# Markwell

**Read Markdown well.** A minimal .md reader for macOS: open a file or pick from Recent, read in a large panel. No accounts, no extras.

## Prerequisites

- **Node.js** 18.x or later (LTS recommended)
- **macOS** for building the app (run works on any platform where Electron runs)

## Run

```bash
npm install
npm start
```

To use a custom npm registry, see [.npmrc.example](.npmrc.example). The repo does not commit a lockfile or `.npmrc`.

- **Open file**: Click "Open file…" or use **Cmd+O** to pick a `.md` file.
- **Recent**: Recently opened files are listed in the sidebar; click to reopen.
- **Reader**: Markdown is rendered in the main panel (readable font size, max-width). Mermaid diagrams in code blocks are supported. Window size and position are remembered.

## Build (optional)

```bash
npm run build
```

Produces a Mac app in `dist/`. The first time you run `npm run build`, the script generates `assets/icon.png` from `assets/icon.svg` for the app icon (requires `sharp`).

## Project structure

- `main.js` — Electron main process: window, menu, IPC handlers.
- `electron/preload.js` — Preload script; exposes `window.api` to the renderer.
- `src/` — Renderer: `index.html`, `app.js`, `styles.css`.
- `scripts/build-icon.js` — Builds app icon from SVG for packaging.

## Tech stack

- [Electron](https://www.electronjs.org/) — Desktop app
- [marked](https://github.com/markedjs/marked) — Markdown to HTML
- [Mermaid](https://mermaid.js.org/) — Diagrams in code blocks (loaded from CDN with SRI)

## License and contributing

- **License**: [MIT](LICENSE)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security**: See [SECURITY.md](SECURITY.md)
