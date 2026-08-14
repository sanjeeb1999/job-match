import { formatScore } from "@/lib/format";
import type { RecommendationScore } from "@/types/api";

type ScoreBreakdownProps = {
  score: RecommendationScore;
};

const BREAKDOWN = [
  { key: "mustHave", label: "Required skills" },
  { key: "niceToHave", label: "Nice-to-have" },
  { key: "technologyOverlap", label: "Technology overlap" },
  { key: "levelFitness", label: "Level fit" },
] as const;

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  return (
    <div className="space-y-2.5">
      {BREAKDOWN.map((row) => {
        const value = score[row.key];
        const width = Math.min(100, Math.max(0, value));
        return (
          <div key={row.key} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium tabular-nums text-foreground">
                {formatScore(value)}
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="meter"
              aria-label={row.label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(value)}
            >
              <div
                className="h-full rounded-full bg-foreground/80"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
