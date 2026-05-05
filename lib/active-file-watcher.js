/**
 * Watch the active markdown file and debounce filesystem events before notifying.
 */
const fs = require('fs');

const DEFAULT_DEBOUNCE_MS = 200;

let watcher = null;
let debounceTimer = null;

function clearDebounce() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

function stopWatching() {
  clearDebounce();
  if (watcher) {
    try {
      watcher.close();
    } catch {
      // ignore
    }
    watcher = null;
  }
}

/**
 * @param {string | null | undefined} filePath
 * @param {object} options
 * @param {(p: string) => string | null} options.validatePath - same rules as validateFilePath
 * @param {(resolvedPath: string) => void} options.onStableChange - after debounce when file may have changed
 * @param {(err: Error) => void} [options.onWatchError]
 * @param {number} [options.debounceMs]
 * @returns {{ ok: boolean }}
 */
function setActiveFileWatch(filePath, options) {
  const { validatePath, onStableChange, onWatchError, debounceMs = DEFAULT_DEBOUNCE_MS } = options;

  stopWatching();

  if (filePath == null || filePath === '') {
    return { ok: true };
  }

  const validPath = validatePath(filePath);
  if (!validPath) {
    return { ok: false };
  }

  function scheduleNotify() {
    clearDebounce();
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      onStableChange(validPath);
    }, debounceMs);
  }

  try {
    watcher = fs.watch(validPath, (eventType) => {
      if (eventType !== 'change' && eventType !== 'rename') return;
      scheduleNotify();
    });
  } catch (err) {
    if (typeof onWatchError === 'function') onWatchError(err);
    return { ok: false };
  }

  watcher.on('error', (err) => {
    stopWatching();
    if (typeof onWatchError === 'function') onWatchError(err);
  });

  return { ok: true };
}

/** For tests: reset module state without relying on fs.watch */
function resetForTests() {
  stopWatching();
}

module.exports = {
  setActiveFileWatch,
  resetForTests,
  DEFAULT_DEBOUNCE_MS,
};
