import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import type { Recommendation } from "@/types/api";

type RecommendationsListProps = {
  recommendations: Recommendation[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onViewDetails: (recommendation: Recommendation) => void;
  onViewSkillGap: (recommendation: Recommendation) => void;
};

export function RecommendationsList({
  recommendations,
  isLoading,
  isError,
  onRetry,
  onViewDetails,
  onViewSkillGap,
}: RecommendationsListProps) {
  return (
    <section aria-labelledby="recommended-jobs-heading" className="space-y-4">
      <div className="space-y-1">
        <h2
          id="recommended-jobs-heading"
          className="font-heading text-xl font-semibold tracking-tight"
        >
          Recommended jobs
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Jobs ranked using your skills, project technologies, experience
          level, and job requirements.
        </p>
      </div>

      {isLoading ? <RecommendationSkeletons /> : null}

      {isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Unable to load recommendations.</AlertTitle>
          <AlertDescription>
            Ranked jobs could not be retrieved. Try again.
          </AlertDescription>
          <div className="col-start-2 mt-2">
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      {!isLoading && !isError && recommendations.length === 0 ? (
        <Alert>
          <AlertTitle>No matching jobs found.</AlertTitle>
          <AlertDescription>
            There are currently no open jobs matching this developer profile.
          </AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !isError && recommendations.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {recommendations.map((recommendation) => (
            <li key={recommendation.job.id} className="min-w-0">
              <RecommendationCard
                recommendation={recommendation}
                onViewDetails={() => onViewDetails(recommendation)}
                onViewSkillGap={() => onViewSkillGap(recommendation)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function RecommendationSkeletons() {
  return (
    <div
      className="grid grid-cols-1 gap-4 xl:grid-cols-2"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <span className="sr-only">Loading recommendations</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
