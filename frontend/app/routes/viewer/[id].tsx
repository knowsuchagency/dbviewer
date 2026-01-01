import { useParams, useNavigate } from 'react-router';
import { Navbar } from '@/components/Navbar';
import DBMLEditor from '@/components/dbml/DBMLEditor';
import { useDiagram } from '@/hooks/queries/use-diagrams';
import { Loader2 } from 'lucide-react';
import type { Route } from './+types/[id]';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: 'Edit Diagram - DBML Viewer' },
    { name: 'description', content: 'Edit your database diagram' },
  ];
}

export default function EditDiagramPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: diagram, isLoading, error } = useDiagram(id);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Diagram not found</h1>
            <p className="text-muted-foreground mb-4">
              The diagram you're looking for doesn't exist or you don't have access to it.
            </p>
            <button
              onClick={() => navigate('/viewer')}
              className="text-primary hover:underline"
            >
              Create a new diagram
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 min-h-0">
        <DBMLEditor
          initialDbml={diagram.dbml}
          initialCanvasState={diagram.canvasState}
          diagramId={diagram.id}
          diagramName={diagram.name}
        />
      </main>
    </div>
  );
}
