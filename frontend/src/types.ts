export type DocMeta = {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  updatedAt: string;
};

export type NotebookMeta = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  entries?: number;
};

export type SortState = { key: 'name' | 'updatedAt' | 'size' | 'createdAt'; dir: 'asc' | 'desc' };