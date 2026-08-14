import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NamedSkill } from "@/types/api";

type SkillMatchListProps = {
  matchedRequired: NamedSkill[];
  missingRequired: NamedSkill[];
  compact?: boolean;
};

const COMPACT_MATCHED_LIMIT = 6;
const COMPACT_MISSING_LIMIT = 4;

export function SkillMatchList({
  matchedRequired,
  missingRequired,
  compact = false,
}: SkillMatchListProps) {
  const requiredTotal = matchedRequired.length + missingRequired.length;
  const matchedPreview = compact
    ? matchedRequired.slice(0, COMPACT_MATCHED_LIMIT)
    : matchedRequired;
  const missingPreview = compact
    ? missingRequired.slice(0, COMPACT_MISSING_LIMIT)
    : missingRequired;
  const extraMatched = matchedRequired.length - matchedPreview.length;
  const extraMissing = missingRequired.length - missingPreview.length;

  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 text-sm">
        <CheckIcon
          className="mt-0.5 size-4 shrink-0 text-foreground"
          aria-hidden="true"
        />
        <span>
          {matchedRequired.length}/{requiredTotal} required skills matched
        </span>
      </p>
      {matchedPreview.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {matchedPreview.map((skill) => (
            <li key={skill.id}>
              <Badge variant="secondary">{skill.name}</Badge>
            </li>
          ))}
          {extraMatched > 0 ? (
            <li>
              <Badge variant="outline">+{extraMatched} more</Badge>
            </li>
          ) : null}
        </ul>
      ) : null}

      {missingRequired.length > 0 ? (
        <div className="space-y-2">
          <p className="flex items-start gap-2 text-sm">
            <AlertTriangleIcon
              className="mt-0.5 size-4 shrink-0 text-foreground"
              aria-hidden="true"
            />
            <span>
              {missingRequired.length} skill{" "}
              {missingRequired.length === 1 ? "gap" : "gaps"}
            </span>
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {missingPreview.map((skill) => (
              <li key={skill.id}>
                <Badge variant="outline">{skill.name}</Badge>
              </li>
            ))}
            {extraMissing > 0 ? (
              <li>
                <Badge variant="outline">+{extraMissing} more</Badge>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
