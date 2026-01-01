import { useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useDiagramStore } from '@/stores/diagram.store';
import { AlertCircle } from 'lucide-react';

const EXAMPLE_DBML = `Table users {
  id integer [primary key]
  username varchar
  email varchar [unique, not null]
  created_at timestamp [default: \`now()\`]
}

Table posts {
  id integer [primary key]
  title varchar [not null]
  body text
  user_id integer [ref: > users.id]
  status varchar [note: 'draft, published, archived']
  created_at timestamp
}

Table comments {
  id integer [primary key]
  body text
  post_id integer [ref: > posts.id]
  user_id integer [ref: > users.id]
  created_at timestamp
}`;

export default function DBMLTextarea() {
  const { dbml, setDbml, parseError } = useDiagramStore();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDbml(e.target.value);
    },
    [setDbml]
  );

  const handleLoadExample = useCallback(() => {
    setDbml(EXAMPLE_DBML);
  }, [setDbml]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <span className="text-sm font-medium">DBML</span>
        <button
          onClick={handleLoadExample}
          className="text-xs text-primary hover:underline"
        >
          Load example
        </button>
      </div>

      <Textarea
        value={dbml}
        onChange={handleChange}
        placeholder="Paste your DBML schema here..."
        className="flex-1 resize-none border-0 rounded-none font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      {parseError && (
        <div className="flex items-start gap-2 px-3 py-2 bg-destructive/10 text-destructive text-sm border-t">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="font-mono text-xs break-all">{parseError}</span>
        </div>
      )}
    </div>
  );
}
