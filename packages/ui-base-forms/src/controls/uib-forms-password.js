import { escapeHtml } from '@ui.base/core';
import { UibFormControlBase, defineFormControl } from '../form-control-base.js';

const eyeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5.5c4.2 0 7.3 3.1 9 6.5-1.7 3.4-4.8 6.5-9 6.5S4.7 15.4 3 12c1.7-3.4 4.8-6.5 9-6.5Zm0 2C9 7.5 6.6 9.4 5.3 12 6.6 14.6 9 16.5 12 16.5s5.4-1.9 6.7-4.5C17.4 9.4 15 7.5 12 7.5Zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="currentColor"/></svg>';
const eyeOffIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m4.4 3 16.6 16.6-1.4 1.4-3.1-3.1a8.4 8.4 0 0 1-4.5 1.1c-4.2 0-7.3-3.1-9-6.5a13.2 13.2 0 0 1 4-4.8L3 4.4 4.4 3Zm4 6.1A10.8 10.8 0 0 0 5.3 12c1.3 2.6 3.7 4.5 6.7 4.5 1.1 0 2.1-.3 3-.7l-1.8-1.8A3 3 0 0 1 10 10.8L8.4 9.1Zm3.6-4.1c4.2 0 7.3 3.1 9 6.5a12.6 12.6 0 0 1-2.7 3.8l-1.4-1.4c.7-.6 1.3-1.4 1.8-2.4C17.4 8.9 15 7 12 7c-.7 0-1.4.1-2 .3L8.4 5.7c1.1-.5 2.3-.7 3.6-.7Zm0 3.5a3 3 0 0 1 3 3l-3-3Z" fill="currentColor"/></svg>';
const passwordStyles = `
.uib-forms-password-control{position:relative;display:block;width:100%}.uib-forms-password-control .uib-control{padding-inline-end:var(--uib-forms-password-control-padding-end,2.85rem)}.uib-forms-password-toggle{position:absolute;inset-block:0;inset-inline-end:.2rem;display:inline-flex;width:2.4rem;align-items:center;justify-content:center;border:0;background:transparent;color:var(--uib-color-muted,#53657f);cursor:pointer}.uib-forms-password-toggle:hover{color:var(--uib-color-ink,#13294b)}.uib-forms-password-toggle:focus-visible{outline:none;box-shadow:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25));border-radius:var(--uib-radius-sm,.5rem)}.uib-forms-password-toggle:disabled{cursor:not-allowed;opacity:.62}.uib-forms-password-toggle svg{width:1.15rem;height:1.15rem;display:block}
`;

export class UibFormsPassword extends UibFormControlBase {
  static inputType = 'password';
  static defaultLabel = 'Password';

  constructor() {
    super();
    this._revealed = false;
  }

  _controlMarkup(inputId, describedBy) {
    const type = this._revealed ? 'text' : 'password';
    const controlParts = [
      'control',
      this.invalid ? 'control-invalid' : '',
      this.disabled || this.readonly ? 'control-disabled' : ''
    ].filter(Boolean).join(' ');
    const common = `id="${inputId}" class="uib-control" part="${controlParts}" name="${escapeHtml(this.name)}" value="${escapeHtml(this.value)}" placeholder="${escapeHtml(this.placeholder)}" style="padding-inline-end:var(--uib-forms-password-control-padding-end,2.85rem)" ${this.required ? 'required' : ''} ${this.disabled ? 'disabled' : ''} ${this.readonly ? 'readonly' : ''} ${describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : ''} aria-invalid="${this.invalid ? 'true' : 'false'}"`;
    const limits = `${this.getAttribute('min') ? ` min="${escapeHtml(this.getAttribute('min'))}"` : ''}${this.getAttribute('max') ? ` max="${escapeHtml(this.getAttribute('max'))}"` : ''}${this.getAttribute('minlength') ? ` minlength="${escapeHtml(this.getAttribute('minlength'))}"` : ''}${this.getAttribute('maxlength') ? ` maxlength="${escapeHtml(this.getAttribute('maxlength'))}"` : ''}${this.getAttribute('pattern') ? ` pattern="${escapeHtml(this.getAttribute('pattern'))}"` : ''}${this.getAttribute('step') ? ` step="${escapeHtml(this.getAttribute('step'))}"` : ''}${this.getAttribute('autocomplete') ? ` autocomplete="${escapeHtml(this.getAttribute('autocomplete'))}"` : ''}`;
    const label = this._revealed ? 'Hide password' : 'Show password';
    const icon = this._revealed ? eyeOffIcon : eyeIcon;

    return (
  `<span class="uib-forms-password-control" part="control-wrap">` +
  `<input type="` +
  (type) +
  `" ` +
  (common) +
  (limits) +
  `><button class="uib-forms-password-toggle" part="toggle" type="button" aria-label="` +
  (label) +
  `" title="` +
  (label) +
  `" aria-pressed="` +
  (this._revealed ? 'true' : 'false') +
  `" ` +
  (this.disabled ? 'disabled' : '') +
  `>` +
  (icon) +
  `</button>` +
  `</span>`
);
  }

  render() {
    super.render();
    this.shadowRoot.querySelector('style').append(passwordStyles);
    this.shadowRoot.querySelector('.uib-forms-password-toggle')?.addEventListener('click', () => {
      this._revealed = !this._revealed;
      this.render();
      this.shadowRoot.querySelector('.uib-forms-password-toggle')?.focus();
    });
  }
}
defineFormControl('uib-forms-password', UibFormsPassword);
