import { toPng, toSvg } from 'html-to-image';
import { dbmlToSQL } from './parser';

export async function exportToPng(
  element: HTMLElement,
  filename = 'diagram.png'
): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: 'white',
      pixelRatio: 2,
      filter: (node) => {
        // Filter out React Flow controls and minimap for cleaner export
        if (node.classList?.contains('react-flow__controls')) return false;
        if (node.classList?.contains('react-flow__minimap')) return false;
        return true;
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw error;
  }
}

export async function exportToSvg(
  element: HTMLElement,
  filename = 'diagram.svg'
): Promise<void> {
  try {
    const dataUrl = await toSvg(element, {
      backgroundColor: 'white',
      filter: (node) => {
        if (node.classList?.contains('react-flow__controls')) return false;
        if (node.classList?.contains('react-flow__minimap')) return false;
        return true;
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export SVG:', error);
    throw error;
  }
}

export function exportToSQL(
  dbml: string,
  dialect: 'postgres' | 'mysql' | 'mssql' = 'postgres',
  filename = 'schema.sql'
): void {
  try {
    const sql = dbmlToSQL(dbml, dialect);
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export SQL:', error);
    throw error;
  }
}

export function exportToDBML(dbml: string, filename = 'schema.dbml'): void {
  try {
    const blob = new Blob([dbml], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export DBML:', error);
    throw error;
  }
}
