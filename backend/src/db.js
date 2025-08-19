import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.resolve(__dirname, '..', '..', 'db.json');

const adapter = new JSONFile(dbFile);
export const db = new Low(adapter, { docs: [], notebooks: [] });

export async function initDb() {
  await db.read();
  db.data ||= { docs: [], notebooks: [] };

  const root = path.resolve(__dirname, '..', '..');
  const docsDir = path.join(root, 'storage', 'docs');
  const notebooksDir = path.join(root, 'storage', 'notebooks');

  fs.mkdirSync(docsDir, { recursive: true });
  fs.mkdirSync(notebooksDir, { recursive: true });

  await db.write();
  return { docsDir, notebooksDir };
}