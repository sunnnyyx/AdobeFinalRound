import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { NotebookMeta, SortState } from '../types';
import { ArrowUpDown, Notebook as NotebookIcon, Pencil, Trash2, Download, Plus } from 'lucide-react';
import RenameModal from './RenameModal';
import { NotebooksAPI } from '../api';

export default function NotebookTable() {
  const { notebooks, createNotebook, renameNotebook, delNotebook, pushToast } = useStore();
  const [sort, setSort] = useState<SortState>({ key: 'createdAt', dir: 'desc' });
  const [renaming, setRenaming] = useState<{id:string,name:string}|null>(null);

  const sorted = useMemo(() => {
    return [...notebooks].sort((a, b) => {
      const k = sort.key as keyof NotebookMeta;
      const av = a[k] as any, bv = b[k] as any;
      const cmp = String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [notebooks, sort]);

  const toggleSort = (key: SortState['key']) =>
    setSort(s => s.key === key ? ({ key, dir: s.dir === 'asc' ? 'desc' : 'asc' }) : ({ key, dir: 'asc' }));

  const onCreate = async () => {
    const name = prompt('Notebook name?')?.trim();
    if (name) { await createNotebook(name); pushToast({ message: 'Notebook created', kind:'success' }); }
  };

  return (
    <div className="card">
      <div className="flex justify-end p-3">
        <button onClick={onCreate} className="btn btn-primary"><Plus size={16}/> New Notebook</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-500 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3 cursor-pointer" onClick={()=>toggleSort('name')}>
                <div className="inline-flex items-center gap-2">Name <ArrowUpDown size={14}/></div>
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={()=>toggleSort('createdAt')}>
                <div className="inline-flex items-center gap-2">Date Created <ArrowUpDown size={14}/></div>
              </th>
              <th className="px-4 py-3">Entries</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-gray-100">
            {sorted.map(n => (
              <tr key={n.id} className="border-t border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5">
                <td className="px-4 py-3"><NotebookIcon size={18} className="text-[var(--accent)]"/></td>
                <td className="px-4 py-3">{n.name}</td>
                <td className="px-4 py-3">{new Date(n.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{n.entries ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <button onClick={()=>setRenaming({id:n.id, name:n.name})} className="text-blue-500 inline-flex items-center gap-1">
                      <Pencil size={16}/> Rename
                    </button>
                    <a href={NotebooksAPI.downloadUrl(n.id)} className="text-gray-700 dark:text-gray-200 inline-flex items-center gap-1">
                      <Download size={16}/> Download
                    </a>
                    <button onClick={async ()=>{ await delNotebook(n.id); pushToast({ message:'Deleted', kind:'success' }); }} className="text-red-600 inline-flex items-center gap-1">
                      <Trash2 size={16}/> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!sorted.length && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No notebooks yet. Create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <RenameModal
        open={!!renaming}
        initial={renaming?.name || ''}
        onClose={()=>setRenaming(null)}
        onSave={(name)=> renaming && renameNotebook(renaming.id, name)}
      />
    </div>
  );
}