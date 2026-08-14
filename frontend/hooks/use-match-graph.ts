"use client";

import { useCallback, useRef, useState } from "react";
import { getMatchGraph } from "@/lib/api/graph";
import type { MatchGraph } from "@/types/api";

type LoadState = "idle" | "loading" | "success" | "error";

function cacheKey(developerId: string, jobId: string): string {
  return `${developerId}:${jobId}`;
}

export function useMatchGraph() {
  const [graph, setGraph] = useState<MatchGraph | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const cacheRef = useRef(new Map<string, MatchGraph>());
  const lastRef = useRef<{ developerId: string; jobId: string } | null>(null);

  const load = useCallback(async (developerId: string, jobId: string) => {
    lastRef.current = { developerId, jobId };
    const key = cacheKey(developerId, jobId);
    const cached = cacheRef.current.get(key);
    if (cached) {
      setGraph(cached);
      setState("success");
      return;
    }

    setState("loading");
    setGraph(null);
    try {
      const data = await getMatchGraph(developerId, jobId);
      cacheRef.current.set(key, data);
      setGraph(data);
      setState("success");
    } catch {
      setGraph(null);
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

  return {
    graph,
    isLoading: state === "loading",
    isError: state === "error",
    load,
    retry,
  };
}
