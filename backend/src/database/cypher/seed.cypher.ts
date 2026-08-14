export const MERGE_SKILLS = `
UNWIND $rows AS row
MERGE (n:Skill {id: row.id})
SET n.name = row.name,
    n.category = row.category
`;

export const MERGE_TECHNOLOGIES = `
UNWIND $rows AS row
MERGE (n:Technology {id: row.id})
SET n.name = row.name,
    n.category = row.category
`;

export const MERGE_COMPANIES = `
UNWIND $rows AS row
MERGE (n:Company {id: row.id})
SET n.name = row.name,
    n.industry = row.industry,
    n.location = row.location,
    n.size = row.size
`;

export const MERGE_DEVELOPERS = `
UNWIND $rows AS row
MERGE (n:Developer {id: row.id})
SET n.name = row.name,
    n.email = row.email,
    n.title = row.title,
    n.experienceYears = row.experienceYears,
    n.experienceLevel = row.experienceLevel,
    n.location = row.location
`;

export const MERGE_PROJECTS = `
UNWIND $rows AS row
MERGE (n:Project {id: row.id})
SET n.name = row.name,
    n.description = row.description,
    n.domain = row.domain
`;

export const MERGE_JOBS = `
UNWIND $rows AS row
MERGE (n:Job {id: row.id})
SET n.title = row.title,
    n.description = row.description,
    n.location = row.location,
    n.employmentType = row.employmentType,
    n.experienceLevel = row.experienceLevel,
    n.status = row.status,
    n.postedAt = row.postedAt
`;

export const MERGE_HAS_SKILL = `
UNWIND $rows AS row
MATCH (d:Developer {id: row.developerId})
MATCH (s:Skill {id: row.skillId})
MERGE (d)-[r:HAS_SKILL]->(s)
SET r.proficiency = row.proficiency,
    r.years = row.years
`;

export const MERGE_WORKED_ON = `
UNWIND $rows AS row
MATCH (d:Developer {id: row.developerId})
MATCH (p:Project {id: row.projectId})
MERGE (d)-[r:WORKED_ON]->(p)
SET r.role = row.role,
    r.years = row.years
`;

export const MERGE_PROJECT_USES = `
UNWIND $rows AS row
MATCH (p:Project {id: row.projectId})
MATCH (t:Technology {id: row.technologyId})
MERGE (p)-[r:USES]->(t)
SET r.importance = row.importance
`;

export const MERGE_REQUIRES = `
UNWIND $rows AS row
MATCH (j:Job {id: row.jobId})
MATCH (s:Skill {id: row.skillId})
MERGE (j)-[r:REQUIRES]->(s)
SET r.required = row.required
`;

export const MERGE_JOB_USES = `
UNWIND $rows AS row
MATCH (j:Job {id: row.jobId})
MATCH (t:Technology {id: row.technologyId})
MERGE (j)-[r:USES]->(t)
SET r.importance = row.importance
`;

export const MERGE_POSTED_BY = `
UNWIND $rows AS row
MATCH (j:Job {id: row.jobId})
MATCH (c:Company {id: row.companyId})
MERGE (j)-[:POSTED_BY]->(c)
`;

export const MERGE_APPLIED_TO = `
UNWIND $rows AS row
MATCH (d:Developer {id: row.developerId})
MATCH (j:Job {id: row.jobId})
MERGE (d)-[r:APPLIED_TO]->(j)
SET r.appliedAt = row.appliedAt,
    r.status = row.status
`;
