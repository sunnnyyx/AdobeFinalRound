// backend/src/server.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ----- storage -----
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ----- db -----
const dbFile = path.join(DATA_DIR, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { docs: [], notebooks: [] });
await db.read();
if (!db.data.docs) db.data.docs = [];
if (!db.data.notebooks) db.data.notebooks = [];

// ----- helpers -----
const MAX_FILES = 25;
const nowISO = () => new Date().toISOString();
const findDoc = (id) => db.data.docs.find((d) => d.id === id);
const findNb = (id) => db.data.notebooks.find((n) => n.id === id);

// ----- multer -----
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${Math.random().toString(16).slice(2)}_${safe}`);
  },
});
const upload = multer({ storage });

// ===== DOCS =====
app.get('/api/docs', async (_req, res) => {
  await db.read();
  const docs = db.data.docs.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  res.json(docs);
});

// upload single
app.post('/api/docs/upload', upload.single('file'), async (req, res) => {
  await db.read();
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  if (db.data.docs.length + 1 > MAX_FILES) {
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(400).json({ error: `Max ${MAX_FILES} files allowed.` });
  }

  const id = path.basename(req.file.filename);
  const stat = fs.statSync(req.file.path);
  const doc = {
    id,
    name: req.file.originalname,
    size: stat.size,
    updatedAt: nowISO(),
    path: req.file.path,
  };
  db.data.docs.push(doc);
  await db.write();
  res.json(doc);
});

// upload many
app.post('/api/docs', upload.array('files'), async (req, res) => {
  await db.read();
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No files uploaded' });
  if (db.data.docs.length + files.length > MAX_FILES) {
    files.forEach((f) => { try { fs.unlinkSync(f.path); } catch {} });
    return res.status(400).json({ error: `Max ${MAX_FILES} files allowed.` });
  }

  const added = files.map((f) => {
    const id = path.basename(f.filename);
    const stat = fs.statSync(f.path);
    return {
      id,
      name: f.originalname,
      size: stat.size,
      updatedAt: nowISO(),
      path: f.path,
    };
  });
  db.data.docs.push(...added);
  await db.write();
  res.json(added);
});

app.put('/api/docs/:id', async (req, res) => {
  await db.read();
  const doc = findDoc(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  const { name } = req.body || {};
  if (name) doc.name = name;
  doc.updatedAt = nowISO();
  await db.write();
  res.json(doc);
});

app.delete('/api/docs/:id', async (req, res) => {
  await db.read();
  const doc = findDoc(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  try { fs.unlinkSync(doc.path); } catch {}
  db.data.docs = db.data.docs.filter((d) => d.id !== doc.id);
  await db.write();
  res.json({ ok: true });
});

app.get('/api/docs/:id/download', async (req, res) => {
  await db.read();
  const doc = findDoc(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.name)}"`);
  res.setHeader('Content-Type', 'application/pdf');
  fs.createReadStream(doc.path).pipe(res);
});

app.get('/api/docs/:id/file', async (req, res) => {
  await db.read();
  const doc = findDoc(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.setHeader('Content-Type', 'application/pdf');
  fs.createReadStream(doc.path).pipe(res);
});

// ===== NOTEBOOKS =====
app.get('/api/notebooks', async (_req, res) => {
  await db.read();
  const nbs = db.data.notebooks.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(nbs);
});

app.post('/api/notebooks', async (req, res) => {
  await db.read();
  const { name } = req.body || {};
  const nb = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`,
    name: name || 'Notebook',
    createdAt: nowISO(),
    items: [], // reserved for future "add selection"
  };
  db.data.notebooks.push(nb);
  await db.write();
  res.json(nb);
});

app.put('/api/notebooks/:id', async (req, res) => {
  await db.read();
  const nb = findNb(req.params.id);
  if (!nb) return res.status(404).json({ error: 'Not found' });
  const { name } = req.body || {};
  if (name) nb.name = name;
  await db.write();
  res.json(nb);
});

app.delete('/api/notebooks/:id', async (req, res) => {
  await db.read();
  const nb = findNb(req.params.id);
  if (!nb) return res.status(404).json({ error: 'Not found' });
  db.data.notebooks = db.data.notebooks.filter((n) => n.id !== nb.id);
  await db.write();
  res.json({ ok: true });
});

app.get('/api/notebooks/:id/download', async (req, res) => {
  await db.read();
  const nb = findNb(req.params.id);
  if (!nb) return res.status(404).json({ error: 'Not found' });
  const content = JSON.stringify(nb, null, 2);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(nb.name)}.json"`);
  res.end(content);
});

// ----- start -----
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));