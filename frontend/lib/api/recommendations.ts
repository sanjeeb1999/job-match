import { apiGet } from "./client";
import type { ApiData, RecommendationsData, SkillGap } from "@/types/api";

export async function getRecommendations(
  developerId: string,
  limit?: number,
): Promise<RecommendationsData> {
  const response = await apiGet<ApiData<RecommendationsData>>(
    `/recommendations/${encodeURIComponent(developerId)}`,
    { limit },
  );
  return response.data;
}

export async function getSkillGap(
  developerId: string,
  jobId: string,
): Promise<SkillGap> {
  const response = await apiGet<ApiData<SkillGap>>(
    `/recommendations/${encodeURIComponent(developerId)}/jobs/${encodeURIComponent(jobId)}/skill-gap`,
  );
  return response.data;
}
