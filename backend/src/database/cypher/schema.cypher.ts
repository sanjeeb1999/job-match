/**
 * Schema statements verified against CognoDB Cloud.
 *
 * Supported:
 *   CREATE CONSTRAINT name IF NOT EXISTS FOR (n:Label) REQUIRE n.id IS UNIQUE
 *   CREATE INDEX name IF NOT EXISTS FOR (n:Label) ON (n.id)
 *   SHOW CONSTRAINTS / SHOW INDEXES
 *
 * Not supported:
 *   CREATE CONSTRAINT ON (n:Label) ASSERT n.id IS UNIQUE
 *   CREATE INDEX ON :Label(id)
 *   CALL db.constraints()
 *
 * Labels and property names are compile-time constants, never user input.
 */

export const UNIQUE_ID_CONSTRAINTS = [
  'CREATE CONSTRAINT developer_id IF NOT EXISTS FOR (d:Developer) REQUIRE d.id IS UNIQUE',
  'CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE',
  'CREATE CONSTRAINT job_id IF NOT EXISTS FOR (j:Job) REQUIRE j.id IS UNIQUE',
  'CREATE CONSTRAINT company_id IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE',
  'CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE',
  'CREATE CONSTRAINT technology_id IF NOT EXISTS FOR (t:Technology) REQUIRE t.id IS UNIQUE',
] as const;

export const ID_LOOKUP_INDEXES = [
  'CREATE INDEX developer_id_idx IF NOT EXISTS FOR (d:Developer) ON (d.id)',
  'CREATE INDEX skill_id_idx IF NOT EXISTS FOR (s:Skill) ON (s.id)',
  'CREATE INDEX job_id_idx IF NOT EXISTS FOR (j:Job) ON (j.id)',
  'CREATE INDEX company_id_idx IF NOT EXISTS FOR (c:Company) ON (c.id)',
  'CREATE INDEX project_id_idx IF NOT EXISTS FOR (p:Project) ON (p.id)',
  'CREATE INDEX technology_id_idx IF NOT EXISTS FOR (t:Technology) ON (t.id)',
] as const;

export const SHOW_CONSTRAINTS = `
SHOW CONSTRAINTS
YIELD name, type, labelsOrTypes, properties
RETURN name, type, labelsOrTypes, properties
`;

export const SHOW_INDEXES = `
SHOW INDEXES
YIELD name, type, labelsOrTypes, properties
RETURN name, type, labelsOrTypes, properties
`;
