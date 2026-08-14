import { ApiProperty } from '@nestjs/swagger';

export class RecommendationDeveloperDto {
  @ApiProperty({ example: 'dev-priya' })
  id: string;

  @ApiProperty({ example: 'Priya Nair' })
  name: string;

  @ApiProperty({ example: 'Frontend React Developer' })
  title: string;
}

export class RecommendationJobDto {
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
}

export class RecommendationCompanyDto {
  @ApiProperty({ example: 'co-novastack' })
  id: string;

  @ApiProperty({ example: 'NovaStack Labs' })
  name: string;
}

export class RecommendationScoreDto {
  @ApiProperty({ example: 87, description: 'Weighted overall score, 0–100' })
  overall: number;

  @ApiProperty({ example: 100, description: 'Required-skill coverage, 0–100' })
  mustHave: number;

  @ApiProperty({ example: 75, description: 'Nice-to-have coverage, 0–100' })
  niceToHave: number;

  @ApiProperty({
    example: 80,
    description: 'Project→technology multi-hop overlap, 0–100',
  })
  technologyOverlap: number;

  @ApiProperty({ example: 100, description: 'Experience-level fitness, 0–100' })
  levelFitness: number;
}

export class NamedSkillDto {
  @ApiProperty({ example: 'skill-react' })
  id: string;

  @ApiProperty({ example: 'React' })
  name: string;

  @ApiProperty({ example: 'framework' })
  category: string;

  @ApiProperty({ required: false, example: true })
  required?: boolean;
}

export class RecommendationSkillsDto {
  @ApiProperty({ type: [NamedSkillDto] })
  matchedRequired: NamedSkillDto[];

  @ApiProperty({ type: [NamedSkillDto] })
  missingRequired: NamedSkillDto[];

  @ApiProperty({ type: [NamedSkillDto] })
  matchedNiceToHave: NamedSkillDto[];

  @ApiProperty({ type: [NamedSkillDto] })
  missingNiceToHave: NamedSkillDto[];
}

export class OverlappingTechnologyDto {
  @ApiProperty({ example: 'tech-react' })
  id: string;

  @ApiProperty({ example: 'React' })
  name: string;

  @ApiProperty({ example: 'frontend' })
  category: string;
}

export class RecommendationItemDto {
  @ApiProperty({ type: RecommendationJobDto })
  job: RecommendationJobDto;

  @ApiProperty({ type: RecommendationCompanyDto })
  company: RecommendationCompanyDto;

  @ApiProperty({ type: RecommendationScoreDto })
  score: RecommendationScoreDto;

  @ApiProperty({ type: RecommendationSkillsDto })
  skills: RecommendationSkillsDto;

  @ApiProperty({ type: [OverlappingTechnologyDto] })
  technologyOverlap: OverlappingTechnologyDto[];

  @ApiProperty({
    example: ['Matches 4 of 4 required skills', 'Experience level is a strong fit'],
  })
  explanation: string[];
}

export class RecommendationsDataDto {
  @ApiProperty({ type: RecommendationDeveloperDto })
  developer: RecommendationDeveloperDto;

  @ApiProperty({ type: [RecommendationItemDto] })
  recommendations: RecommendationItemDto[];
}

export class RecommendationsResponseDto {
  @ApiProperty({ type: RecommendationsDataDto })
  data: RecommendationsDataDto;
}

export class SkillGapDataDto {
  @ApiProperty({ example: 'dev-priya' })
  developerId: string;

  @ApiProperty({ example: 'job-platform' })
  jobId: string;

  @ApiProperty({ type: [NamedSkillDto] })
  matchedRequiredSkills: NamedSkillDto[];

  @ApiProperty({ type: [NamedSkillDto] })
  missingRequiredSkills: NamedSkillDto[];

  @ApiProperty({ type: [NamedSkillDto] })
  matchedNiceToHaveSkills: NamedSkillDto[];

  @ApiProperty({ type: [NamedSkillDto] })
  missingNiceToHaveSkills: NamedSkillDto[];
}

export class SkillGapResponseDto {
  @ApiProperty({ type: SkillGapDataDto })
  data: SkillGapDataDto;
}
