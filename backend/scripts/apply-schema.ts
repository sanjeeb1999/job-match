/**
 * Apply uniqueness constraints and id lookup indexes on CognoDB.
 * Idempotent. Never prints secrets. Does not create seed data.
 */
import neo4j from 'neo4j-driver';
import {
  ID_LOOKUP_INDEXES,
  UNIQUE_ID_CONSTRAINTS,
} from '../src/database/cypher/schema.cypher';
import { requireCognoDbEnv } from './load-env';

async function main(): Promise<void> {
  const { uri, user, password } = requireCognoDbEnv();
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    connectionTimeout: 20_000,
  });
  const session = driver.session();

  try {
    for (const cypher of UNIQUE_ID_CONSTRAINTS) {
      await session.run(cypher, {});
      console.log('constraint applied');
    }

    for (const cypher of ID_LOOKUP_INDEXES) {
      await session.run(cypher, {});
      console.log('index applied');
    }

    console.log(
      `schema ready: ${UNIQUE_ID_CONSTRAINTS.length} unique id constraints, ${ID_LOOKUP_INDEXES.length} id lookup indexes`,
    );
  } finally {
    await session.close();
    await driver.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`apply-schema failed: ${message}`);
  process.exit(1);
});
