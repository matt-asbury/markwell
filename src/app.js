const placeholder = document.getElementById('reader-placeholder');
const readerContent = document.getElementById('reader-content');
const readerTitle = document.getElementById('reader-title');
const readerBody = document.getElementById('reader-body');
const readerToc = document.getElementById('reader-toc');
const recentList = document.getElementById('recent-list');
const openFileBtn = document.getElementById('open-file');
const slugify =
  window.slugify ||
  ((t) =>
    String(t)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '') || 'section');

/** Full path of the currently open file, used to resolve relative document links. */
let currentFilePath = null;

function showPlaceholder() {
  placeholder.classList.remove('hidden');
  readerContent.classList.add('hidden');
}

// Mermaid: startOnLoad false so we run diagrams only after injecting rendered HTML (e.g. from code blocks).
if (typeof mermaid !== 'undefined') {
  mermaid.initialize({ startOnLoad: false });
}

function isExternalLink(href) {
  if (!href || typeof href !== 'string') return false;
  const trimmed = href.trim();
  return /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed);
}

function showReader(title, bodyContent, isHtml = false) {
  placeholder.classList.add('hidden');
  readerContent.classList.remove('hidden');
  readerTitle.textContent = title;
  if (isHtml) {
    const safeHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(bodyContent) : bodyContent;
    readerBody.innerHTML = safeHtml;
    renderMermaidDiagrams(readerBody);
    addHeadingIds(readerBody);
    buildTableOfContents(readerBody, readerToc);
  } else {
    readerBody.textContent = bodyContent;
    buildTableOfContents(null, readerToc);
  }
  readerTitle.setAttribute('tabindex', '-1');
  readerTitle.focus();
}

function addHeadingIds(container) {
  if (!container) return;
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const used = new Set();
  headings.forEach((el) => {
    let id = slugify(el.textContent);
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
  const title = document.createElement('p');
  title.className = 'reader-toc__title';
  title.textContent = 'On this page';
  tocEl.appendChild(title);
  const list = document.createElement('ul');
  list.className = 'reader-toc__list';
  headings.forEach((el) => {
    const li = document.createElement('li');
    li.className = 'reader-toc__item';
    const a = document.createElement('a');
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

function renderMermaidDiagrams(container) {
  if (!container || typeof window.mermaid === 'undefined') return;
  const mermaidCodeBlocks = container.querySelectorAll('pre code.language-mermaid');
  mermaidCodeBlocks.forEach((code) => {
    const pre = code.closest('pre');
    if (!pre) return;
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = code.textContent.trim();
    pre.replaceWith(div);
  });
  const mermaidNodes = container.querySelectorAll('.mermaid');
  if (mermaidNodes.length) {
    window.mermaid.run({ nodes: mermaidNodes, suppressErrors: true }).catch(() => {
      mermaidNodes.forEach((node) => {
        node.textContent = 'Diagram could not be loaded.';
        node.classList.add('mermaid-error');
      });
    });
  }
}

function basename(filePath) {
  return filePath.split(/[/\\]/).pop() || filePath;
}

async function openFileDialog() {
  if (!window.api || typeof window.api.openFile !== 'function') return;
  const btn = openFileBtn;
  const originalText = btn ? btn.textContent : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Opening…';
  }
  try {
    const filePath = await window.api.openFile();
    if (filePath) await openFile(filePath);
  } catch (err) {
    console.error('Markwell: openFile failed', err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}

async function openFile(filePath) {
  const result = await window.api.readFile(filePath);
  if (result.error) {
    showReader(basename(filePath), `Could not read file: ${result.error}`);
    currentFilePath = null;
    return;
  }
  currentFilePath = filePath;
  await window.api.addRecent(filePath);
  const html = await window.api.renderMarkdown(result.content);
  showReader(basename(filePath), html, true);
  refreshRecent();
}

function refreshRecent() {
  window.api.getRecent().then((recent) => {
    recentList.innerHTML = '';
    (recent || []).forEach(({ path: filePath }) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = basename(filePath);
      btn.title = filePath;
      btn.addEventListener('click', () => openFile(filePath));
      li.appendChild(btn);
      recentList.appendChild(li);
    });
  });
}

function isHashLink(href) {
  if (!href || typeof href !== 'string') return false;
  const trimmed = href.trim();
  return trimmed === '' || trimmed.startsWith('#');
}

readerBody.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a || !a.href) return;
  const rawHref = a.getAttribute('href');
  if (isExternalLink(rawHref)) {
    e.preventDefault();
    if (window.api && typeof window.api.openExternal === 'function') {
      window.api.openExternal(a.href);
    }
    return;
  }
  if (isHashLink(rawHref)) return;
  e.preventDefault();
  if (currentFilePath && window.api && typeof window.api.resolvePath === 'function') {
    window.api.resolvePath(currentFilePath, rawHref).then((resolved) => {
      if (resolved) openFile(resolved);
    });
  }
});

if (openFileBtn) {
  openFileBtn.addEventListener('click', openFileDialog);
}
if (window.api) {
  window.api.onFileSelected((filePath) => openFile(filePath));
  refreshRecent();
}

// Initial state: show placeholder until a file is opened
showPlaceholder();
