import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
  const corsOrigin =
    process.env.CORS_ORIGIN ??
    (process.env.NODE_ENV === 'production'
      ? false
      : 'http://localhost:3000');

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'HEAD', 'OPTIONS'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('JobMatch Graph API')
    .setDescription(
      'Read APIs for developer profiles, jobs, companies, and explainable job recommendations backed by CognoDB. Database credentials are never exposed.',
    )
    .setVersion('1.0')
    .addTag('health', 'Process and CognoDB readiness checks')
    .addTag('developers', 'Developer selector and profile reads')
    .addTag('jobs', 'Job search and job detail reads')
    .addTag('companies', 'Company detail and posted jobs')
    .addTag('recommendations', 'Job matching, scoring, and skill-gap analysis')
    .addTag('graph', 'Developer/job match neighborhood for visualization')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);

  console.log(`JobMatch Graph API listening on port ${port} (prefix /api)`);
  console.log('Swagger UI available at /api/docs');
}

bootstrap();
