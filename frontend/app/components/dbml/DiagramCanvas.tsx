import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TableNode from './TableNode';
import RelationEdge from './RelationEdge';
import { useDiagramStore } from '@/stores/diagram.store';
import { parseDBML, parsedToNodes, parsedToEdges, type TableNodeData } from '@/lib/dbml/parser';
import { applyDagreLayout, applyStoredPositions, getNodePositions } from '@/lib/dbml/layout';
import type { CanvasState } from '@/services/diagram.service';

const nodeTypes = {
  table: TableNode,
};

const edgeTypes = {
  relation: RelationEdge,
};

// SVG markers for relationship endpoints
function EdgeMarkers() {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0 }}>
      <defs>
        <marker
          id="one"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="currentColor" strokeWidth="1" />
        </marker>
        <marker
          id="many"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 M 5 0 L 10 5 L 5 10" fill="none" stroke="currentColor" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}

interface DiagramCanvasInnerProps {
  initialCanvasState?: CanvasState | null;
}

function DiagramCanvasInner({ initialCanvasState }: DiagramCanvasInnerProps) {
  const { fitView, setViewport } = useReactFlow();
  const hasInitialized = useRef(false);

  const {
    dbml,
    setParseError,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    setViewport: setStoreViewport,
    setSelectedTableId,
    setDirty,
  } = useDiagramStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TableNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Parse DBML and update nodes/edges
  useEffect(() => {
    const result = parseDBML(dbml);

    if (!result.success) {
      setParseError(result.error || 'Parse error');
      return;
    }

    setParseError(null);

    if (!result.data) {
      setNodes([]);
      setEdges([]);
      return;
    }

    let newNodes = parsedToNodes(result.data);
    const newEdges = parsedToEdges(result.data);

    // Apply layout or stored positions
    if (initialCanvasState?.nodePositions && !hasInitialized.current) {
      newNodes = applyStoredPositions(newNodes, initialCanvasState.nodePositions);
    } else {
      newNodes = applyDagreLayout(newNodes, newEdges);
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setStoreNodes(newNodes);
    setStoreEdges(newEdges);

    // Fit view after initial layout
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      // Apply stored viewport or fit
      if (initialCanvasState?.viewport) {
        setTimeout(() => {
          setViewport(initialCanvasState.viewport);
        }, 0);
      } else {
        setTimeout(() => {
          fitView({ padding: 0.1 });
        }, 0);
      }
    }
  }, [dbml, initialCanvasState, setNodes, setEdges, setStoreNodes, setStoreEdges, setParseError, fitView, setViewport]);

  // Handle node changes (position updates)
  const handleNodesChange: OnNodesChange<Node<TableNodeData>> = useCallback(
    (changes) => {
      onNodesChange(changes);

      // Check if any position changed
      const hasPositionChange = changes.some(
        (change) => change.type === 'position' && change.dragging === false
      );

      if (hasPositionChange) {
        setDirty(true);
      }
    },
    [onNodesChange, setDirty]
  );

  const handleEdgesChange: OnEdgesChange<Edge> = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<TableNodeData>) => {
      setSelectedTableId(node.id);
    },
    [setSelectedTableId]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedTableId(null);
  }, [setSelectedTableId]);

  // Sync nodes to store for export
  useEffect(() => {
    setStoreNodes(nodes);
  }, [nodes, setStoreNodes]);

  return (
    <div className="w-full h-full">
      <EdgeMarkers />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'relation',
        }}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(var(--muted-foreground))" gap={20} size={1} />
        <Controls className="!bg-card !border !shadow-md" />
        <MiniMap
          className="!bg-card !border !shadow-md"
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--muted) / 0.5)"
        />
      </ReactFlow>
    </div>
  );
}

interface DiagramCanvasProps {
  initialCanvasState?: CanvasState | null;
}

export default function DiagramCanvas({ initialCanvasState }: DiagramCanvasProps) {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner initialCanvasState={initialCanvasState} />
    </ReactFlowProvider>
  );
}

// Export function to get current canvas state
export function useCanvasState() {
  const nodes = useDiagramStore((s) => s.nodes);
  const viewport = useDiagramStore((s) => s.viewport);

  return useMemo(
    (): CanvasState => ({
      viewport,
      nodePositions: getNodePositions(nodes),
    }),
    [nodes, viewport]
  );
}
