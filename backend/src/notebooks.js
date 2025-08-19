import fs from 'fs';
import path from 'path';

export function notebookFilePath(baseDir, id) {
  return path.join(baseDir, `${id}.json`);
}

export function newNotebookPayload(id, name) {
  const now = new Date().toISOString();
  return { id, name, createdAt: now, updatedAt: now, entries: [] };
}

export function appendToNotebook(baseDir, id, entry) {
  const fp = notebookFilePath(baseDir, id);
  const nb = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  nb.entries.push({ ...entry, addedAt: new Date().toISOString() });
  nb.updatedAt = new Date().toISOString();
  fs.writeFileSync(fp, JSON.stringify(nb, null, 2));
  return nb;
}