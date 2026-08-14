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
        className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 sm:text-sm"
        aria-live="polite"
      >
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
        </span>
        CognoDB connected
      </p>
    );
  }

  return (
    <p
      className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-1 text-xs font-medium text-muted-foreground sm:text-sm"
      aria-live="polite"
    >
      <span
        className="size-2 rounded-full bg-neutral-400"
        aria-hidden="true"
      />
      Backend unavailable
    </p>
  );
}
