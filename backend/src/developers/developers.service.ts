import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GET_DEVELOPER_PROFILE,
  LIST_DEVELOPERS,
} from '../database/cypher/developers.cypher';
import { Neo4jService } from '../database/neo4j.service';
import { toNative } from '../database/neo4j.utils';

export type DeveloperSummary = {
  id: string;
  name: string;
  title: string;
  experienceYears: number;
  experienceLevel: string;
  location: string;
};

export type DeveloperSkill = {
  id: string;
  name: string;
  category: string;
  proficiency: string;
  years: number;
};

export type ProjectTechnology = {
  id: string;
  name: string;
  category: string;
};

export type DeveloperProject = {
  id: string;
  name: string;
  description: string;
  domain: string;
  role: string;
  years: number;
  technologies: ProjectTechnology[];
};

export type DeveloperProfile = {
  developer: DeveloperSummary;
  skills: DeveloperSkill[];
  projects: DeveloperProject[];
};

@Injectable()
export class DevelopersService {
  constructor(private readonly neo4j: Neo4jService) {}

  async list(search: string): Promise<DeveloperSummary[]> {
    const result = await this.neo4j.read(LIST_DEVELOPERS, { search });
    return result.records.map((record) =>
      toNative<DeveloperSummary>(record.get('developer')),
    );
  }

  async getById(developerId: string): Promise<DeveloperProfile> {
    const result = await this.neo4j.read(GET_DEVELOPER_PROFILE, {
      developerId,
    });
    const record = result.records[0];

    if (!record) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Developer not found',
      });
    }

    return {
      developer: toNative<DeveloperSummary>(record.get('developer')),
      skills: toNative<DeveloperSkill[]>(record.get('skills')),
      projects: toNative<DeveloperProject[]>(record.get('projects')),
    };
  }
}
