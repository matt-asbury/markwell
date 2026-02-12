/**
 * Persisted app state: window bounds and recent file list.
 * Stored as JSON in the Electron userData directory.
 */
const path = require('path');
const fs = require('fs');

const STORE_FILE = 'store.json';
const MAX_RECENT = 20;

function createStore(app) {
  function getStorePath() {
    return path.join(app.getPath('userData'), STORE_FILE);
  }

  function readStore() {
    try {
      const data = fs.readFileSync(getStorePath(), 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  function writeStore(obj) {
    fs.writeFileSync(getStorePath(), JSON.stringify(obj, null, 0), 'utf-8');
  }

  return { getStorePath, readStore, writeStore, MAX_RECENT };
}

module.exports = { createStore, STORE_FILE, MAX_RECENT };
