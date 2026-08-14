"use client";

import { useCallback, useEffect, useState } from "react";
import { getReady } from "@/lib/api/health";

type BackendStatus = "loading" | "connected" | "unavailable";

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const ready = await getReady();
      const connected =
        ready.status === "ok" && ready.database === "connected";
      setStatus(connected ? "connected" : "unavailable");
    } catch {
      setStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { status, retry: load };
}
