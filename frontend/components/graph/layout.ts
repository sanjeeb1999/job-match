import type { GraphNode, GraphNodeLabel, GraphRelationship } from "@/types/api";
import type { Edge, Node } from "@xyflow/react";
import { MarkerType, Position } from "@xyflow/react";

export const GRAPH_NODE_WIDTH = 188;
export const GRAPH_NODE_HEIGHT = 76;

const LAYER_ORDER: Record<GraphNodeLabel, number> = {
  Developer: 0,
  Skill: 1,
  Project: 1,
  Technology: 2,
  Job: 3,
  Company: 4,
};

const H_GAP = 28;
const V_GAP = 128;

export type GraphNodeData = {
  label: GraphNodeLabel;
  name: string;
};

export function layoutMatchGraph(
  graphNodes: GraphNode[],
  graphRelationships: GraphRelationship[],
): { nodes: Node<GraphNodeData>[]; edges: Edge[] } {
  const layers = new Map<number, GraphNode[]>();

  for (const node of graphNodes) {
    const layer = LAYER_ORDER[node.label] ?? 2;
    const current = layers.get(layer) ?? [];
    current.push(node);
    layers.set(layer, current);
  }

  for (const nodesInLayer of layers.values()) {
    nodesInLayer.sort((a, b) => {
      if (a.label !== b.label) {
        return a.label.localeCompare(b.label);
      }
      return a.name.localeCompare(b.name);
    });
  }

  const layerOf = new Map<string, number>();
  const nodes: Node<GraphNodeData>[] = [];

  const sortedLayers = [...layers.keys()].sort((a, b) => a - b);
  for (const layer of sortedLayers) {
    const items = layers.get(layer) ?? [];
    const rowWidth =
      items.length * GRAPH_NODE_WIDTH + Math.max(0, items.length - 1) * H_GAP;
    const startX = -rowWidth / 2;

    items.forEach((item, index) => {
      layerOf.set(item.id, layer);
      nodes.push({
        id: item.id,
        type: "graphNode",
        position: {
          x: startX + index * (GRAPH_NODE_WIDTH + H_GAP),
          y: layer * (GRAPH_NODE_HEIGHT + V_GAP),
        },
        data: {
          label: item.label,
          name: item.name,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    });
  }

  const edges: Edge[] = graphRelationships.map((relationship) => {
    const sourceLayer = layerOf.get(relationship.source) ?? 0;
    const targetLayer = layerOf.get(relationship.target) ?? 0;
    const downward = sourceLayer <= targetLayer;

    return {
      id: relationship.id,
      source: relationship.source,
      target: relationship.target,
      sourceHandle: downward ? "source-bottom" : "source-top",
      targetHandle: downward ? "target-top" : "target-bottom",
      type: "graphEdge",
      label: relationship.type,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
      },
      style: { strokeWidth: 1.4 },
      labelStyle: { fontSize: 10, fontWeight: 500 },
      labelBgPadding: [4, 6],
      labelBgBorderRadius: 4,
    };
  });

  return { nodes, edges };
}
