import {
  UibBaseElement,
  defineUiBaseElement,
  escapeHtml
} from '@ui.base/core';
import '@ui.base/ui/label';
import '@ui.base/ui/help';

const styles = `
:host{display:block;color:var(--uib-color-ink,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.uib-checkbox{display:inline-flex;align-items:flex-start;gap:.55rem;max-width:100%;line-height:1.45;cursor:pointer}.uib-checkbox__input{width:1.05rem;height:1.05rem;min-width:1.05rem;margin:.18rem 0 0;padding:0;border:1px solid var(--uib-color-border-strong,#aab8cc);border-radius:.3rem;background:var(--uib-color-surface,#fff);accent-color:var(--uib-color-primary,#174a8b);cursor:pointer}.uib-checkbox__input:focus-visible{outline:none;box-shadow:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25))}.uib-checkbox__content{display:grid;gap:.12rem;min-width:0}.uib-checkbox__label-row{display:inline-flex;gap:.35rem;align-items:center;min-width:0}.uib-checkbox__label{font-weight:800;overflow-wrap:anywhere}.uib-checkbox__required{color:var(--uib-color-danger,#b4232a);font-weight:900}.uib-checkbox__help,.uib-checkbox__error{font-size:var(--uib-font-size-sm,.875rem)}.uib-checkbox__help{color:var(--uib-color-muted,#53657f)}.uib-checkbox__error{color:var(--uib-color-danger,#b4232a)}.uib-checkbox--disabled,.uib-checkbox--readonly{cursor:not-allowed;opacity:.62}.uib-checkbox--disabled .uib-checkbox__input,.uib-checkbox--readonly .uib-checkbox__input{cursor:not-allowed}:host([invalid]) .uib-checkbox__input{border-color:var(--uib-color-danger,#b4232a)}
`;

export class UibFormsCheckbox extends UibBaseElement {
  static formAssociated = true;

  static get observedAttributes() {
    return [
      ...UibBaseElement.commonAttributes,
      'checked',
      'value'
    ];
  }

  constructor() {
    super();
    this._internals = null;
    try {
      if (typeof this.attachInternals === 'function') this._internals = this.attachInternals();
    } catch {
      this._internals = null;
    }
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
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

  _handleInput(event) {
    const oldValue = !this.checked;
    this.checked = event.currentTarget.checked;
    this._updateFormValue();
    this._emitCommonControlEvent('input', event, { oldValue, newValue: this.checked });
  }

  _handleChange(event) {
    const oldValue = !this.checked;
    this.checked = event.currentTarget.checked;
    this._updateFormValue();
    this.checkValidity();
    const detail = this._eventDetail({ oldValue, newValue: this.checked });
    this.emitMtEvent('change', detail);
    this.emitMtEvent('uib-forms-checkbox-change', detail);
  }

  _bindControlEvents(control) {
    control?.addEventListener('input', (event) => this._handleInput(event));
    control?.addEventListener('change', (event) => this._handleChange(event));
    control?.addEventListener('focus', (event) => this._emitCommonControlEvent('focus', event));
    control?.addEventListener('blur', (event) => this._emitCommonControlEvent('blur', event));
    control?.addEventListener('focusin', (event) => this._emitCommonControlEvent('focusin', event));
    control?.addEventListener('focusout', (event) => this._emitCommonControlEvent('focusout', event));
    control?.addEventListener('keydown', (event) => this._emitKeyboardEvent('keydown', event));
    control?.addEventListener('keyup', (event) => this._emitKeyboardEvent('keyup', event));
    control?.addEventListener('invalid', (event) => this._emitCommonControlEvent('invalid', event));
  }

  render() {
    const inputId = `${this.componentId}-control`;
    const helpId = this.help ? `${this.componentId}-help` : '';
    const validation = this._validation();
    const shouldShowError = this.invalid || !validation.valid;
    const errorText = this.error || validation.message;
    const errorId = shouldShowError && errorText ? `${this.componentId}-error` : '';
    const describedBy = this.describedBy(helpId, errorId);
    const label = this.label || this.textContent.trim() || this.name || 'Checkbox';
    const help = this.help ? `<span id="${helpId}" class="uib-checkbox__help" part="help"><uib-help text="${escapeHtml(this.help)}" mode="${escapeHtml(this.helpMode || 'tooltip')}"></uib-help></span>` : '';
    const error = errorId ? `<span id="${errorId}" class="uib-checkbox__error" part="error">${escapeHtml(errorText)}</span>` : '';
    const disabledClass = this.disabled ? ' uib-checkbox--disabled' : '';
    const readonlyClass = this.readonly ? ' uib-checkbox--readonly' : '';

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <label class="uib-checkbox${disabledClass}${readonlyClass}" part="field" for="${inputId}">
        <input id="${inputId}" class="uib-checkbox__input" part="input" type="checkbox" name="${escapeHtml(this.name)}" value="${escapeHtml(this.value)}" ${this.checked ? 'checked' : ''} ${this.disabled ? 'disabled' : ''} ${this.readonly ? 'disabled' : ''} ${this.required ? 'required' : ''} ${describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : ''} aria-invalid="${this.invalid ? 'true' : 'false'}">
        <span class="uib-checkbox__content" part="content">
          <span class="uib-checkbox__label-row">
            <span class="uib-checkbox__label" part="label"><slot><uib-label for="${inputId}" text="${escapeHtml(label)}"></uib-label></slot></span>
            ${this.required ? '<span class="uib-checkbox__required" part="required" aria-hidden="true">*</span>' : ''}
          </span>
          ${help}
          ${error}
        </span>
      </label>
    `;
    this._bindControlEvents(this.shadowRoot.querySelector('.uib-checkbox__input'));
  }
}

defineUiBaseElement('uib-forms-checkbox', UibFormsCheckbox);
