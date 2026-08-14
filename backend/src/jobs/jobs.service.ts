import { Injectable, NotFoundException } from '@nestjs/common';
import { GET_JOB_DETAIL, LIST_JOBS } from '../database/cypher/jobs.cypher';
import { Neo4jService } from '../database/neo4j.service';
import { toNative } from '../database/neo4j.utils';

export type CompanySummary = {
  id: string;
  name: string;
  industry: string;
  location: string;
  size?: string;
};

export type JobSummary = {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  status: string;
  postedAt: string;
};

export type JobListItem = JobSummary & {
  company: CompanySummary;
};

export type JobSkill = {
  id: string;
  name: string;
  category: string;
  required: boolean;
};

export type JobTechnology = {
  id: string;
  name: string;
  category: string;
  importance: string;
};

export type JobDetail = {
  job: JobSummary & { description: string };
  company: CompanySummary;
  requiredSkills: JobSkill[];
  niceToHaveSkills: JobSkill[];
  technologies: JobTechnology[];
};

export type JobListFilters = {
  search: string;
  location: string;
  experienceLevel: string;
  employmentType: string;
  status: string;
};

@Injectable()
export class JobsService {
  constructor(private readonly neo4j: Neo4jService) {}

  async list(filters: JobListFilters): Promise<JobListItem[]> {
    const result = await this.neo4j.read(LIST_JOBS, {
      search: filters.search,
      location: filters.location,
      experienceLevel: filters.experienceLevel,
      employmentType: filters.employmentType,
      status: filters.status,
    });

    return result.records.map((record) => {
      const job = toNative<JobSummary>(record.get('job'));
      const company = toNative<CompanySummary>(record.get('company'));
      return { ...job, company };
    });
  }

  async getById(jobId: string): Promise<JobDetail> {
    const result = await this.neo4j.read(GET_JOB_DETAIL, { jobId });
    const record = result.records[0];

    if (!record) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Job not found',
      });
    }

    const skills = toNative<JobSkill[]>(record.get('skills'));

    return {
      job: toNative<JobSummary & { description: string }>(record.get('job')),
      company: toNative<CompanySummary>(record.get('company')),
      requiredSkills: skills.filter((skill) => skill.required === true),
      niceToHaveSkills: skills.filter((skill) => skill.required === false),
      technologies: toNative<JobTechnology[]>(record.get('technologies')),
    };
  }
}
