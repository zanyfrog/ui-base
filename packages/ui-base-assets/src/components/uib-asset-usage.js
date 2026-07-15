import { baseAssetStyles, escapeHtml, humanize, registerElement } from '../asset-core.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetUsage extends BaseHTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._usage = [];
  }

  set usage(value) { this._usage = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get usage() { return this._usage; }
  connectedCallback() { this.render(); }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${baseAssetStyles}
        .usage { display: grid; gap: 0.4rem; padding: 0.75rem; border: 1px solid var(--uib-assets-border); border-radius: 0.85rem; background: var(--uib-assets-surface); }
        .usage + .usage { margin-top: 0.55rem; }
      </style>
      <section aria-label="Asset usage">
        ${this._usage.length ? this._usage.map((usage) => `
          <article class="usage">
            <div class="row-between">
              <strong>${escapeHtml(usage.label || 'Usage')}</strong>
              <span class="badge strong">${escapeHtml(humanize(usage.entityType || usage.entity_type || 'other'))}</span>
            </div>
            <div class="small muted">${escapeHtml(usage.applicationName || usage.application_name || usage.applicationId || usage.application_id || 'Restricted or unknown application')}</div>
          </article>
        `).join('') : '<div class="empty-state">No usage records returned, or usage is restricted.</div>'}
      </section>
    `;
  }
}

registerElement('uib-asset-usage', UibAssetUsage);
