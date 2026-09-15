import {
  UibBaseElement,
  defineUiBaseElement,
  escapeHtml
} from '@ui-base/core';
import '@ui-base/ui/label';
import '@ui-base/ui/help';

const styles = `
:host{display:block;color:var(--uib-color-ink,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.uib-forms-display-field{display:grid;gap:var(--uib-forms-display-field-gap,var(--uib-forms-field-gap,.35rem));max-width:100%}.uib-forms-display-field--horizontal,.uib-forms-display-field--auto{grid-template-columns:minmax(8rem,var(--uib-forms-display-field-label-width,12rem)) minmax(0,1fr);align-items:start;column-gap:var(--uib-forms-display-field-column-gap,var(--uib-space-4,1rem))}.uib-forms-display-field__label{display:inline-flex;align-items:center;gap:.35rem;color:var(--uib-color-ink,#13294b);font-weight:850;line-height:1.35}.uib-forms-display-field__value{min-width:0;color:var(--uib-color-ink,#13294b);font:inherit;line-height:1.45;overflow-wrap:anywhere;white-space:pre-wrap}.uib-forms-display-field__help{color:var(--uib-color-muted,#53657f);font-size:var(--uib-font-size-sm,.875rem);line-height:1.4}.uib-forms-display-field--horizontal .uib-forms-display-field__help,.uib-forms-display-field--auto .uib-forms-display-field__help{grid-column:2}@media (max-width:560px){.uib-forms-display-field--auto{grid-template-columns:1fr}.uib-forms-display-field--auto .uib-forms-display-field__help{grid-column:auto}}
`;

function normalizedOrientation(value) {
  const orientation = String(value || '').trim().toLowerCase();
  return orientation === 'horizontal' || orientation === 'auto' ? orientation : 'vertical';
}

function normalizedType(value) {
  const type = String(value || '').trim().toLowerCase();
  return type === 'password' ? 'password' : 'text';
}

function maskedValue(value) {
  const text = String(value ?? '');
  return text ? '*'.repeat(text.length) : '';
}

export class UibFormsDisplayField extends UibBaseElement {
  static get observedAttributes() {
    return [
      ...UibBaseElement.commonAttributes,
      'value',
      'display-value',
      'orientation',
      'empty-value',
      'type'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(value) {
    if (value === null || value === undefined) this.removeAttribute('value');
    else this.setAttribute('value', String(value));
  }

  get displayValue() {
    return this.getAttribute('display-value') || '';
  }

  set displayValue(value) {
    if (value === null || value === undefined) this.removeAttribute('display-value');
    else this.setAttribute('display-value', String(value));
  }

  get orientation() {
    return normalizedOrientation(this.getAttribute('orientation'));
  }

  set orientation(value) {
    if (value === null || value === undefined) this.removeAttribute('orientation');
    else this.setAttribute('orientation', normalizedOrientation(value));
  }

  get emptyValue() {
    return this.getAttribute('empty-value') || '-';
  }

  set emptyValue(value) {
    if (value === null || value === undefined) this.removeAttribute('empty-value');
    else this.setAttribute('empty-value', String(value));
  }

  get type() {
    return normalizedType(this.getAttribute('type'));
  }

  set type(value) {
    if (value === null || value === undefined) this.removeAttribute('type');
    else this.setAttribute('type', normalizedType(value));
  }

  _formattedValue() {
    const value = this.displayValue || this.value;
    const formatted = this.type === 'password' ? maskedValue(value) : value;
    return formatted || this.emptyValue;
  }

  render() {
    const label = this.label || this.name || 'Field';
    const helpId = this.help ? `${this.componentId}-help` : '';
    const describedBy = this.describedBy(helpId);
    const orientation = this.orientation;
    const tooltipHelp = this.help && this.helpMode !== 'inline'
      ? (
  `<span id="` +
  (helpId) +
  `" class="uib-forms-display-field__help" part="help"><uib-help text="` +
  (escapeHtml(this.help)) +
  `" mode="` +
  `tooltip` +
  `"></uib-help></span>`
)
      : '';
    const help = this.help && this.helpMode === 'inline'
      ? (
  `<span id="` +
  (helpId) +
  `" class="uib-forms-display-field__help" part="help"><uib-help text="` +
  (escapeHtml(this.help)) +
  `" mode="inline"></uib-help></span>`
)
      : '';

    this.shadowRoot.innerHTML = (
  `<style>` +
  (styles) +
  `</style>` +
  `<div class="uib-forms-display-field uib-forms-display-field--` +
  (orientation) +
  `" part="field" data-uib-css-class-root>` +
  `<span class="uib-forms-display-field__label" part="label">` +
  `<slot name="label">` +
  `<uib-label text="` +
  (escapeHtml(label)) +
  `"></uib-label>` +
  `</slot>` +
  (tooltipHelp) +
  `</span>` +
  `<span class="uib-forms-display-field__value" part="value" ` +
  (describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : '') +
  `>` +
  (escapeHtml(this._formattedValue())) +
  `</span>` +
  (help) +
  `</div>`
);
  }
}

defineUiBaseElement('uib-forms-display-field', UibFormsDisplayField);
