                                                          
                                                                    
import { BaseHTMLElement, attr, dispatch, escapeHtml } from './dom-utils.js';

let operationSequence = 0;

export class UibLayoutProperties extends BaseHTMLElement {
          internalNode                    = null;
          internalReadonly = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set node(value                   ) {
    this.internalNode = value;
    this.render();
  }

  get node()                    {
    return this.internalNode;
  }

  set readonly(value         ) {
    this.internalReadonly = Boolean(value);
    this.render();
  }

  get readonly()          {
    return this.internalReadonly;
  }

  connectedCallback() {
    this.render();
  }

          bind() {
    const node = this.node;
    if (!node || this.readonly || !node.editable) return;
    this.shadowRoot?.querySelector                   ('[data-apply-classes]')?.addEventListener('click', () => {
      const value = this.shadowRoot?.querySelector                  ('[data-classes]')?.value ?? '';
      const nextClasses = value.split(/\s+/).filter(Boolean);
      const operations                    = [
        ...node.classList.filter((className) => !nextClasses.includes(className)).map((className) => this.createOperation(node.id, 'remove-class', { className })),
        ...nextClasses.filter((className) => !node.classList.includes(className)).map((className) => this.createOperation(node.id, 'add-class', { className })),
      ];
      this.emitOperations(operations);
    });

    this.shadowRoot?.querySelector                   ('[data-apply-attribute]')?.addEventListener('click', () => {
      const name = this.shadowRoot?.querySelector                  ('[data-attribute-name]')?.value ?? '';
      const value = this.shadowRoot?.querySelector                  ('[data-attribute-value]')?.value ?? '';
      if (name.trim()) this.emitOperations([this.createOperation(node.id, 'set-attribute', { name: name.trim(), value })]);
    });

    this.shadowRoot?.querySelectorAll                   ('[data-update-attribute]').forEach((button) => {
      button.addEventListener('click', () => {
        const originalName = button.dataset.updateAttribute ?? '';
        const row = button.closest             ('[data-attribute-row]');
        const name = row?.querySelector                  ('[data-existing-attribute-name]')?.value.trim() ?? originalName;
        const value = row?.querySelector                  ('[data-existing-attribute-value]')?.value ?? '';
        if (!name) return;
        const operations                    = [];
        if (name !== originalName) operations.push(this.createOperation(node.id, 'remove-attribute', { name: originalName }));
        operations.push(this.createOperation(node.id, 'set-attribute', { name, value }));
        this.emitOperations(operations);
      });
    });

    this.shadowRoot?.querySelectorAll                   ('[data-remove-attribute]').forEach((button) => {
      button.addEventListener('click', () => {
        const name = button.dataset.removeAttribute ?? '';
        if (name) this.emitOperations([this.createOperation(node.id, 'remove-attribute', { name })]);
      });
    });

    this.shadowRoot?.querySelector                   ('[data-apply-text]')?.addEventListener('click', () => {
      const value = this.shadowRoot?.querySelector                     ('[data-text]')?.value ?? '';
      this.emitOperations([this.createOperation(node.id, 'set-text', { value })]);
    });
  }

          createOperation(nodeId        , type                         , extra                         )                  {
    return {
      id: `op_${Date.now()}_${++operationSequence}`,
      nodeId,
      type,
      ...extra,
    }                   ;
  }

          emitOperations(operations                   ) {
    for (const operation of operations) {
      dispatch(this, 'uib-layout-operation-added', { operation });
      dispatch(this, 'ui-layout-operation-added', { operation });
    }
  }

  render() {
    if (!this.shadowRoot) return;
    const node = this.node;
    const locked = !node || this.readonly || !node.editable;
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` :host{display:block;color:#172033;font:14px/1.4 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif} .panel{display:grid;gap:1rem} h3{margin:0;font-size:1rem;color:#203b5e} .meta{display:grid;gap:.35rem;padding:.7rem;border:1px solid #d9e2ee;border-radius:8px;background:#f8fafd} label{display:grid;gap:.35rem;color:#40546d;font-weight:700} input,textarea{width:100%;min-width:0;border:1px solid #bdcbdd;border-radius:6px;padding:.5rem;font:inherit;color:#172033;background:#fff} textarea{min-height:5rem;resize:vertical} button{min-height:2.25rem;border:1px solid #245ea8;border-radius:6px;background:#245ea8;color:#fff;font:inherit;font-weight:800;cursor:pointer} button:disabled{opacity:.55;cursor:not-allowed} .readonly{margin:0;color:#6d7888} .attrs{display:grid;gap:.45rem;margin:0;padding:0;list-style:none;color:#52677f} .attr-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr) auto auto;gap:.35rem;align-items:end} .secondary{border-color:#bdcbdd;background:#fff;color:#203b5e} .danger{border-color:#ad3138;background:#ad3138;color:#fff} code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.86rem} @media(max-width:560px){.attr-row{grid-template-columns:1fr}.attr-row button{width:100%}} ` +
  `</style>` +
  `<div class="panel">` +
  `<h3>` +
  `Properties` +
  `</h3>` +
  ` ` +
  (node ? `
          <div class="meta">
            <strong>${escapeHtml(node.label)}</strong>
            <span>${escapeHtml(node.kind)}${node.tagName ? ` / ${escapeHtml(node.tagName)}` : ''}</span>
            ${node.warnings.length ? `<p class="readonly">${escapeHtml(node.warnings.join(' '))}</p>` : ''}
          </div>
          ${node.kind === 'element' || node.kind === 'component' ? `
            <label>Classes
              <input data-classes value="${attr(node.classList.join(' '))}" ${locked ? 'disabled' : ''}>
            </label>
            <button type="button" data-apply-classes ${locked ? 'disabled' : ''}>Apply classes</button>
            <label>Attribute name
              <input data-attribute-name placeholder="data-layout-role" ${locked ? 'disabled' : ''}>
            </label>
            <label>Attribute value
              <input data-attribute-value placeholder="panel" ${locked ? 'disabled' : ''}>
            </label>
            <button type="button" data-apply-attribute ${locked ? 'disabled' : ''}>Set attribute</button>
            <ul class="attrs">${Object.entries(node.attributes).map(([name, value]) => `
              <li class="attr-row" data-attribute-row>
                <label>Attr
                  <input data-existing-attribute-name value="${attr(name)}" ${locked ? 'disabled' : ''}>
                </label>
                <label>Value
                  <input data-existing-attribute-value value="${attr(value)}" ${locked ? 'disabled' : ''}>
                </label>
                <button class="secondary" type="button" data-update-attribute="${attr(name)}" ${locked ? 'disabled' : ''}>Update</button>
                <button class="danger" type="button" data-remove-attribute="${attr(name)}" ${locked ? 'disabled' : ''}>Remove</button>
              </li>
            `).join('')}</ul>
          ` : ''}
          ${node.kind === 'text' ? `
            <label>Text
              <textarea data-text ${locked ? 'disabled' : ''}>${escapeHtml(node.text ?? '')}</textarea>
            </label>
            <button type="button" data-apply-text ${locked ? 'disabled' : ''}>Apply text</button>
          ` : ''}
          ${locked ? '<p class="readonly">This node is read-only in the current layout analysis.</p>' : ''}
        ` : '<p class="readonly">Select a node to edit its layout properties.</p>') +
  ` ` +
  `</div>`
);
    this.bind();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('uib-layout-properties')) customElements.define('uib-layout-properties', UibLayoutProperties);
