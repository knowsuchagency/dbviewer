import type { RecordModel, ListResult } from 'pocketbase';
import { pocketbaseService } from './pocketbase.service';

export interface CanvasState {
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  nodePositions: Record<string, { x: number; y: number }>;
}

export interface Diagram extends RecordModel {
  name: string;
  description: string;
  dbml: string;
  canvasState: CanvasState | null;
  owner: string;
}

export interface CreateDiagramData {
  name: string;
  description?: string;
  dbml: string;
  canvasState?: CanvasState;
}

export interface UpdateDiagramData {
  name?: string;
  description?: string;
  dbml?: string;
  canvasState?: CanvasState;
}

class DiagramService {
  private collection = 'diagrams';

  async list(page = 1, perPage = 20): Promise<ListResult<Diagram>> {
    return pocketbaseService.collection(this.collection).getList<Diagram>(page, perPage, {
      sort: '-updated',
    });
  }

  async getById(id: string): Promise<Diagram> {
    return pocketbaseService.collection(this.collection).getOne<Diagram>(id);
  }

  async create(data: CreateDiagramData): Promise<Diagram> {
    const user = pocketbaseService.getCurrentUser();
    if (!user) {
      throw new Error('Must be authenticated to create a diagram');
    }

    return pocketbaseService.collection(this.collection).create<Diagram>({
      ...data,
      owner: user.id,
    });
  }

  async update(id: string, data: UpdateDiagramData): Promise<Diagram> {
    return pocketbaseService.collection(this.collection).update<Diagram>(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return pocketbaseService.collection(this.collection).delete(id);
  }
}

export const diagramService = new DiagramService();
export default diagramService;
