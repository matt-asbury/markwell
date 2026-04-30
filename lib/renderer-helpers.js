/**
 * Pure helpers used by the renderer (basename, link checks). Exported for Node tests; exposed on window for browser.
 */
function basename(filePath) {
  return filePath.split(/[/\\]/).pop() || filePath;
}

function isExternalLink(href) {
  if (!href || typeof href !== 'string') return false;
  const trimmed = href.trim();
  return /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed);
}

function isHashLink(href) {
  if (href == null || typeof href !== 'string') return false;
  const trimmed = href.trim();
  return trimmed === '' || trimmed.startsWith('#');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { basename, isExternalLink, isHashLink };
} else if (typeof window !== 'undefined') {
  window.basename = basename;
  window.isExternalLink = isExternalLink;
  window.isHashLink = isHashLink;
}
