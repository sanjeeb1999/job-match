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
  { icon: typeof UserIcon; caption: string }
> = {
  Developer: { icon: UserIcon, caption: "Developer" },
  Skill: { icon: TagIcon, caption: "Skill" },
  Project: { icon: FolderIcon, caption: "Project" },
  Technology: { icon: TerminalIcon, caption: "Technology" },
  Job: { icon: BriefcaseIcon, caption: "Job" },
  Company: { icon: Building2Icon, caption: "Company" },
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
          className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted"
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
