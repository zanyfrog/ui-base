import {
  UibBaseElement,
  defineUiBaseElement,
  escapeHtml,
  validateValue
} from '@ui.base/core';
import '@ui.base/ui/label';
import '@ui.base/ui/help';

export const formControlStyles = `
:host{display:block;color:var(--uib-color-ink,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.uib-field{display:grid;gap:var(--uib-forms-field-gap,.35rem);max-width:100%}.uib-field__label{display:inline-flex;align-items:center;gap:.35rem;line-height:1.35}.uib-control{width:100%;font:inherit}.uib-control:focus-visible{outline:none}textarea.uib-control{resize:vertical}select.uib-control{cursor:pointer}
`;

export const commonFormControlEvents = [
  'input',
  'change',
  'focus',
  'blur',
  'focusin',
  'focusout',
  'keydown',
  'keyup',
  'invalid'
];

export class UibFormControlBase extends UibBaseElement {
  static formAssociated = true;
  static inputType = 'text';
  static controlKind = 'input';

  static get observedAttributes() {
    return [
      ...UibBaseElement.commonAttributes,
      'value',
      'placeholder',
      'min',
      'max',
      'minlength',
      'maxlength',
      'pattern',
      'step',
      'options',
      'autocomplete'
    ];
  }

  constructor() {
    super();
    this._value = '';
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
    if (!this._initialized) this._value = this.getAttribute('value') || '';
    this._initialized = true;
    this._updateFormValue();
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || this._reflecting) return;
    if (name === 'value') this._value = newValue || '';
    if (this.isConnected) {
      this._updateFormValue();
      this.render();
    }
  }

  get value() {
    return this._value ?? '';
  }

  set value(value) {
    const oldValue = this.value;
    this._value = value === null || value === undefined ? '' : String(value);
    this._reflecting = true;
    this.setAttribute('value', this._value);
    this._reflecting = false;
    this._updateFormValue();
    if (this.isConnected) this.render();
    if (oldValue !== this._value) this.emitValueChange(`${this.localName}-change`, oldValue, this._value);
  }

  get placeholder() {
    return this.getAttribute('placeholder') || '';
  }

  _constraints() {
    return {
      name: this.name,
      label: this.label || this.name,
      required: this.required,
      minlength: this.getAttribute('minlength'),
      maxlength: this.getAttribute('maxlength'),
      pattern: this.getAttribute('pattern'),
      min: this.getAttribute('min'),
      max: this.getAttribute('max'),
      type: this.constructor.inputType,
      error: this.error
    };
  }

  _validation() {
    return validateValue(this.value, this._constraints());
  }

  _updateFormValue() {
    if (this._internals && typeof this._internals.setFormValue === 'function') {
      this._internals.setFormValue(this.value);
    }
  }

  checkValidity() {
    const result = this._validation();
    this.invalid = !result.valid;
    if (!result.valid) this._emitCommonControlEvent('invalid', null, { validation: result });
    return result.valid;
  }

  _eventDetail(extra = {}) {
    return {
      name: this.name,
      value: this.value,
      ...extra
    };
  }

  _emitCommonControlEvent(type, sourceEvent = null, extra = {}) {
    const detail = this._eventDetail({
      sourceEvent,
      ...extra
    });
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: sourceEvent?.cancelable ?? false,
      detail
    }));
  }

  _emitKeyboardEvent(type, event) {
    this.dispatchEvent(new KeyboardEvent(type, {
      key: event.key,
      code: event.code,
      location: event.location,
      repeat: event.repeat,
      isComposing: event.isComposing,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      bubbles: true,
      composed: true,
      cancelable: event.cancelable
    }));
  }

  _bindCommonControlEvents(control) {
    if (!control) return;
    control.addEventListener('focus', (event) => this._emitCommonControlEvent('focus', event));
    control.addEventListener('blur', (event) => this._emitCommonControlEvent('blur', event));
    control.addEventListener('focusin', (event) => this._emitCommonControlEvent('focusin', event));
    control.addEventListener('focusout', (event) => this._emitCommonControlEvent('focusout', event));
    control.addEventListener('keydown', (event) => this._emitKeyboardEvent('keydown', event));
    control.addEventListener('keyup', (event) => this._emitKeyboardEvent('keyup', event));
    control.addEventListener('invalid', (event) => this._emitCommonControlEvent('invalid', event));
  }

  _handleInput(event) {
    const oldValue = this.value;
    this._value = event.currentTarget.value;
    this._updateFormValue();
    this.emitMtEvent('input', { name: this.name, oldValue, newValue: this.value });
  }

  _handleChange(event) {
    const oldValue = this.getAttribute('value') || '';
    const newValue = event.currentTarget.value;
    this._value = newValue;
    this._reflecting = true;
    this.setAttribute('value', newValue);
    this._reflecting = false;
    this._updateFormValue();
    this.checkValidity();
    this.emitValueChange(`${this.localName}-change`, oldValue, newValue);
  }

  _optionsMarkup() {
    const options = (this.getAttribute('options') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    return options.map((option) => (
  `<option value="` +
  (escapeHtml(option)) +
  `" ` +
  (option === this.value ? 'selected' : '') +
  `> ` +
  (escapeHtml(option)) +
  ` ` +
  `</option>`
)).join('');
  }

  _controlMarkup(inputId, describedBy) {
    const type = this.constructor.inputType;
    const controlParts = [
      'control',
      this.invalid ? 'control-invalid' : '',
      this.disabled || this.readonly ? 'control-disabled' : ''
    ].filter(Boolean).join(' ');
    const commonAttributes = `
      id="${inputId}"
      class="uib-control"
      part="${controlParts}"
      name="${escapeHtml(this.name)}"
      value="${escapeHtml(this.value)}"
      placeholder="${escapeHtml(this.placeholder)}"
      ${this.required ? 'required' : ''}
      ${this.disabled ? 'disabled' : ''}
      ${this.readonly ? 'readonly' : ''}
      ${describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : ''}
      aria-invalid="${this.invalid ? 'true' : 'false'}"
    `;
    const limitAttributes = `
      ${this.getAttribute('min') ? `min="${escapeHtml(this.getAttribute('min'))}"` : ''}
      ${this.getAttribute('max') ? `max="${escapeHtml(this.getAttribute('max'))}"` : ''}
      ${this.getAttribute('minlength') ? `minlength="${escapeHtml(this.getAttribute('minlength'))}"` : ''}
      ${this.getAttribute('maxlength') ? `maxlength="${escapeHtml(this.getAttribute('maxlength'))}"` : ''}
      ${this.getAttribute('pattern') ? `pattern="${escapeHtml(this.getAttribute('pattern'))}"` : ''}
      ${this.getAttribute('step') ? `step="${escapeHtml(this.getAttribute('step'))}"` : ''}
      ${this.getAttribute('autocomplete') ? `autocomplete="${escapeHtml(this.getAttribute('autocomplete'))}"` : ''}
    `;

    if (this.constructor.controlKind === 'textarea') {
      return (
  `<textarea ` +
  (commonAttributes) +
  ` ` +
  (limitAttributes) +
  ` >` +
  (escapeHtml(this.value)) +
  `</textarea>`
);
    }

    if (this.constructor.controlKind === 'select') {
      return (
  `<select id="` +
  (inputId) +
  `" class="uib-control" part="` +
  (controlParts) +
  `" name="` +
  (escapeHtml(this.name)) +
  `" ` +
  (this.required ? 'required' : '') +
  ` ` +
  (this.disabled ? 'disabled' : '') +
  ` ` +
  (describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : '') +
  ` aria-invalid="` +
  (this.invalid ? 'true' : 'false') +
  `" >` +
  `<option value="">` +
  ` Select... ` +
  `</option>` +
  ` ` +
  (this._optionsMarkup()) +
  ` ` +
  `<slot>` +
  `</slot>` +
  `</select>`
);
    }

    return (
  `<input type="` +
  (escapeHtml(type)) +
  `" ` +
  (commonAttributes) +
  ` ` +
  (limitAttributes) +
  ` >`
);
  }

  render() {
    const inputId = `${this.componentId}-control`;
    const helpId = this.help ? `${this.componentId}-help` : '';
    const validation = this._validation();
    const shouldShowError = this.invalid || !validation.valid;
    const errorText = this.error || validation.message;
    const errorId = shouldShowError && errorText ? `${this.componentId}-error` : '';
    const describedBy = this.describedBy(helpId, errorId);
    const label = this.label || this.name || this.constructor.defaultLabel || 'Field';
    const help = this.help ? (
  `<span id="` +
  (helpId) +
  `" class="uib-field__help" part="help"><uib-help text="` +
  (escapeHtml(this.help)) +
  `" mode="` +
  (escapeHtml(this.helpMode || 'tooltip')) +
  `" >` +
  `</uib-help>` +
  `</span>`
) : '';
    const error = errorId ? (
  `<div id="` +
  (errorId) +
  `" class="uib-field__error" part="error"> ` +
  (escapeHtml(errorText)) +
  ` ` +
  `</div>`
) : '';

    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (formControlStyles) +
  ` ` +
  `</style>` +
  `<div class="uib-field" part="field">` +
  `<span class="uib-field__label" part="label">` +
  `<slot name="label">` +
  `<uib-label for="` +
  (inputId) +
  `" text="` +
  (escapeHtml(label)) +
  `">` +
  `</uib-label>` +
  `</slot>` +
  ` ` +
  (this.required ? '<span class="uib-field__required" part="required" aria-hidden="true">*</span>' : '') +
  ` ` +
  `</span>` +
  ` ` +
  (this._controlMarkup(inputId, describedBy)) +
  ` ` +
  (help) +
  ` ` +
  (error) +
  ` ` +
  `</div>`
);
    const control = this.shadowRoot.querySelector('.uib-control');
    control?.addEventListener('input', (event) => this._handleInput(event));
    control?.addEventListener('change', (event) => this._handleChange(event));
    this._bindCommonControlEvents(control);
  }
}

export function defineFormControl(tagName, controlClass) {
  defineUiBaseElement(tagName, controlClass);
  return controlClass;
}
