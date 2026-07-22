import { UibBaseElement, defineUiBaseElement } from '@ui-base/core';

const styles = `:host{display:block}.uib-forms-input-group{display:flex;flex-wrap:wrap;gap:var(--uib-space-2,.5rem);align-items:end}.uib-forms-input-group ::slotted(*){flex:1 1 var(--uib-forms-input-group-item-width,12rem)}`;

export class UibFormsInputGroup extends UibBaseElement {
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
  `<div class="uib-forms-input-group" part="group">` +
  `<slot>` +
  `</slot>` +
  `</div>`
);
  }
}

defineUiBaseElement('uib-forms-input-group', UibFormsInputGroup);
