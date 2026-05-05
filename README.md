# Markwell

**Read Markdown well.** A minimal reader for macOS: open **`.md`** or **`.mmd`** (MultiMarkdown or standalone Mermaid) or pick from Recent, read in a large panel. No accounts, no extras.

## Prerequisites

- **Node.js** 18.x or later (LTS recommended)
- **macOS** for building the app (run works on any platform where Electron runs)

## Run

```bash
npm install
npm start
```

If you use a **private npm registry**, copy [.npmrc.example](.npmrc.example) to `.npmrc` and set `registry` and auth as required. The repo does not commit a lockfile or `.npmrc`.

- **Open file**: Click "Open file…" or use **Cmd+O** to pick a `.md` or `.mmd` file.
- **Recent**: Recently opened files are listed in the sidebar; click to reopen.
- **Reader**: Markdown is rendered in the main panel (readable font size, max-width). Mermaid works from fenced mermaid code blocks in `.md` and from raw diagram text in many `.mmd` files. Window size and position are remembered.
- **Live reload**: If you edit and save the open file in another app, the reader updates automatically after a short pause (debounced).

## Build (optional)

```bash
npm run build
```

Produces a Mac app in `dist/`. The first time you run `npm run build`, the script generates `assets/icon.png` from `assets/icon.svg` for the app icon (requires `sharp`).

## Project structure

- `main.js` — Electron main process: window, menu, IPC handlers.
- `lib/active-file-watcher.js` — Debounced `fs.watch` for the active file (live reload).
- `electron/preload.js` — Preload script; exposes `window.api` to the renderer.
- `src/` — Renderer: `index.html`, `app.js`, `styles.css`.
- `scripts/build-icon.js` — Builds app icon from SVG for packaging.

## Tech stack

- [Electron](https://www.electronjs.org/) — Desktop app
- [marked](https://github.com/markedjs/marked) + [marked-footnote](https://www.npmjs.com/package/marked-footnote) — Markdown to HTML (footnotes for `.mmd` when not in standalone-Mermaid mode)
- [Mermaid](https://mermaid.js.org/) — Diagrams (CDN with SRI; see `index.html` load order)

## License and contributing

- **License**: [MIT](LICENSE)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security**: See [SECURITY.md](SECURITY.md)
