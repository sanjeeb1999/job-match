/**
 * Types that match NestJS API JSON. Do not invent fields.
 * List/detail envelopes use `{ data: ... }`.
 */

export interface Developer {
  id: string;
  name: string;
  title: string;
  experienceYears: number;
  experienceLevel: string;
  location: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface DeveloperSkill extends Skill {
  proficiency: string;
  years: number;
}

export interface NamedSkill extends Skill {
  required?: boolean;
}

export interface Technology {
  id: string;
  name: string;
  category: string;
}

export interface JobTechnology extends Technology {
  importance: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  domain: string;
  role: string;
  years: number;
  technologies: Technology[];
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  size?: string;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  status: string;
  postedAt: string;
}

export interface JobListItem extends Job {
  company: Company;
}

export interface JobDetailJob extends Job {
  description: string;
}

export interface JobDetail {
  job: JobDetailJob;
  company: Company;
  requiredSkills: NamedSkill[];
  niceToHaveSkills: NamedSkill[];
  technologies: JobTechnology[];
}

export interface CompanyJobSummary {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  status: string;
}

export interface CompanyDetail {
  company: Company;
  jobs: CompanyJobSummary[];
}

export interface DeveloperProfile {
  developer: Developer;
  skills: DeveloperSkill[];
  projects: Project[];
}

export interface RecommendationScore {
  overall: number;
  mustHave: number;
  niceToHave: number;
  technologyOverlap: number;
  levelFitness: number;
}

export interface RecommendationJob {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
}

export interface RecommendationCompany {
  id: string;
  name: string;
}

export interface RecommendationSkills {
  matchedRequired: NamedSkill[];
  missingRequired: NamedSkill[];
  matchedNiceToHave: NamedSkill[];
  missingNiceToHave: NamedSkill[];
}

export interface Recommendation {
  job: RecommendationJob;
  company: RecommendationCompany;
  score: RecommendationScore;
  skills: RecommendationSkills;
  technologyOverlap: Technology[];
  explanation: string[];
}

export interface RecommendationsData {
  developer: {
    id: string;
    name: string;
    title: string;
  };
  recommendations: Recommendation[];
}

export interface SkillGap {
  developerId: string;
  jobId: string;
  matchedRequiredSkills: NamedSkill[];
  missingRequiredSkills: NamedSkill[];
  matchedNiceToHaveSkills: NamedSkill[];
  missingNiceToHaveSkills: NamedSkill[];
}

export interface HealthStatus {
  status: string;
}

export interface ReadyStatus {
  status: string;
  database: string;
}

export interface ApiData<T> {
  data: T;
}

export interface JobListParams {
  search?: string;
  location?: string;
  experienceLevel?: string;
  employmentType?: string;
  status?: string;
}

export type GraphNodeLabel =
  | "Developer"
  | "Skill"
  | "Job"
  | "Company"
  | "Project"
  | "Technology";

export type GraphRelationshipType =
  | "HAS_SKILL"
  | "WORKED_ON"
  | "USES"
  | "REQUIRES"
  | "POSTED_BY"
  | "APPLIED_TO";

export type GraphPropertyValue = string | number | boolean;

export interface GraphNode {
  id: string;
  label: GraphNodeLabel;
  name: string;
  properties: Record<string, GraphPropertyValue>;
}

export interface GraphRelationship {
  id: string;
  source: string;
  target: string;
  type: GraphRelationshipType;
  properties: Record<string, GraphPropertyValue>;
}

export interface MatchGraph {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}
