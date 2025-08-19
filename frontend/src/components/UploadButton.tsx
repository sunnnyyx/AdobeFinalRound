import { useRef, useState } from 'react';
import { DocsAPI, type DocMeta } from '../api';

type Props = {
  onUploaded: (newDocs: DocMeta[]) => void; // <— returns new docs so parent can merge instantly
  disabled?: boolean;
};

export default function UploadButton({ onUploaded, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setError(null);

    try {
      let created: DocMeta[] = [];
      if (files.length === 1) {
        const one = await DocsAPI.uploadOne(files[0]);
        created = [one];
      } else {
        const many = await DocsAPI.uploadMany(files);
        created = many;
      }
      onUploaded(created); // <— push immediately into the table
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Upload failed';
      setError(msg);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={pick}
        disabled={busy || disabled}
        className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {busy ? 'Uploading…' : 'Upload PDF'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={onFiles}
        className="hidden"
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}