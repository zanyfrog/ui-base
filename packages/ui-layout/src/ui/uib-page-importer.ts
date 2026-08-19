import { createPageImportArtifact, type PageAppExtraction, type PageExtractionResult, type PageImportArtifact, type PageImportItem, type PageImportItemKind, type PageImportTreeNode } from '../model/page-import-artifact.js';
import { createMockPageExtractionResult } from '../page-importer/mock-extraction.js';
import { matchImportedTextComponents } from '../page-importer/text-component-matching.js';
import { BaseHTMLElement, attr, defineLayoutElement, dispatch, escapeHtml } from './dom-utils.js';

type PageImporterTab = 'source' | 'items' | 'preview' | 'assets' | 'database' | 'tree' | 'logs' | 'artifact';

const STORAGE_DB = 'uib-page-importer';
const STORAGE_STORE = 'drafts';
const RECENT_URL_STORAGE_KEY = 'uib:recent:page-importer-url';
const RECENT_URL_LIMIT = 5;
const RECENT_URL_MAX_LENGTH = 100;

const TABS: Array<{ id: PageImporterTab; label: string }> = [
  { id: 'items', label: 'Extracted Items' },
  { id: 'preview', label: 'Preview' },
  { id: 'database', label: 'Database' },
  { id: 'assets', label: 'Assets' },
  { id: 'tree', label: 'Tree' },
  { id: 'logs', label: 'Logs' },
  { id: 'artifact', label: 'Artifact JSON' },
  { id: 'source', label: 'Source' },
];

const toolbarIcons = {
  importUrl: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z" fill="currentColor"/></svg>',
  loadMock: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 3h6v2h-1v4.6l4.7 7.8A2.4 2.4 0 0 1 16.7 21H7.3a2.4 2.4 0 0 1-2-3.6L10 9.6V5H9V3Zm3 7.1-5 8.3a.4.4 0 0 0 .3.6h9.4a.4.4 0 0 0 .3-.6l-5-8.3ZM8.6 17h6.8l-1.8-3H10.4l-1.8 3Z" fill="currentColor"/></svg>',
  exportJson: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M11 3h2v9.2l3.1-3.1 1.4 1.4L12 16l-5.5-5.5 1.4-1.4 3.1 3.1V3ZM5 18h14v3H5v-3Z" fill="currentColor"/></svg>',
  importJson: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M11 21h2v-9.2l3.1 3.1 1.4-1.4L12 8l-5.5 5.5 1.4 1.4 3.1-3.1V21ZM5 3h14v3H5V3Z" fill="currentColor"/></svg>',
};

export class UibPageImporter extends BaseHTMLElement {
  static get observedAttributes() {
    return ['service-url'];
  }

  private artifact: PageImportArtifact | null = null;
  private activeTab: PageImporterTab = 'items';
  private sourceUrl = '';// 'https://example.local/customer-intake';
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
    this.saveRecentSourceUrl();
    const extraction = matchImportedTextComponents(createMockPageExtractionResult(this.sourceUrl));
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
    this.saveRecentSourceUrl();
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
        extraction: matchImportedTextComponents(payload.result),
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

  private recentSourceUrls(): string[] {
    return loadRecentUrls();
  }

  private saveRecentSourceUrl(): void {
    const values = saveRecentUrl(this.sourceUrl);
    if (!values.length) return;
    dispatch(this, 'uib-recent-values-save', {
      name: 'pageImporterUrl',
      key: RECENT_URL_STORAGE_KEY,
      value: values[0],
      values,
      limit: RECENT_URL_LIMIT,
    });
  }

  private bind() {
    const root = this.shadowRoot;
    if (!root) return;
    root.querySelector<HTMLInputElement>('[data-url]')?.addEventListener('change', (event) => {
      this.sourceUrl = (event.currentTarget as HTMLInputElement).value;
      this.render();
    });
    root.querySelector<HTMLInputElement>('[data-url]')?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      this.sourceUrl = (event.currentTarget as HTMLInputElement).value;
      void this.importUrl();
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
    root.querySelector('uib-tabs')?.addEventListener('uib-tabs-change', (event) => {
      const index = Number((event as CustomEvent<{ newValue?: number }>).detail?.newValue);
      const tab = Number.isInteger(index) ? TABS[index] : null;
      if (!tab) return;
      this.activeTab = tab.id;
      this.render();
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
      <div class="source-grid" part="source-grid">
        ${(['html', 'css', 'js'] as const).map((kind) => `
          <label class="source-box" part="label source-box">
            <span>${kind.toUpperCase()}</span>
            <textarea part="textarea source-textarea" data-source-kind="${kind}" spellcheck="false">${escapeHtml(this.artifact?.source[kind] ?? '')}</textarea>
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
      <div class="review-tools" part="review-tools">
        <label part="label">Search
          <input part="input" data-search value="${attr(this.searchQuery)}" placeholder="Find label, field, component, selector">
        </label>
        <label class="checkbox-row" part="label checkbox-row">
          <input part="input checkbox-input" type="checkbox" data-show-hidden ${this.showHidden ? 'checked' : ''}>
          <span>Show hidden</span>
        </label>
      </div>
      <div class="count-strip" part="count-strip" aria-label="Extracted item counts">
        ${Object.entries(counts).map(([kind, count]) => `<span part="chip count-chip">${escapeHtml(titleCase(kind))}: ${count}</span>`).join('')}
      </div>
      <div class="panel-actions" part="panel-actions">
        <span part="panel-actions-count">${items.length} shown of ${this.artifact.items.length}</span>
        <button part="button" type="button" data-add-item>Add Item</button>
      </div>
      <div class="extracted-workspace" part="extracted-workspace">
        <section class="import-tree" part="import-tree" aria-label="Imported component tree">
          <h3 part="section-heading">Imported Components</h3>
          ${this.renderItemTree(grouped)}
        </section>
        <section class="item-inspector" part="item-inspector">
          ${selected ? this.renderSelectedItem(selected) : '<p>No item selected.</p>'}
        </section>
      </div>
      ${Object.entries(grouped).map(([kind, items]) => `
        <section class="item-group" part="item-group">
          <h3 part="item-group-heading">${escapeHtml(titleCase(kind))} <span part="item-group-count">${items.length}</span></h3>
          <div class="item-list" part="item-list">
            ${items.map((item) => this.renderItem(item)).join('')}
          </div>
        </section>
      `).join('')}
    `;
  }

  private renderItemTree(grouped: Record<PageImportItemKind, PageImportItem[]>): string {
    return `
      <ul part="tree-list">
        ${Object.entries(grouped).map(([kind, items]) => `
          <li>
            <strong>${escapeHtml(titleCase(kind))}</strong>
            <ul part="tree-child-list">
              ${items.map((item) => `
                <li>
                  <button part="button import-tree-button" type="button" data-select-item="${attr(item.id)}" aria-current="${this.selectedItemId === item.id ? 'true' : 'false'}">
                    <span>${escapeHtml(item.label)}</span>
                    <small part="import-tree-meta">${escapeHtml(item.componentTag || item.kind)}</small>
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
    const appExtraction = this.appExtractionFor(item);
    return `
      <div class="inspector-head" part="inspector-head">
        <div>
          <h3 part="section-heading">${escapeHtml(item.label)}</h3>
          <p part="inspector-subtitle">${escapeHtml(item.componentTag || item.kind)}</p>
        </div>
        <span part="inspector-badge">${escapeHtml(item.kind)}</span>
      </div>
      <div class="inspector-grid" part="inspector-grid">
        <section>
          <h4 part="section-heading">Exported HTML</h4>
          <textarea part="textarea inspector-textarea" readonly spellcheck="false">${escapeHtml(item.sourceSnippet || exportedHtmlForItem(item))}</textarea>
        </section>
        <section>
          <h4 part="section-heading">Associated CSS</h4>
          <textarea part="textarea inspector-textarea" readonly spellcheck="false">${escapeHtml(item.cssSnippet || '/* No associated CSS captured for this item yet. */')}</textarea>
        </section>
      </div>
      <section>
        <h4 part="section-heading">Preview Element</h4>
        <div class="selected-preview" part="selected-preview">${previewItem(item)}</div>
      </section>
      ${appExtraction ? `
        <section>
          <h4 part="section-heading">Linked App Extraction</h4>
          <div class="subcomponent-panel" part="subcomponent-panel">
            <div class="meta-row" part="meta-row">
              <span part="chip">${escapeHtml(appExtraction.serviceName)}</span>
              <span part="chip">${escapeHtml(appExtraction.originalTagName)}</span>
              <span part="chip">${escapeHtml(appExtraction.applicationComponentName)}</span>
              <span part="chip">${escapeHtml(appExtraction.childSummary || `${appExtraction.items.length} child items`)}</span>
            </div>
            <ul class="subcomponent-list" part="subcomponent-list">
              ${appExtraction.items.slice(0, 30).map((child) => `
                <li part="subcomponent-list-item">
                  <strong>${escapeHtml(child.label)}</strong>
                  <span part="chip">${escapeHtml(child.kind)}</span>
                  <small>${escapeHtml(child.componentTag || '')}</small>
                </li>
              `).join('')}
            </ul>
          </div>
        </section>
      ` : ''}
    `;
  }

  private appExtractionFor(item: PageImportItem): PageAppExtraction | null {
    if (!item.appExtractionId || !this.artifact?.appExtractions) return null;
    return this.artifact.appExtractions.find((extraction) => extraction.id === item.appExtractionId) || null;
  }

  private renderItem(item: PageImportItem) {
    const itemIndex = this.artifact?.items.findIndex((candidate) => candidate.id === item.id) ?? -1;
    const isFirst = itemIndex <= 0;
    const isLast = !this.artifact || itemIndex === this.artifact.items.length - 1;
    return `
      <article class="item-card ${item.hidden ? 'is-hidden' : ''}" part="item-card${item.hidden ? ' hidden-item' : ''}">
        <div class="item-head" part="item-head">
          <strong>${escapeHtml(item.label)}</strong>
          <span part="chip">${escapeHtml(item.kind)}</span>
        </div>
        <div class="item-edit-grid" part="item-edit-grid">
          <label part="label">Label<input part="input" data-item-id="${attr(item.id)}" data-item-field="label" value="${attr(item.label)}"></label>
          <label part="label">Value<input part="input" data-item-id="${attr(item.id)}" data-item-field="value" value="${attr(item.value || '')}"></label>
          <label part="label">Component<input part="input" data-item-id="${attr(item.id)}" data-item-field="componentTag" value="${attr(item.componentTag || '')}"></label>
          <label part="label">Notes<input part="input" data-item-id="${attr(item.id)}" data-item-field="notes" value="${attr(item.notes || '')}"></label>
        </div>
        <div class="meta-row" part="meta-row">
          ${item.name ? `<span part="chip">name: ${escapeHtml(item.name)}</span>` : ''}
          ${item.inputType ? `<span part="chip">type: ${escapeHtml(item.inputType)}</span>` : ''}
          ${item.required ? '<span part="chip">required</span>' : ''}
          ${item.applicationComponentName ? `<span part="chip">app: ${escapeHtml(item.applicationComponentName)}</span>` : ''}
          ${item.appExtractionId ? `<span part="chip">extraction: ${escapeHtml(item.appExtractionId)}</span>` : ''}
          ${item.serviceName ? `<span part="chip">service: ${escapeHtml(item.serviceName)}</span>` : ''}
          ${item.childSummary ? `<span part="chip">children: ${escapeHtml(item.childSummary)}</span>` : ''}
          ${item.accessibilityRole ? `<span part="chip">a11y: ${escapeHtml(item.accessibilityRole)}</span>` : ''}
          ${item.hiddenReason ? `<span part="chip">hidden: ${escapeHtml(item.hiddenReason)}</span>` : ''}
          ${item.position?.selector ? `<span part="chip">${escapeHtml(item.position.selector)}</span>` : ''}
        </div>
        <div class="item-actions" part="item-actions">
          <button part="button" type="button" data-move-item="up" data-item-id="${attr(item.id)}" ${isFirst ? 'disabled' : ''}>Move Up</button>
          <button part="button" type="button" data-move-item="down" data-item-id="${attr(item.id)}" ${isLast ? 'disabled' : ''}>Move Down</button>
          <button part="button" type="button" data-toggle-hidden data-item-id="${attr(item.id)}">${item.hidden ? 'Unhide' : 'Hide'}</button>
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
        item.applicationComponentName,
        item.appExtractionId,
        item.serviceName,
        item.hiddenReason,
        item.accessibilityRole,
        item.childSummary,
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
      <div class="preview-surface" part="preview-surface">
        ${visible.map((item) => previewItem(item)).join('')}
      </div>
    `;
  }

  private renderDatabase() {
    if (!this.artifact) return emptyPanel('No database suggestions yet.');
    const fields = this.artifact.items.filter((item) => item.database);
    return `
      <div class="table-wrap" part="table-wrap">
        <table part="table">
          <thead><tr><th part="th">Label</th><th part="th">Field</th><th part="th">Type</th><th part="th">Required</th><th part="th">Entity</th><th part="th">Sample</th></tr></thead>
          <tbody>
            ${fields.map((item) => `
              <tr class="${item.database?.stale ? 'stale' : ''}">
                <td part="td${item.database?.stale ? ' stale-cell' : ''}">${escapeHtml(item.label)}${item.database?.stale ? '<span class="stale-badge" part="stale-badge">stale</span>' : ''}</td>
                <td part="td${item.database?.stale ? ' stale-cell' : ''}"><input part="input" data-item-id="${attr(item.id)}" data-db-field="fieldName" value="${attr(item.database?.fieldName || '')}"></td>
                <td part="td${item.database?.stale ? ' stale-cell' : ''}"><input part="input" data-item-id="${attr(item.id)}" data-db-field="type" value="${attr(item.database?.type || '')}"></td>
                <td part="td${item.database?.stale ? ' stale-cell' : ''}">${item.database?.required ? 'Yes' : 'No'}</td>
                <td part="td${item.database?.stale ? ' stale-cell' : ''}"><input part="input" data-item-id="${attr(item.id)}" data-db-field="entityGuess" value="${attr(item.database?.entityGuess || '')}"></td>
                <td part="td${item.database?.stale ? ' stale-cell' : ''}">${escapeHtml(item.database?.sampleValue || '')}</td>
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
      <div class="item-list" part="item-list">
        ${this.artifact.assets.map((asset) => `
          <article class="item-card" part="item-card">
            <div class="item-head" part="item-head"><strong>${escapeHtml(asset.label || asset.url)}</strong><span part="chip">${escapeHtml(asset.type)}</span></div>
            <a href="${attr(asset.url)}" target="_blank" rel="noreferrer">${escapeHtml(asset.url)}</a>
            <p>Used by: ${escapeHtml(asset.usedBy.join(', ') || 'none')}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  private renderTree() {
    if (!this.artifact) return emptyPanel('No tree yet.');
    return `<div class="tree" part="tree">${renderTreeNode(this.artifact.tree)}</div>`;
  }

  private renderLogs() {
    if (!this.artifact) return emptyPanel('No logs yet.');
    return `
      <div class="log-list" part="log-list">
        ${this.artifact.logs.slice().reverse().map((entry) => `
          <article class="log-entry ${entry.level}" part="log-entry log-${entry.level}">
            <strong>${escapeHtml(entry.message)}</strong>
            <time part="log-time">${escapeHtml(entry.timestamp)}</time>
          </article>
        `).join('')}
      </div>
    `;
  }

  private renderArtifact() {
    if (!this.artifact) return emptyPanel('No artifact yet.');
    return `<textarea class="artifact-json" part="textarea artifact-json" readonly spellcheck="false">${escapeHtml(JSON.stringify(this.artifact, null, 2))}</textarea>`;
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

  private activeTabIndex(): number {
    const index = TABS.findIndex((tab) => tab.id === this.activeTab);
    return index >= 0 ? index : 0;
  }

  private renderTabPanel(tab: PageImporterTab): string {
    if (tab !== this.activeTab) return '';
    return this.renderActiveTab();
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;color:#172033;font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        *,*::before,*::after{box-sizing:border-box}
        .icon-button svg{width:1.15rem;height:1.15rem;display:block}
        .file-button input{position:absolute;inline-size:1px;block-size:1px;opacity:0;pointer-events:none}
        .spinner{animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .shell{display:grid;gap:1rem;min-width:0}
        .url-action-bar{position:sticky;top:0;z-index:20;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:.5rem;align-items:end;padding:.85rem;border:1px solid #d9e2ee;border-radius:8px;background:#fff;box-shadow:0 8px 20px rgba(23,32,51,.08)}
        .url-field{display:grid;gap:.25rem;min-width:0;color:#40546d;font-weight:800}
        .url-field{grid-column:span 6}
        .url-field input{width:100%;min-width:0}
        .import-actions{grid-column:span 6;display:grid;grid-template-columns:repeat(4,2.35rem);gap:.5rem;align-items:end;justify-content:start}
        input,textarea{box-sizing:border-box;width:100%;min-width:0;padding:.5rem .6rem;border:1px solid #bdcbdd;border-radius:6px;background:#fff;font:inherit}
        button,.file-button{box-sizing:border-box;min-height:2.35rem;border:1px solid #bdcbdd;border-radius:6px;background:#fff;color:#203b5e;font:inherit;font-weight:800;cursor:pointer}
        button:disabled{opacity:.5;cursor:not-allowed}
        .icon-button,.file-button.icon-button{display:inline-grid;width:2.35rem;min-width:2.35rem;min-height:2.35rem;place-items:center;padding:0;line-height:1}
        .primary{border-color:#245ea8;background:#245ea8;color:#fff}
        .toolbar{display:grid;gap:.75rem;padding:.85rem;border:1px solid #d9e2ee;border-radius:8px;background:#fff}
        .panel{padding:.85rem;min-width:0;border-radius:8px}
        uib-tab[selected]{border-color:#245ea8;background:#edf5ff;color:#174a8b}
        .import-tree button[aria-current="true"]{border-color:#245ea8;background:#edf5ff;color:#174a8b}
        @media(max-width:980px){.url-action-bar{grid-template-columns:1fr}.url-field,.import-actions{grid-column:auto}.import-actions{grid-template-columns:repeat(4,2.35rem)}}
      </style>
      <div class="shell" part="shell">
        <div class="url-action-bar" part="url-action-bar">
          <label class="url-field" part="label url-field">URL
            <input part="input" data-url type="url" list="page-importer-recent-urls" autocomplete="off" value="${attr(this.sourceUrl)}" placeholder="https://example.com/page">
            <datalist id="page-importer-recent-urls">
              ${this.recentSourceUrls().map((url) => `<option value="${attr(url)}"></option>`).join('')}
            </datalist>
          </label>
          <div class="import-actions" part="import-actions" aria-label="Page import actions">
            <button class="primary icon-button" part="button primary-button icon-button" type="button" data-import-url title="${this.importing ? 'Importing' : 'Import URL'}" aria-label="${this.importing ? 'Importing' : 'Import URL'}" ${this.importing ? 'disabled' : ''}>${toolbarIcons.importUrl}</button>
            <button class="icon-button" part="button icon-button" type="button" data-load-mock title="Load mock" aria-label="Load mock" ${this.importing ? 'disabled' : ''}>${toolbarIcons.loadMock}</button>
            <button class="icon-button" part="button icon-button" type="button" data-export title="Export JSON" aria-label="Export JSON" ${this.artifact && !this.importing ? '' : 'disabled'}>${toolbarIcons.exportJson}</button>
            <label class="file-button icon-button" part="file-button icon-button" title="Import JSON" aria-label="Import JSON">${toolbarIcons.importJson}
              <input type="file" accept="application/json" data-import>
            </label>
          </div>
        </div>
        <section class="toolbar" part="toolbar">
          <div class="status" part="status">${this.importing ? '<span class="spinner" part="spinner" aria-hidden="true"></span>' : ''}<span>${escapeHtml(this.statusMessage)}</span></div>
        </section>
        <uib-tabs part="tabs" selected="${this.activeTabIndex()}">
          ${TABS.map((tab) => `<uib-tab part="tab">${escapeHtml(tab.label)}</uib-tab>`).join('')}
          ${TABS.map((tab) => `
            <uib-tab-panel part="tab-panel">
              <section class="panel" part="panel">
                ${this.importing && tab.id === this.activeTab ? `<div class="loading-panel" part="loading-panel" role="status" aria-live="polite"><span class="spinner" part="spinner loading-spinner" aria-hidden="true"></span><span>Loading and parsing web page. Extracted Items will update when complete.</span></div>` : ''}
                ${this.renderTabPanel(tab.id)}
              </section>
            </uib-tab-panel>
          `).join('')}
        </uib-tabs>
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
      ? `<select part="preview-control">${(item.options ?? []).map((option) => `<option>${escapeHtml(option)}</option>`).join('')}</select>`
      : `<input part="preview-control" value="${attr(item.value || '')}" placeholder="${attr(item.placeholder || '')}" ${item.required ? 'required' : ''}>`;
    return `<div class="preview-item preview-field" part="preview-item preview-field"><label part="label">${escapeHtml(item.label)}</label>${control}</div>`;
  }
  if (item.componentTag === 'uib-heading') return `<uib-heading class="preview-item" part="preview-item" level="${headingLevel(item)}">${escapeHtml(item.value || item.label)}</uib-heading>`;
  if (item.componentTag === 'uib-instruction') return `<uib-instruction class="preview-item" part="preview-item">${escapeHtml(item.value || item.label)}</uib-instruction>`;
  if (item.kind === 'instruction') return `<uib-instruction class="preview-item" part="preview-item">${escapeHtml(item.value || item.label)}</uib-instruction>`;
  if (item.kind === 'asset') return `<div class="preview-item" part="preview-item"><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.value || '')}</p></div>`;
  if (item.kind === 'action') return `<button class="primary preview-item" part="button primary-button preview-item" type="button">${escapeHtml(item.label)}</button>`;
  return `<div class="preview-item" part="preview-item"><strong>${escapeHtml(item.label)}</strong>${item.value ? `<p>${escapeHtml(item.value)}</p>` : ''}</div>`;
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
  if (item.componentTag === 'uib-heading') return `<uib-heading level="${headingLevel(item)}">${escapeHtml(item.value || item.label)}</uib-heading>`;
  if (item.componentTag === 'uib-instruction') return `<uib-instruction>${escapeHtml(item.value || item.label)}</uib-instruction>`;
  if (item.kind === 'instruction') return `<uib-instruction>${escapeHtml(item.value || item.label)}</uib-instruction>`;
  if (item.kind === 'static-value') return `<div class="detail"><span>${escapeHtml(item.label)}</span><span>${escapeHtml(item.value || '')}</span></div>`;
  if (item.kind === 'action') return `<button type="button">${escapeHtml(item.label)}</button>`;
  if (item.kind === 'asset') return `<img src="${attr(item.value || '')}" alt="${attr(item.label)}">`;
  return `<div>${escapeHtml(item.value || item.label)}</div>`;
}

function headingLevel(item: PageImportItem): number {
  const level = Number(item.headingLevel);
  return Number.isInteger(level) && level >= 1 && level <= 6 ? level : 3;
}

function renderTreeNode(node: PageImportTreeNode): string {
  return `
    <ul part="tree-branch">
      <li part="tree-node">
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

function normalizeRecentUrl(value: string): string {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function recentUrlStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const storage = window.localStorage;
    const testKey = `${RECENT_URL_STORAGE_KEY}:test`;
    storage.setItem(testKey, '[]');
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

function loadRecentUrls(): string[] {
  const storage = recentUrlStorage();
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(RECENT_URL_STORAGE_KEY) || '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is string => typeof value === 'string')
      .map((value) => normalizeRecentUrl(value))
      .filter(Boolean)
      .filter((value) => value.length <= RECENT_URL_MAX_LENGTH)
      .slice(0, RECENT_URL_LIMIT);
  } catch {
    return [];
  }
}

function saveRecentUrl(value: string): string[] {
  const storage = recentUrlStorage();
  const normalized = normalizeRecentUrl(value);
  if (!storage || !normalized || normalized.length > RECENT_URL_MAX_LENGTH) return [];
  const compareValue = normalized.toLocaleLowerCase();
  const next = [
    normalized,
    ...loadRecentUrls().filter((item) => item.toLocaleLowerCase() !== compareValue),
  ].slice(0, RECENT_URL_LIMIT);

  try {
    storage.setItem(RECENT_URL_STORAGE_KEY, JSON.stringify(next));
  } catch {
    return [];
  }

  return next;
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
