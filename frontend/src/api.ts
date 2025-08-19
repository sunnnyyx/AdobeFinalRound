// frontend/src/api.ts
import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:4000';

export const api = axios.create({
  baseURL,
  withCredentials: false,
});

// ---- Docs ----
export type DocMeta = {
  id: string;
  name: string;
  size: number;
  updatedAt: string; // ISO
};

export const DocsAPI = {
  list: async (): Promise<DocMeta[]> =>
    api.get('/api/docs').then((r) => r.data),

  uploadMany: async (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return api.post('/api/docs', fd).then((r) => r.data as DocMeta[]);
  },

  uploadOne: async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/api/docs/upload', fd).then((r) => r.data as DocMeta);
  },

  rename: async (id: string, name: string) =>
    api.put(`/api/docs/${id}`, { name }).then((r) => r.data),

  del: async (id: string) =>
    api.delete(`/api/docs/${id}`).then((r) => r.data),

  downloadUrl: (id: string) => `${baseURL}/api/docs/${id}/download`,

  fileUrl: (id: string) => `${baseURL}/api/docs/${id}/file`,
};

// ---- Notebooks ----
export type NotebookMeta = {
  id: string;
  name: string;
  createdAt: string; // ISO
};

export const NotebooksAPI = {
  list: async (): Promise<NotebookMeta[]> =>
    api.get('/api/notebooks').then((r) => r.data),

  create: async (name: string) =>
    api.post('/api/notebooks', { name }).then((r) => r.data),

  rename: async (id: string, name: string) =>
    api.put(`/api/notebooks/${id}`, { name }).then((r) => r.data),

  del: async (id: string) =>
    api.delete(`/api/notebooks/${id}`).then((r) => r.data),

  downloadUrl: (id: string) => `${baseURL}/api/notebooks/${id}/download`,
};