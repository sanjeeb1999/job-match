import { CheckIcon } from "lucide-react";

type ExplanationListProps = {
  explanation: string[];
};

export function ExplanationList({ explanation }: ExplanationListProps) {
  if (explanation.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Why this matches</h3>
      <ul className="space-y-1.5">
        {explanation.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <CheckIcon
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
