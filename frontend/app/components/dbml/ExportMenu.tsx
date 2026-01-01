import { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, Image, FileCode, Database, Loader2 } from 'lucide-react';
import { useDiagramStore } from '@/stores/diagram.store';
import { exportToPng, exportToSvg, exportToSQL, exportToDBML } from '@/lib/dbml/export';

export default function ExportMenu() {
  const [exporting, setExporting] = useState(false);
  const { dbml, nodes } = useDiagramStore();

  const handleExportImage = useCallback(
    async (format: 'png' | 'svg') => {
      const element = document.querySelector('.react-flow') as HTMLElement;
      if (!element) return;

      setExporting(true);
      try {
        if (format === 'png') {
          await exportToPng(element);
        } else {
          await exportToSvg(element);
        }
      } catch (error) {
        console.error('Export failed:', error);
      } finally {
        setExporting(false);
      }
    },
    []
  );

  const handleExportSQL = useCallback(
    (dialect: 'postgres' | 'mysql' | 'mssql') => {
      if (!dbml) return;
      exportToSQL(dbml, dialect);
    },
    [dbml]
  );

  const handleExportDBML = useCallback(() => {
    if (!dbml) return;
    exportToDBML(dbml);
  }, [dbml]);

  const hasContent = nodes.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasContent || exporting}>
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export as</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Image className="h-4 w-4 mr-2" />
            Image
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleExportImage('png')}>
              PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportImage('svg')}>
              SVG
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Database className="h-4 w-4 mr-2" />
            SQL
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleExportSQL('postgres')}>
              PostgreSQL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportSQL('mysql')}>
              MySQL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportSQL('mssql')}>
              SQL Server
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={handleExportDBML}>
          <FileCode className="h-4 w-4 mr-2" />
          DBML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
