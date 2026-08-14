/**
 * Parameterized neighborhood for one developer + one job.
 * Does not accept Cypher from the client. Does not scan the full graph.
 *
 * The requested job is kept on `requestedJob` and never reused as the
 * endpoint of OPTIONAL MATCH APPLIED_TO, which can rebind that variable.
 */
export const GET_MATCH_GRAPH = `
MATCH (d:Developer {id: $developerId})
OPTIONAL MATCH (requestedJob:Job {id: $jobId})
WITH d, requestedJob
OPTIONAL MATCH (d)-[hasSkill:HAS_SKILL]->(devSkill:Skill)
WITH d, requestedJob, collect(
  CASE WHEN devSkill IS NULL THEN NULL ELSE {
    id: devSkill.id,
    name: devSkill.name,
    category: devSkill.category,
    proficiency: hasSkill.proficiency,
    years: hasSkill.years
  } END
) AS hasSkillRows
OPTIONAL MATCH (d)-[workedOn:WORKED_ON]->(project:Project)
WITH d, requestedJob, hasSkillRows, collect(
  CASE WHEN project IS NULL THEN NULL ELSE {
    id: project.id,
    name: project.name,
    domain: project.domain,
    role: workedOn.role,
    years: workedOn.years
  } END
) AS projectRows
OPTIONAL MATCH (d)-[:WORKED_ON]->(projectForTech:Project)-[projectUses:USES]->(projectTech:Technology)
WITH d, requestedJob, hasSkillRows, projectRows, collect(
  CASE WHEN projectTech IS NULL THEN NULL ELSE {
    projectId: projectForTech.id,
    id: projectTech.id,
    name: projectTech.name,
    category: projectTech.category,
    importance: projectUses.importance
  } END
) AS projectTechRows
OPTIONAL MATCH (requestedJob)-[requires:REQUIRES]->(jobSkill:Skill)
WITH d, requestedJob, hasSkillRows, projectRows, projectTechRows, collect(
  CASE WHEN jobSkill IS NULL THEN NULL ELSE {
    id: jobSkill.id,
    name: jobSkill.name,
    category: jobSkill.category,
    required: requires.required
  } END
) AS jobSkillRows
OPTIONAL MATCH (requestedJob)-[jobUses:USES]->(jobTech:Technology)
WITH d, requestedJob, hasSkillRows, projectRows, projectTechRows, jobSkillRows, collect(
  CASE WHEN jobTech IS NULL THEN NULL ELSE {
    id: jobTech.id,
    name: jobTech.name,
    category: jobTech.category,
    importance: jobUses.importance
  } END
) AS jobTechRows
OPTIONAL MATCH (requestedJob)-[:POSTED_BY]->(company:Company)
WITH d, requestedJob, hasSkillRows, projectRows, projectTechRows, jobSkillRows, jobTechRows, company
OPTIONAL MATCH (d)-[applied:APPLIED_TO]->(appliedJob:Job)
WITH d, requestedJob, hasSkillRows, projectRows, projectTechRows, jobSkillRows, jobTechRows, company,
     [row IN collect(
       CASE
         WHEN applied IS NULL OR requestedJob IS NULL OR appliedJob.id <> requestedJob.id THEN NULL
         ELSE {
           appliedAt: applied.appliedAt,
           status: applied.status
         }
       END
     ) WHERE row IS NOT NULL] AS appliedRows
RETURN d {
  .id,
  .name,
  .title,
  .experienceLevel,
  .location
} AS developer,
CASE WHEN requestedJob IS NULL THEN NULL ELSE requestedJob {
  .id,
  .title,
  .location,
  .employmentType,
  .experienceLevel
} END AS job,
CASE WHEN company IS NULL THEN NULL ELSE company {
  .id,
  .name,
  .industry,
  .location
} END AS company,
[row IN hasSkillRows WHERE row IS NOT NULL] AS hasSkills,
[row IN projectRows WHERE row IS NOT NULL] AS projects,
[row IN projectTechRows WHERE row IS NOT NULL] AS projectTechnologies,
[row IN jobSkillRows WHERE row IS NOT NULL] AS jobSkills,
[row IN jobTechRows WHERE row IS NOT NULL] AS jobTechnologies,
appliedRows
`;
