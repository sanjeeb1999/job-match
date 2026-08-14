"use client";

import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatExperienceLevel } from "@/lib/format";
import type { Developer } from "@/types/api";

type DeveloperSelectorProps = {
  developers: Developer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function DeveloperSelector({
  developers,
  selectedId,
  onSelect,
  isLoading,
  isError,
  onRetry,
}: DeveloperSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <span className="sr-only">Loading developers</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Unable to load developers.</AlertTitle>
        <AlertDescription>
          The list could not be retrieved. Check that the backend is running,
          then try again.
        </AlertDescription>
        <div className="col-start-2 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </Alert>
    );
  }

  if (developers.length === 0) {
    return (
      <Alert>
        <AlertTitle>No developers available.</AlertTitle>
        <AlertDescription>
          There are no developer profiles to select yet.
        </AlertDescription>
      </Alert>
    );
  }

  const selected = developers.find((developer) => developer.id === selectedId);

  return (
    <div className="space-y-2">
      <label
        htmlFor="developer-select"
        className="text-sm font-medium text-foreground"
      >
        Developer
      </label>
      <Select
        value={selectedId}
        onValueChange={(value) => {
          if (typeof value === "string") {
            onSelect(value);
          }
        }}
        items={developers.map((developer) => ({
          value: developer.id,
          label: developer.name,
        }))}
      >
        <SelectTrigger
          id="developer-select"
          size="default"
          className="h-auto min-h-11 w-full max-w-full py-2"
          aria-label="Select a developer"
        >
          <SelectValue placeholder="Select a developer">
            {(value: string | null) => {
              const developer =
                developers.find((item) => item.id === value) ?? selected;
              if (!developer) {
                return "Select a developer";
              }
              return (
                <span className="flex min-w-0 flex-col text-left">
                  <span className="truncate font-medium">{developer.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {developer.title} ·{" "}
                    {formatExperienceLevel(developer.experienceLevel)}
                  </span>
                </span>
              );
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger={false}
          className="w-(--anchor-width) min-w-[min(100%,20rem)]"
        >
          {developers.map((developer) => (
            <SelectItem key={developer.id} value={developer.id}>
              <span className="font-medium text-foreground">
                {developer.name}
              </span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span>{developer.title}</span>
                <Badge variant="outline">
                  {formatExperienceLevel(developer.experienceLevel)}
                </Badge>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
