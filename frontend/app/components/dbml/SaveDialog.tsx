import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2 } from 'lucide-react';
import { useDiagramStore } from '@/stores/diagram.store';
import { useCreateDiagram, useUpdateDiagram } from '@/hooks/mutations/use-diagram-mutations';
import { getNodePositions } from '@/lib/dbml/layout';
import { useNavigate } from 'react-router';

interface SaveDialogProps {
  diagramId?: string | null;
}

export default function SaveDialog({ diagramId }: SaveDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const { dbml, nodes, viewport, isDirty, setDirty, setCurrentDiagramId } = useDiagramStore();
  const createDiagram = useCreateDiagram();
  const updateDiagram = useUpdateDiagram();

  const isUpdate = !!diagramId;
  const isSaving = createDiagram.isPending || updateDiagram.isPending;

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;

    const canvasState = {
      viewport,
      nodePositions: getNodePositions(nodes),
    };

    try {
      if (isUpdate) {
        await updateDiagram.mutateAsync({
          id: diagramId!,
          data: {
            name,
            description,
            dbml,
            canvasState,
          },
        });
      } else {
        const newDiagram = await createDiagram.mutateAsync({
          name,
          description,
          dbml,
          canvasState,
        });
        setCurrentDiagramId(newDiagram.id);
        navigate(`/viewer/${newDiagram.id}`, { replace: true });
      }

      setDirty(false);
      setOpen(false);
    } catch (error) {
      console.error('Failed to save diagram:', error);
    }
  }, [
    name,
    description,
    dbml,
    nodes,
    viewport,
    isUpdate,
    diagramId,
    createDiagram,
    updateDiagram,
    setDirty,
    setCurrentDiagramId,
    navigate,
  ]);

  // For quick save on existing diagrams
  const handleQuickSave = useCallback(async () => {
    if (!isUpdate || !diagramId) return;

    const canvasState = {
      viewport,
      nodePositions: getNodePositions(nodes),
    };

    try {
      await updateDiagram.mutateAsync({
        id: diagramId,
        data: {
          dbml,
          canvasState,
        },
      });
      setDirty(false);
    } catch (error) {
      console.error('Failed to save diagram:', error);
    }
  }, [isUpdate, diagramId, dbml, nodes, viewport, updateDiagram, setDirty]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isUpdate && diagramId) {
          handleQuickSave();
        } else {
          setOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUpdate, diagramId, handleQuickSave]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" disabled={!dbml.trim()}>
          <Save className="h-4 w-4 mr-2" />
          {isUpdate ? 'Save' : 'Save As'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isUpdate ? 'Save Diagram' : 'Save New Diagram'}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? 'Update the name and description of your diagram.'
              : 'Give your diagram a name to save it to your account.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Database Schema"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this diagram..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
