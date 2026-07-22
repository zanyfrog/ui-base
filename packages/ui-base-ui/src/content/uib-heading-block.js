import { defineUiBaseElement, escapeHtml } from '@ui-base/core';
import './uib-eyebrow.js';

const styles = `
:host{display:block;color:var(--uib-heading-color,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}.block{display:grid;gap:var(--uib-heading-gap,.65rem);text-align:var(--uib-heading-align,start)}.headline{margin:0;color:var(--uib-heading-headline-color,currentColor);font-size:var(--uib-heading-size,clamp(2.3rem,6vw,4.7rem));line-height:var(--uib-heading-line-height,.95);letter-spacing:var(--uib-heading-letter-spacing,-.055em);font-weight:var(--uib-heading-weight,900)}.subheadline{margin:0;max-width:var(--uib-heading-subheadline-width,62ch);color:var(--uib-heading-subheadline-color,var(--uib-color-muted,#40516f));font-size:var(--uib-heading-subheadline-size,1.08rem);line-height:1.6;font-weight:600}.body{margin:0;max-width:var(--uib-heading-body-width,68ch);color:var(--uib-heading-body-color,var(--uib-color-muted,#40516f));line-height:1.6}:host([size="compact"]) .headline{font-size:var(--uib-heading-size,clamp(1.75rem,4vw,2.7rem))}:host([size="large"]) .headline{font-size:var(--uib-heading-size,clamp(2.7rem,7vw,5.4rem))}:host([align="center"]) .block{align-items:center;text-align:center}.eyebrow-slot{display:block;margin:0 0 .15rem}
`;

function safeLevel(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 6 ? parsed : 1;
}

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
    const level = safeLevel(this.getAttribute('level'));
    const tag = `h${level}`;
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<div class="block" part="block">` +
  ` ` +
  (eyebrow ? `<span class="eyebrow-slot"><uib-eyebrow text="${escapeHtml(eyebrow)}"></uib-eyebrow></span>` : '') +
  ` <` +
  (tag) +
  ` class="headline" part="headline">` +
  `<slot name="headline">` +
  (escapeHtml(headline)) +
  `</slot>` +
  `</` +
  (tag) +
  `> ` +
  (subheadline ? `<p class="subheadline" part="subheadline"><slot name="subheadline">${escapeHtml(subheadline)}</slot></p>` : '') +
  ` ` +
  (body ? `<p class="body" part="body"><slot name="body">${escapeHtml(body)}</slot></p>` : '') +
  ` ` +
  `</div>`
);
  }
}

defineUiBaseElement('uib-heading-block', UibHeadingBlock);
