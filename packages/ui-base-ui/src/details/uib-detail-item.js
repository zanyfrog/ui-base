import { defineUiBaseElement, escapeHtml, setOrRemoveAttribute } from '@ui.base/core';
import '../media/uib-media.js';

const styles = `
:host{display:block;color:var(--uib-detail-color,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.detail{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:.7rem;min-width:0;padding:var(--uib-detail-padding,.85rem);border:1px solid var(--uib-detail-border,var(--uib-color-border,rgba(19,41,75,.16)));border-radius:var(--uib-detail-radius,1rem);background:var(--uib-detail-bg,rgba(255,255,255,.72));box-shadow:var(--uib-detail-shadow,none)}.icon{width:var(--uib-detail-icon-size,2.35rem);height:var(--uib-detail-icon-size,2.35rem);display:grid;place-items:center;overflow:hidden;border-radius:var(--uib-detail-icon-radius,.82rem);background:var(--uib-detail-icon-bg,var(--uib-color-surface-soft,#eef4fb));color:var(--uib-detail-icon-color,var(--uib-color-primary,#174a8b));font-size:.78rem;font-weight:900;line-height:1}.icon uib-media,.icon uib-asset-image{width:100%;height:100%}.copy{min-width:0}.label{margin:0;color:var(--uib-detail-label-color,var(--uib-color-muted,#53657f));font-size:var(--uib-detail-label-size,.78rem);font-weight:900;letter-spacing:.04em;text-transform:uppercase}.value{margin:.12rem 0 0;color:var(--uib-detail-value-color,currentColor);font-size:var(--uib-detail-value-size,.98rem);font-weight:850;line-height:1.25;overflow-wrap:anywhere}.description{margin:.25rem 0 0;color:var(--uib-detail-description-color,var(--uib-color-muted,#53657f));font-size:.86rem;line-height:1.4}
`;

function parseObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (!value) return {};
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function safeImageSrc(value) {
  const src = String(value ?? '').trim();
  if (!src || /^javascript:/i.test(src)) return '';
  if (/^data:/i.test(src) && !/^data:image\//i.test(src)) return '';
  if (/^https?:\/\//i.test(src) || /^data:image\//i.test(src)) return src;
  if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) return src;
  if (/^[a-z0-9_.~%+-]+\.(svg|png|jpe?g|gif|webp|avif)([?#].*)?$/i.test(src)) return src;
  return '';
}

function firstText(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function iconText(detail, index) {
  const raw = firstText(detail.icon, detail.label, Number.isFinite(index) ? index + 1 : 1);
  return raw ? raw.slice(0, 2).toUpperCase() : '1';
}

function assetEntry(assetMap, assetId) {
  if (!assetId || !assetMap || typeof assetMap !== 'object') return undefined;
  return assetMap[assetId];
}

function assetEntryText(entry, ...keys) {
  if (!entry) return '';
  if (typeof entry === 'string') return keys.includes('url') || keys.includes('src') ? entry : '';
  if (typeof entry !== 'object') return '';
  for (const key of keys) {
    if (entry[key] !== undefined && entry[key] !== null && String(entry[key]).trim() !== '') return String(entry[key]).trim();
  }
  return '';
}

function normalizeDetail(value = {}) {
  const row = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    label: firstText(row.label),
    value: firstText(row.value),
    description: firstText(row.description),
    icon: firstText(row.icon),
    iconUrl: firstText(row.iconUrl, row.icon_url, row.iconSrc, row.iconHref, row.iconImage),
    iconAssetId: firstText(row.iconAssetId, row.icon_asset_id, row.assetId, row.asset_id),
    iconAlt: firstText(row.iconAlt, row.icon_alt, row.alt)
  };
}

export class UibDetailItem extends HTMLElement {
  static get observedAttributes() {
    return ['detail', 'label', 'value', 'description', 'icon', 'icon-url', 'icon-src', 'asset-id', 'icon-asset-id', 'asset-map', 'alt', 'icon-alt', 'index'];
  }

  constructor() {
    super();
    this._detail = undefined;
    this._assetMap = undefined;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  get detail() {
    if (this._detail && typeof this._detail === 'object') return normalizeDetail(this._detail);
    const detail = normalizeDetail(parseObject(this.getAttribute('detail')));
    return normalizeDetail({
      ...detail,
      label: firstText(this.getAttribute('label'), detail.label),
      value: firstText(this.getAttribute('value'), detail.value),
      description: firstText(this.getAttribute('description'), detail.description),
      icon: firstText(this.getAttribute('icon'), detail.icon),
      iconUrl: firstText(this.getAttribute('icon-url'), this.getAttribute('icon-src'), detail.iconUrl),
      iconAssetId: firstText(this.getAttribute('asset-id'), this.getAttribute('icon-asset-id'), detail.iconAssetId),
      iconAlt: firstText(this.getAttribute('icon-alt'), this.getAttribute('alt'), detail.iconAlt)
    });
  }

  set detail(value) {
    this._detail = normalizeDetail(value);
    setOrRemoveAttribute(this, 'detail', JSON.stringify(this._detail));
    if (this.isConnected) this.render();
  }

  get assetMap() {
    if (this._assetMap && typeof this._assetMap === 'object') return this._assetMap;
    return parseObject(this.getAttribute('asset-map'));
  }

  set assetMap(value) {
    this._assetMap = value && typeof value === 'object' ? value : {};
    setOrRemoveAttribute(this, 'asset-map', JSON.stringify(this._assetMap));
    if (this.isConnected) this.render();
  }

  get index() {
    const value = Number.parseInt(this.getAttribute('index') || '0', 10);
    return Number.isFinite(value) ? value : 0;
  }

  iconMarkup(detail) {
    const assetMap = this.assetMap;
    const entry = assetEntry(assetMap, detail.iconAssetId);
    const explicitSrc = safeImageSrc(detail.iconUrl);
    const mappedSrc = safeImageSrc(assetEntryText(entry, 'url', 'src', 'href', 'publicUrl', 'public_url'));
    const src = explicitSrc || mappedSrc;
    const assetId = detail.iconAssetId;
    const alt = firstText(detail.iconAlt, assetEntryText(entry, 'alt', 'altText', 'alt_text', 'description'), detail.label);

    if (src || assetId) {
      if (typeof customElements !== 'undefined' && customElements.get('uib-asset-image')) {
        return `<span class="icon icon--image"><uib-asset-image src="${escapeHtml(src)}" asset-id="${escapeHtml(assetId)}" alt="${escapeHtml(alt)}" role="icon" fit="contain" asset-map='${escapeHtml(JSON.stringify(assetMap || {}))}' fallback-label="${escapeHtml(iconText(detail, this.index))}"></uib-asset-image></span>`;
      }
      if (src) {
        return `<span class="icon icon--image"><uib-media src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" role="icon" fit="contain" fallback-label="${escapeHtml(iconText(detail, this.index))}"></uib-media></span>`;
      }
    }

    return `<span class="icon icon--text" aria-hidden="true">${escapeHtml(iconText(detail, this.index))}</span>`;
  }

  render() {
    const detail = this.detail;
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="detail" part="item">
        ${this.iconMarkup(detail)}
        <div class="copy">
          <dt class="label" part="label">${escapeHtml(detail.label)}</dt>
          <dd class="value" part="value">${escapeHtml(detail.value)}</dd>
          ${detail.description ? `<dd class="description" part="description">${escapeHtml(detail.description)}</dd>` : ''}
        </div>
      </div>
    `;
  }
}

defineUiBaseElement('uib-detail-item', UibDetailItem);
