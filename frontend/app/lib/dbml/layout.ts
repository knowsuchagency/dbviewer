import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { TableNodeData } from './parser';

const NODE_WIDTH = 280;
const NODE_HEIGHT_BASE = 60; // Header height
const NODE_HEIGHT_PER_COLUMN = 32; // Height per column row

export interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  nodeSpacing?: number;
  rankSpacing?: number;
}

function getNodeHeight(node: Node<TableNodeData>): number {
  const columnCount = node.data.columns?.length || 0;
  return NODE_HEIGHT_BASE + columnCount * NODE_HEIGHT_PER_COLUMN;
}

export function applyDagreLayout(
  nodes: Node<TableNodeData>[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node<TableNodeData>[] {
  const { direction = 'LR', nodeSpacing = 80, rankSpacing = 150 } = options;

  if (nodes.length === 0) {
    return nodes;
  }

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    const height = getNodeHeight(node);
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const height = getNodeHeight(node);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });
}

export function applyStoredPositions(
  nodes: Node<TableNodeData>[],
  storedPositions: Record<string, { x: number; y: number }>
): Node<TableNodeData>[] {
  return nodes.map((node) => {
    const stored = storedPositions[node.id];
    if (stored) {
      return {
        ...node,
        position: stored,
      };
    }
    return node;
  });
}

export function getNodePositions(
  nodes: Node<TableNodeData>[]
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((node) => {
    positions[node.id] = { x: node.position.x, y: node.position.y };
  });
  return positions;
}
