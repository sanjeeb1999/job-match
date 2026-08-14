import { Global, Module } from '@nestjs/common';
import { neo4jProvider } from './neo4j.provider';
import { Neo4jService } from './neo4j.service';

@Global()
@Module({
  providers: [neo4jProvider, Neo4jService],
  exports: [Neo4jService],
})
export class DatabaseModule {}
