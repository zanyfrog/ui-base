import { createPageImportArtifact, type PageExtractionResult, type PageImportArtifact, type PageImportItem, type PageImportItemKind, type PageImportTreeNode } from '../model/page-import-artifact.js';
import { createMockPageExtractionResult } from '../page-importer/mock-extraction.js';
import { BaseHTMLElement, attr, defineLayoutElement, dispatch, escapeHtml } from './dom-utils.js';

type PageImporterTab = 'source' | 'items' | 'preview' | 'assets' | 'database' | 'tree' | 'logs' | 'artifact';

const STORAGE_DB = 'uib-page-importer';
const STORAGE_STORE = 'drafts';

const TABS: Array<{ id: PageImporterTab; label: string }> = [
  { id: 'source', label: 'Source' },
  { id: 'items', label: 'Extracted Items' },
  { id: 'preview', label: 'Preview' },
  { id: 'database', label: 'Database' },
  { id: 'assets', label: 'Assets' },
  { id: 'tree', label: 'Tree' },
  { id: 'logs', label: 'Logs' },
  { id: 'artifact', label: 'Artifact JSON' },
];

export class UibPageImporter extends BaseHTMLElement {
  static get observedAttributes() {
    return ['service-url'];
  }

  private artifact: PageImportArtifact | null = null;
  private activeTab: PageImporterTab = 'source';
  private sourceUrl = 'https://example.local/customer-intake';
  private statusMessage = 'Load the mock extraction to begin.';
  private importing = false;
  private searchQuery = '';
  private showHidden = false;
  private selectedItemId = '';
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    void this.loadDraft();
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
  }

  private loadMockExtraction() {
    const extraction = createMockPageExtractionResult(this.sourceUrl);
    this.artifact = createPageImportArtifact({
      metadata: {
        sourceUrl: this.sourceUrl,
        projectName: 'Modernization Project',
        routePath: routeFromUrl(this.sourceUrl),
        pageName: titleFromUrl(this.sourceUrl),
      },
      extraction,
    });
    this.statusMessage = 'Mock extraction loaded.';
    this.scheduleSave();
    this.render();
    dispatch(this, 'uib-page-importer-artifact-changed', { artifact: this.artifact });
  }

  private get serviceUrl(): string {
    return this.getAttribute('service-url') || 'http://localhost:4178';
  }

  private async importUrl() {
    if (this.importing) return;
    this.importing = true;
    this.statusMessage = `Loading web page ${this.sourceUrl}...`;
    if (this.artifact) this.artifact = appendArtifactLog(this.artifact, this.logEntry('info', `Started loading web page ${this.sourceUrl}.`));
    this.render();
    try {
      const response = await fetch(`${this.serviceUrl.replace(/\/+$/, '')}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: this.sourceUrl,
          waitUntil: 'domcontentloaded',
          delayMs: 1000,
        }),
      });
      const payload = await response.json() as { ok?: boolean; result?: PageExtractionResult; error?: string };
      if (!response.ok || !payload.ok || !payload.result) throw new Error(payload.error || `Import failed with ${response.status}.`);
      const finishedLog = this.logEntry('success', `Finished loading and parsing web page ${this.sourceUrl}.`);
      const artifact = createPageImportArtifact({
        metadata: {
          sourceUrl: this.sourceUrl,
          projectName: 'Modernization Project',
          routePath: routeFromUrl(this.sourceUrl),
          pageName: titleFromUrl(this.sourceUrl),
        },
        extraction: payload.result,
      });
      this.artifact = appendArtifactLog(artifact, finishedLog);
      this.statusMessage = `Imported ${this.artifact.items.length} items from ${this.sourceUrl}.`;
      this.scheduleSave();
      this.render();
      dispatch(this, 'uib-page-importer-artifact-changed', { artifact: this.artifact });
    } catch (error) {
      this.statusMessage = `Import failed: ${error instanceof Error ? error.message : String(error)}. Is @ui-base/page-import-service running?`;
      this.render();
    } finally {
      this.importing = false;
      this.render();
    }
  }

  private updateSource(kind: 'html' | 'css' | 'js', value: string) {
    if (!this.artifact) return;
    this.artifact = {
      ...this.artifact,
      metadata: { ...this.artifact.metadata, updatedAt: new Date().toISOString() },
      source: { ...this.artifact.source, [kind]: value },
      items: this.artifact.items.map((item) => item.database ? {
        ...item,
        database: { ...item.database, stale: true },
      } : item),
      logs: [
        ...this.artifact.logs,
        this.logEntry('info', `${kind.toUpperCase()} source edited. Database suggestions marked stale.`),
      ],
    };
    this.statusMessage = `${kind.toUpperCase()} source updated. Reclassify later to refresh suggestions.`;
    this.scheduleSave();
    this.render();
  }

  private updateItem(itemId: string, property: 'label' | 'value' | 'componentTag' | 'notes', value: string) {
    if (!this.artifact) return;
    this.artifact = {
      ...this.artifact,
      metadata: { ...this.artifact.metadata, updatedAt: new Date().toISOString() },
      items: this.artifact.items.map((item) => item.id === itemId ? { ...item, [property]: value } : item),
      logs: [...this.artifact.logs, this.logEntry('info', `Updated ${property} on ${itemId}.`)],
    };
    this.statusMessage = 'Item updated.';
    this.scheduleSave();
    this.render();
  }

  private toggleHidden(itemId: string) {
    if (!this.artifact) return;
    this.artifact = {
      ...this.artifact,
      metadata: { ...this.artifact.metadata, updatedAt: new Date().toISOString() },
      items: this.artifact.items.map((item) => item.id === itemId ? { ...item, hidden: !item.hidden } : item),
      logs: [...this.artifact.logs, this.logEntry('info', `Toggled hidden state for ${itemId}.`)],
    };
    this.statusMessage = 'Hidden state updated.';
    this.scheduleSave();
    this.render();
  }

  private moveItem(itemId: string, direction: 'up' | 'down') {
    if (!this.artifact) return;
    const items = [...this.artifact.items];
    const index = items.findIndex((item) => item.id === itemId);
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;
    const [item] = items.splice(index, 1);
    items.splice(nextIndex, 0, item);
    const ordered = items.map((nextItem, orderIndex) => ({
      ...nextItem,
      position: {
        ...(nextItem.position || {}),
        order: orderIndex + 1,
      },
    }));
    this.artifact = {
      ...this.artifact,
      metadata: { ...this.artifact.metadata, updatedAt: new Date().toISOString() },
      items: ordered,
      logs: [...this.artifact.logs, this.logEntry('info', `Moved ${itemId} ${direction}.`)],
    };
    this.statusMessage = 'Item order updated.';
    this.scheduleSave();
    this.render();
  }

  private updateDatabase(itemId: string, property: 'fieldName' | 'type' | 'entityGuess', value: string) {
    if (!this.artifact) return;
    this.artifact = {
      ...this.artifact,
      metadata: { ...this.artifact.metadata, updatedAt: new Date().toISOString() },
      items: this.artifact.items.map((item) => {
        if (item.id !== itemId || !item.database) return item;
        return { ...item, database: { ...item.database, [property]: value, stale: false } };
      }),
      logs: [...this.artifact.logs, this.logEntry('info', `Updated database ${property} on ${itemId}.`)],
    };
    this.statusMessage = 'Database suggestion updated.';
    this.scheduleSave();
    this.render();
  }

  private addItem() {
    if (!this.artifact) return;
    const item: PageImportItem = {
      id: `item_manual_${Date.now()}`,
      kind: 'unknown',
      label: 'New item',
      value: '',
      componentTag: '',
      notes: 'Manual item',
      position: { order: this.artifact.items.length + 1 },
    };
    this.artifact = {
      ...this.artifact,
      metadata: { ...this.artifact.metadata, updatedAt: new Date().toISOString() },
      items: [...this.artifact.items, item],
      logs: [...this.artifact.logs, this.logEntry('info', 'Added manual item.')],
    };
    this.scheduleSave();
    this.render();
  }

  private exportArtifact() {
    if (!this.artifact) return;
    const blob = new Blob([`${JSON.stringify(this.artifact, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${sanitizeFileName(this.artifact.metadata.pageName)}-page-import-artifact.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.statusMessage = 'Artifact JSON exported.';
    this.render();
  }

  private importArtifact(file: File) {
    void file.text().then((content) => {
      const parsed = JSON.parse(content) as PageImportArtifact;
      this.artifact = parsed;
      this.statusMessage = `Imported ${parsed.metadata?.pageName || parsed.id}.`;
      this.scheduleSave();
      this.render();
    }).catch((error: unknown) => {
      this.statusMessage = `Import failed: ${error instanceof Error ? error.message : String(error)}`;
      this.render();
    });
  }

  private scheduleSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.saveDraft(), 250);
  }

  private async loadDraft() {
    try {
      const draft = await readDraft();
      if (!draft || this.artifact) return;
      this.artifact = draft;
      this.statusMessage = `Loaded saved draft for ${displayPageName(draft)}.`;
      this.render();
    } catch {
      this.statusMessage = 'IndexedDB draft storage is unavailable in this browser.';
      this.render();
    }
  }

  private async saveDraft() {
    if (!this.artifact) return;
    try {
      await writeDraft(this.artifact);
      this.statusMessage = `Draft saved locally at ${new Date().toLocaleTimeString()}.`;
    } catch {
      this.statusMessage = 'Could not save draft to IndexedDB.';
    }
    this.render();
  }

  private logEntry(level: 'info' | 'success' | 'warning' | 'error', message: string) {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
    };
  }

  private bind() {
    const root = this.shadowRoot;
    if (!root) return;
    root.querySelector<HTMLInputElement>('[data-url]')?.addEventListener('change', (event) => {
      this.sourceUrl = (event.currentTarget as HTMLInputElement).value;
      this.render();
    });
    root.querySelector('[data-load-mock]')?.addEventListener('click', () => this.loadMockExtraction());
    root.querySelector('[data-import-url]')?.addEventListener('click', () => void this.importUrl());
    root.querySelector('[data-export]')?.addEventListener('click', () => this.exportArtifact());
    root.querySelector('[data-add-item]')?.addEventListener('click', () => this.addItem());
    root.querySelector<HTMLInputElement>('[data-search]')?.addEventListener('input', (event) => {
      this.searchQuery = (event.currentTarget as HTMLInputElement).value;
      this.render();
    });
    root.querySelector<HTMLInputElement>('[data-show-hidden]')?.addEventListener('change', (event) => {
      this.showHidden = (event.currentTarget as HTMLInputElement).checked;
      this.render();
    });
    root.querySelector<HTMLInputElement>('[data-import]')?.addEventListener('change', (event) => {
      const file = (event.currentTarget as HTMLInputElement).files?.[0];
      if (file) this.importArtifact(file);
    });
    root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        this.activeTab = button.dataset.tab as PageImporterTab;
        this.render();
      });
    });
    root.querySelectorAll<HTMLTextAreaElement>('[data-source-kind]').forEach((field) => {
      field.addEventListener('change', () => this.updateSource(field.dataset.sourceKind as 'html' | 'css' | 'js', field.value));
    });
    root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-item-field]').forEach((field) => {
      field.addEventListener('change', () => this.updateItem(field.dataset.itemId || '', field.dataset.itemField as 'label' | 'value' | 'componentTag' | 'notes', field.value));
    });
    root.querySelectorAll<HTMLInputElement>('[data-db-field]').forEach((field) => {
      field.addEventListener('change', () => this.updateDatabase(field.dataset.itemId || '', field.dataset.dbField as 'fieldName' | 'type' | 'entityGuess', field.value));
    });
    root.querySelectorAll<HTMLButtonElement>('[data-toggle-hidden]').forEach((button) => {
      button.addEventListener('click', () => this.toggleHidden(button.dataset.itemId || ''));
    });
    root.querySelectorAll<HTMLButtonElement>('[data-move-item]').forEach((button) => {
      button.addEventListener('click', () => this.moveItem(button.dataset.itemId || '', button.dataset.moveItem as 'up' | 'down'));
    });
    root.querySelectorAll<HTMLButtonElement>('[data-select-item]').forEach((button) => {
      button.addEventListener('click', () => {
        this.selectedItemId = button.dataset.selectItem || '';
        this.render();
      });
    });
  }

  private renderSource() {
    if (!this.artifact) return emptyPanel('No source loaded yet.');
    return `
      <div class="source-grid">
        ${(['html', 'css', 'js'] as const).map((kind) => `
          <label class="source-box">
            <span>${kind.toUpperCase()}</span>
            <textarea data-source-kind="${kind}" spellcheck="false">${escapeHtml(this.artifact?.source[kind] ?? '')}</textarea>
          </label>
        `).join('')}
      </div>
    `;
  }

  private renderItems() {
    if (!this.artifact) return emptyPanel('No extracted items yet.');
    const items = this.visibleReviewItems();
    const grouped = groupItems(items);
    const counts = itemCounts(this.artifact.items);
    const selected = this.selectedReviewItem(items);
    return `
      <div class="review-tools">
        <label>Search
          <input data-search value="${attr(this.searchQuery)}" placeholder="Find label, field, component, selector">
        </label>
        <label class="checkbox-row">
          <input type="checkbox" data-show-hidden ${this.showHidden ? 'checked' : ''}>
          <span>Show hidden</span>
        </label>
      </div>
      <div class="count-strip" aria-label="Extracted item counts">
        ${Object.entries(counts).map(([kind, count]) => `<span>${escapeHtml(titleCase(kind))}: ${count}</span>`).join('')}
      </div>
      <div class="panel-actions">
        <span>${items.length} shown of ${this.artifact.items.length}</span>
        <button type="button" data-add-item>Add Item</button>
      </div>
      <div class="extracted-workspace">
        <section class="import-tree" aria-label="Imported component tree">
          <h3>Imported Components</h3>
          ${this.renderItemTree(grouped)}
        </section>
        <section class="item-inspector">
          ${selected ? this.renderSelectedItem(selected) : '<p>No item selected.</p>'}
        </section>
      </div>
      ${Object.entries(grouped).map(([kind, items]) => `
        <section class="item-group">
          <h3>${escapeHtml(titleCase(kind))} <span>${items.length}</span></h3>
          <div class="item-list">
            ${items.map((item) => this.renderItem(item)).join('')}
          </div>
        </section>
      `).join('')}
    `;
  }

  private renderItemTree(grouped: Record<PageImportItemKind, PageImportItem[]>): string {
    return `
      <ul>
        ${Object.entries(grouped).map(([kind, items]) => `
          <li>
            <strong>${escapeHtml(titleCase(kind))}</strong>
            <ul>
              ${items.map((item) => `
                <li>
                  <button type="button" data-select-item="${attr(item.id)}" aria-current="${this.selectedItemId === item.id ? 'true' : 'false'}">
                    <span>${escapeHtml(item.label)}</span>
                    <small>${escapeHtml(item.componentTag || item.kind)}</small>
                  </button>
                </li>
              `).join('')}
            </ul>
          </li>
        `).join('')}
      </ul>
    `;
  }

  private renderSelectedItem(item: PageImportItem): string {
    return `
      <div class="inspector-head">
        <div>
          <h3>${escapeHtml(item.label)}</h3>
          <p>${escapeHtml(item.componentTag || item.kind)}</p>
        </div>
        <span>${escapeHtml(item.kind)}</span>
      </div>
      <div class="inspector-grid">
        <section>
          <h4>Exported HTML</h4>
          <textarea readonly spellcheck="false">${escapeHtml(item.sourceSnippet || exportedHtmlForItem(item))}</textarea>
        </section>
        <section>
          <h4>Associated CSS</h4>
          <textarea readonly spellcheck="false">${escapeHtml(item.cssSnippet || '/* No associated CSS captured for this item yet. */')}</textarea>
        </section>
      </div>
      <section>
        <h4>Preview Element</h4>
        <div class="selected-preview">${previewItem(item)}</div>
      </section>
    `;
  }

  private renderItem(item: PageImportItem) {
    const itemIndex = this.artifact?.items.findIndex((candidate) => candidate.id === item.id) ?? -1;
    const isFirst = itemIndex <= 0;
    const isLast = !this.artifact || itemIndex === this.artifact.items.length - 1;
    return `
      <article class="item-card ${item.hidden ? 'is-hidden' : ''}">
        <div class="item-head">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.kind)}</span>
        </div>
        <div class="item-edit-grid">
          <label>Label<input data-item-id="${attr(item.id)}" data-item-field="label" value="${attr(item.label)}"></label>
          <label>Value<input data-item-id="${attr(item.id)}" data-item-field="value" value="${attr(item.value || '')}"></label>
          <label>Component<input data-item-id="${attr(item.id)}" data-item-field="componentTag" value="${attr(item.componentTag || '')}"></label>
          <label>Notes<input data-item-id="${attr(item.id)}" data-item-field="notes" value="${attr(item.notes || '')}"></label>
        </div>
        <div class="meta-row">
          ${item.name ? `<span>name: ${escapeHtml(item.name)}</span>` : ''}
          ${item.inputType ? `<span>type: ${escapeHtml(item.inputType)}</span>` : ''}
          ${item.required ? '<span>required</span>' : ''}
          ${item.position?.selector ? `<span>${escapeHtml(item.position.selector)}</span>` : ''}
        </div>
        <div class="item-actions">
          <button type="button" data-move-item="up" data-item-id="${attr(item.id)}" ${isFirst ? 'disabled' : ''}>Move Up</button>
          <button type="button" data-move-item="down" data-item-id="${attr(item.id)}" ${isLast ? 'disabled' : ''}>Move Down</button>
          <button type="button" data-toggle-hidden data-item-id="${attr(item.id)}">${item.hidden ? 'Unhide' : 'Hide'}</button>
        </div>
      </article>
    `;
  }

  private visibleReviewItems(): PageImportItem[] {
    if (!this.artifact) return [];
    const query = normalizeSearch(this.searchQuery);
    return this.artifact.items.filter((item) => {
      if (item.hidden && !this.showHidden) return false;
      if (!query) return true;
      return normalizeSearch([
        item.kind,
        item.label,
        item.value,
        item.name,
        item.elementId,
        item.inputType,
        item.componentTag,
        item.position?.selector,
        item.database?.fieldName,
        item.database?.entityGuess,
        item.notes,
      ].filter(Boolean).join(' ')).includes(query);
    });
  }

  private selectedReviewItem(items: PageImportItem[]): PageImportItem | null {
    const selected = items.find((item) => item.id === this.selectedItemId);
    if (selected) return selected;
    return items[0] ?? null;
  }

  private renderPreview() {
    if (!this.artifact) return emptyPanel('No preview yet.');
    const visible = this.artifact.items.filter((item) => !item.hidden);
    return `
      <div class="preview-surface">
        ${visible.map((item) => previewItem(item)).join('')}
      </div>
    `;
  }

  private renderDatabase() {
    if (!this.artifact) return emptyPanel('No database suggestions yet.');
    const fields = this.artifact.items.filter((item) => item.database);
    return `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Label</th><th>Field</th><th>Type</th><th>Required</th><th>Entity</th><th>Sample</th></tr></thead>
          <tbody>
            ${fields.map((item) => `
              <tr class="${item.database?.stale ? 'stale' : ''}">
                <td>${escapeHtml(item.label)}${item.database?.stale ? '<span class="stale-badge">stale</span>' : ''}</td>
                <td><input data-item-id="${attr(item.id)}" data-db-field="fieldName" value="${attr(item.database?.fieldName || '')}"></td>
                <td><input data-item-id="${attr(item.id)}" data-db-field="type" value="${attr(item.database?.type || '')}"></td>
                <td>${item.database?.required ? 'Yes' : 'No'}</td>
                <td><input data-item-id="${attr(item.id)}" data-db-field="entityGuess" value="${attr(item.database?.entityGuess || '')}"></td>
                <td>${escapeHtml(item.database?.sampleValue || '')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderAssets() {
    if (!this.artifact) return emptyPanel('No assets yet.');
    return `
      <div class="item-list">
        ${this.artifact.assets.map((asset) => `
          <article class="item-card">
            <div class="item-head"><strong>${escapeHtml(asset.label || asset.url)}</strong><span>${escapeHtml(asset.type)}</span></div>
            <a href="${attr(asset.url)}" target="_blank" rel="noreferrer">${escapeHtml(asset.url)}</a>
            <p>Used by: ${escapeHtml(asset.usedBy.join(', ') || 'none')}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  private renderTree() {
    if (!this.artifact) return emptyPanel('No tree yet.');
    return `<div class="tree">${renderTreeNode(this.artifact.tree)}</div>`;
  }

  private renderLogs() {
    if (!this.artifact) return emptyPanel('No logs yet.');
    return `
      <div class="log-list">
        ${this.artifact.logs.slice().reverse().map((entry) => `
          <article class="log-entry ${entry.level}">
            <strong>${escapeHtml(entry.message)}</strong>
            <time>${escapeHtml(entry.timestamp)}</time>
          </article>
        `).join('')}
      </div>
    `;
  }

  private renderArtifact() {
    if (!this.artifact) return emptyPanel('No artifact yet.');
    return `<textarea class="artifact-json" readonly spellcheck="false">${escapeHtml(JSON.stringify(this.artifact, null, 2))}</textarea>`;
  }

  private renderActiveTab() {
    if (this.activeTab === 'source') return this.renderSource();
    if (this.activeTab === 'items') return this.renderItems();
    if (this.activeTab === 'preview') return this.renderPreview();
    if (this.activeTab === 'database') return this.renderDatabase();
    if (this.activeTab === 'assets') return this.renderAssets();
    if (this.activeTab === 'tree') return this.renderTree();
    if (this.activeTab === 'logs') return this.renderLogs();
    return this.renderArtifact();
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;color:#172033;font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        *,*::before,*::after{box-sizing:border-box}
        .shell{display:grid;gap:1rem;min-width:0}
        .toolbar,.panel{border:1px solid #d9e2ee;border-radius:8px;background:#fff}
        .toolbar{display:grid;gap:.75rem;padding:.85rem}
        .import-row{display:grid;grid-template-columns:minmax(16rem,1fr) auto auto auto;gap:.5rem;align-items:end}
        label{display:grid;gap:.25rem;color:#40546d;font-weight:800}
        input,textarea{width:100%;min-width:0;border:1px solid #bdcbdd;border-radius:6px;padding:.5rem .6rem;font:inherit;background:#fff}
        textarea{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;resize:vertical}
        button,.file-button{min-height:2.35rem;border:1px solid #bdcbdd;border-radius:6px;background:#fff;color:#203b5e;font:inherit;font-weight:800;cursor:pointer;padding:.45rem .7rem;text-align:center}
        .primary{border-color:#245ea8;background:#245ea8;color:#fff}
        .file-button input{position:absolute;inline-size:1px;block-size:1px;opacity:0;pointer-events:none}
        .status{display:flex;gap:.5rem;align-items:center;color:#52677f;font-size:.9rem}
        .spinner{inline-size:1rem;block-size:1rem;border:2px solid #c9d5e5;border-top-color:#245ea8;border-radius:50%;animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .loading-panel{display:flex;gap:.75rem;align-items:center;padding:.8rem;border:1px solid #b9d4f5;border-radius:8px;background:#f1f7ff;color:#174a8b;font-weight:800}
        .loading-panel .spinner{inline-size:1.35rem;block-size:1.35rem}
        .tabs{display:flex;gap:.35rem;flex-wrap:wrap}
        .tabs button[aria-selected="true"]{border-color:#245ea8;background:#edf5ff;color:#174a8b}
        .panel{padding:.85rem;min-width:0}
        .source-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}
        .source-box textarea{min-height:24rem}
        .review-tools{display:grid;grid-template-columns:minmax(14rem,1fr) auto;gap:.75rem;align-items:end;margin-bottom:.7rem}
        .checkbox-row{display:flex;gap:.45rem;align-items:center;min-height:2.35rem}
        .checkbox-row input{inline-size:auto}
        .count-strip{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.7rem}
        .count-strip span{display:inline-flex;border:1px solid #c9d5e5;border-radius:999px;padding:.16rem .5rem;color:#40546d;background:#f8fafd;font-size:.8rem;font-weight:800}
        .panel-actions,.item-actions{display:flex;gap:.45rem;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin-bottom:.7rem}
        .panel-actions span{margin-right:auto;color:#52677f}
        .item-group{display:grid;gap:.55rem;margin-bottom:1rem}
        .item-group h3{display:flex;gap:.5rem;align-items:center;margin:0;color:#203b5e;font-size:1rem}
        .item-group h3 span{color:#52677f;font-size:.86rem}
        .item-list{display:grid;gap:.6rem}
        .item-card{display:grid;gap:.6rem;padding:.7rem;border:1px solid #d9e2ee;border-radius:8px;background:#fbfcfe}
        .item-card.is-hidden{opacity:.62}
        .item-head,.meta-row{display:flex;gap:.5rem;align-items:center;justify-content:space-between;flex-wrap:wrap}
        .item-head span,.meta-row span,.stale-badge{display:inline-flex;border:1px solid #c9d5e5;border-radius:999px;padding:.1rem .45rem;color:#52677f;font-size:.78rem;font-weight:800}
        .item-edit-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5rem}
        .extracted-workspace{display:grid;grid-template-columns:minmax(15rem,.8fr) minmax(0,1.6fr);gap:.75rem;margin-bottom:1rem}
        .import-tree,.item-inspector{display:grid;gap:.6rem;align-content:start;min-width:0;padding:.75rem;border:1px solid #d9e2ee;border-radius:8px;background:#fff}
        .import-tree h3,.item-inspector h3,.item-inspector h4{margin:0;color:#203b5e}
        .import-tree ul{display:grid;gap:.35rem;list-style:none;margin:0;padding:0}
        .import-tree li ul{margin:.35rem 0 .55rem .6rem;padding-left:.6rem;border-left:1px solid #d9e2ee}
        .import-tree button{display:grid;gap:.1rem;width:100%;height:auto;text-align:left;font-weight:800}
        .import-tree button[aria-current="true"]{border-color:#245ea8;background:#edf5ff;color:#174a8b}
        .import-tree small{color:#52677f;font-weight:600}
        .inspector-head{display:flex;justify-content:space-between;gap:.75rem;align-items:start}
        .inspector-head p{margin:.15rem 0 0;color:#52677f}
        .inspector-head span{display:inline-flex;border:1px solid #c9d5e5;border-radius:999px;padding:.12rem .5rem;color:#52677f;font-size:.78rem;font-weight:800}
        .inspector-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}
        .inspector-grid textarea{min-height:13rem}
        .selected-preview{padding:.75rem;border:1px solid #e1e8f2;border-radius:8px;background:#fbfcfe}
        .preview-surface{display:grid;gap:.75rem;max-width:920px}
        .preview-item{padding:.75rem;border:1px solid #d9e2ee;border-radius:8px;background:#fff}
        .preview-field{display:grid;grid-template-columns:12rem minmax(0,1fr);gap:.5rem;align-items:center}
        .preview-field input,.preview-field select{min-height:2.25rem;border:1px solid #bdcbdd;border-radius:6px;padding:.45rem .55rem}
        .table-wrap{overflow:auto}
        table{width:100%;border-collapse:collapse}
        th,td{border-bottom:1px solid #e1e8f2;padding:.45rem;text-align:left;vertical-align:top}
        th{color:#203b5e;background:#f6f8fb}
        tr.stale td{background:#fff8e8}
        .stale-badge{margin-left:.35rem;color:#875b09;border-color:#e4bd68;background:#fff8e8}
        .tree ul{margin:.35rem 0 .35rem 1rem;padding-left:1rem;border-left:1px solid #d9e2ee}
        .tree li{margin:.25rem 0}
        .log-list{display:grid;gap:.5rem;max-height:28rem;overflow:auto}
        .log-entry{display:grid;gap:.1rem;padding:.55rem;border-left:3px solid #c9d5e5;background:#f8fafd}
        .log-entry.success{border-color:#2f7d42}.log-entry.warning{border-color:#d19611}.log-entry.error{border-color:#b4232a}
        .log-entry time{color:#52677f;font-size:.78rem}
        .artifact-json{min-height:36rem}
        @media(max-width:980px){.import-row,.source-grid,.item-edit-grid,.review-tools,.extracted-workspace,.inspector-grid{grid-template-columns:1fr}.preview-field{grid-template-columns:1fr}}
      </style>
      <div class="shell" part="shell">
        <section class="toolbar" part="toolbar">
          <div class="import-row">
            <label>URL
              <input data-url value="${attr(this.sourceUrl)}" placeholder="https://example.com/page">
            </label>
            <button class="primary" type="button" data-import-url ${this.importing ? 'disabled' : ''}>${this.importing ? 'Importing...' : 'Import URL'}</button>
            <button type="button" data-load-mock ${this.importing ? 'disabled' : ''}>Load Mock</button>
            <button type="button" data-export ${this.artifact && !this.importing ? '' : 'disabled'}>Export JSON</button>
            <label class="file-button">Import JSON
              <input type="file" accept="application/json" data-import>
            </label>
          </div>
          <div class="status">${this.importing ? '<span class="spinner" aria-hidden="true"></span>' : ''}<span>${escapeHtml(this.statusMessage)}</span></div>
          <nav class="tabs" aria-label="Page importer views">
            ${TABS.map((tab) => `<button type="button" data-tab="${tab.id}" aria-selected="${this.activeTab === tab.id ? 'true' : 'false'}">${escapeHtml(tab.label)}</button>`).join('')}
          </nav>
        </section>
        <section class="panel" part="panel">
          ${this.importing ? `<div class="loading-panel" role="status" aria-live="polite"><span class="spinner" aria-hidden="true"></span><span>Loading and parsing web page. Extracted Items will update when complete.</span></div>` : ''}
          ${this.renderActiveTab()}
        </section>
      </div>
    `;
    this.bind();
  }
}

function emptyPanel(message: string): string {
  return `<p>${escapeHtml(message)}</p>`;
}

function groupItems(items: PageImportItem[]): Record<PageImportItemKind, PageImportItem[]> {
  return items.reduce((groups, item) => {
    groups[item.kind] = [...(groups[item.kind] ?? []), item];
    return groups;
  }, {} as Record<PageImportItemKind, PageImportItem[]>);
}

function itemCounts(items: PageImportItem[]): Partial<Record<PageImportItemKind, number>> {
  return items.reduce((counts, item) => {
    counts[item.kind] = (counts[item.kind] ?? 0) + 1;
    return counts;
  }, {} as Partial<Record<PageImportItemKind, number>>);
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function previewItem(item: PageImportItem): string {
  if (item.kind === 'field') {
    const control = item.inputType === 'select'
      ? `<select>${(item.options ?? []).map((option) => `<option>${escapeHtml(option)}</option>`).join('')}</select>`
      : `<input value="${attr(item.value || '')}" placeholder="${attr(item.placeholder || '')}" ${item.required ? 'required' : ''}>`;
    return `<div class="preview-item preview-field"><label>${escapeHtml(item.label)}</label>${control}</div>`;
  }
  if (item.kind === 'asset') return `<div class="preview-item"><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.value || '')}</p></div>`;
  if (item.kind === 'action') return `<button class="primary preview-item" type="button">${escapeHtml(item.label)}</button>`;
  return `<div class="preview-item"><strong>${escapeHtml(item.label)}</strong>${item.value ? `<p>${escapeHtml(item.value)}</p>` : ''}</div>`;
}

function exportedHtmlForItem(item: PageImportItem): string {
  if (item.kind === 'field') {
    if (item.inputType === 'select') {
      return `<div class="field">
  <label for="${attr(item.elementId || item.name || item.id)}">${escapeHtml(item.label)}</label>
  <select id="${attr(item.elementId || item.name || item.id)}" name="${attr(item.name || '')}">
    ${(item.options || []).map((option) => `<option>${escapeHtml(option)}</option>`).join('\n    ')}
  </select>
</div>`;
    }
    return `<div class="field">
  <label for="${attr(item.elementId || item.name || item.id)}">${escapeHtml(item.label)}</label>
  <input id="${attr(item.elementId || item.name || item.id)}" name="${attr(item.name || '')}" type="${attr(item.inputType || 'text')}" value="${attr(item.value || '')}">
</div>`;
  }
  if (item.kind === 'instruction') return `<p>${escapeHtml(item.value || item.label)}</p>`;
  if (item.kind === 'static-value') return `<div class="detail"><span>${escapeHtml(item.label)}</span><span>${escapeHtml(item.value || '')}</span></div>`;
  if (item.kind === 'action') return `<button type="button">${escapeHtml(item.label)}</button>`;
  if (item.kind === 'asset') return `<img src="${attr(item.value || '')}" alt="${attr(item.label)}">`;
  return `<div>${escapeHtml(item.value || item.label)}</div>`;
}

function renderTreeNode(node: PageImportTreeNode): string {
  return `
    <ul>
      <li>
        <strong>${escapeHtml(node.label)}</strong> <span>${escapeHtml(node.kind)}</span>
        ${node.children?.length ? node.children.map((child) => renderTreeNode(child)).join('') : ''}
      </li>
    </ul>
  `;
}

function titleCase(value: string): string {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function routeFromUrl(value: string): string {
  try {
    return new URL(value).pathname || '/';
  } catch {
    return '/';
  }
}

function titleFromUrl(value: string): string {
  const route = routeFromUrl(value);
  const last = route.split('/').filter(Boolean).pop() || 'Imported Page';
  return titleCase(last);
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'page-import-artifact';
}

function displayPageName(artifact: PageImportArtifact): string {
  const pageName = artifact.metadata.pageName;
  if (pageName && pageName.toLowerCase() !== 's') return pageName;
  try {
    const url = new URL(artifact.metadata.sourceUrl);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return artifact.metadata.sourceUrl || artifact.id;
  }
}

function appendArtifactLog(artifact: PageImportArtifact, entry: PageImportArtifact['logs'][number]): PageImportArtifact {
  return {
    ...artifact,
    logs: [...artifact.logs, entry],
  };
}

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORAGE_STORE)) db.createObjectStore(STORAGE_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readDraft(): Promise<PageImportArtifact | null> {
  const db = await openDraftDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_STORE, 'readonly');
    const request = transaction.objectStore(STORAGE_STORE).get('latest');
    request.onsuccess = () => resolve((request.result as { artifact?: PageImportArtifact } | undefined)?.artifact ?? null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function writeDraft(artifact: PageImportArtifact): Promise<void> {
  const db = await openDraftDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_STORE, 'readwrite');
    transaction.objectStore(STORAGE_STORE).put({ id: 'latest', artifact });
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

defineLayoutElement('uib-page-importer', UibPageImporter);

declare global {
  interface HTMLElementTagNameMap {
    'uib-page-importer': UibPageImporter;
  }
}
