import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { DocMeta, SortState } from '../types';
import { ArrowUpDown, FileText, Pencil, Trash2, Download } from 'lucide-react';
import RenameModal from './RenameModal';
import { DocsAPI } from '../api';

const fmt = (n: number) => {
  if (n > 1e6) return (n / 1e6).toFixed(1) + ' MB';
  if (n > 1e3) return (n / 1e3).toFixed(1) + ' KB';
  return n + ' B';
};

export default function DocumentTable() {
  const { docs, delDoc, renameDoc, pushToast } = useStore();
  const [sort, setSort] = useState<SortState>({ key: 'updatedAt', dir: 'desc' });
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);

  const sorted = useMemo(() => {
    return [...docs].sort((a, b) => {
      const k = sort.key as keyof DocMeta;
      const av = a[k] as any, bv = b[k] as any;
      let cmp = 0;
      if (k === 'size') cmp = (av as number) - (bv as number);
      else cmp = String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [docs, sort]);

  const toggleSort = (key: SortState['key']) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-500 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('name')}>
                <div className="inline-flex items-center gap-2">
                  Name <ArrowUpDown size={14} />
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('updatedAt')}>
                <div className="inline-flex items-center gap-2">
                  Date Modified <ArrowUpDown size={14} />
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('size')}>
                <div className="inline-flex items-center gap-2">
                  Size <ArrowUpDown size={14} />
                </div>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-gray-100">
            {sorted.map((d) => (
              <tr
                key={d.id}
                className="border-t border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  <FileText size={18} className="text-[var(--accent)]" />
                </td>

                {/* Open Adobe Embed viewer in the SAME TAB at /view/:id */}
                <td className="px-4 py-3">
                  <a
                    className="text-[var(--accent)] hover:underline"
                    href={`/view/${d.id}`}
                    title="Open in viewer"
                  >
                    {d.name}
                  </a>
                </td>

                <td className="px-4 py-3">{new Date(d.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{fmt(d.size)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setRenaming({ id: d.id, name: d.name })}
                      className="text-blue-500 inline-flex items-center gap-1"
                    >
                      <Pencil size={16} /> Rename
                    </button>
                    <a
                      href={DocsAPI.downloadUrl(d.id)}
                      className="text-gray-700 dark:text-gray-200 inline-flex items-center gap-1"
                    >
                      <Download size={16} /> Download
                    </a>
                    <button
                      onClick={async () => {
                        await delDoc(d.id);
                        pushToast({ message: 'Deleted', kind: 'success' });
                      }}
                      className="text-red-600 inline-flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!sorted.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No documents yet. Use the Upload button.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RenameModal
        open={!!renaming}
        initial={renaming?.name || ''}
        onClose={() => setRenaming(null)}
        onSave={(name) => renaming && renameDoc(renaming.id, name)}
      />
    </div>
  );
}