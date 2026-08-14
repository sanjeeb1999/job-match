"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { GraphLegend } from "@/components/graph/graph-legend";
import { useMatchGraph } from "@/hooks/use-match-graph";
import type { Recommendation } from "@/types/api";

const GraphCanvas = dynamic(
  () =>
    import("@/components/graph/graph-canvas").then((module) => module.GraphCanvas),
  {
    ssr: false,
    loading: () => <GraphSkeleton />,
  },
);

type GraphExplorerProps = {
  developerId: string | null;
  recommendation: Recommendation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GraphExplorer({
  developerId,
  recommendation,
  open,
  onOpenChange,
}: GraphExplorerProps) {
  const { graph, isLoading, isError, load, retry } = useMatchGraph();

  useEffect(() => {
    if (!open || !developerId || !recommendation) {
      return;
    }
    void load(developerId, recommendation.job.id);
  }, [open, developerId, recommendation, load]);

  const jobTitle = recommendation?.job.title ?? "this job";
  const companyName = recommendation?.company.name;
  const isEmpty = !!graph && graph.nodes.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,52rem)] w-full flex-col overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Match graph</DialogTitle>
          <DialogDescription>
            Graph-powered neighborhood for {jobTitle}
            {companyName ? ` at ${companyName}` : ""}. Edges show HAS_SKILL,
            WORKED_ON, USES, REQUIRES, POSTED_BY, and APPLIED_TO when present.
          </DialogDescription>
        </DialogHeader>

        <GraphLegend />

        {isLoading || (open && !graph && !isError) ? <GraphSkeleton /> : null}

        {isError ? (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Unable to load match graph.</AlertTitle>
            <AlertDescription>
              The neighborhood for this match could not be retrieved. Try again.
            </AlertDescription>
            <div className="col-start-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void retry()}
              >
                Retry
              </Button>
            </div>
          </Alert>
        ) : null}

        {graph && !isLoading && !isError && isEmpty ? (
          <Alert>
            <AlertTitle>No graph relationships found for this match.</AlertTitle>
            <AlertDescription>
              The selected developer and job did not return a neighborhood to
              display.
            </AlertDescription>
          </Alert>
        ) : null}

        {graph && !isLoading && !isError && !isEmpty ? (
          <GraphCanvas graph={graph} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function GraphSkeleton() {
  return (
    <div
      className="h-[min(60vh,36rem)] min-h-[16rem] space-y-3 rounded-lg border p-4 sm:min-h-[20rem]"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-full min-h-[16rem] w-full" />
      <span className="sr-only">Loading match graph</span>
    </div>
  );
}
