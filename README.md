# 📚 IntelliDoc – NextGen PDF Workspace - TEAM bareozgarians
<div align="center">
  <h2>[ Sunny Chaudhary, Pranav Suri & Sidhant Malik ] </h2>
</div>

## 🚀 Don’t just read about it — watch the magic happen! 👇🏻
<div align="center">
  <h2> https://youtu.be/qFXo3Px90S8 </h2>
</div>

## ✨ CORE MODULES
<div align="center">
<pre>
╔═════════════╗      ╔══════════════╗
║ ⚡ DASHBOARD ║────▶️ ║ ⚡ PDF READER ║
╚═════════════╝      ╚══════════════╝
</pre>
</div>

## 🗂 DASHBOARD
<div align="center">
<pre>
┌────────────────────────────────────────────┐
│  Bulk Upload (≤30)   │  Quick Open         │
├──────────────────────┼─────────────────────┤
│  Light / Dark Toggle │  Offline Storage    │
├──────────────────────┼─────────────────────┤
│  Manage PDFs         │  Feedback Column    │
└────────────────────────────────────────────┘
</pre>
</div>

## 📖 PDF READER
<div align="center">
<pre>
┌───────────────────────────────────────────────────┐
│   Pan / Zoom / Scroll  │   Highlight & Annotate   │
├────────────────────────┼──────────────────────────┤
│   Insight Bulb         │   Connect the Dots       │
├────────────────────────┼──────────────────────────┤
│   Podcast Generator    │   Notebook Integration   │
├────────────────────────┼──────────────────────────┤
│   Smart TOC / Index    │   Chat with PDF          │
├────────────────────────┼──────────────────────────┤
│   Graphs + Calendar    │   Translate on Select    │
└───────────────────────────────────────────────────┘
</pre>
</div>

## 🛣 Roadmap  

<div align="center">
<pre>
╔══════════════════════════════════╗
║       ⚡ Phase 1 – Foundations    ║
╚══════════════════════════════════╝
</pre>
</div>

• Build Dashboard → Bulk upload, quick open
• Implement local storage + offline access
• Core PDF Reader → pan, zoom, scroll, fullscreen
• Smart TOC → section/heading extraction

<div align="center">
<pre>
╔════════════════════════════════════╗
║      ⚡ Phase 2 – Smart Features    ║
╚════════════════════════════════════╝
</pre>
</div>

• Annotations → highlights, notes, form fill
• Feedback system inside app
• Theme toggle (light/dark)
• Index navigation (jump-to-section)
• Toolbar → search, rotate, print

<div align="center">
<pre>
╔════════════════════════════════════╗
║   ⚡ Phase 3 – Intelligence Layer   ║
╚════════════════════════════════════╝
</pre>
</div>

• Insight Bulb → contextual suggestions
• “Connect the Dots” → cross-PDF linking
• Notebook integration (save snippets)
• Translate selected text (multilingual)
• Save annotations with export/import

<div align="center">
<pre>
╔════════════════════════════════════╗
║    ⚡ Phase 4 – Advanced Magic      ║
╚════════════════════════════════════╝
</pre>
</div>

• Podcast generator → listen to PDFs
• Chatbot → ask questions inside PDFs
• Graphs + timelines from extracted text
• Calendar event extraction
• Shared notebooks & collaboration

 ## ⚙️ Requirements

  - *Node.js 18+* (check: ⁠ node -v ⁠)
  - *npm 9+* (check: ⁠ npm -v ⁠)
  - *Docker* (optional, for the all-in-one image)
  - macOS / Linux / WSL are recommended. (Windows works—use PowerShell equivalents.)

# 🐳 Run with Docker 

This builds the frontend, copies it into the backend, and serves everything on :8080.
- from project root
```
docker build --platform linux/amd64 -t intellidoc .
```
```
docker run --rm -p 8080:8080 intellidoc
```
