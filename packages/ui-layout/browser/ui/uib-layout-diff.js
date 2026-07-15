import { BaseHTMLElement, escapeHtml } from './dom-utils.js';

export class UibLayoutDiff extends BaseHTMLElement {
          internalDiffText = '';
          internalWarnings           = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set diffText(value        ) {
    this.internalDiffText = value || '';
    this.render();
  }

  get diffText()         {
    return this.internalDiffText;
  }

  set warnings(value          ) {
    this.internalWarnings = Array.isArray(value) ? value : [];
    this.render();
  }

  get warnings()           {
    return this.internalWarnings;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;color:#172033;font:13px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .wrap{display:grid;gap:.65rem}
        pre{min-height:5rem;max-height:16rem;margin:0;overflow:auto;padding:.75rem;border:1px solid #d9e2ee;border-radius:8px;background:#0f1724;color:#dbeafe;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap}
        .warnings{display:grid;gap:.25rem;margin:0;padding:.65rem .8rem;border:1px solid #eed097;border-radius:8px;background:#fff8e8;color:#654b12}
      </style>
      <div class="wrap">
        ${this.warnings.length ? `<div class="warnings">${this.warnings.map((warning) => `<div>${escapeHtml(warning)}</div>`).join('')}</div>` : ''}
        <pre>${escapeHtml(this.diffText || 'No diff generated yet.')}</pre>
      </div>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('uib-layout-diff')) customElements.define('uib-layout-diff', UibLayoutDiff);
