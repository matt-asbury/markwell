const { app, BrowserWindow, dialog, Menu } = require('electron');
const path = require('path');
const { createStore } = require('./store');
const { setupIpcHandlers } = require('./ipc-handlers');

let mainWindow;

function createWindow(store) {
  const data = store.readStore();
  const bounds = data.windowBounds || { width: 1200, height: 800, x: undefined, y: undefined };
  mainWindow = new BrowserWindow({
    title: 'Markwell',
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'electron', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on('close', () => {
    const data = store.readStore();
    data.windowBounds = mainWindow.getBounds();
    store.writeStore(data);
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  return mainWindow;
}

function openFileFromMenu() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.focus();
  dialog
    .showOpenDialog(mainWindow, {
      properties: ['openFile'],
      title: 'Open Markdown file',
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'All files', extensions: ['*'] },
      ],
    })
    .then((result) => {
      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        mainWindow.webContents.send('file-selected', result.filePaths[0]);
      }
    });
}

app.whenReady().then(() => {
  const store = createStore(app);
  mainWindow = createWindow(store);
  setupIpcHandlers({ mainWindow, dialog, store });

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'Open File…', accelerator: 'CommandOrControl+O', click: openFileFromMenu },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CommandOrControl+Q', role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [{ role: 'reload' }, { role: 'toggledevtools' }, { role: 'togglefullscreen' }],
    },
  ]);
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow(store);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
