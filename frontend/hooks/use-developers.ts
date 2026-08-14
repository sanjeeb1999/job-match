"use client";

import { useCallback, useEffect, useState } from "react";
import { getDevelopers } from "@/lib/api/developers";
import type { Developer } from "@/types/api";

type LoadState = "loading" | "success" | "error";

export function useDevelopers() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const data = await getDevelopers();
      setDevelopers(data);
      setState("success");
    } catch {
      setDevelopers([]);
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    developers,
    isLoading: state === "loading",
    isError: state === "error",
    retry: load,
  };
}
