import { apiGet } from "./client";
import type { ApiData, JobDetail, JobListItem, JobListParams } from "@/types/api";

export async function getJobs(params?: JobListParams): Promise<JobListItem[]> {
  const response = await apiGet<ApiData<JobListItem[]>>("/jobs", params);
  return response.data;
}

export async function getJob(id: string): Promise<JobDetail> {
  const response = await apiGet<ApiData<JobDetail>>(
    `/jobs/${encodeURIComponent(id)}`,
  );
  return response.data;
}
