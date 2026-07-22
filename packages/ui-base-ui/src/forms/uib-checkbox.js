/**
 * uib-checkbox
 * Accessible boolean checkbox component. Value is always true or false.
 */
import {
  UibBaseElement,
  booleanToAttribute,
  defineUiBaseElement,
  escapeHtml,
  getUiBaseMessage,
  parseBoolean
} from '@ui-base/core';
import '../help/uib-help.js';

const styles = `
:host{--uib-checkbox-text:var(--uib-color-ink,#13294b);--uib-checkbox-muted:var(--uib-color-muted,#53657f);--uib-checkbox-background:var(--uib-color-surface,#fff);--uib-checkbox-border:var(--uib-color-border-strong,#aab8cc);--uib-checkbox-border-strong:var(--uib-color-primary,#174a8b);--uib-checkbox-checked:var(--uib-color-success,#2e7d32);--uib-checkbox-focus:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25));display:block;color:var(--uib-checkbox-text);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.uib-checkbox{display:inline-flex;align-items:flex-start;gap:.55rem;min-height:1.8rem;max-width:100%;cursor:pointer;line-height:1.45}.uib-checkbox__input{width:1.05rem;height:1.05rem;min-width:1.05rem;margin:.17rem 0 0;padding:0;border:1px solid var(--uib-checkbox-border);border-radius:.3rem;background:var(--uib-checkbox-background);accent-color:var(--uib-checkbox-checked);cursor:pointer}.uib-checkbox__input:focus-visible{outline:none;box-shadow:var(--uib-checkbox-focus)}.uib-checkbox__content{display:grid;gap:.12rem;min-width:0}.uib-checkbox__label-row{display:inline-flex;gap:.35rem;align-items:center;min-width:0}.uib-checkbox__label{font-weight:800;overflow-wrap:anywhere}.uib-checkbox__required{color:var(--uib-color-danger,#b4232a);font-weight:900}.uib-checkbox__hint{color:var(--uib-checkbox-muted);font-size:var(--uib-font-size-sm,.875rem)}.uib-checkbox__error{color:var(--uib-color-danger,#b4232a);font-size:var(--uib-font-size-sm,.875rem)}.uib-checkbox--disabled,.uib-checkbox--readonly{cursor:not-allowed;opacity:.62}.uib-checkbox--disabled .uib-checkbox__input,.uib-checkbox--readonly .uib-checkbox__input{cursor:not-allowed}:host([invalid]) .uib-checkbox__input{border-color:var(--uib-color-danger,#b4232a)}@media(max-width:420px){.uib-checkbox{width:100%}}
`;

export class UibCheckbox extends UibBaseElement {
  static formAssociated = true;

  static get observedAttributes() {
    return [...UibBaseElement.commonAttributes, 'value', 'checked', 'hint'];
  }

  constructor() {
    super();
    this._value = false;
    this._initialized = false;
    this._reflecting = false;
    this._internals = null;
    try {
      if (typeof this.attachInternals === 'function') this._internals = this.attachInternals();
    } catch {
      this._internals = null;
    }
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this._initialized) this._initializeValueFromAttributes();
    this._updateFormValue();
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || this._reflecting) return;

    if (name === 'value') {
      this._setValue(newValue, { emit: false, reflect: false });
      return;
    }

    if (name === 'checked') {
      this._setValue(this.hasAttribute('checked'), { emit: false, reflect: false });
      return;
    }

    if (this.isConnected) this.render();
  }

  get value() {
    return this._value === true;
  }

  set value(value) {
    this._setValue(value, { emit: false, reflect: true });
  }

  get checked() {
    return this.value;
  }

  set checked(value) {
    this._setValue(value, { emit: false, reflect: true });
  }

  get hint() {
    return this.getAttribute('hint') || '';
  }

  set hint(value) {
    if (value === null || value === undefined) this.removeAttribute('hint');
    else this.setAttribute('hint', String(value));
  }

  formResetCallback() {
    this._initialized = false;
    this._initializeValueFromAttributes();
    this.render();
  }

  _initializeValueFromAttributes() {
    if (this.hasAttribute('value')) {
      this._setValue(this.getAttribute('value'), { emit: false, reflect: false });
      return;
    }
    this._setValue(this.hasAttribute('checked'), { emit: false, reflect: false });
  }

  _setValue(value, options = {}) {
    const { emit = false, reflect = false } = options;
    const oldValue = this.value;
    const newValue = parseBoolean(value, false);

    this._value = newValue;
    this._initialized = true;
    this._updateFormValue();

    if (reflect) this._reflectValue();
    if (this.isConnected) this.render();

    if (emit && oldValue !== newValue) this.emitValueChange('uib-checkbox-change', oldValue, newValue);
  }

  _reflectValue() {
    this._reflecting = true;
    this.setAttribute('value', booleanToAttribute(this._value));
    this.toggleAttribute('checked', this._value);
    this._reflecting = false;
  }

  _updateFormValue() {
    if (!this._internals || typeof this._internals.setFormValue !== 'function') return;
    this._internals.setFormValue(String(this.value));
  }

  _handleInputChange(event) {
    if (this.disabled || this.readonly) return;
    this._setValue(event.currentTarget.checked, { emit: true, reflect: true });
  }

  render() {
    const labelText = this.label || this.getAttribute('aria-label') || getUiBaseMessage('checkbox.defaultLabel', 'Checkbox');
    const labelMarkup = this.hasAttribute('label') || this.hasAttribute('aria-label')
      ? escapeHtml(labelText)
      : (
  `<slot>` +
  (escapeHtml(labelText)) +
  `</slot>`
);
    const helpId = this.help ? `${this.componentId}-help` : '';
    const errorId = this.error || this.invalid ? `${this.componentId}-error` : '';
    const describedBy = this.describedBy(helpId, errorId);
    const hintMarkup = this.hint ? (
  `<span class="uib-checkbox__hint" part="hint">` +
  (escapeHtml(this.hint)) +
  `</span>`
) : '';
    const helpMarkup = this.help ? (
  `<uib-help id="` +
  (helpId) +
  `" text="` +
  (escapeHtml(this.help)) +
  `" mode="` +
  (escapeHtml(this.helpMode)) +
  `">` +
  `</uib-help>`
) : '';
    const errorMarkup = errorId ? (
  `<span id="` +
  (errorId) +
  `" class="uib-checkbox__error" part="error">` +
  (escapeHtml(this.error || `${labelText} is invalid.`)) +
  `</span>`
) : '';
    const disabledClass = this.disabled ? ' uib-checkbox--disabled' : '';
    const readonlyClass = this.readonly ? ' uib-checkbox--readonly' : '';
    const described = describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : '';

    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<label class="uib-checkbox` +
  (disabledClass) +
  (readonlyClass) +
  `" part="field"><input class="uib-checkbox__input" part="input" type="checkbox" ` +
  (this.value ? 'checked' : '') +
  ` ` +
  (this.disabled ? 'disabled' : '') +
  ` ` +
  (this.required ? 'required' : '') +
  ` ` +
  (described) +
  ` aria-invalid="` +
  (this.invalid ? 'true' : 'false') +
  `" />` +
  `<span class="uib-checkbox__content" part="content">` +
  `<span class="uib-checkbox__label-row">` +
  `<span class="uib-checkbox__label" part="label">` +
  ` ` +
  (labelMarkup) +
  ` ` +
  `</span>` +
  ` ` +
  (this.required ? '<span class="uib-checkbox__required" aria-hidden="true">*</span>' : '') +
  ` ` +
  (helpMarkup) +
  ` ` +
  `</span>` +
  ` ` +
  (hintMarkup) +
  ` ` +
  (errorMarkup) +
  ` ` +
  `</span>` +
  `</label>`
);
    this.shadowRoot.querySelector('input')?.addEventListener('change', (event) => this._handleInputChange(event));
  }
}

defineUiBaseElement('uib-checkbox', UibCheckbox);
