import {
  UibBaseElement,
  defineUiBaseElement,
  escapeHtml,
  getUiBaseMessage,
  readCssLengthPx
} from '@ui.base/core';
import '@ui.base/icons/icon';
import './uib-menuitem.js';

const styles = `
:host{--uib-menu-breakpoint:768px;display:block;color:var(--uib-menu-text,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.uib-menu{display:flex;align-items:center;justify-content:space-between;gap:var(--uib-space-3,.75rem);max-width:100%}.uib-menu__toggle{display:none;align-items:center;justify-content:center;gap:.45rem;min-height:2.5rem;padding:.55rem .85rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-pill,999px);background:var(--uib-color-surface,#fff);color:var(--uib-color-ink,#13294b);font:inherit;font-weight:850;cursor:pointer}.uib-menu__toggle:focus-visible{outline:none;box-shadow:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25))}.uib-menu__nav{min-width:0}.uib-menu__items{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:.2rem;min-width:0}.uib-menu__nav[hidden]{display:none}:host([data-mobile="true"]) .uib-menu{display:grid;justify-items:end}:host([data-mobile="true"]) .uib-menu__toggle{display:inline-flex}:host([data-mobile="true"]) .uib-menu__nav{width:min(100vw - 2rem,28rem);justify-self:stretch}:host([data-mobile="true"]) .uib-menu__items{display:grid;justify-content:stretch;gap:.25rem;width:100%;margin-top:.5rem;padding:.5rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-lg,1rem);background:var(--uib-color-surface,#fff);box-shadow:var(--uib-shadow-md,0 14px 40px rgba(10,31,68,.1))}:host([data-mobile="true"]) ::slotted(uib-menuitem){display:block;width:100%}
`;

export class UibMenu extends UibBaseElement {
  static get observedAttributes() {
    return [...UibBaseElement.commonAttributes, 'label', 'breakpoint', 'open', 'collapse-label', 'close-label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._mobile = false;
    this._media = null;
    this._boundMediaChange = () => this._syncResponsiveState();
    this._boundResize = () => this._configureMediaQuery();
  }

  connectedCallback() {
    this.render();
    this._configureMediaQuery();
    window.addEventListener('resize', this._boundResize);
    this.addEventListener('uib-menuitem-select', () => {
      if (this._mobile) this.open = false;
    });
  }

  disconnectedCallback() {
    this._media?.removeEventListener?.('change', this._boundMediaChange);
    window.removeEventListener('resize', this._boundResize);
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(value) {
    this.toggleAttribute('open', Boolean(value));
  }

  get breakpoint() {
    return this.getAttribute('breakpoint') || '';
  }

  set breakpoint(value) {
    if (value === null || value === undefined) this.removeAttribute('breakpoint');
    else this.setAttribute('breakpoint', String(value));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'breakpoint' && this.isConnected) this._configureMediaQuery();
    if (this.isConnected) this.render();
  }

  _breakpointPx() {
    const attr = this.breakpoint;
    if (attr) return readCssLengthPx(attr, 768);
    const cssValue = window.getComputedStyle(this).getPropertyValue('--uib-menu-breakpoint');
    return readCssLengthPx(cssValue, 768);
  }

  _configureMediaQuery() {
    this._media?.removeEventListener?.('change', this._boundMediaChange);
    const px = Math.max(240, Math.round(this._breakpointPx()));
    this._media = window.matchMedia(`(max-width: ${px}px)`);
    this._media.addEventListener?.('change', this._boundMediaChange);
    this._syncResponsiveState();
  }

  _syncResponsiveState() {
    const mobile = Boolean(this._media?.matches);
    if (this._mobile !== mobile) {
      this._mobile = mobile;
      this.toggleAttribute('data-mobile', mobile);
      if (!mobile) this.open = true;
      if (mobile && !this.hasAttribute('open')) this.open = false;
      this._applyMobileToItems();
      this.render();
      return;
    }
    this._applyMobileToItems();
  }

  _applyMobileToItems() {
    this.querySelectorAll('uib-menuitem').forEach((item) => item.toggleAttribute('mobile', this._mobile));
  }

  _toggleOpen() {
    this.open = !this.open;
  }

  render() {
    const navId = `${this.componentId}-nav`;
    const label = this.ariaLabel || this.label || 'Primary navigation';
    const collapseLabel = this.getAttribute('collapse-label') || getUiBaseMessage('common.openMenu', 'Open menu');
    const closeLabel = this.getAttribute('close-label') || getUiBaseMessage('common.closeMenu', 'Close menu');
    const isOpen = !this._mobile || this.open;
    const buttonLabel = isOpen ? closeLabel : collapseLabel;

    this.shadowRoot.innerHTML = (
  `<style>` +
  (styles) +
  `</style>` +
  `<div class="uib-menu" part="base">` +
  `<button class="uib-menu__toggle" part="toggle" type="button" aria-label="` +
  (escapeHtml(buttonLabel)) +
  `" aria-expanded="` +
  (isOpen ? 'true' : 'false') +
  `" aria-controls="` +
  (navId) +
  `"><uib-icon name="` +
  (isOpen ? 'close' : 'menu') +
  `" decorative>` +
  `</uib-icon>` +
  `<span>` +
  (escapeHtml(getUiBaseMessage('common.menu', 'Menu'))) +
  `</span>` +
  `</button>` +
  `<nav id="` +
  (navId) +
  `" class="uib-menu__nav" part="nav" aria-label="` +
  (escapeHtml(label)) +
  `"` +
  (isOpen ? '' : 'hidden') +
  `>` +
  `<div class="uib-menu__items" part="items">` +
  `<slot>` +
  `</slot>` +
  `</div>` +
  `</nav>` +
  `</div>`
);
    this.shadowRoot.querySelector('.uib-menu__toggle')?.addEventListener('click', () => this._toggleOpen());
    this.shadowRoot.querySelector('slot')?.addEventListener('slotchange', () => this._applyMobileToItems());
    this.shadowRoot.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this._mobile && this.open) {
        this.open = false;
        this.shadowRoot.querySelector('.uib-menu__toggle')?.focus();
      }
    });
    this._applyMobileToItems();
  }
}

defineUiBaseElement('uib-menu', UibMenu);
