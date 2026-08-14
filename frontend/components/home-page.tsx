"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { DeveloperProfileCard } from "@/components/dashboard/developer-profile";
import { MatchingStory } from "@/components/dashboard/matching-story";
import { GraphExplorer } from "@/components/graph/graph-explorer";
import { RecommendationDetail } from "@/components/dashboard/recommendation-detail";
import { RecommendationsList } from "@/components/dashboard/recommendations-list";
import { SkillGapDialog } from "@/components/dashboard/skill-gap-dialog";
import { DeveloperSelector } from "@/components/developer-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { useDeveloper } from "@/hooks/use-developer";
import { useDevelopers } from "@/hooks/use-developers";
import { useRecommendations } from "@/hooks/use-recommendations";
import type { Recommendation } from "@/types/api";

export function HomePage() {
  const { developers, isLoading, isError, retry } = useDevelopers();
  const { status: backendStatus } = useBackendStatus();
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string | null>(
    null,
  );
  const [detailRecommendation, setDetailRecommendation] =
    useState<Recommendation | null>(null);
  const [skillGapRecommendation, setSkillGapRecommendation] =
    useState<Recommendation | null>(null);
  const [graphRecommendation, setGraphRecommendation] =
    useState<Recommendation | null>(null);

  const {
    profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    retry: retryProfile,
  } = useDeveloper(selectedDeveloperId);
  const {
    recommendations,
    isLoading: isRecommendationsLoading,
    isError: isRecommendationsError,
    retry: retryRecommendations,
  } = useRecommendations(selectedDeveloperId);

  useEffect(() => {
    setDetailRecommendation(null);
    setSkillGapRecommendation(null);
    setGraphRecommendation(null);
  }, [selectedDeveloperId]);

  const hasSelection = selectedDeveloperId !== null;

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <AppHeader status={backendStatus} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="space-y-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-pretty sm:text-3xl">
            Find your best job matches
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            JobMatch reads a developer&apos;s skills, the technologies used on
            their projects, and each job&apos;s requirements. Select a developer
            to load graph-powered, explainable recommendations.
          </p>
        </section>

        {backendStatus === "unavailable" ? (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            The backend is unavailable right now. JobMatch cannot load live
            graph data until the API is reachable again.
          </p>
        ) : null}

        <div
          className={
            hasSelection
              ? "grid grid-cols-1 gap-4 lg:grid-cols-2"
              : "grid grid-cols-1"
          }
        >
          <Card>
            <CardHeader>
              <CardTitle>Developer</CardTitle>
              <CardDescription>
                Choose whose skills and project technologies should drive the
                match.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeveloperSelector
                developers={developers}
                selectedId={selectedDeveloperId}
                onSelect={setSelectedDeveloperId}
                isLoading={isLoading}
                isError={isError}
                onRetry={retry}
              />
            </CardContent>
          </Card>

          {hasSelection ? (
            <DeveloperProfileCard
              profile={profile}
              isLoading={isProfileLoading}
              isError={isProfileError}
              onRetry={retryProfile}
            />
          ) : null}
        </div>

        {hasSelection ? (
          <>
            {!isRecommendationsLoading && !isRecommendationsError ? (
              <DashboardSummary recommendations={recommendations} />
            ) : null}

            <MatchingStory />

            <RecommendationsList
              recommendations={recommendations}
              isLoading={isRecommendationsLoading}
              isError={isRecommendationsError}
              onRetry={retryRecommendations}
              onViewDetails={setDetailRecommendation}
              onViewSkillGap={setSkillGapRecommendation}
            />
          </>
        ) : null}
      </main>

      <RecommendationDetail
        recommendation={detailRecommendation}
        open={detailRecommendation !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailRecommendation(null);
          }
        }}
        onExploreGraph={() => {
          if (detailRecommendation) {
            setGraphRecommendation(detailRecommendation);
            setDetailRecommendation(null);
          }
        }}
      />

      <SkillGapDialog
        developerId={selectedDeveloperId}
        recommendation={skillGapRecommendation}
        open={skillGapRecommendation !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSkillGapRecommendation(null);
          }
        }}
      />

      <GraphExplorer
        developerId={selectedDeveloperId}
        recommendation={graphRecommendation}
        open={graphRecommendation !== null}
        onOpenChange={(open) => {
          if (!open) {
            setGraphRecommendation(null);
          }
        }}
      />
    </div>
  );
}
