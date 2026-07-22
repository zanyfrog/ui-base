import {
  UibBaseElement,
  defineUiBaseElement,
  escapeHtml
} from '@ui-base/core';
import '@ui-base/ui/checkbox';

const styles = `
:host{display:block}
uib-checkbox{display:block}
`;

export class UibFormsCheckbox extends UibBaseElement {
  static formAssociated = true;

  static get observedAttributes() {
    return [
      ...UibBaseElement.commonAttributes,
      'checked',
      'value',
      'hint'
    ];
  }

  constructor() {
    super();
    this._defaultChecked = null;
    this._internals = null;
    try {
      if (typeof this.attachInternals === 'function') this._internals = this.attachInternals();
    } catch {
      this._internals = null;
    }
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this._defaultChecked === null) this._defaultChecked = this.hasAttribute('checked');
    this._updateFormValue();
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._updateFormValue();
      this.render();
    }
  }

  get checked() {
    return this.hasAttribute('checked');
  }

  set checked(value) {
    this.toggleAttribute('checked', Boolean(value));
  }

  get value() {
    return this.getAttribute('value') || 'on';
  }

  set value(value) {
    if (value === null || value === undefined) this.removeAttribute('value');
    else this.setAttribute('value', String(value));
  }

  get hint() {
    return this.getAttribute('hint') || '';
  }

  set hint(value) {
    if (value === null || value === undefined) this.removeAttribute('hint');
    else this.setAttribute('hint', String(value));
  }

  formResetCallback() {
    this.checked = this._defaultChecked === true;
    this._updateFormValue();
    this.render();
  }

  _updateFormValue() {
    if (this._internals && typeof this._internals.setFormValue === 'function') {
      this._internals.setFormValue(this.checked ? this.value : null);
    }
  }

  _validation() {
    if (this.required && !this.checked) {
      return {
        valid: false,
        message: this.error || `${this.label || this.name || 'Checkbox'} is required.`
      };
    }
    return { valid: true, message: '' };
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
      checked: this.checked,
      value: this.checked ? this.value : '',
      ...extra
    };
  }

  _emitCommonControlEvent(type, sourceEvent = null, extra = {}) {
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: sourceEvent?.cancelable ?? false,
      detail: this._eventDetail({ sourceEvent, ...extra })
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

  _syncFromUiCheckbox(event) {
    event.stopPropagation();

    const oldValue = this.checked;
    const newValue = Boolean(event.detail?.newValue ?? event.currentTarget.checked);
    if (oldValue !== newValue) this.checked = newValue;
    this._updateFormValue();

    return { oldValue, newValue };
  }

  _handleUiCheckboxChange(event) {
    const { oldValue, newValue } = this._syncFromUiCheckbox(event);
    this.checkValidity();
    const detail = this._eventDetail({ oldValue, newValue });
    this.emitMtEvent('input', detail);
    this.emitMtEvent('change', detail);
    this.emitMtEvent('uib-forms-checkbox-change', detail);
  }

  _bindUiCheckboxEvents(control) {
    if (!control) return;
    control.addEventListener('uib-checkbox-change', (event) => this._handleUiCheckboxChange(event));
    control.addEventListener('change', (event) => event.stopPropagation());
    control.addEventListener('focus', (event) => this._emitCommonControlEvent('focus', event));
    control.addEventListener('blur', (event) => this._emitCommonControlEvent('blur', event));
    control.addEventListener('focusin', (event) => this._emitCommonControlEvent('focusin', event));
    control.addEventListener('focusout', (event) => this._emitCommonControlEvent('focusout', event));
    control.addEventListener('keydown', (event) => this._emitKeyboardEvent('keydown', event));
    control.addEventListener('keyup', (event) => this._emitKeyboardEvent('keyup', event));
    control.addEventListener('invalid', (event) => this._emitCommonControlEvent('invalid', event));
  }

  render() {
    const validation = this._validation();
    const shouldShowError = this.invalid || !validation.valid;
    const errorText = this.error || validation.message;
    const label = this.label || this.textContent.trim() || this.name || 'Checkbox';
    const ariaLabel = this.ariaLabel || '';
    const ariaDescribedBy = this.describedBy();

    this.shadowRoot.innerHTML = (
  `<style>` +
  (styles) +
  `</style>` +
  `<uib-checkbox exportparts="field,input,content,label,required,hint,help,error" ` +
  (this.checked ? 'checked' : '') +
  ` ` +
  (this.disabled ? 'disabled' : '') +
  ` ` +
  (this.readonly ? 'readonly' : '') +
  ` ` +
  (this.required ? 'required' : '') +
  ` ` +
  (this.invalid || !validation.valid ? 'invalid' : '') +
  ` label="` +
  (escapeHtml(label)) +
  `" help="` +
  (escapeHtml(this.help)) +
  `" help-mode="` +
  (escapeHtml(this.helpMode || 'tooltip')) +
  `" hint="` +
  (escapeHtml(this.hint)) +
  `" error="` +
  (shouldShowError ? escapeHtml(errorText) : '') +
  `" ` +
  (ariaLabel ? `aria-label="${escapeHtml(ariaLabel)}"` : '') +
  ` ` +
  (ariaDescribedBy ? `aria-describedby="${escapeHtml(ariaDescribedBy)}"` : '') +
  ` >` +
  `</uib-checkbox>`
);
    this._bindUiCheckboxEvents(this.shadowRoot.querySelector('uib-checkbox'));
  }
}

defineUiBaseElement('uib-forms-checkbox', UibFormsCheckbox);
