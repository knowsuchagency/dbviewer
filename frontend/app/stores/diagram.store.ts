import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Node, Edge, Viewport } from '@xyflow/react';
import type { TableNodeData } from '@/lib/dbml/parser';

interface DiagramState {
  // DBML source
  dbml: string;
  setDbml: (dbml: string) => void;

  // Parsed state
  parseError: string | null;
  setParseError: (error: string | null) => void;

  // React Flow state
  nodes: Node<TableNodeData>[];
  edges: Edge[];
  viewport: Viewport;
  setNodes: (nodes: Node<TableNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setViewport: (viewport: Viewport) => void;
  onNodesChange: (changes: Parameters<typeof import('@xyflow/react').useNodesState>[0]) => void;

  // UI state
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;

  isEditorCollapsed: boolean;
  toggleEditorCollapsed: () => void;

  // Current diagram ID (null for new diagrams)
  currentDiagramId: string | null;
  setCurrentDiagramId: (id: string | null) => void;

  // Dirty state (unsaved changes)
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  dbml: '',
  parseError: null,
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedTableId: null,
  isEditorCollapsed: false,
  currentDiagramId: null,
  isDirty: false,
};

export const useDiagramStore = create<DiagramState>()(
  devtools(
    (set) => ({
      ...initialState,

      setDbml: (dbml) => set({ dbml, isDirty: true }),
      setParseError: (parseError) => set({ parseError }),

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      setViewport: (viewport) => set({ viewport }),
      onNodesChange: () => {
        // Node changes are handled by React Flow's internal state
        // We just need to mark as dirty when positions change
        set({ isDirty: true });
      },

      setSelectedTableId: (selectedTableId) => set({ selectedTableId }),

      toggleEditorCollapsed: () =>
        set((state) => ({ isEditorCollapsed: !state.isEditorCollapsed })),

      setCurrentDiagramId: (currentDiagramId) => set({ currentDiagramId }),
      setDirty: (isDirty) => set({ isDirty }),

      reset: () => set(initialState),
    }),
    { name: 'diagram-store' }
  )
);
