const { describe, it } = require('node:test');
const assert = require('node:assert');
const { basename, isExternalLink, isHashLink } = require('../lib/renderer-helpers.js');

describe('basename', () => {
  it('returns last path segment for Unix path', () => {
    assert.strictEqual(basename('/foo/bar/readme.md'), 'readme.md');
  });

  it('returns last path segment for Windows-style path', () => {
    assert.strictEqual(basename('C:\\Users\\doc\\file.md'), 'file.md');
  });

  it('returns single segment as-is', () => {
    assert.strictEqual(basename('file.md'), 'file.md');
  });

  it('returns original string when no path separator', () => {
    assert.strictEqual(basename('file'), 'file');
  });
});

describe('isExternalLink', () => {
  it('returns true for http URL', () => {
    assert.strictEqual(isExternalLink('http://example.com'), true);
  });

  it('returns true for https URL', () => {
    assert.strictEqual(isExternalLink('https://example.com'), true);
  });

  it('returns true for mailto', () => {
    assert.strictEqual(isExternalLink('mailto:test@example.com'), true);
  });

  it('returns false for relative path', () => {
    assert.strictEqual(isExternalLink('other.md'), false);
  });

  it('returns false for hash-only', () => {
    assert.strictEqual(isExternalLink('#section'), false);
  });

  it('returns false for null, undefined, non-string', () => {
    assert.strictEqual(isExternalLink(null), false);
    assert.strictEqual(isExternalLink(undefined), false);
    assert.strictEqual(isExternalLink(123), false);
  });

  it('trims whitespace before checking', () => {
    assert.strictEqual(isExternalLink('  https://example.com  '), true);
  });
});

describe('isHashLink', () => {
  it('returns true for empty string', () => {
    assert.strictEqual(isHashLink(''), true);
  });

  it('returns true for hash-only', () => {
    assert.strictEqual(isHashLink('#section'), true);
  });

  it('returns true for hash with leading space when trimmed', () => {
    assert.strictEqual(isHashLink('  #section  '), true);
  });

  it('returns false for relative path', () => {
    assert.strictEqual(isHashLink('other.md'), false);
  });

  it('returns false for http URL', () => {
    assert.strictEqual(isHashLink('http://example.com'), false);
  });

  it('returns false for null, undefined, non-string', () => {
    assert.strictEqual(isHashLink(null), false);
    assert.strictEqual(isHashLink(undefined), false);
    assert.strictEqual(isHashLink(123), false);
  });
});
