import { analyzeComponentSource } from '../analyzer/analyze-component.js';
import { flattenLayoutNodes } from '../analyzer/map-dom-to-source.js';
                                                                                      
                                                          
                                                                    
import { applyLayoutOperationsToSource,                  } from '../writer/apply-layout-operations.js';
import { BaseHTMLElement, attr, dispatch, escapeHtml, parseJson } from './dom-utils.js';
import './uib-layout-diff.js';
import './uib-layout-preview.js';
import './uib-layout-properties.js';
import './uib-layout-toolbar.js';
import './uib-layout-tree.js';

export class UibLayoutManager extends BaseHTMLElement {
  static get observedAttributes() {
    return ['source', 'file-name', 'readonly'];
  }

          internalSourceText = '';
          internalFileName = '';
          internalFileAttributes                          = {};
          internalAnalysis                        = null;
          internalOperations                    = [];
          internalSelectedNodeId = '';
          internalPatchResult                     = null;
          operationSequence = 0;
          shellEventsBound = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(name        , oldValue               , newValue               ) {
    if (oldValue === newValue) return;
    if (name === 'source') this.sourceText = newValue ?? '';
    if (name === 'file-name') this.fileName = newValue ?? '';
    if (name === 'readonly') this.render();
  }

  connectedCallback() {
    if (!this.internalSourceText && this.hasAttribute('source')) this.internalSourceText = this.getAttribute('source') ?? '';
    if (!this.internalFileName && this.hasAttribute('file-name')) this.internalFileName = this.getAttribute('file-name') ?? '';
    this.analyze();
  }

  set sourceText(value        ) {
    this.internalSourceText = String(value ?? '');
    this.clearPendingState();
    this.analyze();
  }

  get sourceText()         {
    return this.internalSourceText;
  }

  set fileName(value        ) {
    this.internalFileName = String(value ?? '');
    this.analyze();
  }

  get fileName()         {
    return this.internalFileName;
  }

  set fileAttributes(value                         ) {
    this.internalFileAttributes = value && typeof value === 'object' ? value : {};
    this.analyze();
  }

  get fileAttributes()                          {
    return this.internalFileAttributes;
  }

  set analysis(value                       ) {
    this.internalAnalysis = value;
    this.render();
  }

  get analysis()                        {
    return this.internalAnalysis;
  }

  set operations(value                   ) {
    this.internalOperations = Array.isArray(value) ? value : [];
    this.internalPatchResult = null;
    this.render();
    this.emitDirtyChanged();
  }

  get operations()                    {
    return this.internalOperations;
  }

  get readonly()          {
    return this.hasAttribute('readonly');
  }

  set readonly(value         ) {
    if (value) this.setAttribute('readonly', '');
    else this.removeAttribute('readonly');
  }

  analyze() {
    const input                     = {
      sourceText: this.sourceText,
      fileName: this.fileName,
      fileAttributes: this.fileAttributes,
    };
    this.internalAnalysis = analyzeComponentSource(input);
    this.internalSelectedNodeId = this.firstSelectableNode(this.internalAnalysis.rootNodes)?.id ?? '';
    this.internalPatchResult = null;
    this.render();
    dispatch(this, 'uib-layout-analysis-changed', { analysis: this.internalAnalysis });
    dispatch(this, 'ui-layout-analysis-changed', { analysis: this.internalAnalysis });
  }

          clearPendingState() {
    this.internalOperations = [];
    this.internalSelectedNodeId = '';
    this.internalPatchResult = null;
    this.emitDirtyChanged();
  }

          selectedNode()                    {
    if (!this.analysis) return null;
    return flattenLayoutNodes(this.analysis.rootNodes).get(this.internalSelectedNodeId) ?? null;
  }

          firstSelectableNode(nodes              )                    {
    for (const node of nodes) {
      if (node.kind !== 'fragment') return node;
      const child = this.firstSelectableNode(node.children);
      if (child) return child;
    }
    return null;
  }

          addOperation(operation                 ) {
    this.internalOperations = [...this.internalOperations, operation];
    this.internalPatchResult = null;
    this.render();
    dispatch(this, 'uib-layout-operations-changed', this.dirtyDetail());
    dispatch(this, 'ui-layout-operations-changed', this.dirtyDetail());
    this.emitDirtyChanged();
  }

          dirtyDetail() {
    return {
      dirty: this.operations.length > 0,
      fileName: this.fileName,
      fileAttributes: this.fileAttributes,
      operations: this.operations,
      changedNodeIds: [...new Set(this.operations.map((operation) => operation.nodeId))],
    };
  }

          emitDirtyChanged() {
    const detail = this.dirtyDetail();
    dispatch(this, 'uib-layout-dirty-changed', detail);
    dispatch(this, 'ui-layout-dirty-changed', detail);
  }

          createPatchResult()              {
    this.internalPatchResult = applyLayoutOperationsToSource(this.sourceText, this.operations, {
      fileName: this.fileName,
      analysis: this.analysis ?? undefined,
    });
    return this.internalPatchResult;
  }

          requestSave() {
    if (this.readonly) return;
    const result = this.createPatchResult();
    dispatch(this, 'uib-layout-save-requested', {
      ...result,
      fileName: this.fileName,
      fileAttributes: this.fileAttributes,
      operations: this.operations,
    });
    dispatch(this, 'ui-layout-save-requested', {
      ...result,
      fileName: this.fileName,
      fileAttributes: this.fileAttributes,
      operations: this.operations,
    });
    this.render();
  }

          requestDiff() {
    const result = this.createPatchResult();
    dispatch(this, 'uib-layout-diff-requested', { ...result, operations: this.operations });
    dispatch(this, 'ui-layout-diff-requested', { ...result, operations: this.operations });
    this.render();
  }

          revert() {
    this.internalOperations = [];
    this.internalPatchResult = null;
    this.render();
    dispatch(this, 'uib-layout-revert-requested', this.dirtyDetail());
    dispatch(this, 'ui-layout-revert-requested', this.dirtyDetail());
    this.emitDirtyChanged();
  }

          bind() {
    if (!this.shadowRoot) return;
    if (this.shellEventsBound) return;
    this.shellEventsBound = true;
    this.shadowRoot.addEventListener('uib-layout-node-selected', (event) => {
      const detail = (event                                    ).detail;
      if (!detail?.nodeId) return;
      this.internalSelectedNodeId = detail.nodeId;
      this.render();
      const node = this.selectedNode();
      dispatch(this, 'uib-layout-node-selected', { nodeId: detail.nodeId, node });
      dispatch(this, 'ui-layout-node-selected', { nodeId: detail.nodeId, node });
      event.stopPropagation();
    });
    this.shadowRoot.addEventListener('uib-layout-operation-added', (event) => {
      const detail = (event                                                ).detail;
      if (detail?.operation) this.addOperation(detail.operation);
      event.stopPropagation();
    });
    this.shadowRoot.addEventListener('uib-layout-node-move-requested', (event) => {
      const detail = (event                                                                                           ).detail;
      event.stopPropagation();
      const operation = this.moveOperationForDrop(detail);
      if (operation) this.addOperation(operation);
    });
    this.shadowRoot.addEventListener('uib-layout-node-keyboard-move-requested', (event) => {
      const detail = (event                                                               ).detail;
      event.stopPropagation();
      const operation = this.moveOperationForKeyboard(detail);
      if (operation) this.addOperation(operation);
    });
    this.shadowRoot.addEventListener('uib-layout-analyze-requested', (event) => {
      event.stopPropagation();
      this.analyze();
    });
    this.shadowRoot.addEventListener('uib-layout-diff-requested', (event) => {
      event.stopPropagation();
      this.requestDiff();
    });
    this.shadowRoot.addEventListener('uib-layout-save-requested', (event) => {
      event.stopPropagation();
      this.requestSave();
    });
    this.shadowRoot.addEventListener('uib-layout-revert-requested', (event) => {
      event.stopPropagation();
      this.revert();
    });
  }

          moveOperationForDrop(detail                                                                            )                         {
    if (!this.analysis || !detail.nodeId || !detail.targetNodeId) return null;
    const indexed = this.indexNodes(this.analysis.rootNodes);
    const moving = indexed.get(detail.nodeId);
    const target = indexed.get(detail.targetNodeId);
    if (!moving || !target || !moving.parent || !target.parent || moving.parent.id !== target.parent.id) {
      this.warn('Move blocked. Only static sibling nodes within the same parent can be moved.');
      return null;
    }
    if (!this.isMovable(moving.node) || !this.isMovable(target.node)) {
      this.warn('Move blocked. Dynamic and read-only nodes cannot be moved.');
      return null;
    }
    const siblings = target.parent.children.filter((node) => this.isMovable(node));
    const targetIndex = siblings.findIndex((node) => node.id === target.node.id);
    if (targetIndex < 0) return null;
    return {
      id: this.nextOperationId(),
      type: 'move-node',
      nodeId: moving.node.id,
      newParentNodeId: target.parent.id,
      newIndex: detail.placement === 'after' ? targetIndex + 1 : targetIndex,
    };
  }

          moveOperationForKeyboard(detail                                                )                         {
    if (!this.analysis || !detail.nodeId || !detail.direction) return null;
    const indexed = this.indexNodes(this.analysis.rootNodes);
    const moving = indexed.get(detail.nodeId);
    if (!moving?.parent || !this.isMovable(moving.node)) {
      this.warn('Move blocked. Select a static editable layout node first.');
      return null;
    }
    const siblings = moving.parent.children.filter((node) => this.isMovable(node));
    const index = siblings.findIndex((node) => node.id === moving.node.id);
    if (index < 0) return null;
    const newIndex = detail.direction === 'up' ? index - 1 : index + 2;
    if (newIndex < 0 || newIndex > siblings.length) {
      this.warn('Move blocked. The selected item is already at the edge of its group.');
      return null;
    }
    return {
      id: this.nextOperationId(),
      type: 'move-node',
      nodeId: moving.node.id,
      newParentNodeId: moving.parent.id,
      newIndex,
    };
  }

          indexNodes(nodes              , parent                    = null, map = new Map                                                         ())                                                               {
    for (const node of nodes) {
      map.set(node.id, { node, parent });
      this.indexNodes(node.children, node, map);
    }
    return map;
  }

          isMovable(node            )          {
    return node.editable && node.kind !== 'dynamic' && node.kind !== 'fragment';
  }

          nextOperationId()         {
    this.operationSequence += 1;
    return `op_${Date.now()}_${this.operationSequence}`;
  }

          warn(message        ) {
    dispatch(this, 'uib-layout-warning', { message });
    dispatch(this, 'ui-layout-warning', { message });
  }

          syncChildren() {
    if (!this.shadowRoot || !this.analysis) return;
    const tree = this.shadowRoot.querySelector('uib-layout-tree')                                                                 ;
    const preview = this.shadowRoot.querySelector('uib-layout-preview')                                                                 ;
    const properties = this.shadowRoot.querySelector('uib-layout-properties')                                                                ;
    const diff = this.shadowRoot.querySelector('uib-layout-diff')                                                          ;
    if (tree) {
      tree.nodes = this.analysis.rootNodes;
      tree.selectedNodeId = this.internalSelectedNodeId;
    }
    if (preview) {
      preview.nodes = this.analysis.rootNodes;
      preview.selectedNodeId = this.internalSelectedNodeId;
    }
    if (properties) {
      properties.node = this.selectedNode();
      properties.readonly = this.readonly;
    }
    if (diff) {
      diff.diffText = this.internalPatchResult?.diffText ?? '';
      diff.warnings = [...(this.analysis?.warnings ?? []), ...(this.internalPatchResult?.warnings ?? [])];
    }
  }

  render() {
    if (!this.shadowRoot) return;
    const analysis = this.analysis;
    const sourceLength = this.sourceText.length;
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;color:#172033;font:14px/1.4 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        *,*::before,*::after{box-sizing:border-box}
        .shell{display:grid;gap:.8rem;min-width:0}
        .grid{display:grid;grid-template-columns:minmax(14rem,1fr) minmax(20rem,2fr) minmax(16rem,1fr);gap:.8rem;align-items:start}
        .panel{min-width:0;display:grid;gap:.6rem;padding:.8rem;border:1px solid #d9e2ee;border-radius:8px;background:#fff}
        h2{margin:0;font-size:.95rem;color:#203b5e}
        .summary{display:flex;gap:.75rem;flex-wrap:wrap;color:#52677f;font-size:.86rem}
        @media(max-width:980px){.grid{grid-template-columns:1fr}.panel{padding:.7rem}}
      </style>
      <div class="shell">
        <uib-layout-toolbar file-name="${attr(this.fileName || 'Source content')}" dirty="${this.operations.length > 0 ? 'true' : 'false'}" ${this.readonly ? 'readonly' : ''}></uib-layout-toolbar>
        <div class="summary">
          <span>${escapeHtml(analysis?.framework ?? 'unknown')}</span>
          <span>${escapeHtml(analysis?.componentName || analysis?.customElementName || 'layout source')}</span>
          <span>${sourceLength} characters</span>
          <span>${this.operations.length} pending operation${this.operations.length === 1 ? '' : 's'}</span>
        </div>
        <div class="grid">
          <section class="panel">
            <h2>Layout Tree</h2>
            <uib-layout-tree></uib-layout-tree>
          </section>
          <section class="panel">
            <h2>Visual Preview</h2>
            <uib-layout-preview></uib-layout-preview>
          </section>
          <section class="panel">
            <uib-layout-properties></uib-layout-properties>
          </section>
        </div>
        <section class="panel">
          <h2>Diff / Warnings</h2>
          <uib-layout-diff></uib-layout-diff>
        </section>
      </div>
    `;
    this.syncChildren();
    this.bind();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('uib-layout-manager')) customElements.define('uib-layout-manager', UibLayoutManager);

                
                                   
                                           
   
 
