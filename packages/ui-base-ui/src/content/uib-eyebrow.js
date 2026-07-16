import { defineUiBaseElement, escapeHtml } from '@ui.base/core';

const styles = `
:host{display:inline-block;color:var(--uib-eyebrow-color,var(--uib-color-primary,#174a8b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);font-size:var(--uib-eyebrow-size,.8rem);font-weight:var(--uib-eyebrow-weight,900);letter-spacing:var(--uib-eyebrow-spacing,.08em);line-height:1.2;text-transform:uppercase}.eyebrow{margin:0}
`;

export class UibEyebrow extends HTMLElement {
  static get observedAttributes() { return ['text']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const text = this.getAttribute('text') || this.textContent.trim();
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<p class="eyebrow" part="eyebrow">` +
  `<slot>` +
  ` ` +
  (escapeHtml(text)) +
  ` ` +
  `</slot>` +
  `</p>`
);
  }
}

defineUiBaseElement('uib-eyebrow', UibEyebrow);
