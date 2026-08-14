"use client";

import { useEffect } from "react";
import { AlertCircleIcon, AlertTriangleIcon, CheckIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSkillGap } from "@/hooks/use-skill-gap";
import type { NamedSkill, Recommendation } from "@/types/api";

type SkillGapDialogProps = {
  developerId: string | null;
  recommendation: Recommendation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SkillGapDialog({
  developerId,
  recommendation,
  open,
  onOpenChange,
}: SkillGapDialogProps) {
  const { skillGap, isLoading, isError, load, retry } = useSkillGap();

  useEffect(() => {
    if (!open || !developerId || !recommendation) {
      return;
    }
    void load(developerId, recommendation.job.id);
  }, [open, developerId, recommendation, load]);

  const jobTitle = recommendation?.job.title ?? "this job";
  const companyName = recommendation?.company.name;
  const matchesCurrent =
    !!skillGap &&
    !!recommendation &&
    !!developerId &&
    skillGap.jobId === recommendation.job.id &&
    skillGap.developerId === developerId;
  const showLoading = open && !matchesCurrent && !isError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(85vh,44rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Skill gap</DialogTitle>
          <DialogDescription>
            Matched and missing skills for {jobTitle}
            {companyName ? ` at ${companyName}` : ""}.
          </DialogDescription>
        </DialogHeader>

        {showLoading || isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-live="polite">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-3/4" />
            <span className="sr-only">Loading skill gap</span>
          </div>
        ) : null}

        {isError && !matchesCurrent ? (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Unable to load skill gap.</AlertTitle>
            <AlertDescription>
              Skill comparison could not be retrieved. Try again.
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

        {matchesCurrent && skillGap && !isLoading && !isError ? (
          <div className="space-y-6">
            <SkillSection
              title="Matched skills"
              skills={skillGap.matchedRequiredSkills}
              empty="No required skills matched."
              tone="matched"
            />
            <SkillSection
              title="Skills to develop"
              skills={skillGap.missingRequiredSkills}
              empty="No required skills to develop."
              tone="missing"
            />
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Nice-to-have skills</h3>
              <SkillSection
                title="Matched"
                skills={skillGap.matchedNiceToHaveSkills}
                empty="None matched."
                tone="matched"
                nested
              />
              <SkillSection
                title="Missing"
                skills={skillGap.missingNiceToHaveSkills}
                empty="None missing."
                tone="missing"
                nested
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SkillSection({
  title,
  skills,
  empty,
  tone,
  nested = false,
}: {
  title: string;
  skills: NamedSkill[];
  empty: string;
  tone: "matched" | "missing";
  nested?: boolean;
}) {
  const Icon = tone === "matched" ? CheckIcon : AlertTriangleIcon;
  const HeadingTag = nested ? "h4" : "h3";

  return (
    <div className="space-y-2">
      <HeadingTag className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {title}
      </HeadingTag>
      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {skills.map((skill) => (
            <li key={skill.id} className="flex items-center gap-2 text-sm">
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              <Badge variant={tone === "matched" ? "secondary" : "outline"}>
                {skill.name}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
