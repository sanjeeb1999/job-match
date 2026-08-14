import { Skeleton } from "@/components/ui/skeleton";

export type BackendConnectionStatus = "loading" | "connected" | "unavailable";

type BackendStatusProps = {
  status: BackendConnectionStatus;
};

export function BackendStatus({ status }: BackendStatusProps) {
  if (status === "loading") {
    return (
      <div
        className="flex items-center gap-2 text-sm text-muted-foreground"
        aria-live="polite"
        aria-busy="true"
      >
        <Skeleton className="size-2 rounded-full" />
        <Skeleton className="h-4 w-36" />
        <span className="sr-only">Checking backend status</span>
      </div>
    );
  }

  if (status === "connected") {
    return (
      <p
        className="flex items-center gap-2 text-sm text-muted-foreground"
        aria-live="polite"
      >
        <span className="relative flex size-2.5" aria-hidden="true">
          <span className="absolute inline-flex size-full rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-600" />
        </span>
        <span>● CognoDB Connected</span>
      </p>
    );
  }

  return (
    <p
      className="flex items-center gap-2 text-sm text-muted-foreground"
      aria-live="polite"
    >
      <span
        className="size-2.5 rounded-full bg-neutral-400"
        aria-hidden="true"
      />
      <span>Backend unavailable</span>
    </p>
  );
}
