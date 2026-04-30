const placeholder = document.getElementById('reader-placeholder');
const readerContent = document.getElementById('reader-content');
const readerTitle = document.getElementById('reader-title');
const readerBody = document.getElementById('reader-body');
const readerToc = document.getElementById('reader-toc');
const recentList = document.getElementById('recent-list');
const openFileBtn = document.getElementById('open-file');
// Must not redeclare `slugify` — lib/slugify.js already creates a global `function slugify`.
const slugifyForHeadings =
  typeof window.slugify === 'function'
    ? window.slugify
    : (t) =>
        String(t)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || 'section';

/** Full path of the currently open file, used to resolve relative document links. */
let currentFilePath = null;

function showPlaceholder() {
  placeholder.classList.remove('hidden');
  readerContent.classList.add('hidden');
}

// Mermaid: index.html loads mermaid before this file; startOnLoad false — we call run() after DOM injection.
if (typeof mermaid !== 'undefined') {
  mermaid.initialize({ startOnLoad: false });
}

function showReader(title, bodyContent, isHtml = false) {
  placeholder.classList.add('hidden');
  readerContent.classList.remove('hidden');
  readerTitle.textContent = title;
  if (isHtml) {
    const safeHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(bodyContent) : bodyContent;
    readerBody.innerHTML = safeHtml;
    renderMermaidDiagrams(readerBody);
    if (typeof addHeadingIds === 'function') addHeadingIds(readerBody, slugifyForHeadings);
    if (typeof buildTableOfContents === 'function') buildTableOfContents(readerBody, readerToc);
  } else {
    readerBody.textContent = bodyContent;
    if (typeof buildTableOfContents === 'function') buildTableOfContents(null, readerToc);
  }
  readerTitle.setAttribute('tabindex', '-1');
  readerTitle.focus();
}

/**
 * Mermaid does not treat the two-character sequence \\n as a newline (unlike many languages).
 * Many diagram exports still use literal \\n / \\t in labels — normalize before parsing.
 * In source you can also use a real line break or <br/> in labels (see Mermaid docs).
 */
function normalizeMermaidExporterEscapes(text) {
  return String(text).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

function renderMermaidDiagrams(container) {
  if (!container || typeof window.mermaid === 'undefined') return;
  const mermaidCodeBlocks = container.querySelectorAll('pre code.language-mermaid');
  mermaidCodeBlocks.forEach((code) => {
    const pre = code.closest('pre');
    if (!pre) return;
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = normalizeMermaidExporterEscapes(code.textContent.trim());
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

async function openFileDialog() {
  if (!window.api || typeof window.api.openFile !== 'function') {
    console.error('Markwell: window.api is missing (preload not loaded or wrong context).');
    return;
  }
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
  const html = await window.api.renderMarkdown(result.content, { filePath });
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
