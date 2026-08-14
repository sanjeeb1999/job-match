import { apiGet } from "./client";
import type { ApiData, Developer, DeveloperProfile } from "@/types/api";

export async function getDevelopers(search?: string): Promise<Developer[]> {
  const response = await apiGet<ApiData<Developer[]>>("/developers", {
    search,
  });
  return response.data;
}

export async function getDeveloper(id: string): Promise<DeveloperProfile> {
  const response = await apiGet<ApiData<DeveloperProfile>>(
    `/developers/${encodeURIComponent(id)}`,
  );
  return response.data;
}
