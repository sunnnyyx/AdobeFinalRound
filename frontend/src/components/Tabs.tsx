import { ReactNode } from 'react';

export default function Tabs({
  active, setActive
}: { active: 'documents'|'notebooks'; setActive: (t:'documents'|'notebooks')=>void }) {
  const tab = (id: 'documents'|'notebooks', label: string) => (
    <button
      onClick={() => setActive(id)}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition
        ${active===id ? 'bg-[var(--accent)] text-white' : 'bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200'}`}>
      {label}
    </button>
  );
  return (
    <div className="flex gap-2">{tab('documents', 'Documents')}{tab('notebooks','Notebooks')}</div>
  );
}