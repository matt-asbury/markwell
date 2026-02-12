/**
 * Preload script: exposes a minimal API to the renderer via contextBridge.
 * The renderer receives window.api with: openFile, readFile, getRecent, addRecent, renderMarkdown, openExternal, onFileSelected.
 */
const { contextBridge, ipcRenderer } = require('electron');

let onFileSelected = null;
ipcRenderer.on('file-selected', (_, filePath) => {
  if (onFileSelected) onFileSelected(filePath);
});

contextBridge.exposeInMainWorld('api', {
  openFile: () => ipcRenderer.invoke('open-file'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  getRecent: () => ipcRenderer.invoke('get-recent'),
  addRecent: (filePath) => ipcRenderer.invoke('add-recent', filePath),
  renderMarkdown: (md) => ipcRenderer.invoke('render-markdown', md),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  resolvePath: (baseFilePath, linkHref) => ipcRenderer.invoke('resolve-path', baseFilePath, linkHref),
  onFileSelected: (cb) => {
    onFileSelected = cb;
  },
});
