import neo4j, { Driver } from 'neo4j-driver';

export const NEO4J_DRIVER = 'NEO4J_DRIVER';

export const neo4jProvider = {
  provide: NEO4J_DRIVER,
  useFactory: (): Driver => {
    const uri = process.env.COGNODB_URI;
    const user = process.env.COGNODB_USER;
    const password = process.env.COGNODB_PASSWORD;

    if (!uri || !user) {
      throw new Error(
        'Missing CognoDB configuration. Set COGNODB_URI and COGNODB_USER in backend/.env',
      );
    }

    if (!password) {
      console.warn(
        'COGNODB_PASSWORD is empty. Set it in backend/.env — /api/health/ready will fail until configured.',
      );
    }

    return neo4j.driver(uri, neo4j.auth.basic(user, password ?? ''), {
      connectionTimeout: 20_000,
    });
  },
};
