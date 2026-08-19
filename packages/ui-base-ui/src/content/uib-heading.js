import { defineUiBaseElement, escapeHtml } from '@ui-base/core';

const styles = `
:host{--uib-heading-level-size:4.7rem;--uib-heading-compact-level-size:2.7rem;--uib-heading-large-level-size:5.4rem;display:block;color:var(--uib-heading-color,var(--uib-heading-headline-color,var(--uib-color-ink,#13294b)));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);text-align:var(--uib-heading-align,start)}:host([level="2"]){--uib-heading-level-size:3.7rem;--uib-heading-compact-level-size:2.35rem;--uib-heading-large-level-size:4.55rem}:host([level="3"]){--uib-heading-level-size:3rem;--uib-heading-compact-level-size:2rem;--uib-heading-large-level-size:3.75rem}:host([level="4"]){--uib-heading-level-size:2.35rem;--uib-heading-compact-level-size:1.7rem;--uib-heading-large-level-size:3rem}:host([level="5"]){--uib-heading-level-size:1.85rem;--uib-heading-compact-level-size:1.45rem;--uib-heading-large-level-size:2.4rem}:host([level="6"]){--uib-heading-level-size:1.45rem;--uib-heading-compact-level-size:1.22rem;--uib-heading-large-level-size:1.9rem}.heading{margin:0;color:var(--uib-heading-color,var(--uib-heading-headline-color,currentColor));font-size:var(--uib-heading-size,var(--uib-heading-level-size));line-height:var(--uib-heading-line-height,.95);letter-spacing:var(--uib-heading-letter-spacing,0);font-weight:var(--uib-heading-weight,900)}:host([size="compact"]) .heading{font-size:var(--uib-heading-size,var(--uib-heading-compact-level-size))}:host([size="large"]) .heading{font-size:var(--uib-heading-size,var(--uib-heading-large-level-size))}:host([align="center"]){text-align:center}:host([align="end"]){text-align:end}
`;

function safeLevel(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 6 ? parsed : 1;
}

export class UibHeading extends HTMLElement {
  static get observedAttributes() { return ['text', 'heading', 'level', 'size', 'align']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const text = this.getAttribute('text') || this.getAttribute('heading') || '';
    const level = safeLevel(this.getAttribute('level'));
    const tag = `h${level}`;
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<` +
  (tag) +
  ` class="heading" part="heading">` +
  `<slot>` +
  (escapeHtml(text)) +
  `</slot>` +
  `</` +
  (tag) +
  `>`
);
  }
}

defineUiBaseElement('uib-heading', UibHeading);
