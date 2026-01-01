import { Navbar } from '@/components/Navbar';
import DBMLEditor from '@/components/dbml/DBMLEditor';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'DBML Viewer' },
    { name: 'description', content: 'View and create database diagrams from DBML' },
  ];
}

export default function ViewerPage() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 min-h-0">
        <DBMLEditor />
      </main>
    </div>
  );
}
