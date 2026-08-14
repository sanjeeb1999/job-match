import { ApiProperty } from '@nestjs/swagger';

export class CompanySummaryDto {
  @ApiProperty({ example: 'co-novastack' })
  id: string;

  @ApiProperty({ example: 'NovaStack Labs' })
  name: string;

  @ApiProperty({ example: 'SaaS' })
  industry: string;

  @ApiProperty({ example: 'Bengaluru, India' })
  location: string;

  @ApiProperty({ required: false, example: 'startup' })
  size?: string;
}

export class JobSummaryDto {
  @ApiProperty({ example: 'job-react-dev' })
  id: string;

  @ApiProperty({ example: 'React Developer' })
  title: string;

  @ApiProperty({ example: 'Bengaluru, India' })
  location: string;

  @ApiProperty({ example: 'full-time', enum: ['full-time', 'contract'] })
  employmentType: string;

  @ApiProperty({ example: 'mid', enum: ['junior', 'mid', 'senior'] })
  experienceLevel: string;

  @ApiProperty({ example: 'open', enum: ['open', 'closed'] })
  status: string;

  @ApiProperty({ example: '2026-06-12' })
  postedAt: string;
}

export class JobListItemDto extends JobSummaryDto {
  @ApiProperty({ type: CompanySummaryDto })
  company: CompanySummaryDto;
}

export class JobDetailJobDto extends JobSummaryDto {
  @ApiProperty()
  description: string;
}

export class JobSkillDto {
  @ApiProperty({ example: 'skill-react' })
  id: string;

  @ApiProperty({ example: 'React' })
  name: string;

  @ApiProperty({ example: 'framework' })
  category: string;

  @ApiProperty({ example: true })
  required: boolean;
}

export class JobTechnologyDto {
  @ApiProperty({ example: 'tech-react' })
  id: string;

  @ApiProperty({ example: 'React' })
  name: string;

  @ApiProperty({ example: 'frontend' })
  category: string;

  @ApiProperty({ example: 'primary' })
  importance: string;
}

export class JobDetailDto {
  @ApiProperty({ type: JobDetailJobDto })
  job: JobDetailJobDto;

  @ApiProperty({ type: CompanySummaryDto })
  company: CompanySummaryDto;

  @ApiProperty({ type: [JobSkillDto] })
  requiredSkills: JobSkillDto[];

  @ApiProperty({ type: [JobSkillDto] })
  niceToHaveSkills: JobSkillDto[];

  @ApiProperty({ type: [JobTechnologyDto] })
  technologies: JobTechnologyDto[];
}

export class JobListResponseDto {
  @ApiProperty({ type: [JobListItemDto] })
  data: JobListItemDto[];
}

export class JobDetailResponseDto {
  @ApiProperty({ type: JobDetailDto })
  data: JobDetailDto;
}
