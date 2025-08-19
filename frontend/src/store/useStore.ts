import { create } from 'zustand';
import { DocMeta, NotebookMeta } from '../types';
import { DocsAPI, NotebooksAPI } from '../api';

type Toast = { id: string; message: string; kind?: 'success'|'error'|'info' };
type State = {
  docs: DocMeta[];
  notebooks: NotebookMeta[];
  loading: boolean;
  toasts: Toast[];

  fetchAll: () => Promise<void>;
  uploadDocs: (files: File[]) => Promise<void>;
  renameDoc: (id: string, name: string) => Promise<void>;
  delDoc: (id: string) => Promise<void>;

  createNotebook: (name: string) => Promise<void>;
  renameNotebook: (id: string, name: string) => Promise<void>;
  delNotebook: (id: string) => Promise<void>;

  pushToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
};

export const useStore = create<State>((set, get) => ({
  docs: [],
  notebooks: [],
  loading: false,
  toasts: [],

  pushToast: (t) => set(s => ({ toasts: [...s.toasts, { id: Math.random().toString(36).slice(2), ...t }] })),
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [docs, notebooks] = await Promise.all([DocsAPI.list(), NotebooksAPI.list()]);
      set({ docs, notebooks });
    } finally {
      set({ loading: false });
    }
  },

  uploadDocs: async (files) => {
    try {
      await DocsAPI.upload(files);
      await get().fetchAll();
      get().pushToast({ message: 'Uploaded successfully', kind: 'success' });
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Upload failed';
      get().pushToast({ message: msg, kind: 'error' });
    }
  },

  renameDoc: async (id, name) => { await DocsAPI.rename(id, name); await get().fetchAll(); },
  delDoc: async (id) => { await DocsAPI.del(id); await get().fetchAll(); },

  createNotebook: async (name) => { await NotebooksAPI.create(name); await get().fetchAll(); },
  renameNotebook: async (id, name) => { await NotebooksAPI.rename(id, name); await get().fetchAll(); },
  delNotebook: async (id) => { await NotebooksAPI.del(id); await get().fetchAll(); }
}));