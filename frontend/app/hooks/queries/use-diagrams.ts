import { useQuery } from '@tanstack/react-query';
import { diagramService, type Diagram } from '@/services/diagram.service';
import { pocketbaseService } from '@/services/pocketbase.service';

export const diagramKeys = {
  all: ['diagrams'] as const,
  lists: () => [...diagramKeys.all, 'list'] as const,
  list: (page: number) => [...diagramKeys.lists(), { page }] as const,
  details: () => [...diagramKeys.all, 'detail'] as const,
  detail: (id: string) => [...diagramKeys.details(), id] as const,
};

export function useDiagrams(page = 1) {
  return useQuery({
    queryKey: diagramKeys.list(page),
    queryFn: () => diagramService.list(page),
    enabled: pocketbaseService.isAuthenticated(),
  });
}

export function useDiagram(id: string | undefined) {
  return useQuery({
    queryKey: diagramKeys.detail(id!),
    queryFn: () => diagramService.getById(id!),
    enabled: !!id,
  });
}
