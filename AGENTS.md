# Markwell — guidance for AI coding agents

## Project

Markwell is a minimal reader for macOS: open **Markdown** (`.md`) or **MultiMarkdown / diagram** (`.mmd`) files, or pick from Recent. Stack: Electron, Node.js 18+, npm. **Rendering**: [marked](https://github.com/markedjs/marked) + [marked-footnote](https://www.npmjs.com/package/marked-footnote); `.mmd` may be parsed as MultiMarkdown (metadata, footnotes) or, when the body looks like a single Mermaid diagram, as raw Mermaid. **DOMPurify** ships as `lib/purify.min.js` (from the `dompurify` npm package); **Mermaid** loads from CDN with SRI in `index.html` (load order: DOMPurify → Mermaid → `lib/*.js` → `app.js`). **Do not** redeclare the global `slugify` in `app.js` — `lib/slugify.js` already defines it; use `slugifyForHeadings` or `window.slugify` only.

## Build and validate

- **Bootstrap**: Run `npm install` first (use [.npmrc.example](.npmrc.example) → `.npmrc` when using a private npm registry).
- **Before every PR**: Run `npm run lint`, `npm run format:check`, and `npm test`. All three must pass.
- **Commands**:
  - `npm start` — run the app
  - `npm run lint` — ESLint
  - `npm run format:check` — Prettier check (use `npm run format` to fix)
  - `npm test` — Node built-in test runner (tests in `test/`)
  - `npm run build` — produce Mac app in `dist/` (macOS only; first run generates `assets/icon.png` from `assets/icon.svg` via `scripts/build-icon.js`, requires `sharp`)

## Project layout

- `main.js` — Electron main process (window, menu, IPC)
- `ipc-handlers.js` — IPC handlers for file/markdown/recent
- `store.js` — Persisted state (window bounds, recent files)
- `electron/preload.js` — Preload script; exposes `window.api` to renderer
- `src/` — Renderer: `index.html`, `app.js`, `styles.css`
- `lib/slugify.js` — Slugify helper (used in renderer and tests)
- `lib/markdown-render.js` — marked + footnotes, MultiMarkdown metadata strip, standalone Mermaid `.mmd` detection
- `lib/renderer-helpers.js`, `lib/reader-dom.js` — basename / links / TOC (also loaded in the renderer before `app.js`)
- `test/` — Unit tests

For full layout and file roles, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Conventions

- Prefer small, clear changes. The codebase is intentionally minimal.
- Always run `npm run lint`, `npm run format:check`, and `npm test` before committing.
- Add or update tests when changing behavior. We use the Node built-in test runner; tests live in `test/`.
- Formatting: Prettier. Linting: ESLint. Keep commits focused and link PRs to issues where applicable.
