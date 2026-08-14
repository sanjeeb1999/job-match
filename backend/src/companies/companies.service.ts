import { Injectable, NotFoundException } from '@nestjs/common';
import { GET_COMPANY_DETAIL } from '../database/cypher/companies.cypher';
import { Neo4jService } from '../database/neo4j.service';
import { toNative } from '../database/neo4j.utils';

export type CompanyDetail = {
  company: {
    id: string;
    name: string;
    industry: string;
    location: string;
    size: string;
  };
  jobs: Array<{
    id: string;
    title: string;
    location: string;
    employmentType: string;
    experienceLevel: string;
    status: string;
  }>;
};

@Injectable()
export class CompaniesService {
  constructor(private readonly neo4j: Neo4jService) {}

  async getById(companyId: string): Promise<CompanyDetail> {
    const result = await this.neo4j.read(GET_COMPANY_DETAIL, { companyId });
    const record = result.records[0];

    if (!record) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Company not found',
      });
    }

    return {
      company: toNative(record.get('company')),
      jobs: toNative(record.get('jobs')),
    };
  }
}
