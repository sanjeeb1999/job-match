import { apiGet } from "./client";
import { ApiError } from "./errors";
import type { HealthStatus, ReadyStatus } from "@/types/api";

export async function getHealth(): Promise<HealthStatus> {
  return apiGet<HealthStatus>("/health");
}

export async function getReady(): Promise<ReadyStatus> {
  try {
    return await apiGet<ReadyStatus>("/health/ready");
  } catch (error) {
    if (error instanceof ApiError && (error.status === 503 || error.status === 0)) {
      return { status: "error", database: "unavailable" };
    }
    throw error;
  }
}
