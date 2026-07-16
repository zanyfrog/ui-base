import { defineUiBaseElement, escapeHtml, setOrRemoveAttribute } from '@ui.base/core';
import './uib-detail-item.js';

const styles = `
:host{display:block;color:var(--uib-detail-color,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.details{display:grid;grid-template-columns:repeat(var(--uib-detail-columns,auto-fit),minmax(var(--uib-detail-min-width,9rem),1fr));gap:var(--uib-detail-gap,.75rem);margin:0;padding:0;list-style:none}uib-detail-item{display:block;min-width:0}
`;

function parseDetails(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseAssetMap(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (!value) return {};
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function cleanDetail(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export class UibDetailList extends HTMLElement {
  static get observedAttributes() {
    return ['details', 'asset-map'];
  }

  constructor() {
    super();
    this._details = undefined;
    this._assetMap = undefined;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  get details() {
    return Array.isArray(this._details) ? this._details : parseDetails(this.getAttribute('details'));
  }

  set details(value) {
    this._details = Array.isArray(value) ? value : [];
    setOrRemoveAttribute(this, 'details', JSON.stringify(this._details));
    if (this.isConnected) this.render();
  }

  get assetMap() {
    return this._assetMap && typeof this._assetMap === 'object' ? this._assetMap : parseAssetMap(this.getAttribute('asset-map'));
  }

  set assetMap(value) {
    this._assetMap = value && typeof value === 'object' ? value : {};
    setOrRemoveAttribute(this, 'asset-map', JSON.stringify(this._assetMap));
    if (this.isConnected) this.render();
  }

  render() {
    const details = this.details;
    const assetMap = this.assetMap;
    const assetMapJson = JSON.stringify(assetMap || {});
    this.shadowRoot.innerHTML = (
  `<style>` +
  (styles) +
  `</style>` +
  `<dl class="details" part="list">` +
  ` ` +
  (details.map((item, index) => {
          const row = cleanDetail(item);
          return `<uib-detail-item
            part="item"
            index="${index}"
            label="${escapeHtml(row.label || '')}"
            value="${escapeHtml(row.value || '')}"
            description="${escapeHtml(row.description || '')}"
            icon="${escapeHtml(row.icon || '')}"
            icon-url="${escapeHtml(row.iconUrl || row.icon_url || row.iconSrc || row.iconHref || row.iconImage || '')}"
            asset-id="${escapeHtml(row.iconAssetId || row.icon_asset_id || row.assetId || row.asset_id || '')}"
            icon-alt="${escapeHtml(row.iconAlt || row.icon_alt || row.alt || '')}"
            asset-map='${escapeHtml(assetMapJson)}'
          ></uib-detail-item>`;
        }).join('')) +
  ` ` +
  `</dl>`
);
  }
}

defineUiBaseElement('uib-detail-list', UibDetailList);
