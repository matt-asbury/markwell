const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  stripMultiMarkdownMetadata,
  renderMarkdownToHtml,
  isLikelyStandaloneMermaid,
} = require('../lib/markdown-render.js');

describe('stripMultiMarkdownMetadata', () => {
  it('returns unchanged when first line is not metadata', () => {
    const doc = '# Hello\n\nBody.';
    assert.strictEqual(stripMultiMarkdownMetadata(doc), doc);
  });

  it('strips key/value header ended by blank line', () => {
    const raw = 'Title: My doc\nAuthor: Me\n\n# Hello\n\nText.';
    const out = stripMultiMarkdownMetadata(raw);
    assert.ok(out.includes('# Hello'));
    assert.ok(!out.includes('Title:'));
  });

  it('does not strip when a non-metadata line appears before blank', () => {
    const raw = 'Title: x\nNot metadata\n\nBody';
    assert.strictEqual(stripMultiMarkdownMetadata(raw), raw);
  });
});

describe('renderMarkdownToHtml', () => {
  it('renders headings', () => {
    const html = renderMarkdownToHtml('# Hi', {});
    assert.ok(typeof html === 'string');
    assert.ok(html.includes('<h1'));
  });

  it('renders GFM footnotes when extension path would be mmd', () => {
    const md = 'Ref[^1].\n\n[^1]: Note.';
    const html = renderMarkdownToHtml(md, { isMultiMarkdown: true });
    assert.ok(html.includes('footnote') || html.includes('Footnotes'));
  });

  it('strips metadata before parse for MultiMarkdown', () => {
    const raw = 'Title: T\n\n# H\n';
    const html = renderMarkdownToHtml(raw, { isMultiMarkdown: true });
    assert.ok(html.includes('<h1'));
    assert.ok(!html.includes('Title:'));
  });

  it('wraps raw Mermaid .mmd sources as a language-mermaid block', () => {
    const src = `%% C4 Level 1\nflowchart TB\n  subgraph A\n    X --> Y\n  end`;
    assert.strictEqual(isLikelyStandaloneMermaid(src), true);
    const html = renderMarkdownToHtml(src, { isMultiMarkdown: true });
    assert.ok(html.includes('language-mermaid'));
    assert.ok(html.includes('flowchart'));
  });

  it('parses as Markdown when first diagram line is a heading', () => {
    const md = '# My doc\n\nSome **bold**.';
    assert.strictEqual(isLikelyStandaloneMermaid(md), false);
    const html = renderMarkdownToHtml(md, { isMultiMarkdown: true });
    assert.ok(html.includes('<h1'));
  });
});
