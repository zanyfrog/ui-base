import { defineUiBaseElement } from '@ui-base/core';
import { sanitizeRichTextHtml } from './rich-text-html.js';

const styles = `
:host{display:block;color:var(--uib-rich-text-color,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);font-size:var(--uib-rich-text-font-size,1rem);line-height:var(--uib-rich-text-line-height,1.6)}
.rich-text{display:block;max-width:var(--uib-rich-text-width,72ch)}
::slotted(*){box-sizing:border-box}
::slotted(:is(p,ul,ol,blockquote,pre,h1,h2,h3,h4,h5,h6)){margin-block-start:0;margin-block-end:var(--uib-rich-text-block-gap,.85rem)}
::slotted(:is(h1,h2,h3,h4,h5,h6)){color:var(--uib-rich-text-heading-color,currentColor);font-weight:var(--uib-rich-text-heading-weight,850);line-height:1.18}
::slotted(h1){font-size:var(--uib-rich-text-h1-size,2rem)}
::slotted(h2){font-size:var(--uib-rich-text-h2-size,1.6rem)}
::slotted(h3){font-size:var(--uib-rich-text-h3-size,1.3rem)}
::slotted(:is(h4,h5,h6)){font-size:var(--uib-rich-text-h4-size,1.08rem)}
::slotted(:is(ul,ol)){padding-inline-start:1.35rem}
::slotted(blockquote){padding-inline-start:1rem;border-inline-start:4px solid var(--uib-rich-text-quote-border,var(--uib-color-border-strong,#aab8cc));color:var(--uib-rich-text-muted,var(--uib-color-muted,#53657f))}
::slotted(pre){overflow:auto;padding:.8rem;border-radius:var(--uib-radius-md,.75rem);background:var(--uib-color-surface-soft,#f8fbff)}
::slotted(code){font-family:var(--uib-font-family-mono,ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace)}
::slotted(a){color:var(--uib-rich-text-link-color,var(--uib-color-primary,#174a8b));text-decoration-thickness:.08em;text-underline-offset:.16em}
`;

export class UibRichText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._handleSlotChange = () => this.normalizeContent();
  }

  connectedCallback() {
    this.render();
  }

  normalizeContent() {
    const sanitized = sanitizeRichTextHtml(this.innerHTML, this.ownerDocument);
    if (this.innerHTML !== sanitized) this.innerHTML = sanitized;
  }

  get html() {
    return this.innerHTML;
  }

  set html(value) {
    this.innerHTML = sanitizeRichTextHtml(value, this.ownerDocument);
  }

  render() {
    this.shadowRoot.innerHTML = (
      `<style>${styles}</style>` +
      `<div class="rich-text" part="base content">` +
      `<slot></slot>` +
      `</div>`
    );
    this.shadowRoot.querySelector('slot')?.addEventListener('slotchange', this._handleSlotChange);
    this.normalizeContent();
  }
}

defineUiBaseElement('uib-rich-text', UibRichText);

export { sanitizeRichTextHtml } from './rich-text-html.js';
