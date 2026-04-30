/**
 * DOM helpers for the reader: heading IDs and table of contents.
 * Uses global `document` (browser or jsdom in tests). Exported for Node tests; exposed on window for browser.
 */
function addHeadingIds(container, slugifyFn) {
  if (!container || !slugifyFn) return;
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const used = new Set();
  headings.forEach((el) => {
    let id = slugifyFn(el.textContent);
    if (used.has(id)) {
      let n = 1;
      while (used.has(id + '-' + n)) n++;
      id = id + '-' + n;
    }
    used.add(id);
    el.id = id;
  });
}

function buildTableOfContents(container, tocEl) {
  if (!tocEl) return;
  tocEl.innerHTML = '';
  tocEl.classList.remove('reader-toc--empty');
  if (!container) {
    tocEl.classList.add('reader-toc--empty');
    return;
  }
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    tocEl.classList.add('reader-toc--empty');
    return;
  }
  const doc = typeof document !== 'undefined' ? document : null;
  if (!doc) return;
  const title = doc.createElement('p');
  title.className = 'reader-toc__title';
  title.textContent = 'On this page';
  tocEl.appendChild(title);
  const list = doc.createElement('ul');
  list.className = 'reader-toc__list';
  headings.forEach((el) => {
    const li = doc.createElement('li');
    li.className = 'reader-toc__item';
    const a = doc.createElement('a');
    a.className = 'reader-toc__link reader-toc__link--' + el.tagName.toLowerCase();
    a.href = '#' + el.id;
    a.textContent = el.textContent.trim();
    a.addEventListener('click', (e) => {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    li.appendChild(a);
    list.appendChild(li);
  });
  tocEl.appendChild(list);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addHeadingIds, buildTableOfContents };
} else if (typeof window !== 'undefined') {
  window.addHeadingIds = addHeadingIds;
  window.buildTableOfContents = buildTableOfContents;
}
