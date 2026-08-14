import { ApiProperty } from '@nestjs/swagger';

export class HealthOkDto {
  @ApiProperty({ example: 'ok' })
  status: string;
}

export class ReadyOkDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 'connected' })
  database: string;
}
