import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

interface RelationEdgeData {
  sourceField: string;
  targetField: string;
  sourceRelation: '1' | '*';
  targetRelation: '1' | '*';
}

function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  selected,
  data,
}: EdgeProps & { data?: RelationEdgeData }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          strokeWidth: selected ? 2 : 1.5,
          stroke: selected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
        }}
        markerEnd={data?.targetRelation === '*' ? 'url(#many)' : 'url(#one)'}
        markerStart={data?.sourceRelation === '*' ? 'url(#many)' : undefined}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-1.5 py-0.5 text-[10px] font-mono bg-background border rounded shadow-sm"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(RelationEdge);
