# Markwell — guidance for AI coding agents

## Project

Markwell is a minimal Markdown reader for macOS: open a file or pick from Recent, read in a large panel. No accounts, no extras. Stack: Electron, Node.js 18+, npm. Build target is macOS (run works on any platform where Electron runs). Markdown is rendered with [marked](https://github.com/markedjs/marked); Mermaid diagrams in code blocks are supported (CDN with SRI).

## Build and validate

- **Bootstrap**: Run `npm install` first.
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
- `test/` — Unit tests

For full layout and file roles, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Conventions

- Prefer small, clear changes. The codebase is intentionally minimal.
- Always run `npm run lint`, `npm run format:check`, and `npm test` before committing.
- Add or update tests when changing behavior. We use the Node built-in test runner; tests live in `test/`.
- Formatting: Prettier. Linting: ESLint. Keep commits focused and link PRs to issues where applicable.
