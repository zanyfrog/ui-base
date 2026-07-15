import { UibBaseElement, defineUiBaseElement, escapeHtml } from '@ui.base/core';
import '@ui.base/icons/icon';

const styles = `
:host{display:inline-flex;color:var(--uib-help-color,var(--uib-color-primary,#174a8b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);line-height:1.35}*,*::before,*::after{box-sizing:border-box}.uib-help{position:relative;display:inline-flex;align-items:center}.uib-help__button{display:inline-flex;align-items:center;justify-content:center;width:1.35rem;height:1.35rem;min-width:1.35rem;border:1px solid var(--uib-help-border,var(--uib-color-border-strong,#aab8cc));border-radius:var(--uib-radius-pill,999px);background:var(--uib-help-background,var(--uib-color-surface,#fff));color:var(--uib-help-color,var(--uib-color-primary,#174a8b));cursor:help;padding:0}.uib-help__button:focus-visible{outline:none;box-shadow:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25))}.uib-help__tooltip{position:absolute;z-index:var(--uib-z-index-tooltip,1200);inset-block-start:calc(100% + .45rem);inset-inline-start:50%;transform:translateX(-50%);width:max-content;max-width:min(22rem,calc(100vw - 2rem));padding:.65rem .75rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-md,.75rem);background:var(--uib-color-ink,#13294b);color:var(--uib-color-primary-contrast,#fff);box-shadow:var(--uib-shadow-md,0 14px 40px rgba(10,31,68,.1));font-size:var(--uib-font-size-sm,.875rem);line-height:1.45}.uib-help__tooltip[hidden]{display:none}.uib-help--inline{display:inline-flex;max-width:100%;color:var(--uib-help-inline-color,var(--uib-color-muted,#53657f));font-size:var(--uib-font-size-sm,.875rem)}.uib-help__inline{display:inline-flex;gap:.35rem;align-items:flex-start;line-height:1.45}.uib-help__inline uib-icon{margin-top:.1rem}@media(max-width:420px){.uib-help__tooltip{inset-inline-start:auto;inset-inline-end:0;transform:none;max-width:calc(100vw - 2rem)}}
`;

export class UibHelp extends UibBaseElement {
  static get observedAttributes() {
    return [...UibBaseElement.commonAttributes, 'text', 'mode', 'open', 'label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._boundEscape = (event) => {
      if (event.key === 'Escape') this.open = false;
    };
  }

  connectedCallback() {
    this.render();
    document.addEventListener('keydown', this._boundEscape);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._boundEscape);
  }

  get text() {
    return this.getAttribute('text') || this.getAttribute('help') || this.textContent.trim() || '';
  }

  set text(value) {
    if (value === null || value === undefined) this.removeAttribute('text');
    else this.setAttribute('text', String(value));
  }

  get mode() {
    const mode = (this.getAttribute('mode') || this.getAttribute('help-mode') || 'tooltip').toLowerCase();
    return mode === 'inline' ? 'inline' : 'tooltip';
  }

  set mode(value) {
    if (value === null || value === undefined) this.removeAttribute('mode');
    else this.setAttribute('mode', String(value));
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(value) {
    this.toggleAttribute('open', Boolean(value));
  }

  _show() {
    if (this.mode !== 'tooltip') return;
    this.open = true;
  }

  _hide() {
    if (this.mode !== 'tooltip') return;
    this.open = false;
  }

  render() {
    const text = this.text || 'Help text is not available.';
    const label = this.ariaLabel || this.label || 'Help';
    const tooltipId = `${this.componentId}-tooltip`;

    if (this.mode === 'inline') {
      this.shadowRoot.innerHTML = `<style>${styles}</style><span class="uib-help uib-help--inline" part="base"><span class="uib-help__inline" part="inline"><uib-icon name="info" decorative></uib-icon><span part="text"><slot>${escapeHtml(text)}</slot></span></span></span>`;
      return;
    }

    this.shadowRoot.innerHTML = `<style>${styles}</style><span class="uib-help" part="base"><button class="uib-help__button" part="button" type="button" aria-label="${escapeHtml(label)}" aria-describedby="${tooltipId}" aria-expanded="${this.open ? 'true' : 'false'}"><uib-icon name="help" decorative></uib-icon></button><span id="${tooltipId}" class="uib-help__tooltip" part="tooltip" role="tooltip" ${this.open ? '' : 'hidden'}><slot>${escapeHtml(text)}</slot></span></span>`;
    const button = this.shadowRoot.querySelector('button');
    button?.addEventListener('mouseenter', () => this._show());
    button?.addEventListener('mouseleave', () => this._hide());
    button?.addEventListener('focus', () => this._show());
    button?.addEventListener('blur', () => this._hide());
    button?.addEventListener('click', () => { this.open = !this.open; });
  }
}

defineUiBaseElement('uib-help', UibHelp);
