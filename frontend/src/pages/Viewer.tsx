import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DocsAPI } from '../api';

// PDF.js (ESM)
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy, type PDFRenderTask } from 'pdfjs-dist';
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';

// Use the worker via port (Vite-friendly)
GlobalWorkerOptions.workerPort = new PdfJsWorker();

export default function Viewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;
    container.innerHTML = '';
    setError(null);
    setNumPages(0);

    const url = DocsAPI.fileUrl(id);

    // Track render tasks so we can cancel them on unmount
    const renderTasks: PDFRenderTask[] = [];

    // Start loading
    const loadingTask = getDocument({ url });

    (async () => {
      try {
        const pdf: PDFDocumentProxy = await loadingTask.promise;
        if (cancelled) {
          // If we were cancelled before it loaded, destroy the doc & task cleanly
          try { await pdf.destroy(); } catch {}
          try { await loadingTask.destroy(); } catch {}
          return;
        }

        setNumPages(pdf.numPages);

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) break;

          const page = await pdf.getPage(pageNum);

          // Fit-to-width scale (cap to avoid giant canvases)
          const vw = container.clientWidth || window.innerWidth;
          const viewport1x = page.getViewport({ scale: 1 });
          const scale = Math.min(2, vw / viewport1x.width);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto 16px';
          const ctx = canvas.getContext('2d', { alpha: false })!;

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);

          container.appendChild(canvas);

          const task = page.render({ canvasContext: ctx, viewport });
          renderTasks.push(task);

          // Wait for render (or cancellation)
          try {
            await task.promise;
          } catch (e) {
            // If cancelled, render promise rejects—ignore
            if (!cancelled) {
              console.error('Render error on page', pageNum, e);
              setError('Failed to render PDF page.');
            }
          }
        }

        // Optional: keep the document open for scroll/selection use.
        // If you want to free memory right after render, you can:
        // await pdf.destroy();

      } catch (e) {
        if (!cancelled) {
          console.error('PDF.js load error:', e);
          setError('Failed to load PDF.');
        }
      }
    })();

    // Cleanup: cancel renders first, then destroy the loading task.
    return () => {
      cancelled = true;

      // Cancel all page renders and wait for them to settle
      (async () => {
        try {
          for (const t of renderTasks) {
            try { t.cancel(); } catch {}
            try { await t.promise; } catch {}
          }
          // Properly await the loadingTask destroy (prevents the worker error)
          try { await loadingTask.destroy(); } catch {}
        } finally {
          // Clear canvases
          if (container) container.innerHTML = '';
        }
      })();
    };
  }, [id]);

  return (
    <div className="fixed inset-0 overflow-auto bg-white dark:bg-[#0f172a]">
      <div className="max-w-[1100px] mx-auto px-3 py-3">
        <button onClick={() => navigate(-1)} className="mb-3 text-red-600 hover:underline">
          &larr; Back
        </button>

        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        {!error && numPages === 0 && (
          <div className="text-sm opacity-70 mb-2">Loading…</div>
        )}

        <div ref={containerRef} />
      </div>
    </div>
  );
}