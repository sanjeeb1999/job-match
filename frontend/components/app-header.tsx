import { BackendStatus, type BackendConnectionStatus } from "@/components/backend-status";

type AppHeaderProps = {
  status: BackendConnectionStatus;
};

export function AppHeader({ status }: AppHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
            JobMatch
          </p>
          <p className="text-sm text-muted-foreground">
            Graph-powered job and skill recommendations
          </p>
        </div>
        <BackendStatus status={status} />
      </div>
    </header>
  );
}
