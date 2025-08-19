import { useEffect, useState } from 'react';

export default function RenameModal({
  open, initial, onClose, onSave, label='New name'
}: {
  open: boolean; initial: string; label?: string;
  onClose: () => void; onSave: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  useEffect(() => setName(initial), [initial]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Rename</h3>
        <label className="text-sm text-gray-600 dark:text-gray-300">{label}</label>
        <input
          value={name}
          onChange={e=>setName(e.target.value)}
          className="w-full mt-2 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-transparent text-gray-900 dark:text-white"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-black/10 dark:bg-white/10">Cancel</button>
          <button onClick={()=>{ onSave(name); onClose(); }} className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}