import { BaseHTMLElement, defineLayoutElement, dispatch, escapeHtml } from './dom-utils.js';

export class UibLayoutToolbar extends BaseHTMLElement {
  static get observedAttributes() {
    return ['file-name', 'dirty', 'readonly'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

          bind() {
    this.shadowRoot?.querySelector('[data-analyze]')?.addEventListener('click', () => dispatch(this, 'uib-layout-analyze-requested'));
    this.shadowRoot?.querySelector('[data-diff]')?.addEventListener('click', () => dispatch(this, 'uib-layout-diff-requested'));
    this.shadowRoot?.querySelector('[data-save]')?.addEventListener('click', () => dispatch(this, 'uib-layout-save-requested'));
    this.shadowRoot?.querySelector('[data-revert]')?.addEventListener('click', () => dispatch(this, 'uib-layout-revert-requested'));
  }

  render() {
    if (!this.shadowRoot) return;
    const fileName = this.getAttribute('file-name') || 'Untitled source';
    const dirty = this.getAttribute('dirty') === 'true';
    const readonly = this.hasAttribute('readonly');
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;color:#172033;font:14px/1.4 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .bar{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.75rem 1rem;border:1px solid #d9e2ee;border-radius:8px;background:#fff}
        .title{min-width:0;display:grid;gap:.1rem}
        strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#203b5e}
        span{color:${dirty ? '#875b09' : '#52677f'};font-size:.84rem}
        .actions{display:flex;gap:.5rem;flex-wrap:wrap;justify-content:flex-end}
        button{min-height:2.25rem;border:1px solid #bdcbdd;border-radius:6px;background:#fff;color:#203b5e;font:inherit;font-weight:800;cursor:pointer}
        button.primary{border-color:#245ea8;background:#245ea8;color:#fff}
        button:disabled{opacity:.55;cursor:not-allowed}
      </style>
      <div class="bar" part="bar">
        <div class="title" part="title">
          <strong>${escapeHtml(fileName)}</strong>
          <span>${dirty ? 'Changed' : 'Clean'}${readonly ? ' / read-only' : ''}</span>
        </div>
        <div class="actions" part="actions">
          <button part="button" type="button" data-analyze>Analyze</button>
          <button part="button" type="button" data-diff>Diff</button>
          <button part="button" type="button" data-revert ${dirty ? '' : 'disabled'}>Revert</button>
          <button part="button primary-button" type="button" class="primary" data-save ${dirty && !readonly ? '' : 'disabled'}>Save request</button>
        </div>
      </div>
    `;
    this.bind();
  }
}

defineLayoutElement('uib-layout-toolbar', UibLayoutToolbar);
