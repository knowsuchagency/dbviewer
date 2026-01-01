import { useState, useCallback } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Database } from 'lucide-react';
import { useDiagramStore } from '@/stores/diagram.store';
import { sqlToDBML, getDBMLString } from '@/lib/dbml/parser';

type SQLDialect = 'postgres' | 'mysql' | 'mssql';

interface SQLImportDialogProps {
  children?: React.ReactNode;
}

export default function SQLImportDialog({ children }: SQLImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [sql, setSql] = useState('');
  const [dialect, setDialect] = useState<SQLDialect>('postgres');
  const [error, setError] = useState<string | null>(null);

  const { setDbml } = useDiagramStore();

  const handleImport = useCallback(() => {
    if (!sql.trim()) {
      setError('Please enter SQL DDL statements');
      return;
    }

    try {
      // Import SQL and convert to DBML
      const { importer } = require('@dbml/core');
      const dbmlString = importer.import(sql, dialect);
      setDbml(dbmlString);
      setOpen(false);
      setSql('');
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to convert SQL to DBML');
    }
  }, [sql, dialect, setDbml]);

  const handleSqlChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSql(e.target.value);
    setError(null);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Import SQL
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import SQL DDL</DialogTitle>
          <DialogDescription>
            Paste your SQL CREATE TABLE statements to convert them to DBML.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">SQL Dialect:</label>
            <Select value={dialect} onValueChange={(v) => setDialect(v as SQLDialect)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="mssql">SQL Server</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            value={sql}
            onChange={handleSqlChange}
            placeholder={`CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100)
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id)
);`}
            className="h-64 font-mono text-sm"
          />

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="font-mono text-xs">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
