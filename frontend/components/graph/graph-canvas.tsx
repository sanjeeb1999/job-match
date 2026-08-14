"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GraphEdge } from "@/components/graph/graph-edge";
import { GraphNodeComponent } from "@/components/graph/graph-node";
import { layoutMatchGraph } from "@/components/graph/layout";
import type { MatchGraph } from "@/types/api";

const nodeTypes: NodeTypes = {
  graphNode: GraphNodeComponent,
};

const edgeTypes: EdgeTypes = {
  graphEdge: GraphEdge,
};

type GraphCanvasProps = {
  graph: MatchGraph;
};

export function GraphCanvas({ graph }: GraphCanvasProps) {
  const { nodes, edges } = useMemo(
    () => layoutMatchGraph(graph.nodes, graph.relationships),
    [graph],
  );

  return (
    <div className="jobmatch-flow h-[min(60vh,36rem)] min-h-[16rem] w-full overflow-hidden rounded-lg border bg-background sm:min-h-[20rem]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        aria-label="Match neighborhood graph"
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.25}
        maxZoom={1.6}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: false }}
      >
        <Background gap={18} size={1} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable className="!bg-card" />
      </ReactFlow>
    </div>
  );
}
