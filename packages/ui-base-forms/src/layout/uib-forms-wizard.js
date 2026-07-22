import { UibBaseElement, defineUiBaseElement, escapeHtml } from '@ui-base/core';

const styles = `:host{display:block;font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui)}.uib-forms-wizard{display:grid;gap:var(--uib-space-4,1rem)}`;

export class UibFormsWizard extends UibBaseElement {
  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<section class="uib-forms-wizard" part="wizard">` +
  `<div class="uib-forms-wizard__title" part="title">` +
  `<slot name="title">` +
  ` ` +
  (escapeHtml(this.label || 'Wizard')) +
  ` ` +
  `</slot>` +
  `</div>` +
  `<slot>` +
  `</slot>` +
  `<div class="uib-forms-wizard__note" part="note">` +
  ` Experimental stub: step coordination, validation gates, and navigation will be implemented later. ` +
  `</div>` +
  `</section>`
);
  }
}

defineUiBaseElement('uib-forms-wizard', UibFormsWizard);
