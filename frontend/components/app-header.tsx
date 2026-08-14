import { NetworkIcon } from "lucide-react";
import { BackendStatus, type BackendConnectionStatus } from "@/components/backend-status";

type AppHeaderProps = {
  status: BackendConnectionStatus;
};

export function AppHeader({ status }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
            aria-hidden="true"
          >
            <NetworkIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-base font-semibold tracking-tight text-foreground">
              JobMatch
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Graph-powered job and skill recommendations
            </p>
          </div>
        </div>
        <BackendStatus status={status} />
      </div>
    </header>
  );
}
