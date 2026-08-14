import { Button } from "@/components/ui/button";
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
  matchQualityLabel,
} from "@/lib/format";
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
    <Card className="h-full">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h3 className="font-heading text-base font-medium text-pretty">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground">{company.name}</p>
            <p className="text-sm text-muted-foreground">
              {job.location}
              <span aria-hidden="true"> · </span>
              {formatEmploymentType(job.employmentType)}
              <span aria-hidden="true"> · </span>
              {formatExperienceLevel(job.experienceLevel)}
            </p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <p className="font-heading text-3xl font-semibold tabular-nums tracking-tight">
              {formatScore(score.overall)}
            </p>
            <p className="text-xs text-muted-foreground">{quality}</p>
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
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
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
