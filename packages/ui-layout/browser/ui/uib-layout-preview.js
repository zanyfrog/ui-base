                                                          
import { BaseHTMLElement, attr, dispatch, escapeHtml } from './dom-utils.js';

export class UibLayoutPreview extends BaseHTMLElement {
          internalNodes               = [];
          internalSelectedNodeId = '';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set nodes(value              ) {
    this.internalNodes = Array.isArray(value) ? value : [];
    this.render();
  }

  get nodes()               {
    return this.internalNodes;
  }

  set selectedNodeId(value        ) {
    this.internalSelectedNodeId = value || '';
    this.render();
  }

  get selectedNodeId()         {
    return this.internalSelectedNodeId;
  }

  connectedCallback() {
    this.render();
  }

          bind() {
    this.shadowRoot?.querySelectorAll                   ('[data-node-id]').forEach((button) => {
      button.addEventListener('click', () => {
        dispatch(this, 'uib-layout-node-selected', { nodeId: button.dataset.nodeId });
        dispatch(this, 'ui-layout-node-selected', { nodeId: button.dataset.nodeId });
      });
    });
  }

          renderNode(node            )         {
    if (node.kind === 'text') {
      return `<button type="button" class="text ${node.id === this.selectedNodeId ? 'selected' : ''}" data-node-id="${attr(node.id)}">${escapeHtml(node.text || node.label)}</button>`;
    }
    if (node.kind === 'dynamic') {
      return `<button type="button" class="dynamic ${node.id === this.selectedNodeId ? 'selected' : ''}" data-node-id="${attr(node.id)}">${escapeHtml(node.label)}</button>`;
    }
    const tag = node.tagName || node.kind;
    return `
      <button type="button" class="box ${node.id === this.selectedNodeId ? 'selected' : ''} ${node.editable ? '' : 'readonly'}" data-node-id="${attr(node.id)}">
        <span class="tag">${escapeHtml(tag)}</span>
        ${node.classList.length ? `<span class="classes">${escapeHtml(node.classList.slice(0, 4).join(' '))}</span>` : ''}
        <span class="children">${node.children.map((child) => this.renderNode(child)).join('')}</span>
      </button>
    `;
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;min-width:0;color:#172033;font:14px/1.4 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .surface{display:grid;gap:.65rem;align-content:start;min-height:28rem;padding:1rem;background:#f7f9fc;border:1px solid #d9e2ee;border-radius:8px;overflow:auto}
        button{font:inherit;color:inherit;text-align:left}
        .box{display:grid;gap:.45rem;width:100%;min-height:2.7rem;padding:.7rem;border:1px solid #9db6d6;border-radius:6px;background:#fff;cursor:pointer}
        .box:hover,.text:hover,.dynamic:hover{border-color:#245ea8}
        .box.selected,.text.selected,.dynamic.selected{outline:3px solid rgba(36,94,168,.2);border-color:#245ea8}
        .box.readonly{border-style:dashed;background:#fbfcfe}
        .tag{font-weight:800;color:#245ea8}
        .classes{color:#52677f;font-size:.82rem;word-break:break-word}
        .children{display:grid;gap:.45rem}
        .text,.dynamic{display:block;width:100%;padding:.45rem .55rem;border:1px solid #cdd8e7;border-radius:6px;background:#fff;cursor:pointer}
        .dynamic{border-style:dashed;background:#fff8e8;color:#6f5418}
        .empty{margin:0;color:#63748a}
      </style>
      <div class="surface">
        ${this.nodes.length ? this.nodes.map((node) => this.renderNode(node)).join('') : '<p class="empty">No preview content.</p>'}
      </div>
    `;
    this.bind();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('uib-layout-preview')) customElements.define('uib-layout-preview', UibLayoutPreview);
