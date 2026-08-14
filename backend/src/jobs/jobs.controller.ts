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
import {
  optionalEmploymentType,
  optionalExperienceLevel,
  optionalJobStatus,
  optionalText,
  requireId,
} from '../common/query.util';
import {
  DatabaseUnavailableDto,
  HttpErrorDto,
  NotFoundErrorDto,
} from '../common/swagger/error.dto';
import {
  JobDetailResponseDto,
  JobListResponseDto,
} from '../common/swagger/jobs.dto';
import { JobsService } from './jobs.service';

const DEFAULT_JOB_STATUS = 'open';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({
    summary: 'List jobs',
    description:
      'Returns open jobs by default, with company summaries. Filters are parameterized.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Match against job title or description',
    example: 'Nest',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    example: 'Remote',
  })
  @ApiQuery({
    name: 'experienceLevel',
    required: false,
    enum: ['junior', 'mid', 'senior'],
  })
  @ApiQuery({
    name: 'employmentType',
    required: false,
    enum: ['full-time', 'contract'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['open', 'closed'],
    description: 'Defaults to open',
  })
  @ApiOkResponse({ type: JobListResponseDto })
  @ApiBadRequestResponse({ type: HttpErrorDto })
  @ApiServiceUnavailableResponse({ type: DatabaseUnavailableDto })
  async list(
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('experienceLevel') experienceLevel?: string,
    @Query('employmentType') employmentType?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.jobsService.list({
      search: optionalText(search),
      location: optionalText(location),
      experienceLevel: optionalExperienceLevel(experienceLevel),
      employmentType: optionalEmploymentType(employmentType),
      status: optionalJobStatus(status) || DEFAULT_JOB_STATUS,
    });
    return { data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get job detail',
    description:
      'Returns the job, posting company, required/nice-to-have skills, and technologies.',
  })
  @ApiParam({ name: 'id', example: 'job-nestjs-backend', description: 'Job id' })
  @ApiOkResponse({ type: JobDetailResponseDto })
  @ApiBadRequestResponse({ type: HttpErrorDto })
  @ApiNotFoundResponse({ type: NotFoundErrorDto })
  @ApiServiceUnavailableResponse({ type: DatabaseUnavailableDto })
  async getById(@Param('id') id: string) {
    const data = await this.jobsService.getById(requireId(id, 'job'));
    return { data };
  }
}
