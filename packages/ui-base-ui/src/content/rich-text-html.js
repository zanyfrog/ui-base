const allowedTags = new Set([
  'A', 'ABBR', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DIV', 'EM', 'H1', 'H2', 'H3',
  'H4', 'H5', 'H6', 'I', 'LI', 'OL', 'P', 'PRE', 'SMALL', 'SPAN', 'STRONG',
  'SUB', 'SUP', 'U', 'UL'
]);

const removedTags = new Set(['BASE', 'EMBED', 'IFRAME', 'LINK', 'META', 'OBJECT', 'SCRIPT', 'STYLE', 'TEMPLATE']);

function safeHref(value, baseUrl) {
  const href = String(value || '').trim();
  if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  try {
    const url = new URL(href, baseUrl);
    return ['http:', 'https:'].includes(url.protocol) ? href : '';
  } catch {
    return '';
  }
}

function normalizeAnchor(anchor, baseUrl) {
  const href = safeHref(anchor.getAttribute('href'), baseUrl);
  Array.from(anchor.attributes).forEach((attribute) => anchor.removeAttribute(attribute.name));
  if (!href) return;
  anchor.setAttribute('href', href);
  try {
    const url = new URL(href, baseUrl);
    if (['http:', 'https:'].includes(url.protocol) && url.origin !== new URL(baseUrl).origin) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  } catch {
    // Fragment and relative links are already allowed above.
  }
}

function sanitizeNode(node, baseUrl) {
  if (node.nodeType !== 1) return;
  const element = node;
  if (removedTags.has(element.tagName)) {
    element.remove();
    return;
  }
  if (!allowedTags.has(element.tagName)) {
    const children = Array.from(element.childNodes);
    element.replaceWith(...children);
    children.forEach((child) => sanitizeNode(child, baseUrl));
    return;
  }
  if (element.tagName === 'A') normalizeAnchor(element, baseUrl);
  else Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
  Array.from(element.childNodes).forEach((child) => sanitizeNode(child, baseUrl));
}

/**
 * Returns canonical, display-safe HTML for the UI Base rich-text contract.
 * It intentionally permits only the small semantic formatting vocabulary that
 * uib-forms-rich-text can author.
 */
export function sanitizeRichTextHtml(value, documentRef = globalThis.document) {
  if (!documentRef?.createElement) return '';
  const template = documentRef.createElement('template');
  template.innerHTML = String(value ?? '');
  const baseUrl = documentRef.baseURI || globalThis.location?.href || 'http://localhost/';
  Array.from(template.content.childNodes).forEach((node) => sanitizeNode(node, baseUrl));
  return template.innerHTML;
}
