const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert');
const { validateFilePath } = require('../ipc-handlers.js');
const { setActiveFileWatch, resetForTests } = require('../lib/active-file-watcher.js');

describe('setActiveFileWatch', () => {
  afterEach(() => {
    resetForTests();
  });

  it('returns ok true when clearing watch with null', () => {
    const r = setActiveFileWatch(null, {
      validatePath: validateFilePath,
      onStableChange: () => {},
    });
    assert.strictEqual(r.ok, true);
  });

  it('returns ok false when path does not validate', () => {
    const r = setActiveFileWatch('/nonexistent/markwell-no-file.md', {
      validatePath: validateFilePath,
      onStableChange: () => {},
    });
    assert.strictEqual(r.ok, false);
  });
});
