                                                          
import { BaseHTMLElement, attr, dispatch, escapeHtml } from './dom-utils.js';

export class UibLayoutTree extends BaseHTMLElement {
          internalNodes               = [];
          internalSelectedNodeId = '';
          draggedNodeId = '';

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
      button.addEventListener('dragstart', (event) => {
        this.draggedNodeId = button.dataset.nodeId ?? '';
        event.dataTransfer?.setData('text/plain', this.draggedNodeId);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      });
      button.addEventListener('dragover', (event) => {
        if (!this.draggedNodeId || this.draggedNodeId === button.dataset.nodeId) return;
        event.preventDefault();
        const rect = button.getBoundingClientRect();
        const after = event.clientY > rect.top + rect.height / 2;
        button.classList.toggle('drop-before', !after);
        button.classList.toggle('drop-after', after);
      });
      button.addEventListener('dragleave', () => {
        button.classList.remove('drop-before', 'drop-after');
      });
      button.addEventListener('drop', (event) => {
        event.preventDefault();
        const nodeId = event.dataTransfer?.getData('text/plain') || this.draggedNodeId;
        const targetNodeId = button.dataset.nodeId ?? '';
        const rect = button.getBoundingClientRect();
        const placement = event.clientY > rect.top + rect.height / 2 ? 'after' : 'before';
        this.clearDropState();
        if (!nodeId || !targetNodeId || nodeId === targetNodeId) return;
        dispatch(this, 'uib-layout-node-move-requested', { nodeId, targetNodeId, placement });
        dispatch(this, 'ui-layout-node-move-requested', { nodeId, targetNodeId, placement });
      });
      button.addEventListener('dragend', () => {
        this.draggedNodeId = '';
        this.clearDropState();
      });
      button.addEventListener('keydown', (event) => {
        const keyboardEvent = event                 ;
        if (!keyboardEvent.altKey || !['ArrowUp', 'ArrowDown'].includes(keyboardEvent.key)) return;
        keyboardEvent.preventDefault();
        dispatch(this, 'uib-layout-node-keyboard-move-requested', {
          nodeId: button.dataset.nodeId,
          direction: keyboardEvent.key === 'ArrowUp' ? 'up' : 'down',
        });
        dispatch(this, 'ui-layout-node-keyboard-move-requested', {
          nodeId: button.dataset.nodeId,
          direction: keyboardEvent.key === 'ArrowUp' ? 'up' : 'down',
        });
      });
    });
  }

          clearDropState() {
    this.shadowRoot?.querySelectorAll('.drop-before,.drop-after').forEach((node) => node.classList.remove('drop-before', 'drop-after'));
  }

          renderNode(node            , depth = 0)         {
    const readonly = !node.editable;
    const selected = node.id === this.selectedNodeId;
    const summary = node.classList.length ? `.${node.classList.slice(0, 3).join('.')}` : '';
    return (
  `<li>` +
  `<button type="button" draggable="` +
  (node.editable && node.kind !== 'dynamic' && node.kind !== 'fragment' ? 'true' : 'false') +
  `" data-node-id="` +
  (attr(node.id)) +
  `" class="` +
  (selected ? 'selected' : '') +
  `" style="--depth:` +
  (depth) +
  `">` +
  `<span class="kind">` +
  (escapeHtml(node.kind)) +
  `</span>` +
  `<span class="label">` +
  (escapeHtml(node.tagName || node.label)) +
  (escapeHtml(summary)) +
  `</span>` +
  ` ` +
  (readonly ? '<span class="readonly" title="Read-only">locked</span>' : '') +
  ` ` +
  `</button>` +
  ` ` +
  (node.children.length ? `<ul>${node.children.map((child) => this.renderNode(child, depth + 1)).join('')}</ul>` : '') +
  ` ` +
  `</li>`
);
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` :host{display:block;min-width:0;color:var(--uib-layout-ink,#172033);font:14px/1.4 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif} ul{list-style:none;margin:0;padding:0} button{width:100%;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.45rem;padding:.45rem .5rem .45rem calc(.5rem + var(--depth,0) * .85rem);border:0;border-radius:6px;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer} button:hover{background:#eef4fb} button.selected{background:#dfefff;box-shadow:inset 3px 0 0 #245ea8} button.drop-before{box-shadow:inset 0 3px 0 #245ea8} button.drop-after{box-shadow:inset 0 -3px 0 #245ea8} .kind{padding:.08rem .3rem;border:1px solid #c9d5e5;border-radius:999px;color:#47627f;font-size:.72rem;text-transform:uppercase;white-space:nowrap} .label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .readonly{color:#7b8797;font-size:.72rem;text-transform:uppercase} ` +
  `</style>` +
  `<ul>` +
  (this.nodes.length ? this.nodes.map((node) => this.renderNode(node)).join('') : '<li class="empty">No layout nodes.</li>') +
  `</ul>`
);
    this.bind();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('uib-layout-tree')) customElements.define('uib-layout-tree', UibLayoutTree);
