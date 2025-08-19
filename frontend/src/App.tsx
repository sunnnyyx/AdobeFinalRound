import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar';
import Tabs from './components/Tabs';
import DocumentTable from './components/DocumentTable';
import NotebookTable from './components/NotebookTable';
import { useStore } from './store/useStore';
import Toasts from './components/Toast';
import Viewer from './pages/Viewer';

function Dashboard() {
  const [active, setActive] = useState<'documents'|'notebooks'>('documents');
  const { fetchAll } = useStore();
  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <Tabs active={active} setActive={setActive} />
        {active === 'documents' ? <DocumentTable /> : <NotebookTable />}
      </main>
      <Toasts />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/view/:id" element={<Viewer />} />
    </Routes>
  );
}