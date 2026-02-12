const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createStore, MAX_RECENT, STORE_FILE } = require('../store.js');

describe('store', () => {
  it('exports MAX_RECENT and STORE_FILE', () => {
    assert.strictEqual(MAX_RECENT, 20);
    assert.strictEqual(STORE_FILE, 'store.json');
  });

  it('readStore returns empty object when no file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markwell-test-'));
    const app = { getPath: () => tmpDir };
    const store = createStore(app);
    assert.deepStrictEqual(store.readStore(), {});
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('writeStore and readStore round-trip', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markwell-test-'));
    const app = { getPath: () => tmpDir };
    const store = createStore(app);
    const data = { windowBounds: { width: 800, height: 600 }, recent: [] };
    store.writeStore(data);
    assert.deepStrictEqual(store.readStore(), data);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('recent list is capped at MAX_RECENT', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markwell-test-'));
    const app = { getPath: () => tmpDir };
    const store = createStore(app);
    const recent = Array.from({ length: 25 }, (_, i) => ({ path: `/tmp/file${i}.md`, openedAt: Date.now() - i }));
    store.writeStore({ recent });
    const read = store.readStore();
    assert.strictEqual(read.recent.length, 25);
    const capped = read.recent.slice(0, MAX_RECENT);
    store.writeStore({ ...read, recent: capped });
    assert.strictEqual(store.readStore().recent.length, MAX_RECENT);
    fs.rmSync(tmpDir, { recursive: true });
  });
});
