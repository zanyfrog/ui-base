import { defineUiBaseElement, escapeHtml, setOrRemoveAttribute } from '@ui-base/core';

const styles = `
:host{display:block;inline-size:100%;block-size:auto}.media{position:relative;display:block;inline-size:100%;overflow:hidden;border-radius:var(--uib-media-radius,inherit);background:var(--uib-media-bg,var(--uib-color-surface-soft,#eef4fb));aspect-ratio:var(--uib-media-ratio,auto)}.media img{display:block;inline-size:100%;block-size:100%;object-fit:var(--uib-media-fit,cover);object-position:var(--uib-media-position,center)}.fallback{display:grid;place-items:center;min-block-size:var(--uib-media-fallback-height,8rem);padding:1rem;color:var(--uib-media-fallback-color,var(--uib-color-muted,#53657f));font-weight:850;text-align:center}:host([role="icon"]) .media{aspect-ratio:1}:host([role="icon"]) .fallback{min-block-size:2.5rem}
`;

export function safeMediaSrc(value) {
  const src = String(value ?? '').trim();
  if (!src || /^javascript:/i.test(src)) return '';
  if (/^data:/i.test(src) && !/^data:image\//i.test(src)) return '';
  return src;
}

export class UibMedia extends HTMLElement {
  static get observedAttributes() { return ['src','alt','fit','ratio','position','role','fallback-label']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  get src() { return this.getAttribute('src') || ''; }
  set src(value) { setOrRemoveAttribute(this, 'src', value); }
  render() {
    const src = safeMediaSrc(this.src);
    const alt = this.getAttribute('alt') || '';
    const fit = this.getAttribute('fit') || (this.getAttribute('role') === 'icon' ? 'contain' : 'cover');
    const ratio = this.getAttribute('ratio') || '';
    const position = this.getAttribute('position') || 'center';
    const fallback = this.getAttribute('fallback-label') || alt || 'Image unavailable';
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<figure class="media" part="media" style="--uib-media-fit:` +
  (escapeHtml(fit)) +
  `;--uib-media-position:` +
  (escapeHtml(position)) +
  `;` +
  (ratio ? `--uib-media-ratio:${escapeHtml(ratio)};` : '') +
  `" > ` +
  (src
          ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`
          : `<div class="fallback" part="fallback">${escapeHtml(fallback)}</div>`) +
  ` ` +
  `</figure>`
);
  }
}

defineUiBaseElement('uib-media', UibMedia);
