"use client";

import {
  BriefcaseIcon,
  Building2Icon,
  FolderIcon,
  TagIcon,
  TerminalIcon,
  UserIcon,
} from "lucide-react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { GraphNodeData } from "@/components/graph/layout";
import type { GraphNodeLabel } from "@/types/api";

const NODE_VISUAL: Record<
  GraphNodeLabel,
  { icon: typeof UserIcon; caption: string; tone: string }
> = {
  Developer: {
    icon: UserIcon,
    caption: "Developer",
    tone: "bg-teal-50 text-teal-800 border-teal-200",
  },
  Skill: {
    icon: TagIcon,
    caption: "Skill",
    tone: "bg-violet-50 text-violet-800 border-violet-200",
  },
  Project: {
    icon: FolderIcon,
    caption: "Project",
    tone: "bg-amber-50 text-amber-900 border-amber-200",
  },
  Technology: {
    icon: TerminalIcon,
    caption: "Technology",
    tone: "bg-sky-50 text-sky-800 border-sky-200",
  },
  Job: {
    icon: BriefcaseIcon,
    caption: "Job",
    tone: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  Company: {
    icon: Building2Icon,
    caption: "Company",
    tone: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export function GraphNodeComponent({
  data,
}: NodeProps<Node<GraphNodeData>>) {
  const visual = NODE_VISUAL[data.label];
  const Icon = visual.icon;

  return (
    <div
      className={cn(
        "h-[76px] w-[188px] rounded-lg border bg-card px-3 py-2 shadow-sm ring-1 ring-foreground/10",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="!size-2 !border-border !bg-foreground"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="source-top"
        className="!size-2 !border-border !bg-foreground"
      />
      <div className="flex h-full items-center gap-2">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md border",
            visual.tone,
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {data.name}
          </p>
          <p className="text-xs text-muted-foreground">{visual.caption}</p>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Bottom}
        id="target-bottom"
        className="!size-2 !border-border !bg-foreground"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="!size-2 !border-border !bg-foreground"
      />
    </div>
  );
}
