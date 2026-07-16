import {
  UibBaseElement,
  defineUiBaseElement,
  escapeHtml,
  getDirectTextContent
} from '@ui.base/core';
import '@ui.base/icons/icon';

const styles = `
:host{display:inline-block;position:relative;color:var(--uib-menu-text,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}:host([hidden]){display:none}*,*::before,*::after{box-sizing:border-box}.uib-menuitem{position:relative}.uib-menuitem__link,.uib-menuitem__button{display:inline-flex;align-items:center;justify-content:space-between;gap:.35rem;min-height:2.35rem;padding:.55rem .75rem;border:1px solid transparent;border-radius:var(--uib-radius-pill,999px);background:transparent;color:inherit;font:inherit;font-weight:800;line-height:1.2;text-decoration:none;cursor:pointer;white-space:nowrap}.uib-menuitem__link:hover,.uib-menuitem__button:hover{background:var(--uib-color-surface-soft,#f8fbff);border-color:var(--uib-color-border,#d9e2f0)}.uib-menuitem__link:focus-visible,.uib-menuitem__button:focus-visible{outline:none;box-shadow:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25))}.uib-menuitem__link[aria-current="page"],:host([active]) .uib-menuitem__link,:host([active]) .uib-menuitem__button{background:var(--uib-color-primary,#174a8b);border-color:var(--uib-color-primary,#174a8b);color:var(--uib-color-primary-contrast,#fff)}.uib-menuitem__submenu{position:absolute;z-index:var(--uib-z-index-dropdown,1000);inset-block-start:calc(100% + .25rem);inset-inline-start:0;display:grid;gap:.2rem;min-width:13rem;padding:.45rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-lg,1rem);background:var(--uib-color-surface,#fff);box-shadow:var(--uib-shadow-md,0 14px 40px rgba(10,31,68,.1))}.uib-menuitem__submenu[hidden]{display:none}.uib-menuitem__chevron{transition:transform 140ms ease}:host([open]) .uib-menuitem__chevron{transform:rotate(180deg)}:host([disabled]){opacity:.58;pointer-events:none}.uib-menuitem__submenu ::slotted(uib-menuitem){display:block}:host([mobile]){display:block;width:100%}:host([mobile]) .uib-menuitem__link,:host([mobile]) .uib-menuitem__button{width:100%;border-radius:var(--uib-radius-md,.75rem);white-space:normal}:host([mobile]) .uib-menuitem__submenu{position:static;min-width:0;margin-inline-start:.75rem;margin-block:.2rem .4rem;box-shadow:none;background:var(--uib-color-surface-soft,#f8fbff)}
`;

export class UibMenuItem extends UibBaseElement {
  static get observedAttributes() {
    return [...UibBaseElement.commonAttributes, 'href', 'target', 'rel', 'label', 'active', 'open', 'mobile'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  get href() {
    return this.getAttribute('href') || '';
  }

  set href(value) {
    if (value === null || value === undefined) this.removeAttribute('href');
    else this.setAttribute('href', String(value));
  }

  get target() {
    return this.getAttribute('target') || '';
  }

  get rel() {
    return this.getAttribute('rel') || '';
  }

  get active() {
    return this.hasAttribute('active');
  }

  set active(value) {
    this.toggleAttribute('active', Boolean(value));
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(value) {
    this.toggleAttribute('open', Boolean(value));
  }

  get hasSubmenu() {
    return Array.from(this.children).some((child) => child.localName === 'uib-menuitem');
  }

  _labelText() {
    return this.label || getDirectTextContent(this) || this.href || 'Menu item';
  }

  _toggleOpen() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  _close() {
    this.open = false;
  }

  _emitSelect(event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    const detail = {
      name: this.name,
      href: this.href,
      text: this._labelText(),
      oldValue: null,
      newValue: this.href || this._labelText()
    };
    this.emitMtEvent('uib-menuitem-select', detail);
    this.emitMtEvent('uib-menu-select', detail);
  }

  render() {
    const labelText = this._labelText();
    const submenu = this.hasSubmenu;
    const submenuId = `${this.componentId}-submenu`;
    const current = this.active ? ' aria-current="page"' : '';
    const disabled = this.disabled ? ' aria-disabled="true" tabindex="-1"' : '';

    if (submenu) {
      this.shadowRoot.innerHTML = (
  `<style>` +
  (styles) +
  `</style>` +
  `<div class="uib-menuitem" part="item">` +
  `<button class="uib-menuitem__button" part="button" type="button" aria-expanded="` +
  (this.open ? 'true' : 'false') +
  `" aria-controls="` +
  (submenuId) +
  `"` +
  (disabled) +
  `>` +
  `<span part="label">` +
  (escapeHtml(labelText)) +
  `</span>` +
  `<uib-icon class="uib-menuitem__chevron" name="chevron-down" decorative>` +
  `</uib-icon>` +
  `</button>` +
  `<div id="` +
  (submenuId) +
  `" class="uib-menuitem__submenu" part="submenu"` +
  (this.open ? '' : 'hidden') +
  `>` +
  `<slot>` +
  `</slot>` +
  `</div>` +
  `</div>`
);
      const button = this.shadowRoot.querySelector('button');
      button?.addEventListener('click', () => this._toggleOpen());
      this.shadowRoot.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          this._close();
          button?.focus();
        }
      });
      return;
    }

    if (this.href) {
      const target = this.target ? ` target="${escapeHtml(this.target)}"` : '';
      const rel = this.rel ? ` rel="${escapeHtml(this.rel)}"` : (this.target === '_blank' ? ' rel="noopener noreferrer"' : '');
      this.shadowRoot.innerHTML = (
  `<style>` +
  (styles) +
  `</style>` +
  `<div class="uib-menuitem" part="item">` +
  `<a class="uib-menuitem__link" part="link" href="` +
  (escapeHtml(this.href)) +
  `"` +
  (target) +
  (rel) +
  (current) +
  (disabled) +
  `>` +
  `<slot>` +
  (escapeHtml(labelText)) +
  `</slot>` +
  `</a>` +
  `</div>`
);
      this.shadowRoot.querySelector('a')?.addEventListener('click', (event) => this._emitSelect(event));
      return;
    }

    this.shadowRoot.innerHTML = (
  `<style>` +
  (styles) +
  `</style>` +
  `<div class="uib-menuitem" part="item">` +
  `<button class="uib-menuitem__button" part="button" type="button"` +
  (disabled) +
  `>` +
  `<slot>` +
  (escapeHtml(labelText)) +
  `</slot>` +
  `</button>` +
  `</div>`
);
    this.shadowRoot.querySelector('button')?.addEventListener('click', (event) => this._emitSelect(event));
  }
}

defineUiBaseElement('uib-menuitem', UibMenuItem);
