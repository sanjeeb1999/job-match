export const GET_RECOMMENDATION_DEVELOPER = `
MATCH (d:Developer {id: $developerId})
RETURN d {
  .id,
  .name,
  .title,
  .experienceYears,
  .experienceLevel
} AS developer
`;

export const LIST_CANDIDATE_JOBS = `
MATCH (d:Developer {id: $developerId})
OPTIONAL MATCH (d)-[:HAS_SKILL]->(owned:Skill)
WITH d, [skillId IN collect(DISTINCT owned.id) WHERE skillId IS NOT NULL] AS ownedSkillIds
OPTIONAL MATCH (d)-[:APPLIED_TO]->(appliedJob:Job)
WITH d, ownedSkillIds, [jobId IN collect(DISTINCT appliedJob.id) WHERE jobId IS NOT NULL] AS appliedJobIds
MATCH (job:Job)-[:POSTED_BY]->(company:Company)
WHERE job.status = $status
OPTIONAL MATCH (job)-[requires:REQUIRES]->(skill:Skill)
WITH d, ownedSkillIds, appliedJobIds, job, company, collect(
  CASE WHEN skill IS NULL THEN NULL ELSE {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    required: requires.required
  } END
) AS skillRows
OPTIONAL MATCH (job)-[:USES]->(tech:Technology)
WITH d, ownedSkillIds, appliedJobIds, job, company, skillRows, collect(
  CASE WHEN tech IS NULL THEN NULL ELSE {
    id: tech.id,
    name: tech.name,
    category: tech.category
  } END
) AS techRows
RETURN ownedSkillIds,
appliedJobIds,
job {
  .id,
  .title,
  .location,
  .employmentType,
  .experienceLevel,
  .postedAt,
  .status
} AS job,
company {
  .id,
  .name
} AS company,
[skill IN skillRows WHERE skill IS NOT NULL] AS skills,
[tech IN techRows WHERE tech IS NOT NULL] AS jobTechnologies
`;

export const LIST_TECHNOLOGY_OVERLAP = `
MATCH (d:Developer {id: $developerId})-[:WORKED_ON]->(:Project)-[:USES]->(t:Technology)<-[:USES]-(job:Job)
WHERE job.status = $status
RETURN job.id AS jobId, collect(DISTINCT {
  id: t.id,
  name: t.name,
  category: t.category
}) AS technologies
`;

export const GET_SKILL_GAP = `
OPTIONAL MATCH (d:Developer {id: $developerId})
OPTIONAL MATCH (job:Job {id: $jobId})
WITH d, job
OPTIONAL MATCH (d)-[:HAS_SKILL]->(owned:Skill)
WITH d, job, [skillId IN collect(DISTINCT owned.id) WHERE skillId IS NOT NULL] AS ownedSkillIds
OPTIONAL MATCH (job)-[requires:REQUIRES]->(skill:Skill)
WITH d, job, ownedSkillIds, collect(
  CASE WHEN skill IS NULL THEN NULL ELSE {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    required: requires.required
  } END
) AS skillRows
RETURN CASE WHEN d IS NULL THEN NULL ELSE d.id END AS developerId,
CASE WHEN job IS NULL THEN NULL ELSE job.id END AS jobId,
ownedSkillIds,
[skill IN skillRows WHERE skill IS NOT NULL] AS skills
`;
