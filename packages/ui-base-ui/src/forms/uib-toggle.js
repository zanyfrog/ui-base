/**
 * uib-toggle
 * Accessible compact segmented control for nullable booleans.
 */
import {
  UibBaseElement,
  defineUiBaseElement,
  escapeHtml,
  getUiBaseMessage,
  normalizeNullableBoolean,
  nullableBooleanToAttribute,
  parseNullableBoolean,
  splitCommaList
} from '@ui.base/core';
import '../help/uib-help.js';

const styles = `
:host{--uib-toggle-text:var(--uib-color-ink,#13294b);--uib-toggle-muted:var(--uib-color-muted,#53657f);--uib-toggle-background:var(--uib-color-surface,#fff);--uib-toggle-background-soft:var(--uib-color-surface-soft,#f8fbff);--uib-toggle-border:var(--uib-color-border,#d9e2f0);--uib-toggle-border-strong:var(--uib-color-border-strong,#aab8cc);--uib-toggle-null:var(--uib-color-ink-soft,#40516f);--uib-toggle-yes:var(--uib-color-success,#2e7d32);--uib-toggle-no:var(--uib-color-danger,#b4232a);--uib-toggle-focus:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25));--uib-toggle-segment-min-width:3.35rem;--uib-toggle-height:2.05rem;--uib-toggle-font-size:.875rem;display:block;color:var(--uib-toggle-text);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.uib-field{display:flex;align-items:center;gap:var(--uib-space-2,.5rem);max-width:100%;min-width:0}.uib-field__label{display:inline-flex;align-items:center;gap:.35rem;min-width:0;color:var(--uib-toggle-text);font-weight:800;line-height:1.35;overflow-wrap:anywhere}.uib-field__required{color:var(--uib-color-danger,#b4232a);font-weight:900}.uib-field__control{display:inline-flex;align-items:center;min-width:0;max-width:100%;overflow-x:auto;overflow-y:hidden;padding:.1rem}.uib-field__error{display:block;margin-top:.3rem;color:var(--uib-color-danger,#b4232a);font-size:var(--uib-font-size-sm,.875rem);line-height:1.35}.uib-toggle{display:inline-grid;grid-auto-flow:column;grid-auto-columns:minmax(var(--uib-toggle-segment-min-width),1fr);overflow:hidden;max-width:100%;border:1px solid var(--uib-toggle-border);border-radius:var(--uib-radius-md,.75rem);background:var(--uib-toggle-background);box-shadow:var(--uib-shadow-sm,0 6px 18px rgba(10,31,68,.08))}.uib-toggle__button{position:relative;min-width:var(--uib-toggle-segment-min-width);min-height:var(--uib-toggle-height);display:inline-flex;align-items:center;justify-content:center;margin:0;padding:.42rem .65rem;border:0;border-inline-start:1px solid var(--uib-toggle-border);border-radius:0;background:var(--uib-toggle-background);color:var(--uib-toggle-text);cursor:pointer;font:inherit;font-size:var(--uib-toggle-font-size);font-weight:850;line-height:1;white-space:nowrap;transition:background-color 140ms ease,color 140ms ease,border-color 140ms ease,box-shadow 140ms ease}.uib-toggle__button:first-child{border-inline-start:0}.uib-toggle__button:hover:not(:disabled){background:var(--uib-toggle-background-soft)}.uib-toggle__button:focus-visible{z-index:1;outline:none;box-shadow:inset var(--uib-toggle-focus)}.uib-toggle__button[aria-checked="true"]{z-index:1}.uib-toggle__button[data-value="null"][aria-checked="true"]{background:var(--uib-toggle-null);color:#fff}.uib-toggle__button[data-value="true"]{color:var(--uib-toggle-yes)}.uib-toggle__button[data-value="true"][aria-checked="true"]{background:var(--uib-toggle-yes);color:#fff}.uib-toggle__button[data-value="false"]{color:var(--uib-toggle-no)}.uib-toggle__button[data-value="false"][aria-checked="true"]{background:var(--uib-toggle-no);color:#fff}.uib-toggle__button:disabled{cursor:not-allowed;opacity:.58}:host([disabled]){cursor:not-allowed}.uib-toggle[aria-disabled="true"]{opacity:.72}.uib-toggle--required{grid-auto-columns:minmax(3.15rem,1fr)}:host([invalid]) .uib-toggle{border-color:var(--uib-color-danger,#b4232a)}@media(max-width:520px){.uib-field{align-items:flex-start;flex-wrap:wrap}.uib-field__label{flex:1 1 9rem}.uib-field__control{flex:0 1 auto}.uib-toggle{grid-auto-columns:minmax(2.8rem,1fr)}.uib-toggle__button{min-width:2.8rem;padding-inline:.48rem;font-size:.82rem}}@media(max-width:340px){.uib-field__control{width:100%}.uib-toggle{width:100%}}
`;

function defaultLabels() {
  return [
    getUiBaseMessage('toggle.null', 'N/A'),
    getUiBaseMessage('toggle.true', '✓'),
    getUiBaseMessage('toggle.false', '✕')
  ];
}

function valuesAreEqual(left, right) {
  return left === right;
}

export class UibToggle extends UibBaseElement {
  static formAssociated = true;

  static get observedAttributes() {
    return [...UibBaseElement.commonAttributes, 'value', 'labels'];
  }

  constructor() {
    super();
    this._value = null;
    this._initialized = false;
    this._reflectingValue = false;
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
    if (oldValue === newValue) return;

    if (name === 'value' && !this._reflectingValue) {
      this._setValue(newValue, { emit: false, reflect: false });
      return;
    }

    if (name === 'required') {
      const normalized = normalizeNullableBoolean(this._value, this.required);
      if (!valuesAreEqual(this._value, normalized)) this._value = normalized;
      this._updateFormValue();
    }

    if (this.isConnected) this.render();
  }

  get labels() {
    return this.getAttribute('labels') || defaultLabels().join(',');
  }

  set labels(value) {
    if (value === null || value === undefined) this.removeAttribute('labels');
    else if (Array.isArray(value)) this.setAttribute('labels', value.join(','));
    else this.setAttribute('labels', String(value));
  }

  get value() {
    return normalizeNullableBoolean(this._value, this.required);
  }

  set value(value) {
    this._setValue(value, { emit: false, reflect: true });
  }

  formResetCallback() {
    this._initialized = false;
    this._initializeValueFromAttributes();
    this.render();
  }

  _initializeValueFromAttributes() {
    const defaultValue = this.required ? false : null;
    const value = this.hasAttribute('value') ? this.getAttribute('value') : defaultValue;
    this._setValue(value, { emit: false, reflect: false });
  }

  _setValue(value, options = {}) {
    const { emit = false, reflect = false } = options;
    const oldValue = this.value;
    const newValue = normalizeNullableBoolean(value, this.required);

    this._value = newValue;
    this._initialized = true;
    this._updateFormValue();

    if (reflect) this._reflectValue();
    if (this.isConnected) this.render();

    if (emit && !valuesAreEqual(oldValue, newValue)) this.emitValueChange('uib-toggle-change', oldValue, newValue);
  }

  _reflectValue() {
    this._reflectingValue = true;
    if (this._value === null) this.removeAttribute('value');
    else this.setAttribute('value', nullableBooleanToAttribute(this._value));
    this._reflectingValue = false;
  }

  _updateFormValue() {
    if (!this._internals || typeof this._internals.setFormValue !== 'function') return;
    const current = this.value;
    this._internals.setFormValue(current === null ? null : String(current));
  }

  _parsedLabels() {
    const defaults = defaultLabels();
    const parts = splitCommaList(this.getAttribute('labels') || '');

    if (parts.length >= 3) return { nullLabel: parts[0], trueLabel: parts[1], falseLabel: parts[2] };
    if (parts.length === 2) return { nullLabel: defaults[0], trueLabel: parts[0], falseLabel: parts[1] };
    if (parts.length === 1) return { nullLabel: defaults[0], trueLabel: parts[0], falseLabel: defaults[2] };
    return { nullLabel: defaults[0], trueLabel: defaults[1], falseLabel: defaults[2] };
  }

  _selectValue(value) {
    if (this.disabled || this.readonly) return;
    this._setValue(value, { emit: true, reflect: true });
  }

  _moveSelection(direction) {
    if (this.disabled || this.readonly) return;
    const optionValues = this.required ? [true, false] : [null, true, false];
    const currentIndex = Math.max(0, optionValues.findIndex((optionValue) => valuesAreEqual(optionValue, this.value)));
    const nextIndex = (currentIndex + direction + optionValues.length) % optionValues.length;
    this._selectValue(optionValues[nextIndex]);
    this.shadowRoot.querySelector(`[data-value="${nullableBooleanToAttribute(optionValues[nextIndex])}"]`)?.focus();
  }

  render() {
    const labels = this._parsedLabels();
    const options = this.required
      ? [
          { value: true, label: labels.trueLabel, aria: getUiBaseMessage('toggle.trueAria', 'Yes') },
          { value: false, label: labels.falseLabel, aria: getUiBaseMessage('toggle.falseAria', 'No') }
        ]
      : [
          { value: null, label: labels.nullLabel, aria: getUiBaseMessage('toggle.nullAria', 'Not applicable') },
          { value: true, label: labels.trueLabel, aria: getUiBaseMessage('toggle.trueAria', 'Yes') },
          { value: false, label: labels.falseLabel, aria: getUiBaseMessage('toggle.falseAria', 'No') }
        ];

    const currentValue = this.value;
    const requiredClass = this.required ? ' uib-toggle--required' : '';
    const labelId = `${this.componentId}-label`;
    const helpId = this.help ? `${this.componentId}-help` : '';
    const errorId = this.error || this.invalid ? `${this.componentId}-error` : '';
    const describedBy = this.describedBy(helpId, errorId);
    const groupLabel = this.ariaLabel || this.label || this.name || 'Toggle';
    const labelMarkup = this.label || this.help
      ? `<span id="${labelId}" class="uib-field__label" part="label"><slot name="label">${escapeHtml(this.label || groupLabel)}</slot>${this.required ? '<span class="uib-field__required" aria-hidden="true">*</span>' : ''}${this.help ? `<uib-help id="${helpId}" text="${escapeHtml(this.help)}" mode="${escapeHtml(this.helpMode)}"></uib-help>` : ''}</span>`
      : '';
    const buttons = options.map((option) => {
      const selected = valuesAreEqual(option.value, currentValue);
      const valueText = nullableBooleanToAttribute(option.value);
      const tabIndex = selected ? '0' : '-1';
      return `<button class="uib-toggle__button" part="button" type="button" role="radio" data-value="${valueText}" aria-label="${escapeHtml(option.aria)}" aria-checked="${selected ? 'true' : 'false'}" tabindex="${tabIndex}" ${this.disabled ? 'disabled' : ''}>${escapeHtml(option.label)}</button>`;
    }).join('');
    const labelledBy = labelMarkup ? `aria-labelledby="${labelId}"` : `aria-label="${escapeHtml(groupLabel)}"`;
    const described = describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : '';
    const errorMarkup = errorId ? `<span id="${errorId}" class="uib-field__error" part="error">${escapeHtml(this.error || `${groupLabel} is invalid.`)}</span>` : '';

    this.shadowRoot.innerHTML = `<style>${styles}</style><div class="uib-field" part="field">${labelMarkup}<span class="uib-field__control" part="control"><span class="uib-toggle${requiredClass}" part="segmented-control" role="radiogroup" ${labelledBy} ${described} aria-disabled="${this.disabled ? 'true' : 'false'}" aria-readonly="${this.readonly ? 'true' : 'false'}" aria-invalid="${this.invalid ? 'true' : 'false'}">${buttons}</span></span></div>${errorMarkup}`;

    this.shadowRoot.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => this._selectValue(parseNullableBoolean(button.dataset.value)));
    });

    this.shadowRoot.querySelector('.uib-toggle')?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        this._moveSelection(1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        this._moveSelection(-1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        this._selectValue(this.required ? true : null);
        this.shadowRoot.querySelector('button')?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        this._selectValue(false);
        this.shadowRoot.querySelector('[data-value="false"]')?.focus();
      }
    });
  }
}

defineUiBaseElement('uib-toggle', UibToggle);
