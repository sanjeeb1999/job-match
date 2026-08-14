"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExplanationList } from "@/components/dashboard/explanation-list";
import { ScoreBreakdown } from "@/components/dashboard/score-breakdown";
import { TechnologyOverlap } from "@/components/dashboard/technology-overlap";
import {
  formatEmploymentType,
  formatExperienceLevel,
  formatScore,
  matchQualityLabel,
} from "@/lib/format";
import type { NamedSkill, Recommendation } from "@/types/api";

type RecommendationDetailProps = {
  recommendation: Recommendation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExploreGraph: () => void;
};

export function RecommendationDetail({
  recommendation,
  open,
  onOpenChange,
  onExploreGraph,
}: RecommendationDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(85vh,44rem)] overflow-y-auto sm:max-w-lg"
      >
        {recommendation ? (
          <>
            <DialogHeader>
              <DialogTitle>{recommendation.job.title}</DialogTitle>
              <DialogDescription>
                {recommendation.company.name}
                <span aria-hidden="true"> · </span>
                {recommendation.job.location}
                <span aria-hidden="true"> · </span>
                {formatEmploymentType(recommendation.job.employmentType)}
                <span aria-hidden="true"> · </span>
                {formatExperienceLevel(recommendation.job.experienceLevel)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <p className="font-heading text-3xl font-semibold tabular-nums tracking-tight">
                  {formatScore(recommendation.score.overall)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {matchQualityLabel(recommendation.score.overall)}
                </p>
              </div>

              <ScoreBreakdown score={recommendation.score} />

              <SkillGroup
                title="Matched required skills"
                skills={recommendation.skills.matchedRequired}
                empty="No required skills matched."
              />
              <SkillGroup
                title="Missing required skills"
                skills={recommendation.skills.missingRequired}
                empty="No required skill gaps."
              />
              <SkillGroup
                title="Matched nice-to-have skills"
                skills={recommendation.skills.matchedNiceToHave}
                empty="No nice-to-have skills matched."
              />
              <SkillGroup
                title="Missing nice-to-have skills"
                skills={recommendation.skills.missingNiceToHave}
                empty="No missing nice-to-have skills."
              />

              <TechnologyOverlap
                technologies={recommendation.technologyOverlap}
              />
              <ExplanationList explanation={recommendation.explanation} />
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={onExploreGraph}
              >
                Explore match graph
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SkillGroup({
  title,
  skills,
  empty,
}: {
  title: string;
  skills: NamedSkill[];
  empty: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill.id}>
              <Badge variant="secondary">{skill.name}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
