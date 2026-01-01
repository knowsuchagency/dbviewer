import { Link, useNavigate } from 'react-router';
import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDiagrams } from '@/hooks/queries/use-diagrams';
import { useDeleteDiagram } from '@/hooks/mutations/use-diagram-mutations';
import { Plus, MoreVertical, Pencil, Trash2, Loader2, FileCode } from 'lucide-react';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'My Diagrams - DBML Viewer' },
    { name: 'description', content: 'View and manage your saved database diagrams' },
  ];
}

function DiagramsContent() {
  const navigate = useNavigate();
  const { data, isLoading } = useDiagrams();
  const deleteDiagram = useDeleteDiagram();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteDiagram.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const diagrams = data?.items || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Diagrams</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your saved database diagrams
          </p>
        </div>
        <Button asChild>
          <Link to="/viewer">
            <Plus className="h-4 w-4 mr-2" />
            New Diagram
          </Link>
        </Button>
      </div>

      {diagrams.length === 0 ? (
        <Card className="p-12 text-center">
          <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No diagrams yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first diagram to visualize your database schema.
          </p>
          <Button asChild>
            <Link to="/viewer">Create Diagram</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {diagrams.map((diagram) => (
            <Card key={diagram.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <Link
                  to={`/viewer/${diagram.id}`}
                  className="flex-1 min-w-0"
                >
                  <h3 className="font-semibold truncate hover:text-primary">
                    {diagram.name}
                  </h3>
                  {diagram.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {diagram.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Updated {new Date(diagram.updated).toLocaleDateString()}
                  </p>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/viewer/${diagram.id}`)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(diagram.id, diagram.name)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiagramsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <DiagramsContent />
        </main>
      </div>
    </ProtectedRoute>
  );
}
