import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { requireId } from '../common/query.util';
import {
  DatabaseUnavailableDto,
  HttpErrorDto,
  NotFoundErrorDto,
} from '../common/swagger/error.dto';
import { MatchGraphResponseDto } from '../common/swagger/graph.dto';
import { GraphService } from './graph.service';

@ApiTags('graph')
@Controller('graph')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get('match/:developerId/:jobId')
  @ApiOperation({
    summary: 'Match neighborhood graph',
    description:
      'Returns nodes and relationships for one developer and one job. Includes HAS_SKILL, WORKED_ON, Project/Job USES Technology, REQUIRES, POSTED_BY, and APPLIED_TO when present. Cypher is server-side and parameterized; the client cannot send queries.',
  })
  @ApiParam({
    name: 'developerId',
    example: 'dev-priya',
    description: 'Developer id',
  })
  @ApiParam({
    name: 'jobId',
    example: 'job-platform',
    description: 'Job id',
  })
  @ApiOkResponse({ type: MatchGraphResponseDto })
  @ApiBadRequestResponse({ type: HttpErrorDto })
  @ApiNotFoundResponse({ type: NotFoundErrorDto })
  @ApiServiceUnavailableResponse({ type: DatabaseUnavailableDto })
  async getMatchGraph(
    @Param('developerId') developerId: string,
    @Param('jobId') jobId: string,
  ) {
    const data = await this.graphService.getMatchGraph(
      requireId(developerId, 'developer'),
      requireId(jobId, 'job'),
    );
    return { data };
  }
}
