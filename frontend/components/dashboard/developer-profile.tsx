"use client";

import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatExperienceLevel,
  formatExperienceYears,
} from "@/lib/format";
import type { DeveloperProfile } from "@/types/api";

type DeveloperProfileCardProps = {
  profile: DeveloperProfile | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function DeveloperProfileCard({
  profile,
  isLoading,
  isError,
  onRetry,
}: DeveloperProfileCardProps) {
  if (isLoading) {
    return (
      <Card aria-busy="true">
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
          <span className="sr-only">Loading developer profile</span>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Unable to load developer profile.</AlertTitle>
        <AlertDescription>
          The profile could not be retrieved. Try again.
        </AlertDescription>
        <div className="col-start-2 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </Alert>
    );
  }

  if (!profile) {
    return null;
  }

  const { developer } = profile;

  return (
    <Card aria-live="polite">
      <CardHeader>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Selected developer
        </p>
        <CardTitle className="text-lg">{developer.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{developer.title}</p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-foreground">
          {formatExperienceYears(developer.experienceYears)}
        </span>
        <Badge variant="secondary">
          {formatExperienceLevel(developer.experienceLevel)}
        </Badge>
        <span className="text-muted-foreground">{developer.location}</span>
      </CardContent>
    </Card>
  );
}
