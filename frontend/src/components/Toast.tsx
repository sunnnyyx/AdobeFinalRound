import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Toasts() {
  const { toasts, removeToast } = useStore();
  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => removeToast(t.id), 3000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id}
          className={`px-4 py-2 rounded-lg shadow-soft text-white ${t.kind==='error'?'bg-red-600':t.kind==='success'?'bg-green-600':'bg-gray-800'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}