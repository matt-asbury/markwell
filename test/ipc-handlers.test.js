const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateFilePath } = require('../ipc-handlers.js');

describe('validateFilePath', () => {
  it('returns null for non-string or empty', () => {
    assert.strictEqual(validateFilePath(null), null);
    assert.strictEqual(validateFilePath(undefined), null);
    assert.strictEqual(validateFilePath(123), null);
    assert.strictEqual(validateFilePath(''), null);
  });

  it('returns null for non-existent path', () => {
    assert.strictEqual(validateFilePath('/nonexistent/file.md'), null);
  });

  it('returns null for directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markwell-test-'));
    assert.strictEqual(validateFilePath(tmpDir), null);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns resolved path for existing file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markwell-test-'));
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, '# test');
    const result = validateFilePath(filePath);
    assert.strictEqual(typeof result, 'string');
    assert.ok(result.endsWith('test.md') || result.includes('test.md'));
    assert.strictEqual(validateFilePath(path.join(tmpDir, '..', path.basename(tmpDir), 'test.md')), result);
    fs.rmSync(tmpDir, { recursive: true });
  });
});
