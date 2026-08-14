import { Injectable, NotFoundException } from '@nestjs/common';
import { GET_MATCH_GRAPH } from '../database/cypher/graph-explorer.cypher';
import { Neo4jService } from '../database/neo4j.service';
import { toNative } from '../database/neo4j.utils';

export type GraphNodeLabel =
  | 'Developer'
  | 'Skill'
  | 'Job'
  | 'Company'
  | 'Project'
  | 'Technology';

export type GraphRelationshipType =
  | 'HAS_SKILL'
  | 'WORKED_ON'
  | 'USES'
  | 'REQUIRES'
  | 'POSTED_BY'
  | 'APPLIED_TO';

export type GraphPropertyValue = string | number | boolean;

export type GraphNode = {
  id: string;
  label: GraphNodeLabel;
  name: string;
  properties: Record<string, GraphPropertyValue>;
};

export type GraphRelationship = {
  id: string;
  source: string;
  target: string;
  type: GraphRelationshipType;
  properties: Record<string, GraphPropertyValue>;
};

export type MatchGraph = {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
};

type NamedRow = {
  id: string;
  name: string;
  category?: string;
  domain?: string;
  proficiency?: string;
  years?: number;
  role?: string;
  importance?: string;
  required?: boolean;
  projectId?: string;
};

@Injectable()
export class GraphService {
  constructor(private readonly neo4j: Neo4jService) {}

  async getMatchGraph(
    developerId: string,
    jobId: string,
  ): Promise<MatchGraph> {
    const result = await this.neo4j.read(GET_MATCH_GRAPH, {
      developerId,
      jobId,
    });
    const record = result.records[0];

    if (!record) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Developer not found',
      });
    }

    const developer = toNative<{
      id: string;
      name: string;
      title: string;
      experienceLevel: string;
      location: string;
    }>(record.get('developer'));
    const job = toNative<{
      id: string;
      title: string;
      location: string;
      employmentType: string;
      experienceLevel: string;
    } | null>(record.get('job'));

    if (!job) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Job not found',
      });
    }

    const company = toNative<{
      id: string;
      name: string;
      industry: string;
      location: string;
    } | null>(record.get('company'));
    const hasSkills = toNative<NamedRow[]>(record.get('hasSkills') ?? []);
    const projects = toNative<NamedRow[]>(record.get('projects') ?? []);
    const projectTechnologies = toNative<NamedRow[]>(
      record.get('projectTechnologies') ?? [],
    );
    const jobSkills = toNative<NamedRow[]>(record.get('jobSkills') ?? []);
    const jobTechnologies = toNative<NamedRow[]>(
      record.get('jobTechnologies') ?? [],
    );
    const appliedRows = toNative<
      {
        appliedAt?: string;
        status?: string;
      }[]
    >(record.get('appliedRows') ?? []);
    const applied = appliedRows[0] ?? null;

    const nodes = new Map<string, GraphNode>();
    const relationships = new Map<string, GraphRelationship>();

    addNode(nodes, {
      id: developer.id,
      label: 'Developer',
      name: developer.name,
      properties: compact({
        title: developer.title,
        experienceLevel: developer.experienceLevel,
        location: developer.location,
      }),
    });

    addNode(nodes, {
      id: job.id,
      label: 'Job',
      name: job.title,
      properties: compact({
        location: job.location,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
      }),
    });

    if (company) {
      addNode(nodes, {
        id: company.id,
        label: 'Company',
        name: company.name,
        properties: compact({
          industry: company.industry,
          location: company.location,
        }),
      });
      addRelationship(relationships, {
        source: job.id,
        target: company.id,
        type: 'POSTED_BY',
        properties: {},
      });
    }

    for (const skill of hasSkills) {
      addNode(nodes, {
        id: skill.id,
        label: 'Skill',
        name: skill.name,
        properties: compact({ category: skill.category }),
      });
      addRelationship(relationships, {
        source: developer.id,
        target: skill.id,
        type: 'HAS_SKILL',
        properties: compact({
          proficiency: skill.proficiency,
          years: skill.years,
        }),
      });
    }

    for (const project of projects) {
      addNode(nodes, {
        id: project.id,
        label: 'Project',
        name: project.name,
        properties: compact({ domain: project.domain }),
      });
      addRelationship(relationships, {
        source: developer.id,
        target: project.id,
        type: 'WORKED_ON',
        properties: compact({
          role: project.role,
          years: project.years,
        }),
      });
    }

    for (const tech of projectTechnologies) {
      if (!tech.projectId) {
        continue;
      }
      addNode(nodes, {
        id: tech.id,
        label: 'Technology',
        name: tech.name,
        properties: compact({ category: tech.category }),
      });
      addRelationship(relationships, {
        source: tech.projectId,
        target: tech.id,
        type: 'USES',
        properties: compact({ importance: tech.importance }),
      });
    }

    for (const skill of jobSkills) {
      addNode(nodes, {
        id: skill.id,
        label: 'Skill',
        name: skill.name,
        properties: compact({ category: skill.category }),
      });
      addRelationship(relationships, {
        source: job.id,
        target: skill.id,
        type: 'REQUIRES',
        properties: compact({ required: skill.required }),
      });
    }

    for (const tech of jobTechnologies) {
      addNode(nodes, {
        id: tech.id,
        label: 'Technology',
        name: tech.name,
        properties: compact({ category: tech.category }),
      });
      addRelationship(relationships, {
        source: job.id,
        target: tech.id,
        type: 'USES',
        properties: compact({ importance: tech.importance }),
      });
    }

    if (applied) {
      addRelationship(relationships, {
        source: developer.id,
        target: job.id,
        type: 'APPLIED_TO',
        properties: compact({
          appliedAt: applied.appliedAt,
          status: applied.status,
        }),
      });
    }

    return {
      nodes: [...nodes.values()],
      relationships: [...relationships.values()],
    };
  }
}

function addNode(nodes: Map<string, GraphNode>, node: GraphNode): void {
  if (!nodes.has(node.id)) {
    nodes.set(node.id, node);
  }
}

function addRelationship(
  relationships: Map<string, GraphRelationship>,
  relationship: Omit<GraphRelationship, 'id'>,
): void {
  const id = `${relationship.source}-${relationship.type}-${relationship.target}`;
  if (!relationships.has(id)) {
    relationships.set(id, { id, ...relationship });
  }
}

function compact(
  properties: Record<string, unknown>,
): Record<string, GraphPropertyValue> {
  const result: Record<string, GraphPropertyValue> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      result[key] = value;
    }
  }
  return result;
}
