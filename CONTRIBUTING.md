# Contributing to Markwell

Thanks for your interest in contributing. Here’s how to get started.

## Run and build

- **Prerequisites**: Node.js 18+ (LTS recommended), npm.
- **Install**: `npm install` (see [Registry setup](#registry-setup) if you use a custom npm registry).
- **Run**: `npm start`
- **Build** (macOS): `npm run build` (produces the app in `dist/`)

### Registry setup

The project does not commit `package-lock.json` or `.npmrc`.

If you use a **private npm registry** (corporate proxy, self-hosted, etc.), copy [.npmrc.example](.npmrc.example) to `.npmrc`, set `registry=` to your team’s registry URL, add authentication if required, then run `npm install`. Do not commit `.npmrc`.

### Dependencies

We do not commit a lockfile. To limit version creep and breaking changes, critical runtime and build dependencies use **tilde ranges** (`~x.y.z`) in `package.json`, so only patch updates are installed. CI runs `npm audit --omit=dev --audit-level=critical` so known critical vulnerabilities in production dependencies fail the build.

## Code style and checks

- **Lint**: `npm run lint` (ESLint)
- **Format**: `npm run format` (Prettier). Run `npm run format:check` to only check.
- **Tests**: `npm test` (Node built-in test runner)

Please run `npm run lint`, `npm run format:check`, and `npm test` before submitting a PR.

**Simulate CI locally** (e.g. to verify the workflow will pass): from the repo root, run `npm run ci`. To mirror CI exactly without a lockfile: `rm -f package-lock.json && npm install && npm run ci` (and `npm run build` on macOS if you want to test the build job).

## Submitting changes

1. Open an issue or comment on an existing one so we can align on the approach.
2. Fork the repo and create a branch (e.g. `fix/thing` or `feat/something`).
3. Make your changes; keep commits focused.
4. Ensure lint and tests pass; add or update tests when relevant.
5. Open a pull request with a short description and, if applicable, link to the issue.

## Project layout

- `main.js` — Electron main process
- `store.js` — Persisted state (window bounds, recent files)
- `ipc-handlers.js` — IPC handlers for file/markdown/recent
- `electron/preload.js` — Preload script; exposes `window.api`
- `src/` — Renderer: `index.html`, `app.js`, `styles.css`
- `lib/markdown-render.js` — Markdown / `.mmd` HTML for the main process
- `lib/slugify.js`, `lib/renderer-helpers.js`, `lib/reader-dom.js` — Shared helpers (browser + tests where noted)
- `test/` — Unit tests

### Renderer script order

Scripts in `index.html` are ordered deliberately: **DOMPurify and Mermaid (CDN) load before** `lib/*.js` and **`app.js`**, so sanitization and `mermaid.initialize` run at startup. `lib/slugify.js` defines a global `slugify` function; **`app.js` must not declare another `const slugify`** (same global scope — it throws and stops the rest of the script).

### Debugging IPC / native dialogs

Set **`MARKWELL_DEBUG_OPEN=1`** when launching Electron to log `open-file` / `showOpenDialog` steps to the terminal (`ipc-handlers.js`).

We use Prettier for formatting and ESLint for linting. The codebase is intentionally minimal; prefer small, clear changes.
