import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Key, Link2, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TableNodeData, DBMLColumn } from '@/lib/dbml/parser';

function ColumnRow({ column, tableId }: { column: DBMLColumn; tableId: string }) {
  return (
    <div className="group relative flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50">
      {/* Source handle for this column */}
      <Handle
        type="source"
        position={Position.Right}
        id={column.name}
        className="!w-2 !h-2 !bg-primary !border-background opacity-0 group-hover:opacity-100 transition-opacity"
      />
      {/* Target handle for this column */}
      <Handle
        type="target"
        position={Position.Left}
        id={column.name}
        className="!w-2 !h-2 !bg-primary !border-background opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Column icons */}
      <div className="flex items-center gap-1 w-6 shrink-0">
        {column.pk && (
          <Key className="h-3.5 w-3.5 text-amber-500" />
        )}
        {!column.pk && column.unique && (
          <Hash className="h-3.5 w-3.5 text-blue-500" />
        )}
      </div>

      {/* Column name */}
      <span className={cn(
        "flex-1 font-mono truncate",
        column.pk && "font-semibold"
      )}>
        {column.name}
      </span>

      {/* Column type */}
      <span className="text-muted-foreground font-mono text-xs shrink-0">
        {column.type}
      </span>

      {/* Constraints */}
      <div className="flex items-center gap-1 shrink-0">
        {column.notNull && (
          <span className="text-[10px] text-muted-foreground font-medium">NN</span>
        )}
      </div>
    </div>
  );
}

function TableNode({ data, selected }: NodeProps & { data: TableNodeData }) {
  const tableId = data.schema ? `${data.schema}.${data.name}` : data.name;

  return (
    <div
      className={cn(
        "bg-card border rounded-lg shadow-md min-w-[200px] max-w-[350px] overflow-hidden",
        selected && "ring-2 ring-primary"
      )}
    >
      {/* Table header */}
      <div className="bg-primary/10 px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          {data.schema && (
            <span className="text-xs text-muted-foreground font-mono">
              {data.schema}.
            </span>
          )}
          <span className="font-semibold text-sm truncate">{data.name}</span>
        </div>
        {data.note && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{data.note}</p>
        )}
      </div>

      {/* Columns */}
      <div className="divide-y divide-border">
        {data.columns.map((column) => (
          <ColumnRow key={column.name} column={column} tableId={tableId} />
        ))}
      </div>

      {data.columns.length === 0 && (
        <div className="px-3 py-2 text-sm text-muted-foreground italic">
          No columns
        </div>
      )}
    </div>
  );
}

export default memo(TableNode);
