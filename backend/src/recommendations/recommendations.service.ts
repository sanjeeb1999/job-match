import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GET_RECOMMENDATION_DEVELOPER,
  GET_SKILL_GAP,
  LIST_CANDIDATE_JOBS,
  LIST_TECHNOLOGY_OVERLAP,
} from '../database/cypher/recommendations.cypher';
import { Neo4jService } from '../database/neo4j.service';
import { toNative } from '../database/neo4j.utils';
import {
  buildExplanation,
  coveragePercent,
  levelFitness,
  overallScore,
  technologyOverlapPercent,
} from './scoring';

type NamedItem = {
  id: string;
  name: string;
  category?: string;
};

type SkillItem = NamedItem & {
  required?: boolean;
};

type CandidateJobRow = {
  ownedSkillIds: string[];
  appliedJobIds: string[];
  job: {
    id: string;
    title: string;
    location: string;
    employmentType: string;
    experienceLevel: string;
    postedAt: string;
    status: string;
  };
  company: {
    id: string;
    name: string;
  };
  skills: SkillItem[];
  jobTechnologies: NamedItem[];
};

const OPEN_STATUS = 'open';

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
}

@Injectable()
export class RecommendationsService {
  constructor(private readonly neo4j: Neo4jService) {}

  async recommend(developerId: string, limit: number) {
    const developer = await this.getDeveloper(developerId);

    const [candidateResult, overlapResult] = await Promise.all([
      this.neo4j.read(LIST_CANDIDATE_JOBS, {
        developerId,
        status: OPEN_STATUS,
      }),
      this.neo4j.read(LIST_TECHNOLOGY_OVERLAP, {
        developerId,
        status: OPEN_STATUS,
      }),
    ]);

    const overlapByJob = new Map<string, NamedItem[]>();
    for (const record of overlapResult.records) {
      overlapByJob.set(
        String(record.get('jobId')),
        toNative<NamedItem[]>(record.get('technologies')),
      );
    }

    const recommendations = candidateResult.records
      .map((record) => {
        const row: CandidateJobRow = {
          ownedSkillIds: toNative<string[]>(record.get('ownedSkillIds')),
          appliedJobIds: toNative<string[]>(record.get('appliedJobIds')),
          job: toNative(record.get('job')),
          company: toNative(record.get('company')),
          skills: uniqueById(toNative<SkillItem[]>(record.get('skills'))),
          jobTechnologies: uniqueById(
            toNative<NamedItem[]>(record.get('jobTechnologies')),
          ),
        };

        return row;
      })
      .filter((row) => !row.appliedJobIds.includes(row.job.id))
      .map((row) => {
        const owned = new Set(row.ownedSkillIds);
        const requiredSkills = row.skills.filter(
          (skill) => skill.required === true,
        );
        const niceToHaveSkills = row.skills.filter(
          (skill) => skill.required === false,
        );
        const matchedRequired = requiredSkills.filter((skill) =>
          owned.has(skill.id),
        );
        const missingRequired = requiredSkills.filter(
          (skill) => !owned.has(skill.id),
        );
        const matchedNiceToHave = niceToHaveSkills.filter((skill) =>
          owned.has(skill.id),
        );
        const missingNiceToHave = niceToHaveSkills.filter(
          (skill) => !owned.has(skill.id),
        );
        const overlapping = uniqueById(overlapByJob.get(row.job.id) ?? []);

        const mustHave = coveragePercent(
          matchedRequired.length,
          requiredSkills.length,
        );
        const niceToHave = coveragePercent(
          matchedNiceToHave.length,
          niceToHaveSkills.length,
        );
        const technologyOverlap = technologyOverlapPercent(
          overlapping.length,
          row.jobTechnologies.length,
        );
        const fitness = levelFitness(
          developer.experienceLevel,
          row.job.experienceLevel,
        );

        const score = {
          overall: overallScore({
            mustHave,
            niceToHave,
            technologyOverlap,
            levelFitness: fitness,
          }),
          mustHave,
          niceToHave,
          technologyOverlap,
          levelFitness: fitness,
        };

        return {
          job: {
            id: row.job.id,
            title: row.job.title,
            location: row.job.location,
            employmentType: row.job.employmentType,
            experienceLevel: row.job.experienceLevel,
          },
          company: row.company,
          score,
          skills: {
            matchedRequired,
            missingRequired,
            matchedNiceToHave,
            missingNiceToHave,
          },
          technologyOverlap: overlapping,
          explanation: buildExplanation({
            matchedRequired: matchedRequired.length,
            totalRequired: requiredSkills.length,
            matchedNice: matchedNiceToHave.length,
            totalNice: niceToHaveSkills.length,
            overlappingNames: overlapping.map((tech) => tech.name),
            technologyOverlap,
            levelFitness: fitness,
          }),
          postedAt: row.job.postedAt,
        };
      })
      .sort((a, b) => {
        if (b.score.overall !== a.score.overall) {
          return b.score.overall - a.score.overall;
        }
        if (b.score.mustHave !== a.score.mustHave) {
          return b.score.mustHave - a.score.mustHave;
        }
        return b.postedAt.localeCompare(a.postedAt);
      })
      .slice(0, limit)
      .map(({ postedAt: _postedAt, ...recommendation }) => recommendation);

    return {
      developer: {
        id: developer.id,
        name: developer.name,
        title: developer.title,
      },
      recommendations,
    };
  }

  async skillGap(developerId: string, jobId: string) {
    const result = await this.neo4j.read(GET_SKILL_GAP, {
      developerId,
      jobId,
    });
    const record = result.records[0];
    const foundDeveloperId = record?.get('developerId');
    const foundJobId = record?.get('jobId');

    if (!foundDeveloperId) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Developer not found',
      });
    }

    if (!foundJobId) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Job not found',
      });
    }

    const owned = new Set(toNative<string[]>(record.get('ownedSkillIds')));
    const skills = uniqueById(toNative<SkillItem[]>(record.get('skills')));
    const requiredSkills = skills.filter((skill) => skill.required === true);
    const niceToHaveSkills = skills.filter((skill) => skill.required === false);

    return {
      developerId: String(foundDeveloperId),
      jobId: String(foundJobId),
      matchedRequiredSkills: requiredSkills.filter((skill) =>
        owned.has(skill.id),
      ),
      missingRequiredSkills: requiredSkills.filter(
        (skill) => !owned.has(skill.id),
      ),
      matchedNiceToHaveSkills: niceToHaveSkills.filter((skill) =>
        owned.has(skill.id),
      ),
      missingNiceToHaveSkills: niceToHaveSkills.filter(
        (skill) => !owned.has(skill.id),
      ),
    };
  }

  private async getDeveloper(developerId: string) {
    const result = await this.neo4j.read(GET_RECOMMENDATION_DEVELOPER, {
      developerId,
    });
    const record = result.records[0];

    if (!record) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Developer not found',
      });
    }

    return toNative<{
      id: string;
      name: string;
      title: string;
      experienceYears: number;
      experienceLevel: string;
    }>(record.get('developer'));
  }
}
