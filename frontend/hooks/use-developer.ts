"use client";

import { useCallback, useEffect, useState } from "react";
import { getDeveloper } from "@/lib/api/developers";
import type { DeveloperProfile } from "@/types/api";

type LoadState = "idle" | "loading" | "success" | "error";

export function useDeveloper(developerId: string | null) {
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [state, setState] = useState<LoadState>("idle");

  const load = useCallback(async () => {
    if (!developerId) {
      setProfile(null);
      setState("idle");
      return;
    }

    setState("loading");
    try {
      const data = await getDeveloper(developerId);
      setProfile(data);
      setState("success");
    } catch {
      setProfile(null);
      setState("error");
    }
  }, [developerId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    profile,
    isLoading: state === "loading",
    isError: state === "error",
    retry: load,
  };
}
