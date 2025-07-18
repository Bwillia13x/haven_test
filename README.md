# Aether Weaver v2.0

Aether Weaver is a professional-grade 3D modeling tool built with React, Three.js, Zustand, and a modern UI component system. It features advanced node-based modeling, AI-powered commands, project export/import, and a highly interactive, extensible interface.

---

## 🚀 Features

- **3D Node/Connector Modeling Canvas**
  - Multi-select, drag, snap-to-grid, group, align, distribute
  - Advanced node/connector operations (duplicate, scale, rotate, align, etc.)
- **Natural Language Command Parser**
  - Text-based commands for grid, spiral, fractal, symmetry, animation, material, etc.
- **Material System**
  - Customizable materials, material editor, real-time preview
- **Camera Controls**
  - Bookmarks, focus, frame all, multiple view modes
- **File Operations**
  - Project export/import (JSON), STL/OBJ export
- **Audio Feedback**
  - Background music, hit/success sounds
- **Undo/Redo & History**
  - Full operation history, keyboard shortcuts
- **UI/UX**
  - Toolbar, property panel, notifications, context menus, status bar, help overlay
- **Extensible UI Component Library**
  - Modular, accessible, and customizable

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Development
```bash
npm install
npm run dev
```
- Visit [http://localhost:5173](http://localhost:5173) (or as indicated in terminal)

### Production Build
```bash
npm run build
npm run preview
```

### Backend (API/SSR)
- See `server/` for Express + Vite integration.

---

## 🏗️ Architecture Diagram

```mermaid
graph TD;
  UI["UI Components"] -->|Zustand| Store["Aether Store"]
  Store -->|State| Canvas["3D Canvas (Three.js)"]
  Store -->|Actions| Commands["Command Parser"]
  Store -->|Actions| FileOps["Export/Import"]
  Store -->|Actions| Material["Material System"]
  Store -->|Actions| Camera["Camera Controls"]
  Store -->|Actions| Audio["Audio Hooks"]
  Store -->|Actions| UndoRedo["Undo/Redo"]
  FileOps -->|Export| STL["STL/OBJ"]
  FileOps -->|Import| JSON["Project JSON"]
  Backend["Express API (server/")"]
  UI -->|API| Backend
```

---

## 🧑‍💻 Contribution Guidelines

1. **Fork and clone the repo**
2. **Create a feature branch**
3. **Follow code style (Prettier/ESLint)**
4. **Write/Update tests for new features**
5. **Open a pull request with clear description**

---

## 📦 Project Structure

- `client/` – React frontend, UI, Zustand store, Three.js canvas
- `server/` – Express backend, Vite SSR/static serving
- `shared/` – Shared types and schema
- `client/src/components/UI/` – Modular UI component library

---

## 📄 License
MIT

---

## 📣 Credits
- Inspired by node-based 3D tools and modern web design
- Built with ❤️ by the Aether Weaver team 