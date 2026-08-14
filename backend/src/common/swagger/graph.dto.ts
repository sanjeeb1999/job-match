import { ApiProperty } from '@nestjs/swagger';

export class GraphNodeDto {
  @ApiProperty({ example: 'dev-priya' })
  id: string;

  @ApiProperty({
    example: 'Developer',
    enum: ['Developer', 'Skill', 'Job', 'Company', 'Project', 'Technology'],
  })
  label: string;

  @ApiProperty({ example: 'Priya Nair' })
  name: string;

  @ApiProperty({
    example: { title: 'Frontend React Developer', experienceLevel: 'mid' },
  })
  properties: Record<string, string | number | boolean>;
}

export class GraphRelationshipDto {
  @ApiProperty({ example: 'dev-priya-WORKED_ON-proj-fintech-dashboard' })
  id: string;

  @ApiProperty({ example: 'dev-priya' })
  source: string;

  @ApiProperty({ example: 'proj-fintech-dashboard' })
  target: string;

  @ApiProperty({
    example: 'WORKED_ON',
    enum: [
      'HAS_SKILL',
      'WORKED_ON',
      'USES',
      'REQUIRES',
      'POSTED_BY',
      'APPLIED_TO',
    ],
  })
  type: string;

  @ApiProperty({ example: { role: 'Frontend Engineer', years: 2 } })
  properties: Record<string, string | number | boolean>;
}

export class MatchGraphDto {
  @ApiProperty({ type: [GraphNodeDto] })
  nodes: GraphNodeDto[];

  @ApiProperty({ type: [GraphRelationshipDto] })
  relationships: GraphRelationshipDto[];
}

export class MatchGraphResponseDto {
  @ApiProperty({ type: MatchGraphDto })
  data: MatchGraphDto;
}
