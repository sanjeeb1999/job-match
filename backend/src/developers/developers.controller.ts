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
import { optionalText, requireId } from '../common/query.util';
import {
  DatabaseUnavailableDto,
  HttpErrorDto,
  NotFoundErrorDto,
} from '../common/swagger/error.dto';
import {
  DeveloperListResponseDto,
  DeveloperProfileResponseDto,
} from '../common/swagger/developers.dto';
import { DevelopersService } from './developers.service';

@ApiTags('developers')
@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Get()
  @ApiOperation({
    summary: 'List developers',
    description:
      'Returns developers for the selector. Optional search matches name or title.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Case-insensitive match on developer name or title',
    example: 'React',
  })
  @ApiOkResponse({ type: DeveloperListResponseDto })
  @ApiServiceUnavailableResponse({ type: DatabaseUnavailableDto })
  async list(@Query('search') search?: string) {
    const data = await this.developersService.list(optionalText(search));
    return { data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get developer profile',
    description:
      'Returns the developer plus HAS_SKILL skills and WORKED_ON projects with technologies.',
  })
  @ApiParam({ name: 'id', example: 'dev-priya', description: 'Developer id' })
  @ApiOkResponse({ type: DeveloperProfileResponseDto })
  @ApiBadRequestResponse({ type: HttpErrorDto })
  @ApiNotFoundResponse({ type: NotFoundErrorDto })
  @ApiServiceUnavailableResponse({ type: DatabaseUnavailableDto })
  async getById(@Param('id') id: string) {
    const data = await this.developersService.getById(requireId(id, 'developer'));
    return { data };
  }
}
