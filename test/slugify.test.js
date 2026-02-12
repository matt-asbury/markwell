const { describe, it } = require('node:test');
const assert = require('node:assert');
const { slugify } = require('../lib/slugify.js');

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    assert.strictEqual(slugify('Hello World'), 'hello-world');
  });

  it('trims and collapses multiple spaces', () => {
    assert.strictEqual(slugify('  Foo   Bar  '), 'foo-bar');
  });

  it('removes non-word characters except hyphen', () => {
    assert.strictEqual(slugify('Section 1: Introduction'), 'section-1-introduction');
  });

  it('collapses multiple hyphens', () => {
    assert.strictEqual(slugify('a---b'), 'a-b');
  });

  it('strips leading and trailing hyphens', () => {
    assert.strictEqual(slugify('  hello  '), 'hello');
    assert.strictEqual(slugify('---'), 'section');
  });

  it('returns "section" for empty or only-symbol result', () => {
    assert.strictEqual(slugify(''), 'section');
    assert.strictEqual(slugify('   '), 'section');
    assert.strictEqual(slugify('!!!'), 'section');
  });
});
