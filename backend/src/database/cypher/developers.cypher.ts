export const LIST_DEVELOPERS = `
MATCH (d:Developer)
WHERE $search = ''
   OR toLower(d.name) CONTAINS toLower($search)
   OR toLower(d.title) CONTAINS toLower($search)
RETURN d {
  .id,
  .name,
  .title,
  .experienceYears,
  .experienceLevel,
  .location
} AS developer
ORDER BY d.name
`;

export const GET_DEVELOPER_PROFILE = `
MATCH (d:Developer {id: $developerId})
OPTIONAL MATCH (d)-[hasSkill:HAS_SKILL]->(skill:Skill)
WITH d, collect(
  CASE WHEN skill IS NULL THEN NULL ELSE {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    proficiency: hasSkill.proficiency,
    years: hasSkill.years
  } END
) AS skillRows
OPTIONAL MATCH (d)-[workedOn:WORKED_ON]->(project:Project)
OPTIONAL MATCH (project)-[:USES]->(tech:Technology)
WITH d, skillRows, project, workedOn, collect(
  CASE WHEN tech IS NULL THEN NULL ELSE {
    id: tech.id,
    name: tech.name,
    category: tech.category
  } END
) AS techRows
WITH d, skillRows, collect(
  CASE WHEN project IS NULL THEN NULL ELSE {
    id: project.id,
    name: project.name,
    description: project.description,
    domain: project.domain,
    role: workedOn.role,
    years: workedOn.years,
    technologies: [tech IN techRows WHERE tech IS NOT NULL]
  } END
) AS projectRows
RETURN d {
  .id,
  .name,
  .title,
  .experienceYears,
  .experienceLevel,
  .location
} AS developer,
[skill IN skillRows WHERE skill IS NOT NULL] AS skills,
[project IN projectRows WHERE project IS NOT NULL] AS projects
`;
