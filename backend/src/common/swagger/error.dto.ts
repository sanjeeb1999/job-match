import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HttpErrorDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Invalid developer id' })
  message: string;

  @ApiPropertyOptional({ example: 'Bad Request' })
  error?: string;
}

export class NotFoundErrorDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Developer not found' })
  message: string;
}

export class DatabaseUnavailableDto {
  @ApiProperty({ example: 503 })
  statusCode: number;

  @ApiProperty({ example: 'Database unavailable' })
  message: string;
}

export class HealthUnavailableDto {
  @ApiProperty({ example: 'error' })
  status: string;

  @ApiProperty({ example: 'unavailable' })
  database: string;
}
