import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ZoomIn, ZoomOut, Maximize, LayoutGrid, Save } from 'lucide-react';
import ExportMenu from './ExportMenu';
import SaveDialog from './SaveDialog';
import { useDiagramStore } from '@/stores/diagram.store';
import { useAuth } from '@/hooks/use-auth';

interface DiagramToolbarProps {
  diagramName?: string;
}

export default function DiagramToolbar({ diagramName }: DiagramToolbarProps) {
  const { isDirty, currentDiagramId } = useDiagramStore();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-card">
      <div className="flex items-center gap-2 flex-1">
        <h1 className="text-lg font-semibold">
          {diagramName || 'Untitled Diagram'}
          {isDirty && <span className="text-muted-foreground ml-1">*</span>}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ExportMenu />

        {isAuthenticated && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <SaveDialog diagramId={currentDiagramId} />
          </>
        )}
      </div>
    </div>
  );
}
