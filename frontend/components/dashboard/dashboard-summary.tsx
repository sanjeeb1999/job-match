import { BriefcaseIcon, SparklesIcon, TargetIcon } from "lucide-react";
import { formatScore } from "@/lib/format";
import type { Recommendation } from "@/types/api";

type DashboardSummaryProps = {
  recommendations: Recommendation[];
};

function uniqueMatchedSkillCount(recommendations: Recommendation[]): number {
  const names = new Set<string>();
  for (const recommendation of recommendations) {
    for (const skill of recommendation.skills.matchedRequired) {
      names.add(skill.id);
    }
  }
  return names.size;
}

export function DashboardSummary({ recommendations }: DashboardSummaryProps) {
  const jobsMatched = recommendations.length;
  const bestMatch = recommendations.reduce(
    (highest, recommendation) =>
      Math.max(highest, recommendation.score.overall),
    0,
  );
  const skillsRepresented = uniqueMatchedSkillCount(recommendations);

  return (
    <section aria-labelledby="dashboard-summary-heading">
      <h2 id="dashboard-summary-heading" className="sr-only">
        Match summary
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryStat
          icon={BriefcaseIcon}
          label="Jobs matched"
          value={String(jobsMatched)}
          hint="Ranked open roles returned for this profile"
        />
        <SummaryStat
          icon={SparklesIcon}
          label="Best match"
          value={jobsMatched > 0 ? formatScore(bestMatch) : "—"}
          hint="Highest overall score from the API"
        />
        <SummaryStat
          icon={TargetIcon}
          label="Skills represented"
          value={String(skillsRepresented)}
          hint="Distinct required skills matched across these jobs"
        />
      </div>
    </section>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof BriefcaseIcon;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card px-4 py-4 shadow-sm ring-1 ring-foreground/5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <span
          className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}
