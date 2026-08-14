import { Badge } from "@/components/ui/badge";
import type { Technology } from "@/types/api";

type TechnologyOverlapProps = {
  technologies: Technology[];
};

export function TechnologyOverlap({ technologies }: TechnologyOverlapProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Technology overlap</h3>
      {technologies.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No overlapping project technologies for this job.
        </p>
      ) : (
        <>
          <ul className="flex flex-wrap gap-1.5">
            {technologies.map((technology) => (
              <li key={technology.id}>
                <Badge variant="outline">{technology.name}</Badge>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Based on technologies used across your projects.
          </p>
        </>
      )}
    </div>
  );
}
