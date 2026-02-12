/**
 * IPC handlers for renderer: file open, read, markdown render, recent list.
 */
const path = require('path');
const fs = require('fs');
const { ipcMain, shell } = require('electron');
const { marked } = require('marked');

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

function setupIpcHandlers({ mainWindow, dialog, store }) {
  ipcMain.handle('open-file', async () => {
    const win = mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
    if (win) win.focus();
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      title: 'Open Markdown file',
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'All files', extensions: ['*'] },
      ],
    });
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

  ipcMain.handle('render-markdown', async (_, raw) => {
    if (raw == null || typeof raw !== 'string') return '';
    try {
      const out = marked.parse(raw);
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
}

module.exports = { setupIpcHandlers, validateFilePath };
