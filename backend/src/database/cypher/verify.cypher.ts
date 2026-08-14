export const DUPLICATE_IDS_BY_LABEL = {
  Developer: 'MATCH (n:Developer) WITH n.id AS id, count(*) AS c WHERE c > 1 RETURN count(*) AS count',
  Skill: 'MATCH (n:Skill) WITH n.id AS id, count(*) AS c WHERE c > 1 RETURN count(*) AS count',
  Job: 'MATCH (n:Job) WITH n.id AS id, count(*) AS c WHERE c > 1 RETURN count(*) AS count',
  Company: 'MATCH (n:Company) WITH n.id AS id, count(*) AS c WHERE c > 1 RETURN count(*) AS count',
  Project: 'MATCH (n:Project) WITH n.id AS id, count(*) AS c WHERE c > 1 RETURN count(*) AS count',
  Technology: 'MATCH (n:Technology) WITH n.id AS id, count(*) AS c WHERE c > 1 RETURN count(*) AS count',
} as const;

export const DUPLICATE_RELATIONSHIPS = {
  HAS_SKILL:
    'MATCH (a)-[r:HAS_SKILL]->(b) WITH a, b, count(r) AS c WHERE c > 1 RETURN count(*) AS count',
  WORKED_ON:
    'MATCH (a)-[r:WORKED_ON]->(b) WITH a, b, count(r) AS c WHERE c > 1 RETURN count(*) AS count',
  USES:
    'MATCH (a)-[r:USES]->(b) WITH a, b, count(r) AS c WHERE c > 1 RETURN count(*) AS count',
  REQUIRES:
    'MATCH (a)-[r:REQUIRES]->(b) WITH a, b, count(r) AS c WHERE c > 1 RETURN count(*) AS count',
  POSTED_BY:
    'MATCH (a)-[r:POSTED_BY]->(b) WITH a, b, count(r) AS c WHERE c > 1 RETURN count(*) AS count',
  APPLIED_TO:
    'MATCH (a)-[r:APPLIED_TO]->(b) WITH a, b, count(r) AS c WHERE c > 1 RETURN count(*) AS count',
} as const;

export const DEVELOPERS_WITH_MULTIPLE_SKILLS = `
MATCH (d:Developer)-[:HAS_SKILL]->(s:Skill)
WITH d, count(s) AS skillCount
WHERE skillCount > 1
RETURN count(d) AS count
`;

export const JOBS_WITH_MULTIPLE_REQUIRED_SKILLS = `
MATCH (j:Job)-[r:REQUIRES]->(:Skill)
WHERE r.required = true
WITH j, count(r) AS requiredCount
WHERE requiredCount > 1
RETURN count(j) AS count
`;

export const DEVELOPERS_WITH_PROJECTS = `
MATCH (d:Developer)-[:WORKED_ON]->(:Project)
RETURN count(DISTINCT d) AS count
`;

export const PROJECTS_WITH_MULTIPLE_TECHNOLOGIES = `
MATCH (p:Project)-[:USES]->(t:Technology)
WITH p, count(t) AS techCount
WHERE techCount > 1
RETURN count(p) AS count
`;

export const MULTI_HOP_PATHS = `
MATCH (d:Developer)-[:WORKED_ON]->(p:Project)-[:USES]->(t:Technology)<-[:USES]-(j:Job)
RETURN count(*) AS count
`;

export const DEVELOPERS_WITH_APPLICATIONS = `
MATCH (d:Developer)-[:APPLIED_TO]->(:Job)
RETURN count(DISTINCT d) AS count
`;

export const JOBS_WITH_REQUIRED_AND_NICE_SKILLS = `
MATCH (j:Job)-[:REQUIRES {required: true}]->(:Skill)
WITH DISTINCT j AS job
MATCH (job)-[:REQUIRES {required: false}]->(:Skill)
RETURN count(DISTINCT job) AS count
`;

export const JOBS_WITHOUT_COMPANY = `
MATCH (j:Job)
OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
WITH j, c
WHERE c IS NULL
RETURN count(j) AS count
`;

export const COMPANIES_WITHOUT_JOBS = `
MATCH (c:Company)
OPTIONAL MATCH (j:Job)-[:POSTED_BY]->(c)
WITH c, j
WHERE j IS NULL
RETURN count(c) AS count
`;

export const DEVELOPERS_WITHOUT_SKILLS = `
MATCH (d:Developer)
OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
WITH d, s
WHERE s IS NULL
RETURN count(d) AS count
`;

export const PROJECTS_WITHOUT_DEVELOPER = `
MATCH (p:Project)
OPTIONAL MATCH (d:Developer)-[:WORKED_ON]->(p)
WITH p, d
WHERE d IS NULL
RETURN count(p) AS count
`;

export const JOBS_WITHOUT_REQUIRED_SKILLS = `
MATCH (j:Job)
OPTIONAL MATCH (j)-[:REQUIRES {required: true}]->(s:Skill)
WITH j, s
WHERE s IS NULL
RETURN count(j) AS count
`;
