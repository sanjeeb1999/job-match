import {
  BriefcaseIcon,
  Building2Icon,
  FolderIcon,
  TagIcon,
  TerminalIcon,
  UserIcon,
} from "lucide-react";

const ITEMS = [
  { icon: UserIcon, label: "Developer" },
  { icon: TagIcon, label: "Skill" },
  { icon: FolderIcon, label: "Project" },
  { icon: TerminalIcon, label: "Technology" },
  { icon: BriefcaseIcon, label: "Job" },
  { icon: Building2Icon, label: "Company" },
] as const;

export function GraphLegend() {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-muted-foreground">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.label} className="flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center rounded border bg-card">
              <Icon className="size-3" aria-hidden="true" />
            </span>
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
