import { useEffect, useState, useMemo } from 'react';
import { DocsAPI, type DocMeta } from '../api';
import UploadButton from '../components/UploadButton';
import DocumentTable from '../components/DocumentTable';

export default function Dashboard() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // initial fetch
  useEffect(() => {
    (async () => {
      try {
        const list = await DocsAPI.list();
        setDocs(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // merge uploads instantly
  const handleUploaded = (newDocs: DocMeta[]) => {
    setDocs(prev => {
      const next = [...newDocs, ...prev];
      // sort by updatedAt desc (same as backend list endpoint)
      next.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
      return next;
    });
  };

  // keep list in sync on rename/delete
  const onRename = (id: string, name: string) => {
    setDocs(prev =>
      prev.map(d => (d.id === id ? { ...d, name, updatedAt: new Date().toISOString() } : d))
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    );
  };
  const onDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const count = useMemo(() => docs.length, [docs]);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xl font-semibold">Documents ({count})</div>
        <UploadButton onUploaded={handleUploaded} />
      </div>

      {loading ? (
        <div className="opacity-70 text-sm">Loading…</div>
      ) : (
        <DocumentTable
          docs={docs}
          onRenameLocal={onRename}
          onDeleteLocal={onDelete}
        />
      )}
    </div>
  );
}