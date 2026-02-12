/**
 * Slugify text for heading IDs (safe for HTML id attributes).
 */
function slugify(text) {
  return (
    String(text)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  );
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { slugify };
} else if (typeof window !== 'undefined') {
  window.slugify = slugify;
}
