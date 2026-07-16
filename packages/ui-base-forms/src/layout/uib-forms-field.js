import { UibBaseElement, defineUiBaseElement, escapeHtml } from '@ui.base/core';
import '@ui.base/ui/label';
import '@ui.base/ui/help';

const styles = `
:host{display:block;font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui)}
.uib-forms-field{display:grid;gap:var(--uib-forms-field-gap,.35rem)}
.uib-forms-field__label{display:inline-flex;align-items:center;gap:.35rem;line-height:1.35}
`;

export class UibFormsField extends UibBaseElement {
  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    const label = this.label || '';
    const help = this.help
      ? (
  `<span class="uib-forms-field__help" part="help">` +
  `<uib-help text="` +
  (escapeHtml(this.help)) +
  `" mode="` +
  (escapeHtml(this.helpMode || 'tooltip')) +
  `">` +
  `</uib-help>` +
  `</span>`
)
      : '';

    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<div class="uib-forms-field" part="field">` +
  `<span class="uib-forms-field__label" part="label">` +
  `<slot name="label">` +
  `<uib-label text="` +
  (escapeHtml(label)) +
  `">` +
  `</uib-label>` +
  `</slot>` +
  ` ` +
  (help) +
  ` ` +
  `</span>` +
  `<slot>` +
  `</slot>` +
  `</div>`
);
  }
}

defineUiBaseElement('uib-forms-field', UibFormsField);
