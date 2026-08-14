import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  Driver,
  ManagedTransaction,
  QueryResult,
  RecordShape,
  Session,
} from 'neo4j-driver';
import { NEO4J_DRIVER } from './neo4j.provider';
import { toNative, toNumber } from './neo4j.utils';
import { redactForLogs } from '../common/safe-error';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  private readonly logger = new Logger(Neo4jService.name);

  constructor(@Inject(NEO4J_DRIVER) private readonly driver: Driver) {}

  async onApplicationShutdown(): Promise<void> {
    this.logger.log('Closing Neo4j driver');
    await this.driver.close();
  }

  async verifyConnectivity(): Promise<void> {
    this.assertCredentialsConfigured();
    await this.driver.verifyConnectivity();
  }

  toNumber(value: unknown): number {
    return toNumber(value);
  }

  toNative<T = unknown>(value: unknown): T {
    return toNative<T>(value);
  }

  async run<T extends RecordShape = RecordShape>(
    cypher: string,
    params: Record<string, unknown> = {},
  ): Promise<QueryResult<T>> {
    return this.withSession((session) => session.run<T>(cypher, params));
  }

  async read<T extends RecordShape = RecordShape>(
    cypher: string,
    params: Record<string, unknown> = {},
  ): Promise<QueryResult<T>> {
    return this.withSession((session) =>
      session.executeRead((tx: ManagedTransaction) => tx.run<T>(cypher, params)),
    );
  }

  async write<T extends RecordShape = RecordShape>(
    cypher: string,
    params: Record<string, unknown> = {},
  ): Promise<QueryResult<T>> {
    return this.withSession((session) =>
      session.executeWrite((tx: ManagedTransaction) =>
        tx.run<T>(cypher, params),
      ),
    );
  }

  async writeTransaction<T>(
    work: (tx: ManagedTransaction) => Promise<T>,
  ): Promise<T> {
    return this.withSession((session) => session.executeWrite(work));
  }

  private async withSession<T>(
    work: (session: Session) => Promise<T>,
  ): Promise<T> {
    this.assertCredentialsConfigured();
    const session = this.driver.session();

    try {
      return await work(session);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      this.logger.error(`CognoDB query failed: ${redactForLogs(message)}`);
      throw error;
    } finally {
      await session.close();
    }
  }

  private assertCredentialsConfigured(): void {
    if (!process.env.COGNODB_PASSWORD) {
      throw new Error(
        'COGNODB_PASSWORD is not set. Add it to backend/.env and restart the server.',
      );
    }
  }
}
