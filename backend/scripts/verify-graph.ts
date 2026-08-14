/**
 * Development-only CognoDB verification. Never prints secrets.
 */
import neo4j, { Session } from 'neo4j-driver';
import {
  HEALTH_PING,
  NODE_COUNT_QUERIES,
  RELATIONSHIP_COUNT_QUERIES,
} from '../src/database/cypher/health.cypher';
import {
  COMPANIES_WITHOUT_JOBS,
  DEVELOPERS_WITHOUT_SKILLS,
  DEVELOPERS_WITH_APPLICATIONS,
  DEVELOPERS_WITH_MULTIPLE_SKILLS,
  DEVELOPERS_WITH_PROJECTS,
  DUPLICATE_IDS_BY_LABEL,
  DUPLICATE_RELATIONSHIPS,
  JOBS_WITHOUT_COMPANY,
  JOBS_WITHOUT_REQUIRED_SKILLS,
  JOBS_WITH_MULTIPLE_REQUIRED_SKILLS,
  JOBS_WITH_REQUIRED_AND_NICE_SKILLS,
  MULTI_HOP_PATHS,
  PROJECTS_WITHOUT_DEVELOPER,
  PROJECTS_WITH_MULTIPLE_TECHNOLOGIES,
} from '../src/database/cypher/verify.cypher';
import { toNumber } from '../src/database/neo4j.utils';
import { requireCognoDbEnv } from './load-env';

async function countOf(session: Session, cypher: string): Promise<number> {
  const result = await session.run(cypher, {});
  return toNumber(result.records[0].get('count'));
}

async function main(): Promise<void> {
  const { uri, user, password } = requireCognoDbEnv();
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    connectionTimeout: 20_000,
  });
  const session = driver.session();
  let failed = false;

  try {
    const ping = await session.run(HEALTH_PING, {});
    console.log(`ping: ${toNumber(ping.records[0].get('result'))}`);

    console.log('nodes by label:');
    for (const [label, cypher] of Object.entries(NODE_COUNT_QUERIES)) {
      console.log(`  ${label}: ${await countOf(session, cypher)}`);
    }

    console.log('relationships by type:');
    for (const [type, cypher] of Object.entries(RELATIONSHIP_COUNT_QUERIES)) {
      console.log(`  ${type}: ${await countOf(session, cypher)}`);
    }

    const checks: Array<[string, string, (value: number) => boolean]> = [
      ['developer with multiple skills', DEVELOPERS_WITH_MULTIPLE_SKILLS, (n) => n >= 1],
      [
        'job with multiple required skills',
        JOBS_WITH_MULTIPLE_REQUIRED_SKILLS,
        (n) => n >= 1,
      ],
      ['developer worked on a project', DEVELOPERS_WITH_PROJECTS, (n) => n >= 1],
      [
        'project uses multiple technologies',
        PROJECTS_WITH_MULTIPLE_TECHNOLOGIES,
        (n) => n >= 1,
      ],
      [
        'multi-hop Developer → Project → Technology ← Job',
        MULTI_HOP_PATHS,
        (n) => n >= 1,
      ],
      ['developer applied to a job', DEVELOPERS_WITH_APPLICATIONS, (n) => n >= 1],
      [
        'job with required and nice-to-have skills',
        JOBS_WITH_REQUIRED_AND_NICE_SKILLS,
        (n) => n >= 1,
      ],
      ['jobs without company', JOBS_WITHOUT_COMPANY, (n) => n === 0],
      ['companies without jobs', COMPANIES_WITHOUT_JOBS, (n) => n === 0],
      ['developers without skills', DEVELOPERS_WITHOUT_SKILLS, (n) => n === 0],
      ['projects without developer', PROJECTS_WITHOUT_DEVELOPER, (n) => n === 0],
      [
        'jobs without required skills',
        JOBS_WITHOUT_REQUIRED_SKILLS,
        (n) => n === 0,
      ],
    ];

    console.log('quality checks:');
    for (const [name, cypher, ok] of checks) {
      const value = await countOf(session, cypher);
      const passed = ok(value);
      console.log(`  ${passed ? 'pass' : 'FAIL'} ${name}: ${value}`);
      if (!passed) failed = true;
    }

    console.log('duplicate ids:');
    for (const [label, cypher] of Object.entries(DUPLICATE_IDS_BY_LABEL)) {
      const value = await countOf(session, cypher);
      const passed = value === 0;
      console.log(`  ${passed ? 'pass' : 'FAIL'} ${label}: ${value}`);
      if (!passed) failed = true;
    }

    console.log('duplicate relationships:');
    for (const [type, cypher] of Object.entries(DUPLICATE_RELATIONSHIPS)) {
      const value = await countOf(session, cypher);
      const passed = value === 0;
      console.log(`  ${passed ? 'pass' : 'FAIL'} ${type}: ${value}`);
      if (!passed) failed = true;
    }
  } finally {
    await session.close();
    await driver.close();
  }

  if (failed) {
    throw new Error('One or more graph quality checks failed');
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`verify-graph failed: ${message}`);
  process.exit(1);
});
