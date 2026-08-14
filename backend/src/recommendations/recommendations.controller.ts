import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { requireId } from '../common/query.util';
import {
  DatabaseUnavailableDto,
  HttpErrorDto,
  NotFoundErrorDto,
} from '../common/swagger/error.dto';
import {
  RecommendationsResponseDto,
  SkillGapResponseDto,
} from '../common/swagger/recommendations.dto';
import { optionalLimit } from './limit';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get(':developerId')
  @ApiOperation({
    summary: 'Recommend open jobs for a developer',
    description:
      'Ranks open jobs the developer has not applied to. Score weights: required skills 60%, nice-to-have 20%, technology overlap 15%, level fitness 5%. Technology overlap uses Developer → Project → Technology ← Job.',
  })
  @ApiParam({
    name: 'developerId',
    example: 'dev-priya',
    description: 'Developer id',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Max recommendations to return (1–50). Defaults to 10.',
    example: 10,
  })
  @ApiOkResponse({ type: RecommendationsResponseDto })
  @ApiBadRequestResponse({ type: HttpErrorDto })
  @ApiNotFoundResponse({ type: NotFoundErrorDto })
  @ApiServiceUnavailableResponse({ type: DatabaseUnavailableDto })
  async recommend(
    @Param('developerId') developerId: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.recommendationsService.recommend(
      requireId(developerId, 'developer'),
      optionalLimit(limit),
    );
    return { data };
  }

  @Get(':developerId/jobs/:jobId/skill-gap')
  @ApiOperation({
    summary: 'Skill gap for a developer and job',
    description:
      'Returns matched and missing required and nice-to-have skills. Applied jobs are still included.',
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
  @ApiOkResponse({ type: SkillGapResponseDto })
  @ApiBadRequestResponse({ type: HttpErrorDto })
  @ApiNotFoundResponse({ type: NotFoundErrorDto })
  @ApiServiceUnavailableResponse({ type: DatabaseUnavailableDto })
  async skillGap(
    @Param('developerId') developerId: string,
    @Param('jobId') jobId: string,
  ) {
    const data = await this.recommendationsService.skillGap(
      requireId(developerId, 'developer'),
      requireId(jobId, 'job'),
    );
    return { data };
  }
}
