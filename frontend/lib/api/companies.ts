import { apiGet } from "./client";
import type { ApiData, CompanyDetail } from "@/types/api";

export async function getCompany(id: string): Promise<CompanyDetail> {
  const response = await apiGet<ApiData<CompanyDetail>>(
    `/companies/${encodeURIComponent(id)}`,
  );
  return response.data;
}
