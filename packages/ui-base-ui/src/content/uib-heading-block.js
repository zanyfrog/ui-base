import { defineUiBaseElement, escapeHtml } from '@ui-base/core';
import './uib-eyebrow.js';
import './uib-heading.js';

const styles = `
:host{display:block;color:var(--uib-heading-color,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}.block{display:grid;gap:var(--uib-heading-gap,.65rem);text-align:var(--uib-heading-align,start)}.subheadline{margin:0;max-width:var(--uib-heading-subheadline-width,62ch);color:var(--uib-heading-subheadline-color,var(--uib-color-muted,#40516f));font-size:var(--uib-heading-subheadline-size,1.08rem);line-height:1.6;font-weight:600}.body{margin:0;max-width:var(--uib-heading-body-width,68ch);color:var(--uib-heading-body-color,var(--uib-color-muted,#40516f));line-height:1.6}:host([align="center"]) .block{align-items:center;text-align:center}.eyebrow-slot{display:block;margin:0 0 .15rem}
`;

export class UibHeadingBlock extends HTMLElement {
  static get observedAttributes() { return ['eyebrow', 'headline', 'subheadline', 'body', 'level', 'size', 'align']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const eyebrow = this.getAttribute('eyebrow') || '';
    const headline = this.getAttribute('headline') || '';
    const subheadline = this.getAttribute('subheadline') || this.getAttribute('subtitle') || '';
    const body = this.getAttribute('body') || '';
    const level = this.getAttribute('level') || '';
    const size = this.getAttribute('size') || '';
    const align = this.getAttribute('align') || '';
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<div class="block" part="block">` +
  ` ` +
  (eyebrow ? `<span class="eyebrow-slot"><uib-eyebrow text="${escapeHtml(eyebrow)}"></uib-eyebrow></span>` : '') +
  `<uib-heading level="${escapeHtml(level)}" size="${escapeHtml(size)}" align="${escapeHtml(align)}" exportparts="heading: headline"><slot name="headline">${escapeHtml(headline)}</slot></uib-heading>` +
  ` ` +
  (subheadline ? `<p class="subheadline" part="subheadline"><slot name="subheadline">${escapeHtml(subheadline)}</slot></p>` : '') +
  ` ` +
  (body ? `<p class="body" part="body"><slot name="body">${escapeHtml(body)}</slot></p>` : '') +
  ` ` +
  `</div>`
);
  }
}

defineUiBaseElement('uib-heading-block', UibHeadingBlock);
