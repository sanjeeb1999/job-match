import {
  BriefcaseIcon,
  Building2Icon,
  FolderIcon,
  TagIcon,
  TerminalIcon,
  UserIcon,
} from "lucide-react";

const ITEMS = [
  { icon: UserIcon, label: "Developer", tone: "bg-teal-50 text-teal-800 border-teal-200" },
  { icon: TagIcon, label: "Skill", tone: "bg-violet-50 text-violet-800 border-violet-200" },
  { icon: FolderIcon, label: "Project", tone: "bg-amber-50 text-amber-900 border-amber-200" },
  { icon: TerminalIcon, label: "Technology", tone: "bg-sky-50 text-sky-800 border-sky-200" },
  { icon: BriefcaseIcon, label: "Job", tone: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  { icon: Building2Icon, label: "Company", tone: "bg-slate-100 text-slate-700 border-slate-200" },
] as const;

export function GraphLegend() {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-muted-foreground">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.label} className="flex items-center gap-1.5">
            <span className={`flex size-5 items-center justify-center rounded border ${item.tone}`}>
              <Icon className="size-3" aria-hidden="true" />
            </span>
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
