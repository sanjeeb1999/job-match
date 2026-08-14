/**
 * Idempotent CognoDB seed. Never prints secrets.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Neo4jService } from '../src/database/neo4j.service';
import {
  MERGE_APPLIED_TO,
  MERGE_COMPANIES,
  MERGE_DEVELOPERS,
  MERGE_HAS_SKILL,
  MERGE_JOBS,
  MERGE_JOB_USES,
  MERGE_POSTED_BY,
  MERGE_PROJECTS,
  MERGE_PROJECT_USES,
  MERGE_REQUIRES,
  MERGE_SKILLS,
  MERGE_TECHNOLOGIES,
  MERGE_WORKED_ON,
} from '../src/database/cypher/seed.cypher';
import { loadBackendEnv } from './load-env';
import {
  appliedTo,
  companies,
  developers,
  hasSkills,
  jobs,
  jobUses,
  postedBy,
  projects,
  projectUses,
  requires,
  skills,
  technologies,
  workedOn,
} from './seed-data';

async function main(): Promise<void> {
  loadBackendEnv();

  console.log('Seeding JobMatch Graph...');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });

  try {
    const neo4j = app.get(Neo4jService);

    await neo4j.writeTransaction(async (tx) => {
      await tx.run(MERGE_SKILLS, { rows: skills });
      await tx.run(MERGE_TECHNOLOGIES, { rows: technologies });
      await tx.run(MERGE_COMPANIES, { rows: companies });
      await tx.run(MERGE_DEVELOPERS, { rows: developers });
      await tx.run(MERGE_PROJECTS, { rows: projects });
      await tx.run(MERGE_JOBS, { rows: jobs });
    });
    console.log('✓ Developers');
    console.log('✓ Skills');
    console.log('✓ Technologies');
    console.log('✓ Companies');
    console.log('✓ Jobs');
    console.log('✓ Projects');

    await neo4j.writeTransaction(async (tx) => {
      await tx.run(MERGE_HAS_SKILL, { rows: hasSkills });
      await tx.run(MERGE_WORKED_ON, { rows: workedOn });
      await tx.run(MERGE_PROJECT_USES, { rows: projectUses });
      await tx.run(MERGE_REQUIRES, { rows: requires });
      await tx.run(MERGE_JOB_USES, { rows: jobUses });
      await tx.run(MERGE_POSTED_BY, { rows: postedBy });
      await tx.run(MERGE_APPLIED_TO, { rows: appliedTo });
    });
    console.log('✓ Relationships');
    console.log('Seed completed successfully.');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`seed failed: ${message}`);
  process.exit(1);
});
