export const GET_COMPANY_DETAIL = `
MATCH (company:Company {id: $companyId})
OPTIONAL MATCH (job:Job)-[:POSTED_BY]->(company)
WITH company, collect(
  CASE WHEN job IS NULL THEN NULL ELSE {
    id: job.id,
    title: job.title,
    location: job.location,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    status: job.status
  } END
) AS jobRows
RETURN company {
  .id,
  .name,
  .industry,
  .location,
  .size
} AS company,
[job IN jobRows WHERE job IS NOT NULL] AS jobs
`;
