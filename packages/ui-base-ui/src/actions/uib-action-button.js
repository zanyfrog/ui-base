import { defineUiBaseElement, escapeHtml, setOrRemoveAttribute } from '@ui-base/core';

const FALSE_VALUES = new Set(['false', '0', 'no', 'off']);
const styles = `
:host{display:inline-flex;font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.button{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;min-height:var(--uib-action-min-height,2.9rem);padding:var(--uib-action-padding,.78rem 1.08rem);border:1px solid var(--uib-action-border,rgba(19,41,75,.18));border-radius:var(--uib-action-radius,999px);background:var(--uib-action-bg,#fff);color:var(--uib-action-color,var(--uib-color-ink,#13294b));box-shadow:var(--uib-action-shadow,0 12px 24px rgba(10,31,68,.1));cursor:pointer;font:inherit;font-weight:var(--uib-action-font-weight,900);line-height:1.1;text-decoration:none;transition:transform 140ms ease,box-shadow 140ms ease,background-color 140ms ease,border-color 140ms ease,color 140ms ease}.button:hover:not([aria-disabled="true"]){transform:translateY(-1px);box-shadow:var(--uib-action-shadow-hover,0 16px 30px rgba(10,31,68,.14))}.button:focus-visible{outline:none;box-shadow:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25)),var(--uib-action-shadow,0 12px 24px rgba(10,31,68,.1))}.button[aria-disabled="true"]{cursor:not-allowed;opacity:.55;transform:none}.button--primary{--uib-action-bg:var(--uib-color-primary,#174a8b);--uib-action-color:var(--uib-color-primary-contrast,#fff);--uib-action-border:var(--uib-color-primary,#174a8b)}.button--secondary{--uib-action-bg:var(--uib-color-surface,#fff);--uib-action-color:var(--uib-color-ink,#13294b);--uib-action-border:var(--uib-color-border-strong,#aab8cc)}.button--tertiary{--uib-action-bg:transparent;--uib-action-shadow:none;--uib-action-border:transparent;--uib-action-color:var(--uib-color-primary,#174a8b)}.button--destructive{--uib-action-bg:var(--uib-color-danger,#b4232a);--uib-action-color:#fff;--uib-action-border:var(--uib-color-danger,#b4232a)}.icon{display:inline-grid;place-items:center;min-width:1em}.label{overflow-wrap:anywhere}
`;

function boolAttribute(element, name, fallback = false) {
  if (!element.hasAttribute(name)) return fallback;
  const value = element.getAttribute(name);
  if (value === '') return true;
  return !FALSE_VALUES.has(String(value).trim().toLowerCase());
}

function safeHref(value) {
  const href = String(value ?? '').trim();
  if (!href || /^javascript:/i.test(href)) return '';
  return href;
}

export class UibActionButton extends HTMLElement {
  static get observedAttributes() { return ['label', 'href', 'action', 'action-token', 'variant', 'kind', 'disabled', 'target', 'rel', 'icon']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  get label() { return this.getAttribute('label') || ''; }
  set label(value) { setOrRemoveAttribute(this, 'label', value); }
  get href() { return this.getAttribute('href') || ''; }
  set href(value) { setOrRemoveAttribute(this, 'href', value); }
  get action() { return this.getAttribute('action') || this.getAttribute('action-token') || ''; }
  set action(value) { setOrRemoveAttribute(this, 'action', value); }
  get disabled() { return boolAttribute(this, 'disabled', false); }
  set disabled(value) { this.toggleAttribute('disabled', Boolean(value)); }
  emitClick(event) {
    const detail = { kind: this.getAttribute('kind') || '', variant: this.getAttribute('variant') || 'secondary', label: this.label || this.textContent.trim(), href: safeHref(this.href), action: this.action, actionToken: this.action, disabled: this.disabled, hasHref: Boolean(safeHref(this.href)), originalEvent: event };
    const allowed = this.dispatchEvent(new CustomEvent('uib-action-button-click', { bubbles: true, composed: true, cancelable: true, detail }));
    this.dispatchEvent(new CustomEvent('uib-action', { bubbles: true, composed: true, detail }));
    if (this.disabled || !allowed) event.preventDefault();
  }
  render() {
    const label = this.label || this.textContent.trim() || 'Action';
    const href = safeHref(this.href);
    const variant = this.getAttribute('variant') || 'secondary';
    const icon = this.getAttribute('icon') || '';
    const target = this.getAttribute('target') || '';
    const rel = this.getAttribute('rel') || (target === '_blank' ? 'noopener noreferrer' : '');
    const className = `button button--${escapeHtml(variant)}`;
    const disabled = this.disabled;
    const commonAttrs = `class="${className}" part="button" aria-disabled="${disabled ? 'true' : 'false'}"`;
    const contents = (
  (icon ? `<span class="icon" aria-hidden="true">${escapeHtml(icon)}</span>` : '') +
  `<span class="label">` +
  `<slot>` +
  (escapeHtml(label)) +
  `</slot>` +
  `</span>`
);
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  ` ` +
  (href
        ? `<a ${commonAttrs} href="${escapeHtml(href)}" ${target ? `target="${escapeHtml(target)}"` : ''} ${rel ? `rel="${escapeHtml(rel)}"` : ''}>
            ${contents}
          </a>`
        : `<button ${commonAttrs} type="button" ${disabled ? 'disabled' : ''}>
            ${contents}
          </button>`) +
  ` `
);
    this.shadowRoot.querySelector('a,button')?.addEventListener('click', (event) => this.emitClick(event));
  }
}

defineUiBaseElement('uib-action-button', UibActionButton);
