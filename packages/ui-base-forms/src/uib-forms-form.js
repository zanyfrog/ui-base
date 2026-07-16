import { UibBaseElement, defineUiBaseElement, escapeHtml } from '@ui.base/core';
import '@ui.base/ui/action-button';

const styles = `
:host{display:block;color:var(--uib-color-ink,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.uib-forms-form{display:grid;gap:var(--uib-forms-form-gap,var(--uib-space-4,1rem))}.uib-forms-form__actions{display:flex;gap:.6rem;flex-wrap:wrap}.uib-forms-form__submit{font:inherit;cursor:pointer}.uib-forms-form__submit:focus-visible{outline:none}
`;

export class UibFormsForm extends UibBaseElement {
  static get observedAttributes() {
    return [...UibBaseElement.commonAttributes, 'submit-label', 'novalidate'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  _collectValues() {
    const values = {};
    this.querySelectorAll('input, select, textarea, uib-forms-textbox, uib-forms-number, uib-forms-date, uib-forms-email, uib-forms-password, uib-forms-phone, uib-forms-textarea, uib-forms-select, uib-forms-checkbox, uib-toggle, uib-checkbox').forEach((control) => {
      const name = control.getAttribute('name') || control.name;
      if (!name) return;
      if (control.localName === 'uib-forms-checkbox') values[name] = control.checked ? control.value : '';
      else if ('value' in control) values[name] = control.value;
      else if (control.type === 'checkbox') values[name] = control.checked;
      else values[name] = control.value;
    });
    return values;
  }

  _checkValidity() {
    const controls = Array.from(this.querySelectorAll('uib-forms-textbox, uib-forms-number, uib-forms-date, uib-forms-email, uib-forms-password, uib-forms-phone, uib-forms-textarea, uib-forms-select, uib-forms-checkbox'));
    return controls.every((control) => typeof control.checkValidity !== 'function' || control.checkValidity());
  }

  _submit(event) {
    event.preventDefault();
    this._emitSubmit();
  }

  _emitSubmit() {
    const valid = this.hasAttribute('novalidate') ? true : this._checkValidity();
    const values = this._collectValues();
    this.emitMtEvent('uib-forms-form-submit', { name: this.name, oldValue: null, newValue: values, values, valid });
  }

  _requestSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    this._emitSubmit();
  }

  render() {
    const label = this.label || 'Form';
    const submitLabel = this.getAttribute('submit-label') || 'Submit';
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<form class="uib-forms-form" part="form" aria-label="` +
  (escapeHtml(label)) +
  `">` +
  `<slot>` +
  `</slot>` +
  `<div class="uib-forms-form__actions" part="actions">` +
  `<slot name="actions">` +
  `<uib-action-button class="uib-forms-form__submit" part="submit" label="` +
  (escapeHtml(submitLabel)) +
  `" variant="primary" action="submit" action-token="submit" >` +
  `</uib-action-button>` +
  `</slot>` +
  `</div>` +
  `</form>`
);
    this.shadowRoot.querySelector('form')?.addEventListener('submit', (event) => this._submit(event));
    this.shadowRoot.querySelector('uib-action-button')?.addEventListener('click', (event) => this._requestSubmit(event));
  }
}

defineUiBaseElement('uib-forms-form', UibFormsForm);
