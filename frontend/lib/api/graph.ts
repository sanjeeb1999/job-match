import { apiGet } from "./client";
import type { ApiData, MatchGraph } from "@/types/api";

export async function getMatchGraph(
  developerId: string,
  jobId: string,
): Promise<MatchGraph> {
  const response = await apiGet<ApiData<MatchGraph>>(
    `/graph/match/${encodeURIComponent(developerId)}/${encodeURIComponent(jobId)}`,
  );
  return response.data;
}
