# JobMatch Graph — Technical Architecture & Implementation Plan

**Project:** JobMatch Graph — Smart Job & Skill Gap Recommendation System  
**Assignment:** Wexa AI take-home  
**Status:** Implemented — NestJS + Next.js + CognoDB Cloud  
**Constraint:** CognoDB is the sole database

---

## 1. Architecture Analysis

### 1.1 Proposed system shape

```
┌─────────────────┐     REST/JSON      ┌─────────────────┐     Bolt + Cypher     ┌─────────────────┐
│  Next.js (UI)   │ ─────────────────► │  NestJS (API)   │ ───────────────────► │  CognoDB Cloud  │
│  TypeScript     │ ◄───────────────── │  TypeScript     │ ◄─────────────────── │  openCypher     │
│  Tailwind/shadcn│                    │  neo4j-driver   │                      │                 │
│  React Flow     │                    │                 │                      │                 │
└─────────────────┘                    └─────────────────┘                      └─────────────────┘
```

This split is appropriate:

| Layer | Role | Why it fits |
|-------|------|-------------|
| **Next.js** | Presentation, UX states, React Flow visualization | Non-technical users need polished UI; frontend never holds DB credentials |
| **NestJS** | Validation, modules, error mapping, Cypher execution | Clear module boundaries; interview-defensible structure |
| **CognoDB** | Graph storage + multi-hop traversals | Relationship-heavy matching/skill-gap is awkward in SQL |

### 1.2 Why a graph is genuinely useful here

Job–skill–developer matching is a **relationship problem**:

1. **Multi-hop paths** matter: `Developer → HAS_SKILL → Skill ← REQUIRES ← Job`, and also `Developer → WORKED_ON → Project → USES → Technology ← USES ← Job`.
2. **Skill gap** is set difference over a neighborhood: skills required by a job minus skills held by a developer — natural as graph pattern matching.
3. **“Why does this match?”** is path explanation: shared skills, overlapping technologies via projects — returning paths/subgraphs is first-class in Cypher.
4. **Graph explorer** can return a neighborhood subgraph that React Flow renders directly — the UI *proves* the graph model.

A relational model would need many join tables and recursive CTEs; the same questions become longer, harder to explain, and less natural to visualize.

### 1.3 What we will *not* build (scope guardrails)

- No secondary database (MongoDB, PostgreSQL, Redis, etc.)
- No auth/SSO, roles, or multi-tenant security beyond selecting a demo developer
- No write-heavy product features (apply flow can be seed-only or a thin demo mutation)
- No ML ranking, embeddings, or external job APIs
- No GraphQL, message queues, microservices, or monorepo tooling beyond `apps/` or `frontend` + `backend`
- No custom CognoDB SDK — official `neo4j-driver` only

---

## 2. Architectural Risks & Unnecessary Complexity

### 2.1 Risks (and mitigations)

| Risk | Impact | Mitigation |
|------|--------|------------|
| **CognoDB / Bolt connectivity** (`bolt+s://`, auth, certs) | Blocks all demos | Early Spike Phase 0; health endpoint; clear `.env.example`; graceful 503s |
| **Integer / Float / Date Neo4j types** in JS driver | Subtle bugs in scores/JSON | Normalize in graph layer (`neo4j.integer` → number) before DTOs leave Nest |
| **Match scoring “looks fake”** | Weak interview defense | Document formula in README; compute in Cypher or one clear service method; return *explainable* components (matched skills, missing skills, tech overlap) |
| **React Flow over-scope** | Burns hours on layout polish | Backend returns `{ nodes, edges }` already shaped for the UI; fixed layouts / dagre-lite; explorer limited to ego-neighborhood + job–skill paths |
| **Seed idempotency** | Duplicate nodes on re-seed | `MERGE` on stable IDs; documented wipe-or-reseed procedure |
| **CORS / dual deploy** | Hosted demo fails | Explicit CORS config; document frontend `NEXT_PUBLIC_API_BASE_URL` |
| **48-hour scope creep** | Incomplete demo | Strict feature MVP (below); polish states over extra entity types |
| **String-built Cypher** | Assignment fail | Queries as constants + `$params` only; lint/review checklist |

### 2.2 Unnecessary complexity to avoid

1. **Separating Project vs Technology too deeply in the UI** — keep both in the model (assignment requires them) but surface them mainly in match explanation and graph explorer, not as full CRUD pages.
2. **Generic graph query API** — do not expose arbitrary Cypher from the client. Fixed, parameterized endpoints only.
3. **Heavy DDD / CQRS / event buses** — flat Nest modules + repository-style graph services.
4. **Caching layers** — seed size is small; skip Redis/in-memory cache unless latency becomes a demo problem.
5. **Next.js API routes as a second backend** — NestJS owns all CognoDB access; Next.js is UI + BFF-free client.
6. **Complex auth for “pick a developer”** — use a developer selector (dropdown/search) for the demo persona.

### 2.3 Conscious simplifications

- **Read-mostly demo:** seeding creates the world; runtime writes optional (e.g. one “Apply” mutation is nice-to-have, not required for MVP).
- **Match score in application layer or Cypher:** prefer **one Cypher query** that returns matched/missing skill counts + optional tech-path signal, then Nest maps to a 0–100 score. Avoid opaque scoring libraries.
- **Monorepo layout:** simple `frontend/` + `backend/` folders (not Nx/Turborepo) unless tooling already exists.

---

## 3. Final Folder Structure

### 3.1 Repository root

```
jobmatch-graph/
├── README.md
├── .gitignore
├── .env.example                 # placeholders only — no secrets
├── docs/
│   ├── architecture.md          # this document
│   ├── graph-model.md           # optional short mirror for README diagrams
│   └── screenshots/             # UI screenshots for README
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   │   ├── configuration.ts
│   │   │   └── env.validation.ts
│   │   ├── database/            # graph connection layer
│   │   │   ├── database.module.ts
│   │   │   ├── neo4j.provider.ts
│   │   │   ├── neo4j.service.ts
│   │   │   └── cypher/          # parameterized query strings
│   │   │       ├── developers.cypher.ts
│   │   │       ├── jobs.cypher.ts
│   │   │       ├── companies.cypher.ts
│   │   │       ├── recommendations.cypher.ts
│   │   │       ├── graph-explorer.cypher.ts
│   │   │       └── health.cypher.ts
│   │   ├── developers/
│   │   ├── jobs/
│   │   ├── companies/
│   │   ├── recommendations/
│   │   ├── graph-explorer/
│   │   ├── health/
│   │   └── common/
│   │       ├── filters/
│   │       ├── dto/
│   │       └── utils/           # neo4j type helpers
│   └── scripts/
│       ├── seed.ts
│       └── seed-data.ts         # realistic fixtures
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── components.json          # shadcn
    ├── .env.example
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx             # dashboard / entry
    │   ├── developers/[id]/page.tsx
    │   ├── jobs/[id]/page.tsx
    │   ├── companies/[id]/page.tsx
    │   ├── recommendations/page.tsx
    │   ├── graph/page.tsx
    │   └── globals.css
    ├── components/
    │   ├── ui/                  # shadcn primitives
    │   ├── layout/
    │   ├── states/              # LoadingState, EmptyState, ErrorState
    │   └── graph/               # React Flow wrappers
    ├── features/
    │   ├── developer-profile/
    │   ├── recommendations/
    │   ├── skill-gap/
    │   ├── job-details/
    │   ├── company-details/
    │   └── graph-explorer/
    ├── services/                # fetch wrappers → Nest REST
    ├── hooks/
    ├── types/
    ├── lib/
    └── styles/
```

### 3.2 Nest module map (expected)

| Module | Responsibility |
|--------|----------------|
| `config` | Env loading/validation (`COGNODB_URI`, user, password, port, CORS origin) |
| `database` | Driver lifecycle, `run(query, params)`, record mapping |
| `developers` | List/get developer, skills, projects |
| `jobs` | List/filter/search jobs, job detail + required skills |
| `companies` | Company detail + posted jobs |
| `recommendations` | Ranked jobs, match score breakdown, skill gap |
| `graph-explorer` | Neighborhood / path subgraph for React Flow |
| `health` | Liveness + CognoDB connectivity check |
| `common` | Exception filter, shared DTOs, Neo4j serializers |

### 3.3 Cypher isolation rule

- All Cypher lives under `backend/src/database/cypher/*.ts` as exported string constants.
- Feature services call `Neo4jService.run(QUERY, params)` only.
- **Never** concatenate user input into Cypher strings.

---

## 4. Exact Graph Model (High Level)

### 4.1 Node labels & key properties

| Label | Key properties | Notes |
|-------|----------------|-------|
| `Developer` | `id`, `name`, `title`, `location`, `experienceYears`, `summary`, `avatarUrl?` | Demo personas |
| `Skill` | `id`, `name`, `category` | e.g. language, framework, soft |
| `Job` | `id`, `title`, `level`, `location`, `remote`, `description`, `postedAt` | |
| `Company` | `id`, `name`, `industry`, `size`, `location`, `website?` | |
| `Project` | `id`, `name`, `description`, `year` | Portfolio / experience proof |
| `Technology` | `id`, `name`, `category` | Distinct from Skill when useful (e.g. “PostgreSQL” as tech used by projects/jobs); skills remain the matching currency |

**ID strategy:** string UUIDs or stable slug IDs in seed data (`dev-alice`, `skill-typescript`) so `MERGE` and demos stay deterministic.

### 4.2 Relationship types & properties

| Relationship | From → To | Properties |
|--------------|-----------|------------|
| `HAS_SKILL` | Developer → Skill | `level` (1–5), `years?` |
| `WORKED_ON` | Developer → Project | `role` |
| `USES` | Project → Technology | — |
| `REQUIRES` | Job → Skill | `importance` (`must` \| `nice`), `minLevel?` |
| `USES` | Job → Technology | — |
| `POSTED_BY` | Job → Company | `postedAt?` (or keep on Job) |
| `APPLIED_TO` | Developer → Job | `appliedAt`, `status?` |

No extra relationship types for MVP (no `KNOWS`, `FOLLOWS`, `SIMILAR_TO`, etc.).

### 4.3 Diagram (for README)

```text
                    ┌──────────┐
                    │ Company  │
                    └────▲─────┘
                         │ POSTED_BY
┌──────────┐    REQUIRES    ┌────┴─────┐     USES      ┌────────────┐
│  Skill   │◄───────────────│   Job    │──────────────►│ Technology │
└────▲─────┘                └────▲─────┘               └──────▲─────┘
     │ HAS_SKILL                  │ APPLIED_TO                 │ USES
┌────┴─────┐                      │                      ┌─────┴──────┐
│Developer │──────────────────────┘                      │  Project   │
└────┬─────┘                                             └─────▲──────┘
     │ WORKED_ON                                               │
     └─────────────────────────────────────────────────────────┘
```

### 4.4 Model notes for interviews

- **Skill vs Technology:** Skills are what jobs *require* and developers *have* (matching axis). Technologies are what projects/jobs *use* (context / multi-hop boost). This avoids forcing every tool into both labels while still enabling 2+ hop paths.
- **APPLIED_TO:** Useful for “already applied” filters and a relationship-oriented query; seed a few applications.
- Indexes (if CognoDB/Neo4j-style constraints available): uniqueness on `id` per label; range/lookup on `Skill.name`, `Job.title` for search.

---

## 5. Main REST API Endpoints

Base URL: `/api` (Nest global prefix).  
All list endpoints support sensible defaults and empty arrays (not 404).  
404 only when a specific resource `id` does not exist.  
503 when CognoDB is unreachable (after mapping driver errors).

### 5.1 Health

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Process up |
| `GET` | `/api/health/ready` | Runs a trivial parameterized Cypher (`RETURN 1` / count nodes) |

### 5.2 Developers

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/developers` | List demo developers (selector) |
| `GET` | `/api/developers/:id` | Profile including skills and projects |

### 5.3 Jobs

| Method | Path | Query params | Purpose |
|--------|------|--------------|---------|
| `GET` | `/api/jobs` | `search`, `location`, `experienceLevel`, `employmentType`, `status` | Search/filter (defaults to open jobs) |
| `GET` | `/api/jobs/:id` | | Job detail with skills, technologies, and posting company |

### 5.4 Companies

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/companies/:id` | Detail plus jobs posted via `POSTED_BY` |

### 5.5 Recommendations & skill gap

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/recommendations/:developerId` | Ranked jobs + match score + short reasons |
| `GET` | `/api/recommendations/:developerId/jobs/:jobId/skill-gap` | Missing / matched / nice-to-have skills |

### 5.6 Graph explorer

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/graph/match/:developerId/:jobId` | Neighborhood for one developer and one job (React Flow). Cypher is server-side and parameterized. |

### 5.7 Response conventions

- JSON only; camelCase fields.
- Errors: `{ "statusCode": number, "message": string }` via Nest exception filter (optional `error` on some 400s). Production responses do not include stack traces, URIs, credentials, or Cypher.
- Graph payloads:

```ts
{
  nodes: Array<{ id: string; label: string; name: string; properties: Record<string, string | number | boolean> }>;
  relationships: Array<{ id: string; source: string; target: string; type: string; properties: Record<string, string | number | boolean> }>;
}
```

Frontend maps node `label` and relationship `type` → React Flow styling. Backend owns graph semantics; UI owns layout.

### 5.8 Swagger

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/docs` | OpenAPI UI. Database credentials are never documented. |

---

## 6. Main Cypher Query Categories

All queries parameterized (`$developerId`, `$jobId`, `$q`, `$limit`, …). No string concatenation.

### 6.1 Categories

| Category | Examples | Hops / graph value |
|----------|----------|--------------------|
| **CRUD-style reads** | Get developer by id; list jobs with filters | 0–1 hop |
| **Neighborhood** | Developer skills; job requirements; company jobs | 1 hop |
| **Multi-hop (≥2)** | Developer → Project → Technology; Developer skills ↔ Job requirements; tech overlap via projects | **Required demo** |
| **Set / relationship reasoning** | Skill gap (`REQUIRES` not in `HAS_SKILL`); recommend by shared skill count | Awkward in SQL — **required narrative** |
| **Path explanation** | `MATCH path = (d)-[:HAS_SKILL]->(s)<-[:REQUIRES]-(j)` | Powers “why this match” + React Flow |
| **Aggregations** | Match components: matched count, required count, tech overlap count | Scoring inputs |
| **Seed / constraints** | `MERGE` nodes/rels; optional uniqueness constraints | Scripts only |
| **Health** | `RETURN 1 AS ok` or `MATCH (n) RETURN count(n) AS c LIMIT 1` | Readiness |

### 6.2 Flagship queries (assignment proof)

1. **Multi-hop (≥2):**  
   “Technologies a developer has used on projects that a target job also uses”

   ```cypher
   MATCH (d:Developer {id: $developerId})-[:WORKED_ON]->(p:Project)-[:USES]->(t:Technology)
         <-[:USES]-(j:Job {id: $jobId})
   RETURN DISTINCT t
   ```

2. **Relationship-oriented (awkward in relational):**  
   “Recommend jobs by shared skills, excluding already applied, ordered by overlap, with missing must-have skills collected”

   ```cypher
   MATCH (d:Developer {id: $developerId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)
   WHERE NOT (d)-[:APPLIED_TO]->(j)
   WITH j, collect(DISTINCT s) AS matchedSkills
   MATCH (j)-[:REQUIRES]->(req:Skill)
   WHERE NOT (d)-[:HAS_SKILL]->(req)
   WITH j, matchedSkills, collect(DISTINCT req) AS missingSkills
   RETURN j, matchedSkills, missingSkills
   ORDER BY size(matchedSkills) DESC
   LIMIT $limit
   ```

   (Final form may adjust `WITH`/`OPTIONAL MATCH` for jobs with zero overlap — still parameterized.)

3. **Skill gap:**  
   Must-have vs nice-to-have via `REQUIRES.importance`.

### 6.3 Query file mapping

| File | Contents |
|------|----------|
| `developers.cypher.ts` | profile, skills, projects→tech |
| `jobs.cypher.ts` | search, detail, requirements |
| `companies.cypher.ts` | detail, jobs posted |
| `recommendations.cypher.ts` | recommend, match breakdown, skill gap |
| `graph-explorer.cypher.ts` | neighborhood, explain paths |
| `health.cypher.ts` | ping |

---

## 7. Job Matching & Skill-Gap Calculation

### 7.1 Design goals

- **Explainable** in an interview (no black-box ML).
- **Computed from graph relationships**, not hardcoded scores in the UI.
- **Stable** on seed data so demos are reproducible.

### 7.2 Match score (proposed formula)

Let for developer `D` and job `J`:

| Signal | Definition | Weight |
|--------|------------|--------|
| **Must-have coverage** | `matchedMust / totalMust` | 0.60 |
| **Nice-to-have coverage** | `matchedNice / max(totalNice, 1)` | 0.20 |
| **Technology overlap** | `sharedTech / max(jobTech, 1)` where sharedTech comes from **2-hop** project path | 0.15 |
| **Level fitness** | optional: `HAS_SKILL.level` vs `REQUIRES.minLevel` average | 0.05 |

```
score = round(100 * (
  0.60 * mustCoverage +
  0.20 * niceCoverage +
  0.15 * techOverlap +
  0.05 * levelFitness
))
```

**Rules:**

- If `totalMust = 0`, redistribute must weight to nice + tech (edge case; seed should always have must-haves).
- Clamp to `[0, 100]`.
- API returns:

```ts
{
  score: number;
  matchedSkills: Skill[];
  missingSkills: Skill[];   // emphasize importance === 'must'
  niceToHaveMissing: Skill[];
  sharedTechnologies: Technology[];
  reasons: string[];        // short human sentences derived from counts
}
```

Computation location: **Nest `RecommendationsService`** using counts returned by Cypher (preferred for testability), or a single Cypher `RETURN` of components. Document the formula in README.

### 7.3 Skill-gap analysis

1. Load `(j)-[:REQUIRES]->(s)` with `importance` / `minLevel`.
2. Load `(d)-[:HAS_SKILL]->(s)` with `level`.
3. Partition:
   - **Matched** — required skill present (optionally flag under-leveled).
   - **Missing must** — primary gap list / learning path focus.
   - **Missing nice** — secondary.
4. Optional enrichment (multi-hop): missing skills that appear on projects using related technologies — only if time allows; not required for MVP.

### 7.4 Recommendation list

1. Cypher finds candidate jobs with skill overlap (and optionally tech overlap).
2. Exclude `APPLIED_TO` (or flag them).
3. Service computes score per job (batch query preferred over N+1).
4. Sort by `score` DESC; return top N with summary reasons.

---

## 8. Frontend UX Plan (non-code)

### 8.1 Primary screens (MVP)

1. **Dashboard** — pick developer, summary of skills, CTA to recommendations & graph.
2. **Recommendations** — ranked cards with score, matched/missing chips, link to detail/gap.
3. **Job detail** — description, company, requirements, match panel if developer selected.
4. **Skill gap** — clear missing must-haves; empty state if perfect match.
5. **Graph explorer** — React Flow view of neighborhood or developer–job explanation paths.
6. **Company detail** — profile + jobs.

### 8.2 UX states (required)

Every data-backed view implements:

- **Loading** — skeletons or spinners (consistent component).
- **Empty** — e.g. no jobs match filters; no missing skills.
- **Error** — API/network/DB failure with retry.
- **Responsive** — usable on mobile; graph may simplify on small screens (list fallback or constrained canvas).

### 8.3 Design system

- Tailwind + shadcn/ui + Lucide icons.
- Intentional visual hierarchy; avoid dashboard clutter on first paint of marketing-style pages if any — this app is a product UI, so a clean app shell is fine.
- Graph colors by node label (Developer, Skill, Job, Company, Project, Technology).

---

## 9. Configuration, Security & Ops

### 9.1 Environment variables (backend)

```env
COGNODB_URI=bolt+s://xxxx.databases.cognodb.cloud
COGNODB_USER=cognodb
COGNODB_PASSWORD=           # never commit
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### 9.2 Environment variables (frontend)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### 9.3 Rules

- Secrets only in env / host secret store.
- `.env` in `.gitignore`; `.env.example` with empty/placeholder values.
- Frontend never receives CognoDB credentials.
- Nest validates env at boot; fail fast with clear message if URI/password missing.
- Driver errors → logged server-side; client gets safe messages.

### 9.4 Hosted demo & recording (mandatory deliverables)

| Deliverable | Plan |
|-------------|------|
| **Hosted demo** | Frontend: Vercel; Backend: Render/Railway/Fly (or similar) with env secrets; CognoDB Cloud instance |
| **Screen recording** | 2–4 min: select developer → recommendations → match/gap → graph explorer → brief model narration |
| **Screenshots** | Dashboard, recommendations, skill gap, graph — stored under `docs/screenshots/` |

---

## 10. Seed Data Strategy

### 10.1 Volume (realistic but small)

Approximate targets for a crisp demo:

| Entity | Count |
|--------|-------|
| Developers | 5–8 |
| Skills | 25–40 |
| Technologies | 15–25 |
| Companies | 5–8 |
| Jobs | 12–20 |
| Projects | 10–15 |
| Applications | handful |

### 10.2 Script behavior

- Nest-less or Nest-context script under `backend/scripts/seed.ts`.
- Uses same env vars and `neo4j-driver`.
- `MERGE` on `id`; relationship `MERGE` to allow re-run.
- Document: “Seed creates demo graph; re-run is idempotent.”

### 10.3 Narrative personas

At least 2–3 contrasting developers (e.g. frontend-leaning, backend/platform, full-stack) so recommendations and gaps visibly differ.

---

## 11. Implementation Phases (Order of Work)

Optimized for **demo risk first**, then **graph proof**, then **UI polish**.

### Phase 0 — Spike (half day)

1. Create CognoDB Cloud instance; store password securely.
2. Minimal Node script: connect with `neo4j-driver`, run parameterized `RETURN 1`.
3. Confirm `bolt+s://` works from local machine and from intended host region.

**Exit criteria:** connectivity proven.

### Phase 1 — Backend skeleton + graph layer

1. NestJS app, config validation, `Neo4jService`, global exception filter.
2. Health endpoints.
3. Cypher folder conventions.

**Exit criteria:** `/api/health/ready` green against CognoDB.

### Phase 2 — Model + seed

1. Finalize property names.
2. Implement seed script + fixtures.
3. Verify counts and a sample multi-hop query in the Neo4j/CognoDB browser or script.

**Exit criteria:** idempotent seed; diagram matches data.

### Phase 3 — Core read APIs

1. Developers, skills, projects.
2. Jobs search/filter, job detail.
3. Companies.

**Exit criteria:** curl/Postman can drive the demo narrative without UI.

### Phase 4 — Recommendations + skill gap (graph crown jewels)

1. Recommendation query (relationship-oriented).
2. Match breakdown + score formula.
3. Skill-gap endpoint.
4. Multi-hop tech overlap included in match payload.

**Exit criteria:** explainable scores on seed personas; queries parameterized.

### Phase 5 — Graph explorer API

1. Neighborhood endpoint (depth ≤ 2).
2. Developer–job path endpoint shaped for React Flow.

**Exit criteria:** JSON renders mentally as a graph; no arbitrary Cypher from client.

### Phase 6 — Frontend MVP

1. App shell, developer selector, dashboard.
2. Recommendations + match/score UI.
3. Job & company pages.
4. Skill gap view.
5. Loading / empty / error components.

**Exit criteria:** non-technical user can complete the happy path.

### Phase 7 — React Flow integration

1. Map API graph DTO → React Flow nodes/edges.
2. Legend, basic layout, responsive behavior.

**Exit criteria:** visualization reflects **actual** relationships from the API.

### Phase 8 — Harden, document, ship

1. README: use case, why graph, model diagram, CognoDB setup, env, seed, main queries, screenshots.
2. Deploy frontend + backend; set secrets.
3. Record screen demo.
4. Pass interview dry-run: defend model, score formula, multi-hop query, parameterized Cypher.

**Exit criteria:** hosted URL + recording + README complete.

---

## 12. Testing & Quality (lightweight)

Appropriate for 48 hours — not a full QA suite:

- Manual checklist against seed personas.
- Optional: a few Nest unit tests for score formula pure functions.
- Optional: one integration test skipped in CI if no CognoDB credentials.
- Pre-submit checklist:
  - [ ] No secrets in git
  - [ ] All Cypher parameterized
  - [ ] Multi-hop query present and documented
  - [ ] Relationship-awkward query documented
  - [ ] UX states present
  - [ ] Hosted demo live
  - [ ] Recording linked in README

---

## 13. Decision Log (ADRs-lite)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| DB | CognoDB only | Assignment requirement; proves graph value |
| Driver | Official `neo4j-driver` | Required; Bolt/openCypher compatible |
| API style | REST | Assigned; simple for Next.js `fetch` |
| Score | Weighted coverage + tech overlap | Explainable; uses multi-hop |
| Auth | None (developer picker) | Scope control |
| Monorepo tooling | Plain `frontend/` + `backend/` | Avoid setup tax |
| Graph UI data | Backend-shaped subgraph | Keeps Cypher server-side; React Flow stays presentational |
| Writes at runtime | Minimal / optional | Seed-driven demo is enough |

---

## 14. Success Criteria (definition of done)

The take-home is successful when:

1. CognoDB holds the only application data.
2. NestJS serves parameterized Cypher via REST; Next.js never talks to CognoDB.
3. README includes use case, why graph, model diagram, setup, queries, screenshots.
4. At least one ≥2-hop query and one relationship-oriented recommendation/gap query are documented and used by the UI.
5. UI supports profile, recommendations, match score, skill gap, job/company detail, search/filter, and graph explorer with proper states.
6. Hosted demo and short screen recording exist.
7. The author can defend every module and query in an interview without apologizing for dead abstractions.

---

## 15. Next Steps (after approval)

Await further instructions before:

- scaffolding Nest/Next projects,
- installing packages,
- writing seed data or application code.

When approved, start with **Phase 0 (CognoDB connectivity spike)** then **Phase 1**.
