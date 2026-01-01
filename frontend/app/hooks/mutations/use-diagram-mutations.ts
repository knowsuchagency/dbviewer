import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  diagramService,
  type CreateDiagramData,
  type UpdateDiagramData,
} from '@/services/diagram.service';
import { diagramKeys } from '@/hooks/queries/use-diagrams';
import { useAppStore } from '@/stores/app.store';

export function useCreateDiagram() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((s) => s.addNotification);

  return useMutation({
    mutationFn: (data: CreateDiagramData) => diagramService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagramKeys.lists() });
      addNotification({
        type: 'success',
        title: 'Diagram saved',
        message: 'Your diagram has been saved successfully.',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Failed to save',
        message: error instanceof Error ? error.message : 'Failed to save diagram',
      });
    },
  });
}

export function useUpdateDiagram() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((s) => s.addNotification);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiagramData }) =>
      diagramService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: diagramKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: diagramKeys.lists() });
      addNotification({
        type: 'success',
        title: 'Diagram updated',
        message: 'Your changes have been saved.',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Failed to update',
        message: error instanceof Error ? error.message : 'Failed to update diagram',
      });
    },
  });
}

export function useDeleteDiagram() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((s) => s.addNotification);

  return useMutation({
    mutationFn: (id: string) => diagramService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagramKeys.lists() });
      addNotification({
        type: 'success',
        title: 'Diagram deleted',
        message: 'The diagram has been deleted.',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Failed to delete',
        message: error instanceof Error ? error.message : 'Failed to delete diagram',
      });
    },
  });
}
