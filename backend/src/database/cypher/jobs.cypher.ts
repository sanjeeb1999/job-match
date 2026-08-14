export const LIST_JOBS = `
MATCH (job:Job)-[:POSTED_BY]->(company:Company)
WHERE job.status = $status
  AND ($search = ''
    OR toLower(job.title) CONTAINS toLower($search)
    OR toLower(job.description) CONTAINS toLower($search))
  AND ($location = '' OR toLower(job.location) CONTAINS toLower($location))
  AND ($experienceLevel = '' OR job.experienceLevel = $experienceLevel)
  AND ($employmentType = '' OR job.employmentType = $employmentType)
RETURN job {
  .id,
  .title,
  .location,
  .employmentType,
  .experienceLevel,
  .status,
  .postedAt
} AS job,
company {
  .id,
  .name,
  .industry,
  .location
} AS company
ORDER BY job.postedAt DESC, job.title
`;

export const GET_JOB_DETAIL = `
MATCH (job:Job {id: $jobId})-[:POSTED_BY]->(company:Company)
OPTIONAL MATCH (job)-[requires:REQUIRES]->(skill:Skill)
WITH job, company, collect(
  CASE WHEN skill IS NULL THEN NULL ELSE {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    required: requires.required
  } END
) AS skillRows
OPTIONAL MATCH (job)-[uses:USES]->(tech:Technology)
WITH job, company, skillRows, collect(
  CASE WHEN tech IS NULL THEN NULL ELSE {
    id: tech.id,
    name: tech.name,
    category: tech.category,
    importance: uses.importance
  } END
) AS techRows
RETURN job {
  .id,
  .title,
  .description,
  .location,
  .employmentType,
  .experienceLevel,
  .status,
  .postedAt
} AS job,
company {
  .id,
  .name,
  .industry,
  .location,
  .size
} AS company,
[skill IN skillRows WHERE skill IS NOT NULL] AS skills,
[tech IN techRows WHERE tech IS NOT NULL] AS technologies
`;
