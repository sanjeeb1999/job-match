"use client";

import { useCallback, useEffect, useState } from "react";
import { getRecommendations } from "@/lib/api/recommendations";
import type { Recommendation, RecommendationsData } from "@/types/api";

type LoadState = "idle" | "loading" | "success" | "error";

const DEFAULT_LIMIT = 10;

export function useRecommendations(developerId: string | null) {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [state, setState] = useState<LoadState>("idle");

  const load = useCallback(async () => {
    if (!developerId) {
      setData(null);
      setState("idle");
      return;
    }

    setState("loading");
    try {
      const result = await getRecommendations(developerId, DEFAULT_LIMIT);
      setData(result);
      setState("success");
    } catch {
      setData(null);
      setState("error");
    }
  }, [developerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const recommendations: Recommendation[] = data?.recommendations ?? [];

  return {
    data,
    recommendations,
    isLoading: state === "loading",
    isError: state === "error",
    retry: load,
  };
}
