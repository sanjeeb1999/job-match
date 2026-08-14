export const HEALTH_PING = 'RETURN 1 AS result';

export const NODE_COUNT_QUERIES = {
  Developer: 'MATCH (n:Developer) RETURN count(n) AS count',
  Skill: 'MATCH (n:Skill) RETURN count(n) AS count',
  Job: 'MATCH (n:Job) RETURN count(n) AS count',
  Company: 'MATCH (n:Company) RETURN count(n) AS count',
  Project: 'MATCH (n:Project) RETURN count(n) AS count',
  Technology: 'MATCH (n:Technology) RETURN count(n) AS count',
} as const;

export const RELATIONSHIP_COUNT_QUERIES = {
  HAS_SKILL: 'MATCH ()-[r:HAS_SKILL]->() RETURN count(r) AS count',
  WORKED_ON: 'MATCH ()-[r:WORKED_ON]->() RETURN count(r) AS count',
  USES: 'MATCH ()-[r:USES]->() RETURN count(r) AS count',
  REQUIRES: 'MATCH ()-[r:REQUIRES]->() RETURN count(r) AS count',
  POSTED_BY: 'MATCH ()-[r:POSTED_BY]->() RETURN count(r) AS count',
  APPLIED_TO: 'MATCH ()-[r:APPLIED_TO]->() RETURN count(r) AS count',
} as const;
