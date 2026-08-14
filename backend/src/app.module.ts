import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CompaniesModule } from './companies/companies.module';
import { DatabaseModule } from './database/database.module';
import { DevelopersModule } from './developers/developers.module';
import { GraphModule } from './graph/graph.module';
import { HealthModule } from './health/health.module';
import { JobsModule } from './jobs/jobs.module';
import { RecommendationsModule } from './recommendations/recommendations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
    DevelopersModule,
    JobsModule,
    CompaniesModule,
    RecommendationsModule,
    GraphModule,
  ],
})
export class AppModule {}
