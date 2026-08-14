/**
 * Phase 0 connectivity probe — never prints password values.
 */
import neo4j from 'neo4j-driver';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main(): Promise<void> {
  loadEnvFile(path.join(__dirname, '..', '.env'));

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER || 'cognodb';
  const password = process.env.COGNODB_PASSWORD || '';

  if (!uri) {
    throw new Error('COGNODB_URI is not set. Copy backend/.env.example to backend/.env.');
  }

  console.log(`URI: ${uri}`);
  console.log(`User: ${user}`);
  console.log(`Password configured: ${password.length > 0 ? 'yes' : 'no'}`);
  console.log(`Driver version: ${require('neo4j-driver/package.json').version}`);

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    connectionTimeout: 20_000,
    logging: {
      level: 'info',
      logger: (level, message) => console.log(`[neo4j:${level}] ${message}`),
    },
  });

  try {
    const info = await driver.verifyConnectivity();
    console.log('verifyConnectivity OK', JSON.stringify(info));

    const session = driver.session();
    try {
      const result = await session.run('RETURN 1 AS result', {});
      const raw = result.records[0].get('result');
      const numeric = neo4j.isInt(raw) ? raw.toNumber() : Number(raw);
      console.log(`Cypher OK: result=${numeric}`);
    } finally {
      await session.close();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`FAILED: ${message}`);
  } finally {
    await driver.close();
  }
}

main();
