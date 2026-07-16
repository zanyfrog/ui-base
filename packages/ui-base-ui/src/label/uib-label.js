import { UibBaseElement, defineUiBaseElement, ensureGlobalStyle, escapeHtml } from '@ui.base/core';
import '../help/uib-help.js';

const globalStyles = `
uib-label{display:inline-flex;max-width:100%;font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);color:var(--uib-color-ink,#13294b)}uib-label[hidden]{display:none}.uib-label{display:inline-flex;align-items:center;gap:.4rem;max-width:100%;font-weight:800;line-height:1.35}.uib-label__text{min-width:0;overflow-wrap:anywhere}.uib-label__required{color:var(--uib-color-danger,#b4232a);font-weight:900}.uib-label__accessible{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}uib-label[disabled]{opacity:.62}uib-label[invalid] .uib-label{color:var(--uib-color-danger,#b4232a)}
`;

export class UibLabel extends UibBaseElement {
  static get observedAttributes() {
    return [...UibBaseElement.commonAttributes, 'for', 'text', 'accessible-text'];
  }

  constructor() {
    super();
    this._initialContent = '';
    this._rendering = false;
  }

  connectedCallback() {
    ensureGlobalStyle('uib-label-global-styles', globalStyles);
    if (!this._initialContent) this._initialContent = this.innerHTML.trim();
    this.render();
  }

  attributeChangedCallback() {
    if (!this._rendering && this.isConnected) this.render();
  }

  get htmlFor() {
    return this.getAttribute('for') || '';
  }

  set htmlFor(value) {
    if (value === null || value === undefined) this.removeAttribute('for');
    else this.setAttribute('for', String(value));
  }

  get text() {
    return this.getAttribute('text') || '';
  }

  set text(value) {
    if (value === null || value === undefined) this.removeAttribute('text');
    else this.setAttribute('text', String(value));
  }

  get accessibleText() {
    return this.getAttribute('accessible-text') || '';
  }

  set accessibleText(value) {
    if (value === null || value === undefined) this.removeAttribute('accessible-text');
    else this.setAttribute('accessible-text', String(value));
  }

  render() {
    this._rendering = true;
    const visibleText = this.text ? escapeHtml(this.text) : (this._initialContent || escapeHtml(this.label || this.name || 'Label'));
    const required = this.required ? '<span class="uib-label__required" aria-hidden="true">*</span>' : '';
    const accessible = this.accessibleText ? (
  `<span class="uib-label__accessible">` +
  (escapeHtml(this.accessibleText)) +
  `</span>`
) : '';
    const help = this.help ? (
  `<uib-help text="` +
  (escapeHtml(this.help)) +
  `" mode="` +
  (escapeHtml(this.helpMode)) +
  `">` +
  `</uib-help>`
) : '';
    const content = (
  `<span class="uib-label__text">` +
  (visibleText) +
  (accessible) +
  `</span>` +
  (required) +
  (help)
);
    const title = this.titleText ? ` title="${escapeHtml(this.titleText)}"` : '';
    const label = this.htmlFor
      ? (
  `<label class="uib-label" part="label" for="` +
  (escapeHtml(this.htmlFor)) +
  `"` +
  (title) +
  `>` +
  (content) +
  `</label>`
)
      : (
  `<span class="uib-label" part="label"` +
  (title) +
  `>` +
  (content) +
  `</span>`
);
    this.innerHTML = label;
    this._rendering = false;
  }
}

defineUiBaseElement('uib-label', UibLabel);
