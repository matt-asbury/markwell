/**
 * Markdown / MultiMarkdown → HTML for the main process (marked + extensions).
 */
const { Marked } = require('marked');
const markedFootnote = require('marked-footnote');

/** Lines like `Key: value` at the start of a MultiMarkdown document, ended by a blank line. */
const METADATA_LINE = /^([A-Za-z][A-Za-z0-9 \t_-]*):\s*(.*)$/;

/**
 * Removes a leading MultiMarkdown metadata block so the body parses as normal Markdown.
 * If the first line does not look like metadata, returns the original string unchanged.
 *
 * @param {string} text
 * @returns {string}
 */
function stripMultiMarkdownMetadata(text) {
  const str = String(text);
  const lines = str.split(/\r?\n/);
  if (lines.length === 0 || !METADATA_LINE.test(lines[0])) {
    return str;
  }
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i += 1;
      break;
    }
    if (METADATA_LINE.test(line)) {
      i += 1;
      continue;
    }
    return str;
  }
  const sep = str.includes('\r\n') ? '\r\n' : '\n';
  return lines.slice(i).join(sep);
}

const renderer = new Marked();
renderer.use(
  markedFootnote({
    refMarkers: true,
  })
);

/** First non-empty line that is not a full-line %% comment (Mermaid comment syntax). */
function firstMeaningfulDiagramLine(text) {
  const lines = String(text).split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (t === '') continue;
    if (t.startsWith('%%')) continue;
    return t;
  }
  return '';
}

/**
 * True when the body is (almost) only Mermaid diagram syntax, not a Markdown document.
 * Many tools use `.mmd` for a single raw diagram (no ``` fence).
 */
const MERMAID_START =
  /^(flowchart(?:\s+[A-Z]{1,2})?|graph(?:\s+[A-Z]{1,2})?|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie(?:\s|$)|gitGraph|mindmap|timeline|quadrantChart|requirementDiagram|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|zenuml|block-beta|sankey(?:-beta)?)\b/i;

function isLikelyStandaloneMermaid(text) {
  const line = firstMeaningfulDiagramLine(String(text));
  if (!line) return false;
  if (line.startsWith('#')) return false;
  return MERMAID_START.test(line);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** HTML that `app.js` + `renderMermaidDiagrams` turn into a rendered diagram. */
function wrapStandaloneMermaidHtml(source) {
  return `<pre><code class="language-mermaid">${escapeHtml(source.trim())}</code></pre>`;
}

/**
 * @param {string} raw
 * @param {{ isMultiMarkdown?: boolean }} [options]
 * @returns {string | Promise<string>}
 */
function renderMarkdownToHtml(raw, options = {}) {
  let input = String(raw ?? '');
  if (options.isMultiMarkdown) {
    input = stripMultiMarkdownMetadata(input);
  }
  if (options.isMultiMarkdown && isLikelyStandaloneMermaid(input)) {
    return wrapStandaloneMermaidHtml(input);
  }
  return renderer.parse(input);
}

module.exports = {
  renderMarkdownToHtml,
  stripMultiMarkdownMetadata,
  isLikelyStandaloneMermaid,
};
