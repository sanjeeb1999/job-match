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
          label="Jobs matched"
          value={String(jobsMatched)}
          hint="Ranked open roles returned for this profile"
        />
        <SummaryStat
          label="Best match"
          value={jobsMatched > 0 ? formatScore(bestMatch) : "—"}
          hint="Highest overall score from the API"
        />
        <SummaryStat
          label="Skills represented"
          value={String(skillsRepresented)}
          hint="Distinct required skills matched across these jobs"
        />
      </div>
    </section>
  );
}

function SummaryStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border bg-card px-4 py-4 ring-1 ring-foreground/10">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
