const { describe, it } = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const { slugify } = require('../lib/slugify.js');
const { addHeadingIds, buildTableOfContents } = require('../lib/reader-dom.js');

function setupDom(bodyHtml) {
  const dom = new JSDOM(`<!DOCTYPE html><body>${bodyHtml}</body>`, { url: 'file:///test.html' });
  global.document = dom.window.document;
  global.window = dom.window;
  return dom;
}

describe('addHeadingIds', () => {
  it('assigns slugified ids to headings', () => {
    const dom = setupDom('<div id="body"><h1>Hello World</h1><h2>Getting Started</h2></div>');
    const body = dom.window.document.getElementById('body');
    addHeadingIds(body, slugify);
    const h1 = body.querySelector('h1');
    const h2 = body.querySelector('h2');
    assert.strictEqual(h1.id, 'hello-world');
    assert.strictEqual(h2.id, 'getting-started');
  });

  it('deduplicates ids for same heading text', () => {
    const dom = setupDom('<div id="body"><h2>Introduction</h2><h3>Introduction</h3></div>');
    const body = dom.window.document.getElementById('body');
    addHeadingIds(body, slugify);
    const headings = body.querySelectorAll('h2, h3');
    assert.strictEqual(headings[0].id, 'introduction');
    assert.strictEqual(headings[1].id, 'introduction-1');
  });

  it('does nothing when container is null', () => {
    addHeadingIds(null, slugify);
    // no throw
  });

  it('does nothing when slugifyFn is missing', () => {
    const dom = setupDom('<div id="body"><h1>Hi</h1></div>');
    const body = dom.window.document.getElementById('body');
    addHeadingIds(body, null);
    assert.strictEqual(body.querySelector('h1').id, '');
  });
});

describe('buildTableOfContents', () => {
  it('builds TOC with title and links to headings', () => {
    const dom = setupDom('<div id="body"><h1>Title</h1><h2>Section</h2></div><nav id="toc"></nav>');
    const body = dom.window.document.getElementById('body');
    const toc = dom.window.document.getElementById('toc');
    addHeadingIds(body, slugify);
    buildTableOfContents(body, toc);
    assert.strictEqual(toc.querySelector('.reader-toc__title').textContent, 'On this page');
    const links = toc.querySelectorAll('.reader-toc__link');
    assert.strictEqual(links.length, 2);
    assert.strictEqual(links[0].getAttribute('href'), '#title');
    assert.strictEqual(links[0].textContent.trim(), 'Title');
    assert.strictEqual(links[1].getAttribute('href'), '#section');
    assert.strictEqual(links[1].textContent.trim(), 'Section');
  });

  it('adds reader-toc--empty when container is null', () => {
    const dom = setupDom('<nav id="toc"></nav>');
    const toc = dom.window.document.getElementById('toc');
    buildTableOfContents(null, toc);
    assert.ok(toc.classList.contains('reader-toc--empty'));
    assert.strictEqual(toc.innerHTML, '');
  });

  it('adds reader-toc--empty when no headings', () => {
    const dom = setupDom('<div id="body"><p>No headings</p></div><nav id="toc"></nav>');
    const body = dom.window.document.getElementById('body');
    const toc = dom.window.document.getElementById('toc');
    buildTableOfContents(body, toc);
    assert.ok(toc.classList.contains('reader-toc--empty'));
  });

  it('does nothing when tocEl is null', () => {
    const dom = setupDom('<div id="body"><h1>Hi</h1></div>');
    const body = dom.window.document.getElementById('body');
    buildTableOfContents(body, null);
    // no throw
  });
});
