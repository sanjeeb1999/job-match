import { MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScoreBreakdown } from "@/components/dashboard/score-breakdown";
import { SkillMatchList } from "@/components/dashboard/skill-match-list";
import { TechnologyOverlap } from "@/components/dashboard/technology-overlap";
import { ExplanationList } from "@/components/dashboard/explanation-list";
import {
  formatEmploymentType,
  formatExperienceLevel,
  formatScore,
  matchQualityClass,
  matchQualityLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/types/api";

type RecommendationCardProps = {
  recommendation: Recommendation;
  onViewDetails: () => void;
  onViewSkillGap: () => void;
};

export function RecommendationCard({
  recommendation,
  onViewDetails,
  onViewSkillGap,
}: RecommendationCardProps) {
  const { job, company, score } = recommendation;
  const quality = matchQualityLabel(score.overall);

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h3 className="font-heading text-base font-semibold text-pretty">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-foreground/80">
              {company.name}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3.5" aria-hidden="true" />
                {job.location}
              </span>
              <Badge variant="outline">
                {formatEmploymentType(job.employmentType)}
              </Badge>
              <Badge variant="secondary">
                {formatExperienceLevel(job.experienceLevel)}
              </Badge>
            </div>
          </div>
          <div
            className={cn(
              "shrink-0 rounded-xl px-3 py-2 text-left ring-1 sm:text-right",
              matchQualityClass(score.overall),
            )}
          >
            <p className="font-heading text-3xl font-semibold tabular-nums tracking-tight">
              {formatScore(score.overall)}
            </p>
            <p className="text-xs font-medium">{quality}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <ScoreBreakdown score={score} />
        <SkillMatchList
          matchedRequired={recommendation.skills.matchedRequired}
          missingRequired={recommendation.skills.missingRequired}
          compact
        />
        <TechnologyOverlap technologies={recommendation.technologyOverlap} />
        <ExplanationList explanation={recommendation.explanation} />
      </CardContent>
      <CardFooter className="flex flex-col gap-2 bg-muted/30 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onViewSkillGap}
        >
          View skill gap
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={onViewDetails}
        >
          View match details
        </Button>
      </CardFooter>
    </Card>
  );
}
