import { ApiProperty } from '@nestjs/swagger';

export class DeveloperSummaryDto {
  @ApiProperty({ example: 'dev-priya' })
  id: string;

  @ApiProperty({ example: 'Priya Nair' })
  name: string;

  @ApiProperty({ example: 'Frontend React Developer' })
  title: string;

  @ApiProperty({ example: 4 })
  experienceYears: number;

  @ApiProperty({ example: 'mid', enum: ['junior', 'mid', 'senior'] })
  experienceLevel: string;

  @ApiProperty({ example: 'Bengaluru, India' })
  location: string;
}

export class DeveloperSkillDto {
  @ApiProperty({ example: 'skill-react' })
  id: string;

  @ApiProperty({ example: 'React' })
  name: string;

  @ApiProperty({ example: 'framework' })
  category: string;

  @ApiProperty({ example: 'expert' })
  proficiency: string;

  @ApiProperty({ example: 4 })
  years: number;
}

export class ProjectTechnologyDto {
  @ApiProperty({ example: 'tech-nextjs' })
  id: string;

  @ApiProperty({ example: 'Next.js' })
  name: string;

  @ApiProperty({ example: 'frontend' })
  category: string;
}

export class DeveloperProjectDto {
  @ApiProperty({ example: 'proj-fintech-dashboard' })
  id: string;

  @ApiProperty({ example: 'FinTech Dashboard' })
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ example: 'finance' })
  domain: string;

  @ApiProperty({ example: 'Frontend Engineer' })
  role: string;

  @ApiProperty({ example: 2 })
  years: number;

  @ApiProperty({ type: [ProjectTechnologyDto] })
  technologies: ProjectTechnologyDto[];
}

export class DeveloperProfileDto {
  @ApiProperty({ type: DeveloperSummaryDto })
  developer: DeveloperSummaryDto;

  @ApiProperty({ type: [DeveloperSkillDto] })
  skills: DeveloperSkillDto[];

  @ApiProperty({ type: [DeveloperProjectDto] })
  projects: DeveloperProjectDto[];
}

export class DeveloperListResponseDto {
  @ApiProperty({ type: [DeveloperSummaryDto] })
  data: DeveloperSummaryDto[];
}

export class DeveloperProfileResponseDto {
  @ApiProperty({ type: DeveloperProfileDto })
  data: DeveloperProfileDto;
}
