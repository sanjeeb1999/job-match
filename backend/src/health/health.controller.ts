import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HEALTH_PING } from '../database/cypher/health.cypher';
import { Neo4jService } from '../database/neo4j.service';
import { HealthUnavailableDto } from '../common/swagger/error.dto';
import { HealthOkDto, ReadyOkDto } from '../common/swagger/health.dto';
import { redactForLogs } from '../common/safe-error';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly neo4jService: Neo4jService) {}

  @Get()
  @ApiOperation({ summary: 'Process liveness check' })
  @ApiOkResponse({ type: HealthOkDto, description: 'NestJS process is running' })
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'CognoDB readiness check',
    description:
      'Verifies connectivity and runs a parameterized Cypher ping: RETURN 1 AS result.',
  })
  @ApiOkResponse({ type: ReadyOkDto, description: 'CognoDB is reachable' })
  @ApiServiceUnavailableResponse({
    description: 'CognoDB is unavailable',
    type: HealthUnavailableDto,
  })
  async getReady(): Promise<{ status: string; database: string }> {
    try {
      await this.neo4jService.verifyConnectivity();

      const result = await this.neo4jService.run(HEALTH_PING, {});
      const numeric = this.neo4jService.toNumber(
        result.records[0]?.get('result'),
      );

      if (numeric !== 1) {
        throw new Error('Unexpected Cypher result from CognoDB');
      }

      return {
        status: 'ok',
        database: 'connected',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      this.logger.error(
        `CognoDB readiness check failed: ${redactForLogs(message)}`,
      );

      throw new HttpException(
        {
          status: 'error',
          database: 'unavailable',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
