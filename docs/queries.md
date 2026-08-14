# JobMatch Graph — Cypher Queries

All application Cypher is parameterized. Values from HTTP requests are never concatenated into query strings. Credentials are never stored in queries.

CognoDB is the only database. These queries are the ones used by the recommendation engine and graph explorer.

## A. Developer lookup

**Purpose:** Confirm the developer exists and load the fields needed for ranking (name, title, experience level).

**Parameters:** `$developerId`

```cypher
MATCH (d:Developer {id: $developerId})
RETURN d {
  .id,
  .name,
  .title,
  .experienceYears,
  .experienceLevel
} AS developer
```

**Traversal:** Single-node lookup by unique `id`.

**Why graph:** This is a simple lookup. The graph value appears in the queries below, which walk relationships from this node.

---

## B. Required and nice-to-have skill matching (with applied-job exclusion)

**Purpose:** For one developer, load every **open** job they have **not** applied to, together with:

- required skills (`REQUIRES.required = true`)
- nice-to-have skills (`REQUIRES.required = false`)
- job technologies (`USES`)
- the developer’s owned skill ids (`HAS_SKILL`)

The service then partitions each job’s skills into matched vs missing by set membership. That keeps scoring in one place and avoids an N+1 loop of per-job queries.

**Parameters:** `$developerId`, `$status` (`open`)

**Graph traversal:**

```
Developer -[:HAS_SKILL]-> Skill
Job -[:REQUIRES]-> Skill
Job -[:POSTED_BY]-> Company
Developer -[:APPLIED_TO]-> Job   (excluded)
```

```cypher
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
RETURN ownedSkillIds, appliedJobIds, job, company, skills, jobTechnologies
```

Relationship property predicates such as `[:REQUIRES {required: true}]` are not reliable on this CognoDB instance. The query returns `requires.required` on each skill map; the service splits must-have vs nice-to-have.

**Applied-job exclusion:** CognoDB does not reliably evaluate `WHERE NOT (d)-[:APPLIED_TO]->(job)` or `WHERE applied IS NULL` after an optional relationship match. The query collects applied job ids with `OPTIONAL MATCH (d)-[:APPLIED_TO]->(appliedJob)` and the service excludes those ids. That is still a graph lookup, not a second per-job query.

**Why graph is useful:** Matching is a neighborhood question: “which Job nodes share Skill nodes with this Developer, and which required Skills are *not* in that neighborhood?” In a relational model this is several join tables (`developer_skills`, `job_skills`, `applications`) plus a `NOT EXISTS` / anti-join for missing skills and already-applied jobs. SQL can do it; the graph makes the same relationships explicit as typed edges.

---

## C. Technology overlap — flagship multi-hop query

**Purpose:** Find technologies the developer used on **projects** that the **job** also uses. This is the assignment’s graph-specific signal (not a skill list lookup).

**Parameters:** `$developerId`, `$status`

**Traversal (2+ hops):**

```
Developer -[:WORKED_ON]-> Project -[:USES]-> Technology <-[:USES]- Job
```

```cypher
MATCH (d:Developer {id: $developerId})-[:WORKED_ON]->(:Project)-[:USES]->(t:Technology)<-[:USES]-(job:Job)
WHERE job.status = $status
RETURN job.id AS jobId, collect(DISTINCT {
  id: t.id,
  name: t.name,
  category: t.category
}) AS technologies
```

Applied jobs are removed in the service using the applied-id list from query B, so this traversal stays a pure multi-hop path.

**What it means:** A developer may not list “PostgreSQL” as a skill, but if they shipped a project that used PostgreSQL and the job uses PostgreSQL, that shared `Technology` node is evidence of relevant experience.

**Why graph is useful:** The path is a first-class pattern. The equivalent relational query joins `developers → project_members → projects → project_technologies → technologies ← job_technologies ← jobs`, then deduplicates. That is valid SQL; it is several join tables to express one path. Cypher states the path directly and returns the overlapping `Technology` nodes.

**Scoring:**

```
technologyOverlap = overlappingDistinctTechCount / jobTechnologyCount * 100
```

If the job lists no technologies, coverage is **0**: there is nothing to overlap with. If the developer has no project overlap and the job does list technologies, coverage is also 0.

---

## D. Skill-gap query

**Purpose:** For one developer and one job, return required and nice-to-have skills so the API can split matched vs missing. Applied jobs are **not** excluded here — gap analysis is valid after applying.

**Parameters:** `$developerId`, `$jobId`

```cypher
OPTIONAL MATCH (d:Developer {id: $developerId})
OPTIONAL MATCH (job:Job {id: $jobId})
WITH d, job
OPTIONAL MATCH (d)-[:HAS_SKILL]->(owned:Skill)
WITH d, job, [skillId IN collect(DISTINCT owned.id) WHERE skillId IS NOT NULL] AS ownedSkillIds
OPTIONAL MATCH (job)-[:REQUIRES {required: true}]->(must:Skill)
WITH d, job, ownedSkillIds, collect(...) AS mustRows
OPTIONAL MATCH (job)-[:REQUIRES {required: false}]->(nice:Skill)
WITH d, job, ownedSkillIds, mustRows, collect(...) AS niceRows
RETURN developerId, jobId, ownedSkillIds, requiredSkills, niceToHaveSkills
```

**Why graph is useful:** Skill gap is set difference over the `HAS_SKILL` / `REQUIRES` neighborhood of two nodes.

---

## E. Scoring (application layer)

Cypher returns the graph facts. `RecommendationsService` computes:

| Component | Weight | Formula |
|-----------|--------|---------|
| Must-have coverage | 60% | `matchedRequired / totalRequired * 100` (100 if none) |
| Nice-to-have coverage | 20% | `matchedNice / totalNice * 100` (100 if the job lists none — nothing optional is missing) |
| Technology overlap | 15% | `overlap / jobTechCount * 100` (0 if the job lists none — no overlap can be established) |
| Level fitness | 5% | junior/mid/senior rank rule |

```
overall = mustHave * 0.60
        + niceToHave * 0.20
        + technologyOverlap * 0.15
        + levelFitness * 0.05
```

Scores are rounded to at most one decimal place. Recommendations sort by `overall` DESC, then `mustHave` DESC, then `postedAt` DESC.

**Level fitness** (seeded values: `junior` < `mid` < `senior`):

| Developer vs job | Score |
|------------------|------:|
| Exact match | 100 |
| One level above | 100 |
| One level below | 60 |
| Two or more levels below | 20 |
| Two or more levels above | 50 |

Query design: **three parameterized reads** per recommendation request (developer, candidate jobs + skills, multi-hop technology overlap). No per-job query loop.

---

## F. Match neighborhood (graph explorer)

**Endpoint:** `GET /api/graph/match/:developerId/:jobId`

**Purpose:** Load the neighborhood for one developer and one job: developer skills, projects, project technologies, job required skills, job technologies, posting company, and `APPLIED_TO` when present. Used by the React Flow explorer. The client never sends Cypher.

**Parameters:** `$developerId`, `$jobId`

The requested job is bound as `requestedJob`. A separate `appliedJob` variable is used for `APPLIED_TO` so OPTIONAL MATCH cannot rebind the job under inspection.

Source: `backend/src/database/cypher/graph-explorer.cypher.ts`.
