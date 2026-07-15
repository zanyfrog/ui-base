import { baseAssetStyles, emitAssetEvent, escapeHtml, registerElement } from '../asset-core.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetPermissionSetPicker extends BaseHTMLElement {
  static get observedAttributes() { return ['value', 'disabled']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._permissionSets = [];
  }

  set permissionSets(value) { this._permissionSets = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get permissionSets() { return this._permissionSets; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const value = this.getAttribute('value') || '';
    const disabled = this.hasAttribute('disabled');
    this.shadowRoot.innerHTML = `
      <style>${baseAssetStyles}</style>
      <label>
        Permission set
        <select ${disabled ? 'disabled' : ''}>
          <option value="">Choose a permission set</option>
          ${this._permissionSets.map((set) => `<option value="${escapeHtml(set.key)}" ${set.key === value ? 'selected' : ''}>${escapeHtml(set.name || set.key)}</option>`).join('')}
        </select>
      </label>
      ${this._permissionSets.find((set) => set.key === value)?.description ? `<p class="subtitle small">${escapeHtml(this._permissionSets.find((set) => set.key === value).description)}</p>` : ''}
    `;
    this.shadowRoot.querySelector('select')?.addEventListener('change', (event) => {
      this.setAttribute('value', event.target.value);
      emitAssetEvent(this, 'uib-asset-permission-change-request', { permissionSetKey: event.target.value });
    });
  }
}

registerElement('uib-asset-permission-set-picker', UibAssetPermissionSetPicker);
