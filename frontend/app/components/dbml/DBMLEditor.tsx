import { useEffect } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelLeftClose, PanelLeft, Database, FileCode } from 'lucide-react';
import DBMLTextarea from './DBMLTextarea';
import SQLImportDialog from './SQLImportDialog';
import DiagramCanvas from './DiagramCanvas';
import DiagramToolbar from './DiagramToolbar';
import { useDiagramStore } from '@/stores/diagram.store';
import type { CanvasState } from '@/services/diagram.service';

interface DBMLEditorProps {
  initialDbml?: string;
  initialCanvasState?: CanvasState | null;
  diagramId?: string | null;
  diagramName?: string;
}

export default function DBMLEditor({
  initialDbml = '',
  initialCanvasState,
  diagramId,
  diagramName,
}: DBMLEditorProps) {
  const { isEditorCollapsed, toggleEditorCollapsed, setDbml, setCurrentDiagramId, reset } =
    useDiagramStore();

  // Initialize store with props
  useEffect(() => {
    reset();
    if (initialDbml) {
      setDbml(initialDbml);
    }
    if (diagramId) {
      setCurrentDiagramId(diagramId);
    }
  }, [initialDbml, diagramId, setDbml, setCurrentDiagramId, reset]);

  return (
    <div className="flex flex-col h-full">
      <DiagramToolbar diagramName={diagramName} />

      <div className="flex-1 min-h-0">
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          {!isEditorCollapsed && (
            <>
              <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                <div className="h-full border-r flex flex-col">
                  <Tabs defaultValue="dbml" className="flex-1 flex flex-col">
                    <div className="flex items-center border-b px-2">
                      <TabsList className="h-10 bg-transparent">
                        <TabsTrigger value="dbml" className="gap-2">
                          <FileCode className="h-4 w-4" />
                          DBML
                        </TabsTrigger>
                      </TabsList>
                      <div className="ml-auto flex items-center gap-2">
                        <SQLImportDialog>
                          <Button variant="ghost" size="sm" className="h-8 gap-2">
                            <Database className="h-4 w-4" />
                            <span className="hidden sm:inline">Import SQL</span>
                          </Button>
                        </SQLImportDialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={toggleEditorCollapsed}
                        >
                          <PanelLeftClose className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <TabsContent value="dbml" className="flex-1 mt-0">
                      <DBMLTextarea />
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          <ResizablePanel defaultSize={isEditorCollapsed ? 100 : 70}>
            <div className="h-full relative">
              {isEditorCollapsed && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 left-2 z-10 h-8 w-8"
                  onClick={toggleEditorCollapsed}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              )}
              <DiagramCanvas initialCanvasState={initialCanvasState} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
