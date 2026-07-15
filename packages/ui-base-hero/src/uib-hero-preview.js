import './uib-hero.js';
import {
  escapeHtml,
  heroActionsForRecord,
  normalizeHeroRecord,
  parseArray,
  parseObject,
  registerHeroElement,
  resolveHeroVisualMode,
  visualPositionForMode
} from './hero-data.js';

function recordValue(record, ...keys) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return '';
}

function slotMarkup(record, name, modeField, contentField) {
  const mode = record[modeField] || 'empty';
  const content = record[contentField] || '';
  if (mode !== 'custom' || !String(content).trim()) return '';
  return `<div slot="${escapeHtml(name)}">${content}</div>`;
}

export class UibHeroPreview extends HTMLElement {
  static get observedAttributes() {
    return ['hero-data', 'hero-json', 'asset-map', 'application-key', 'brand-label', 'brand-mark'];
  }

  constructor() {
    super();
    this.heroRecord = {};
  }

  connectedCallback() {
    if (!Object.keys(this.heroRecord).length) this.readHeroDataFromAttributes();
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'hero-data' || name === 'hero-json') this.readHeroDataFromAttributes();
    if (this.isConnected) this.render();
  }

  set record(value) {
    this.heroRecord = normalizeHeroRecord(value || {});
    if (this.isConnected) this.render();
  }

  get record() {
    return { ...this.heroRecord };
  }

  set heroData(value) {
    this.record = value;
  }

  get heroData() {
    return this.record;
  }

  loadHeroData(value) {
    this.record = parseObject(value);
  }

  readHeroDataFromAttributes() {
    const raw = this.getAttribute('hero-data') || this.getAttribute('hero-json') || '';
    if (raw) this.heroRecord = normalizeHeroRecord(parseObject(raw));
  }

  render() {
    const record = normalizeHeroRecord(this.heroRecord);
    this.heroRecord = record;
    const navItems = record.nav_items || '[]';
    const details = record.details || '[]';
    const navCount = parseArray(navItems).length;
    const detailsCount = parseArray(details).length;
    const actionsJson = JSON.stringify(heroActionsForRecord(record));
    const applicationKey = record.application_key || this.getAttribute('application-key') || '';
    const brandLabel = this.getAttribute('brand-label') || (applicationKey ? `${applicationKey} preview` : 'Hero preview');
    const brandMark = this.getAttribute('brand-mark') || (applicationKey || 'UIB').slice(0, 2).toUpperCase();
    const visualMode = resolveHeroVisualMode(record);
    const assetMap = this.getAttribute('asset-map') || record.asset_map || '';

    this.innerHTML = `
      <style>
        :host{display:block;color:var(--uib-hero-editor-text,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}
        *,*::before,*::after{box-sizing:border-box}
        .preview-card{display:grid;gap:1rem}
        .preview-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap}
        h2{margin:0;color:var(--uib-color-primary,#174a8b);font-size:1.05rem;line-height:1.2}
        p{margin:.25rem 0 0;color:var(--uib-color-muted,#53657f);line-height:1.45}
        .status{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap;color:var(--uib-color-muted,#53657f);font-size:.85rem;font-weight:750}
        .badge{display:inline-flex;align-items:center;min-height:1.55rem;padding:.16rem .55rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:999px;background:var(--uib-color-surface-soft,#f8fbff);color:var(--uib-color-primary,#174a8b);font-size:.74rem;font-weight:900;text-transform:uppercase}
        .shell{min-width:0;overflow:auto;padding:.75rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:1rem;background:var(--uib-color-surface-soft,#f8fbff)}
        uib-hero{min-width:min(100%,52rem)}
      </style>
      <section class="preview-card">
        <div class="preview-head">
          <div>
            <h2>Live preview</h2>
            <p>The preview renders the currently edited Hero record.</p>
          </div>
          <div class="status">
            <span class="badge">${escapeHtml(record.theme || 'theme')}</span>
            <span>${navCount} nav item${navCount === 1 ? '' : 's'}</span>
            <span>${detailsCount} detail${detailsCount === 1 ? '' : 's'}</span>
          </div>
        </div>
        <div class="shell">
          <uib-hero
            eyebrow="${escapeHtml(record.eyebrow)}"
            headline="${escapeHtml(record.headline || 'Hero headline')}"
            subheadline="${escapeHtml(record.subheadline)}"
            action-components="${escapeHtml(actionsJson)}"
            visual-source="${escapeHtml(record.visual_source || 'none')}"
            visual-role="${escapeHtml(record.visual_role || 'image')}"
            visual-src="${escapeHtml(recordValue(record, 'visual_src', 'visualSrc'))}"
            visual-asset-id="${escapeHtml(recordValue(record, 'visual_asset_id', 'visualAssetId'))}"
            visual-alt="${escapeHtml(recordValue(record, 'visual_alt', 'visualAlt'))}"
            visual-mode="${escapeHtml(visualMode)}"
            visual-position="${escapeHtml(visualPositionForMode(visualMode))}"
            layout-opacity="${escapeHtml(record.layout_opacity || '0.8')}"
            trust-signal="${escapeHtml(record.trust_signal)}"
            nav-items="${escapeHtml(navItems)}"
            details="${escapeHtml(details)}"
            asset-map="${escapeHtml(assetMap)}"
            theme="${escapeHtml(record.theme || 'organization')}"
            size="${escapeHtml(record.size || 'large')}"
            brand-label="${escapeHtml(brandLabel)}"
            brand-mark="${escapeHtml(brandMark)}"
          >
            ${slotMarkup(record, 'navigation', 'navigation_slot_mode', 'navigation_slot')}
            ${slotMarkup(record, 'visual', 'visual_slot_mode', 'visual_slot')}
            ${slotMarkup(record, 'trust', 'trust_slot_mode', 'trust_slot')}
            ${slotMarkup(record, 'after-content', 'after_content_slot_mode', 'after_content_slot')}
          </uib-hero>
        </div>
      </section>
    `;
  }
}

registerHeroElement('uib-hero-preview', UibHeroPreview);
