/**
 * IPC handlers for renderer: file open, read, markdown render, recent list.
 */
const path = require('path');
const fs = require('fs');
const { ipcMain, shell } = require('electron');
const { renderMarkdownToHtml } = require('./lib/markdown-render');
const { setActiveFileWatch } = require('./lib/active-file-watcher');

const EXTERNAL_PROTOCOLS = /^https?:\/\//i;
const MAILTO_PROTOCOL = /^mailto:/i;

function isExternalUrl(href) {
  if (!href || typeof href !== 'string') return false;
  const trimmed = href.trim();
  return EXTERNAL_PROTOCOLS.test(trimmed) || MAILTO_PROTOCOL.test(trimmed);
}

function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') return null;
  try {
    const resolved = path.resolve(filePath);
    const real = fs.realpathSync(resolved);
    const stat = fs.statSync(real);
    return stat.isFile() ? real : null;
  } catch {
    return null;
  }
}

function setupIpcHandlers({ getMainWindow, dialog, store }) {
  ipcMain.handle('open-file', async () => {
    const debugOpen = process.env.MARKWELL_DEBUG_OPEN === '1';
    if (debugOpen) {
      console.log('[Markwell main] open-file IPC invoked');
    }
    const mw = typeof getMainWindow === 'function' ? getMainWindow() : null;
    const win = mw && !mw.isDestroyed() ? mw : null;
    if (debugOpen) {
      console.log(
        '[Markwell main] getMainWindow:',
        mw == null ? 'null' : mw.isDestroyed() ? 'BrowserWindow(destroyed)' : 'BrowserWindow(ok)',
        '→ showOpenDialog parent:',
        win == null ? 'null' : 'BrowserWindow'
      );
    }
    if (win) win.focus();
    let result;
    try {
      result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        title: 'Open Markdown file',
        filters: [
          { name: 'Markdown', extensions: ['md', 'markdown', 'mmd'] },
          { name: 'All files', extensions: ['*'] },
        ],
      });
    } catch (err) {
      console.error('[Markwell main] showOpenDialog threw', err);
      throw err;
    }
    if (debugOpen) {
      console.log(
        '[Markwell main] showOpenDialog done; canceled=',
        result.canceled,
        'paths=',
        (result.filePaths && result.filePaths.length) || 0
      );
    }
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('read-file', async (_, filePath) => {
    const validPath = validateFilePath(filePath);
    if (!validPath) return { error: 'Invalid path' };
    try {
      const content = fs.readFileSync(validPath, 'utf-8');
      return { content };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle('render-markdown', async (_, raw, options = {}) => {
    if (raw == null || typeof raw !== 'string') return '';
    try {
      const filePath = options && typeof options.filePath === 'string' ? options.filePath : '';
      const isMultiMarkdown = /\.mmd$/i.test(filePath);
      const out = renderMarkdownToHtml(raw, { isMultiMarkdown });
      return typeof out?.then === 'function' ? await out : out;
    } catch {
      return raw;
    }
  });

  ipcMain.handle('get-recent', async () => {
    const data = store.readStore();
    return data.recent || [];
  });

  ipcMain.handle('add-recent', async (_, filePath) => {
    const validPath = validateFilePath(filePath);
    if (!validPath) return;
    const data = store.readStore();
    let recent = data.recent || [];
    const entry = { path: validPath, openedAt: Date.now() };
    recent = recent.filter((e) => e.path !== validPath);
    recent.unshift(entry);
    data.recent = recent.slice(0, store.MAX_RECENT);
    store.writeStore(data);
  });

  ipcMain.handle('open-external', async (_, url) => {
    if (!isExternalUrl(url)) return;
    try {
      await shell.openExternal(url);
    } catch {
      // Ignore (e.g. invalid URL or no handler)
    }
  });

  ipcMain.handle('resolve-path', (_, baseFilePath, linkHref) => {
    if (!baseFilePath || !linkHref || typeof linkHref !== 'string') return null;
    const trimmed = linkHref.trim();
    if (!trimmed || trimmed.startsWith('#') || /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return null;
    try {
      const dir = path.dirname(path.resolve(baseFilePath));
      const resolved = path.resolve(dir, trimmed);
      return validateFilePath(resolved);
    } catch {
      return null;
    }
  });

  ipcMain.handle('watch-active-file', (_, filePath) => {
    return setActiveFileWatch(filePath, {
      validatePath: validateFilePath,
      onStableChange: (validPath) => {
        const mw = typeof getMainWindow === 'function' ? getMainWindow() : null;
        const win = mw && !mw.isDestroyed() ? mw : null;
        if (win) win.webContents.send('file-changed', validPath);
      },
    });
  });
}

module.exports = { setupIpcHandlers, validateFilePath };
