"use client";

import { useCallback, useRef, useState } from "react";
import { getSkillGap } from "@/lib/api/recommendations";
import type { SkillGap } from "@/types/api";

type LoadState = "idle" | "loading" | "success" | "error";

function cacheKey(developerId: string, jobId: string): string {
  return `${developerId}:${jobId}`;
}

export function useSkillGap() {
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const cacheRef = useRef(new Map<string, SkillGap>());
  const lastRef = useRef<{ developerId: string; jobId: string } | null>(null);

  const load = useCallback(async (developerId: string, jobId: string) => {
    lastRef.current = { developerId, jobId };
    const key = cacheKey(developerId, jobId);
    const cached = cacheRef.current.get(key);
    if (cached) {
      setSkillGap(cached);
      setState("success");
      return;
    }

    setState("loading");
    setSkillGap(null);
    try {
      const data = await getSkillGap(developerId, jobId);
      cacheRef.current.set(key, data);
      setSkillGap(data);
      setState("success");
    } catch {
      setSkillGap(null);
      setState("error");
    }
  }, []);

  const retry = useCallback(async () => {
    const last = lastRef.current;
    if (!last) {
      return;
    }
    cacheRef.current.delete(cacheKey(last.developerId, last.jobId));
    await load(last.developerId, last.jobId);
  }, [load]);

  const reset = useCallback(() => {
    setSkillGap(null);
    setState("idle");
    lastRef.current = null;
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    reset();
  }, [reset]);

  return {
    skillGap,
    isLoading: state === "loading",
    isError: state === "error",
    load,
    retry,
    reset,
    clearCache,
  };
}
