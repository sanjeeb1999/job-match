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
import { CompanyDetailResponseDto } from '../common/swagger/companies.dto';
import {
  DatabaseUnavailableDto,
  HttpErrorDto,
  NotFoundErrorDto,
} from '../common/swagger/error.dto';
import { CompaniesService } from './companies.service';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get company detail',
    description: 'Returns the company and jobs posted via POSTED_BY.',
  })
  @ApiParam({
    name: 'id',
    example: 'co-novastack',
    description: 'Company id',
  })
  @ApiOkResponse({ type: CompanyDetailResponseDto })
  @ApiBadRequestResponse({ type: HttpErrorDto })
  @ApiNotFoundResponse({ type: NotFoundErrorDto })
  @ApiServiceUnavailableResponse({ type: DatabaseUnavailableDto })
  async getById(@Param('id') id: string) {
    const data = await this.companiesService.getById(
      requireId(id, 'company'),
    );
    return { data };
  }
}
