import { ApiProperty } from '@nestjs/swagger';
import { CompanySummaryDto } from './jobs.dto';

export class CompanyJobSummaryDto {
  @ApiProperty({ example: 'job-react-dev' })
  id: string;

  @ApiProperty({ example: 'React Developer' })
  title: string;

  @ApiProperty({ example: 'Bengaluru, India' })
  location: string;

  @ApiProperty({ example: 'full-time' })
  employmentType: string;

  @ApiProperty({ example: 'mid' })
  experienceLevel: string;

  @ApiProperty({ example: 'open' })
  status: string;
}

export class CompanyDetailDto {
  @ApiProperty({ type: CompanySummaryDto })
  company: CompanySummaryDto;

  @ApiProperty({ type: [CompanyJobSummaryDto] })
  jobs: CompanyJobSummaryDto[];
}

export class CompanyDetailResponseDto {
  @ApiProperty({ type: CompanyDetailDto })
  data: CompanyDetailDto;
}
