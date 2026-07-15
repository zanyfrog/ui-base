import { analyzeComponentSource } from '../analyzer/analyze-component.js';
import type { LayoutOperation } from '../model/layout-operation.js';
import { applyLayoutOperationsToSource } from '../writer/apply-layout-operations.js';
import { BaseHTMLElement, attr, defineLayoutElement, dispatch, escapeHtml } from './dom-utils.js';
import './uib-layout-manager.js';

type EditorFileKind = 'layout' | 'json';
type LogLevel = 'info' | 'success' | 'warning' | 'error';

interface EditorFileEntry {
  name: string;
  path: string;
  kind: EditorFileKind;
  lastModified?: number;
  handle?: FileHandleLike;
  directoryHandle?: DirectoryHandleLike;
}

interface EditorLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  eventType: string;
  message: string;
  filePath?: string;
  metadata?: Record<string, unknown>;
}

interface ProviderFileEntry {
  name: string;
  path: string;
  lastModified?: number;
}

interface ProviderReadResult {
  content: string;
  fileName?: string;
  lastModified?: number;
  attributes?: Record<string, unknown>;
}

interface ProviderWriteResult {
  lastModified?: number;
}

interface FileHandleLike {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<{ write(value: string): Promise<void>; close(): Promise<void> }>;
}

interface DirectoryHandleLike {
  kind: 'directory';
  name: string;
  values(): AsyncIterable<FileHandleLike | DirectoryHandleLike>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike>;
}

const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.html', '.htm', '.json'];
const AUTOSAVE_DELAY = 2000;
const MAX_SAVE_RETRIES = 5;

export class UibLayoutEditor extends BaseHTMLElement {
  static get observedAttributes() {
    return ['startfolder'];
  }

  private rootHandle: DirectoryHandleLike | null = null;
  private availableFiles: EditorFileEntry[] = [];
  private pickerOpen = false;
  private currentFile: EditorFileEntry | null = null;
  private sourceText = '';
  private savedText = '';
  private originalText = '';
  private fileAttributes: Record<string, unknown> = {};
  private history: string[] = [];
  private historyIndex = -1;
  private dirty = false;
  private backupCreated = false;
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private saveRetryCount = 0;
  private externalChangeBlocked = false;
  private layoutPanelCollapsed = false;
  private logCollapsed = false;
  private logs: EditorLogEntry[] = [];
  private jsonWarning = '';
  private statusMessage = 'Open a file to begin.';
  private keyboardBound = false;
  private shellEventsBound = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.setAttribute('tabindex', this.getAttribute('tabindex') || '0');
    if (!this.keyboardBound) {
      this.keyboardBound = true;
      this.addEventListener('keydown', (event) => this.handleKeyboard(event as KeyboardEvent));
    }
    this.render();
  }

  disconnectedCallback() {
    this.clearAutosaveTimers();
  }

  attributeChangedCallback() {
    this.render();
  }

  get startfolder(): string {
    return this.getAttribute('startfolder') || this.getAttribute('start-folder') || 'packages/';
  }

  set startfolder(value: string) {
    this.setAttribute('startfolder', value || 'packages/');
  }

  private get fileKind(): EditorFileKind {
    return this.currentFile?.kind ?? 'layout';
  }

  private get fileName(): string {
    return this.currentFile?.name ?? 'No file selected';
  }

  private get filePath(): string {
    return this.currentFile?.path ?? '';
  }

  private get canUndo(): boolean {
    return this.historyIndex > 0;
  }

  private get canRedo(): boolean {
    return this.historyIndex >= 0 && this.historyIndex < this.history.length - 1;
  }

  private async openFileFlow() {
    this.log('info', 'open-started', 'Opening file picker.', { startfolder: this.startfolder });
    this.statusMessage = 'Opening file picker...';
    this.render();

    const picker = (globalThis as unknown as { showDirectoryPicker?: (options?: unknown) => Promise<DirectoryHandleLike> }).showDirectoryPicker;
    if (picker) {
      try {
        this.rootHandle = await picker({ mode: 'readwrite' });
        this.availableFiles = await this.listDirectoryFiles(this.rootHandle, this.rootHandle.name);
        this.pickerOpen = true;
        this.statusMessage = `${this.availableFiles.length} editable files found.`;
        this.log('success', 'files-listed', `Found ${this.availableFiles.length} editable files.`, { root: this.rootHandle.name });
        this.render();
        return;
      } catch (error) {
        this.log('warning', 'file-picker-cancelled', error instanceof Error ? error.message : 'File picker was cancelled.');
      }
    }

    try {
      const files = await this.requestProvider<ProviderFileEntry[]>('ui-layout-editor-list-files-requested', {
        rootFolder: this.startfolder,
        extensions: SUPPORTED_EXTENSIONS,
      }, 5000);
      this.availableFiles = files.map((file) => ({
        ...file,
        kind: this.kindForFile(file.name || file.path),
      }));
      this.pickerOpen = true;
      this.statusMessage = `${this.availableFiles.length} editable files found.`;
      this.log('success', 'files-listed', `Found ${this.availableFiles.length} editable files from the parent file provider.`);
      this.render();
    } catch {
      this.statusMessage = 'This browser does not expose writable folder access, and no parent file provider responded.';
      this.log('error', 'file-access-unavailable', this.statusMessage, {
        startfolder: this.startfolder,
      });
      this.render();
    }
  }

  private async listDirectoryFiles(directoryHandle: DirectoryHandleLike, rootPath: string): Promise<EditorFileEntry[]> {
    const files: EditorFileEntry[] = [];
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'directory') {
        files.push(...await this.listDirectoryFiles(entry, `${rootPath}/${entry.name}`));
        continue;
      }
      if (!this.isSupportedFile(entry.name)) continue;
      const file = await entry.getFile();
      files.push({
        name: entry.name,
        path: `${rootPath}/${entry.name}`,
        kind: this.kindForFile(entry.name),
        lastModified: file.lastModified,
        handle: entry,
        directoryHandle,
      });
    }
    return files.sort((left, right) => left.path.localeCompare(right.path));
  }

  private async loadFile(file: EditorFileEntry) {
    this.clearAutosaveTimers();
    this.externalChangeBlocked = false;
    this.saveRetryCount = 0;
    try {
      let content = '';
      let lastModified = file.lastModified;
      let attributes: Record<string, unknown> = {};

      if (file.handle) {
        const browserFile = await file.handle.getFile();
        content = await browserFile.text();
        lastModified = browserFile.lastModified;
      } else {
        const result = await this.requestProvider<ProviderReadResult>('ui-layout-editor-read-file-requested', { path: file.path }, 30000);
        content = result.content;
        lastModified = result.lastModified;
        attributes = result.attributes ?? {};
      }

      this.currentFile = { ...file, lastModified };
      this.sourceText = content;
      this.savedText = content;
      this.originalText = content;
      this.fileAttributes = attributes;
      this.history = [content];
      this.historyIndex = 0;
      this.dirty = false;
      this.backupCreated = false;
      this.pickerOpen = false;
      this.jsonWarning = this.validateJson(content);
      this.statusMessage = `Opened ${file.name}.`;
      this.log('success', 'file-opened', `Opened ${file.name}.`, { path: file.path, lastModified });
      dispatch(this, 'ui-layout-editor-file-opened', { file: this.currentFile, content });
      this.render();
    } catch (error) {
      this.log('error', 'file-open-failed', `Could not open ${file.name}.`, { error: this.errorMessage(error), path: file.path });
      this.render();
    }
  }

  private applySourceChange(nextSourceText: string, eventType: string, metadata: Record<string, unknown> = {}) {
    if (nextSourceText === this.sourceText) return;
    if (this.historyIndex < this.history.length - 1) this.history = this.history.slice(0, this.historyIndex + 1);
    this.sourceText = nextSourceText;
    this.history.push(nextSourceText);
    this.historyIndex = this.history.length - 1;
    this.dirty = true;
    this.externalChangeBlocked = false;
    this.jsonWarning = this.validateJson(nextSourceText);
    this.statusMessage = 'Changed. Autosave will run after editing pauses.';
    this.log('info', eventType, 'Updated file content.', metadata);
    dispatch(this, 'ui-layout-editor-content-changed', {
      file: this.currentFile,
      content: this.sourceText,
      dirty: this.dirty,
    });
    this.scheduleAutosave();
    this.render();
  }

  private handleLayoutOperations(operations: LayoutOperation[]) {
    if (!operations.length || !this.currentFile) return;
    const analysis = analyzeComponentSource({
      sourceText: this.sourceText,
      fileName: this.fileName,
      fileAttributes: this.fileAttributes,
    });
    const result = applyLayoutOperationsToSource(this.sourceText, operations, {
      fileName: this.fileName,
      analysis,
    });
    if (result.warnings.length) {
      result.warnings.forEach((warning) => this.log('warning', 'layout-operation-warning', warning, { operations }));
    }
    if (result.changed) this.applySourceChange(result.updatedText, 'layout-operation-applied', { operations });
  }

  private scheduleAutosave() {
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    this.autosaveTimer = setTimeout(() => {
      void this.autosave();
    }, AUTOSAVE_DELAY);
  }

  private async autosave() {
    if (!this.currentFile || !this.dirty || this.externalChangeBlocked) return;
    this.autosaveTimer = null;
    if (this.jsonWarning) {
      this.log('warning', 'json-invalid-save', 'JSON is currently invalid; autosave will still write the current content.', {
        warning: this.jsonWarning,
      });
    }

    try {
      const currentLastModified = await this.currentLastModified();
      if (this.currentFile.lastModified !== undefined && currentLastModified !== undefined && currentLastModified !== this.currentFile.lastModified) {
        this.externalChangeBlocked = true;
        this.statusMessage = 'The file changed outside this editor. Reload before saving.';
        this.log('warning', 'external-change-detected', this.statusMessage, {
          expectedLastModified: this.currentFile.lastModified,
          actualLastModified: currentLastModified,
        });
        this.render();
        return;
      }

      if (!this.backupCreated) await this.createBackup();
      const writeResult = await this.writeCurrentFile();
      this.currentFile = {
        ...this.currentFile,
        lastModified: writeResult.lastModified ?? await this.currentLastModified() ?? this.currentFile.lastModified,
      };
      this.savedText = this.sourceText;
      this.dirty = false;
      this.saveRetryCount = 0;
      this.statusMessage = `Saved ${this.fileName}.`;
      this.log('success', 'autosave-succeeded', this.statusMessage, {
        path: this.filePath,
        lastModified: this.currentFile.lastModified,
      });
      dispatch(this, 'ui-layout-editor-autosaved', {
        file: this.currentFile,
        content: this.sourceText,
      });
      this.render();
    } catch (error) {
      this.saveRetryCount += 1;
      const message = this.errorMessage(error);
      this.statusMessage = `Autosave failed (${this.saveRetryCount}/${MAX_SAVE_RETRIES}).`;
      this.log('error', 'autosave-failed', this.statusMessage, {
        error: message,
        retryCount: this.saveRetryCount,
        maxRetries: MAX_SAVE_RETRIES,
      });
      if (this.saveRetryCount < MAX_SAVE_RETRIES) {
        this.retryTimer = setTimeout(() => {
          void this.autosave();
        }, 1000 * this.saveRetryCount);
      }
      this.render();
    }
  }

  private async createBackup() {
    if (!this.currentFile) return;
    const backupPath = this.backupPath();
    if (this.currentFile.directoryHandle) {
      const backupName = backupPath.split('/').pop() ?? `${this.fileName}.bak`;
      const backupHandle = await this.currentFile.directoryHandle.getFileHandle(backupName, { create: true });
      const writable = await backupHandle.createWritable();
      await writable.write(this.originalText);
      await writable.close();
    } else {
      await this.requestProvider<void>('ui-layout-editor-create-backup-requested', {
        path: this.filePath,
        backupPath,
        content: this.originalText,
      }, 30000);
    }
    this.backupCreated = true;
    this.log('success', 'backup-created', `Created backup ${backupPath}.`, { backupPath });
  }

  private async writeCurrentFile(): Promise<ProviderWriteResult> {
    if (!this.currentFile) return {};
    if (this.currentFile.handle) {
      const writable = await this.currentFile.handle.createWritable();
      await writable.write(this.sourceText);
      await writable.close();
      const file = await this.currentFile.handle.getFile();
      return { lastModified: file.lastModified };
    }
    return this.requestProvider<ProviderWriteResult>('ui-layout-editor-write-file-requested', {
      path: this.filePath,
      content: this.sourceText,
    }, 30000);
  }

  private async currentLastModified(): Promise<number | undefined> {
    if (!this.currentFile) return undefined;
    if (this.currentFile.handle) return (await this.currentFile.handle.getFile()).lastModified;
    try {
      const result = await this.requestProvider<{ lastModified?: number }>('ui-layout-editor-stat-file-requested', {
        path: this.filePath,
      }, 5000);
      return result.lastModified;
    } catch {
      return this.currentFile.lastModified;
    }
  }

  private async reloadCurrentFile() {
    if (!this.currentFile) return;
    const file = this.currentFile;
    await this.loadFile(file);
    this.log('info', 'file-reloaded', `Reloaded ${file.name}.`, { path: file.path });
  }

  private undo() {
    if (!this.canUndo) return;
    this.historyIndex -= 1;
    this.restoreHistory('undo');
  }

  private redo() {
    if (!this.canRedo) return;
    this.historyIndex += 1;
    this.restoreHistory('redo');
  }

  private restoreHistory(eventType: 'undo' | 'redo') {
    const next = this.history[this.historyIndex];
    if (next === undefined) return;
    this.sourceText = next;
    this.dirty = this.sourceText !== this.savedText;
    this.externalChangeBlocked = false;
    this.jsonWarning = this.validateJson(this.sourceText);
    this.statusMessage = eventType === 'undo' ? 'Undo applied.' : 'Redo applied.';
    this.log('info', eventType, this.statusMessage, { historyIndex: this.historyIndex });
    if (this.dirty) this.scheduleAutosave();
    this.render();
  }

  private clearAutosaveTimers() {
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.autosaveTimer = null;
    this.retryTimer = null;
  }

  private bind() {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelector('[data-open-file]')?.addEventListener('click', () => void this.openFileFlow());
    this.shadowRoot.querySelector('[data-close-picker]')?.addEventListener('click', () => {
      this.pickerOpen = false;
      this.render();
    });
    this.shadowRoot.querySelectorAll<HTMLButtonElement>('[data-file-path]').forEach((button) => {
      button.addEventListener('click', () => {
        const file = this.availableFiles.find((item) => item.path === button.dataset.filePath);
        if (file) void this.loadFile(file);
      });
    });
    this.shadowRoot.querySelector('[data-toggle-layout]')?.addEventListener('click', () => {
      this.layoutPanelCollapsed = !this.layoutPanelCollapsed;
      this.render();
    });
    this.shadowRoot.querySelector('[data-toggle-log]')?.addEventListener('click', () => {
      this.logCollapsed = !this.logCollapsed;
      this.render();
    });
    this.shadowRoot.querySelector('[data-export-log]')?.addEventListener('click', () => this.exportLogs());
    this.shadowRoot.querySelector('[data-undo]')?.addEventListener('click', () => this.undo());
    this.shadowRoot.querySelector('[data-redo]')?.addEventListener('click', () => this.redo());
    this.shadowRoot.querySelector('[data-reload]')?.addEventListener('click', () => void this.reloadCurrentFile());

    if (!this.shellEventsBound) {
      this.shellEventsBound = true;
      this.shadowRoot.addEventListener('ui-layout-operations-changed', (event) => {
        const detail = (event as CustomEvent<{ operations?: LayoutOperation[] }>).detail;
        this.handleLayoutOperations(detail?.operations ?? []);
      });
      this.shadowRoot.addEventListener('ui-layout-warning', (event) => {
        const detail = (event as CustomEvent<{ message?: string }>).detail;
        if (detail?.message) this.log('warning', 'layout-warning', detail.message);
      });
    }

    this.shadowRoot.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-json-key],[data-json-value],[data-json-raw]').forEach((field) => {
      field.addEventListener('change', () => this.handleJsonFieldChange(field));
    });
    this.shadowRoot.querySelectorAll<HTMLButtonElement>('[data-json-remove],[data-json-add]').forEach((button) => {
      button.addEventListener('click', () => this.handleJsonButton(button));
    });

    const manager = this.shadowRoot.querySelector('uib-layout-manager') as HTMLElement & {
      sourceText: string;
      fileName: string;
      fileAttributes: Record<string, unknown>;
    } | null;
    if (manager && this.fileKind === 'layout') {
      manager.sourceText = this.sourceText;
      manager.fileName = this.fileName;
      manager.fileAttributes = this.fileAttributes;
    }
  }

  private handleKeyboard(keyboardEvent: KeyboardEvent) {
    const isUndo = (keyboardEvent.ctrlKey || keyboardEvent.metaKey) && !keyboardEvent.shiftKey && keyboardEvent.key.toLowerCase() === 'z';
    const isRedo = (keyboardEvent.ctrlKey || keyboardEvent.metaKey) && (keyboardEvent.key.toLowerCase() === 'y' || (keyboardEvent.shiftKey && keyboardEvent.key.toLowerCase() === 'z'));
    if (isUndo) {
      keyboardEvent.preventDefault();
      this.undo();
    }
    if (isRedo) {
      keyboardEvent.preventDefault();
      this.redo();
    }
  }

  private handleJsonFieldChange(field: HTMLInputElement | HTMLTextAreaElement) {
    if (!this.currentFile || this.fileKind !== 'json') return;
    if (field instanceof HTMLTextAreaElement && field.hasAttribute('data-json-raw')) {
      this.applySourceChange(field.value, 'json-raw-edited');
      return;
    }

    const parsed = this.parseJsonSource();
    if (!parsed.ok) {
      this.log('warning', 'json-edit-blocked', 'JSON tree edits are paused until the current JSON can be parsed.', { error: parsed.error });
      return;
    }
    const path = field.dataset.jsonKey || field.dataset.jsonValue;
    if (!path) return;
    const nextValue = structuredCloneFallback(parsed.value);
    if (field.dataset.jsonKey) {
      const oldKey = field.dataset.oldKey ?? '';
      renameJsonKey(nextValue, decodePath(path), oldKey, field.value);
    } else {
      const valueResult = parseJsonLiteral(field.value);
      if (valueResult.warning) this.log('warning', 'json-value-warning', valueResult.warning, { path });
      setJsonPath(nextValue, decodePath(path), valueResult.value);
    }
    this.applySourceChange(`${JSON.stringify(nextValue, null, 2)}\n`, 'json-tree-edited', { path });
  }

  private handleJsonButton(button: HTMLButtonElement) {
    const parsed = this.parseJsonSource();
    if (!parsed.ok) {
      this.log('warning', 'json-edit-blocked', 'JSON tree edits are paused until the current JSON can be parsed.', { error: parsed.error });
      return;
    }
    const path = button.dataset.jsonRemove || button.dataset.jsonAdd;
    if (path === undefined) return;
    const nextValue = structuredCloneFallback(parsed.value);
    if (button.dataset.jsonRemove !== undefined) {
      removeJsonPath(nextValue, decodePath(path));
      this.applySourceChange(`${JSON.stringify(nextValue, null, 2)}\n`, 'json-node-removed', { path });
      return;
    }
    addJsonChild(nextValue, decodePath(path));
    this.applySourceChange(`${JSON.stringify(nextValue, null, 2)}\n`, 'json-node-added', { path });
  }

  private renderJsonTree(): string {
    const parsed = this.parseJsonSource();
    return `
      <section class="panel json-panel">
        <div class="panel-header">
          <h2>JSON Tree</h2>
          ${this.jsonWarning ? `<span class="warning">${escapeHtml(this.jsonWarning)}</span>` : ''}
        </div>
        ${parsed.ok ? `<div class="json-tree">${renderJsonNode(parsed.value, [])}</div>` : '<p class="warning">The current JSON is invalid. Tree editing will resume when it can be parsed.</p>'}
        <label class="raw-source">Raw JSON
          <textarea data-json-raw spellcheck="false">${escapeHtml(this.sourceText)}</textarea>
        </label>
      </section>
    `;
  }

  private parseJsonSource(): { ok: true; value: unknown } | { ok: false; error: string } {
    try {
      return { ok: true, value: JSON.parse(this.sourceText || 'null') as unknown };
    } catch (error) {
      return { ok: false, error: this.errorMessage(error) };
    }
  }

  private validateJson(sourceText: string): string {
    if (this.fileKind !== 'json') return '';
    try {
      JSON.parse(sourceText || 'null');
      return '';
    } catch (error) {
      return `Invalid JSON: ${this.errorMessage(error)}`;
    }
  }

  private async requestProvider<T>(eventName: string, payload: Record<string, unknown>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`${eventName} was not handled.`)), timeoutMs);
      const detail = {
        ...payload,
        resolve: (value: T) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (reason: unknown) => {
          clearTimeout(timer);
          reject(reason instanceof Error ? reason : new Error(String(reason)));
        },
      };
      this.dispatchEvent(new CustomEvent(eventName, { bubbles: true, composed: true, detail }));
    });
  }

  private backupPath(): string {
    if (!this.currentFile) return '';
    const stamp = timestampForFileName();
    const parts = this.filePath.split('/');
    const fileName = parts.pop() || this.fileName;
    parts.push(`${fileName}.${stamp}.bak`);
    return parts.join('/');
  }

  private exportLogs() {
    const fileBase = sanitizeFileName(this.fileName.replace(/\.[^.]+$/, '') || 'ui-layout-editor');
    const name = `${fileBase}-${timestampForFileName()}.events.log`;
    const content = `${this.logs.map((entry) => JSON.stringify(entry)).join('\n')}\n`;
    const blob = new Blob([content], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
    this.log('success', 'event-log-exported', `Exported event log ${name}.`, { name });
  }

  private log(level: LogLevel, eventType: string, message: string, metadata: Record<string, unknown> = {}) {
    const entry: EditorLogEntry = {
      id: `evt_${Date.now()}_${this.logs.length + 1}`,
      timestamp: new Date().toISOString(),
      level,
      eventType,
      message,
      filePath: this.filePath || undefined,
      metadata,
    };
    this.logs = [...this.logs.slice(-199), entry];
    dispatch(this, 'ui-layout-editor-event-logged', { entry });
  }

  private isSupportedFile(fileName: string): boolean {
    return SUPPORTED_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension));
  }

  private kindForFile(fileName: string): EditorFileKind {
    return fileName.toLowerCase().endsWith('.json') ? 'json' : 'layout';
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;color:#172033;font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        *,*::before,*::after{box-sizing:border-box}
        .editor{display:grid;gap:.8rem;min-width:0}
        .toolbar,.panel{border:1px solid #d9e2ee;border-radius:8px;background:#fff}
        .toolbar{display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:.7rem .85rem}
        .identity{min-width:0;display:grid;gap:.1rem}
        .identity strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#203b5e}
        .identity span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#52677f;font-size:.84rem}
        .actions{display:flex;gap:.4rem;flex-wrap:wrap;justify-content:flex-end}
        button{min-height:2.25rem;border:1px solid #bdcbdd;border-radius:6px;background:#fff;color:#203b5e;font:inherit;font-weight:800;cursor:pointer}
        button.primary{border-color:#245ea8;background:#245ea8;color:#fff}
        button.icon{min-width:2.25rem;padding:0 .55rem}
        button:disabled{opacity:.48;cursor:not-allowed}
        .status{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;color:#52677f}
        .badge{display:inline-flex;align-items:center;min-height:1.45rem;padding:.1rem .45rem;border-radius:999px;border:1px solid #c9d5e5;font-size:.78rem;font-weight:800}
        .badge.dirty{border-color:#e4bd68;color:#875b09;background:#fff8e8}
        .badge.saved{border-color:#b7d8bd;color:#206b32;background:#effaf1}
        .panel{display:grid;gap:.7rem;padding:.85rem;min-width:0}
        .panel-header{display:flex;align-items:center;justify-content:space-between;gap:.7rem}
        h2{margin:0;color:#203b5e;font-size:1rem}
        uib-layout-manager{display:block}
        .hidden{display:none}
        .picker{position:fixed;inset:1.5rem;z-index:20;display:grid;grid-template-rows:auto 1fr;gap:.8rem;padding:1rem;border:1px solid #bdcbdd;border-radius:8px;background:#fff;box-shadow:0 24px 60px rgba(15,32,54,.22)}
        .file-list{display:grid;align-content:start;gap:.35rem;overflow:auto}
        .file-list button{display:grid;text-align:left;padding:.55rem .65rem}
        .file-list small{color:#52677f;font-weight:500}
        .warning{color:#8a5a00}
        .log{display:grid;gap:.5rem;max-height:15rem;overflow:auto}
        .log-entry{display:grid;gap:.1rem;padding:.5rem;border-left:3px solid #c9d5e5;background:#f8fafd}
        .log-entry.success{border-color:#2f7d42}.log-entry.warning{border-color:#d19611}.log-entry.error{border-color:#b4232a}
        .log-entry time{color:#52677f;font-size:.78rem}
        .json-tree{display:grid;gap:.35rem}
        .json-node{display:grid;gap:.35rem;margin-left:calc(var(--depth,0) * 1rem);padding:.45rem;border:1px solid #e0e7f0;border-radius:6px;background:#fbfcfe}
        .json-row{display:grid;grid-template-columns:minmax(8rem,.8fr) minmax(10rem,1.2fr) auto auto;gap:.4rem;align-items:end}
        .json-row label,.raw-source{display:grid;gap:.25rem;color:#40546d;font-weight:800}
        input,textarea{width:100%;min-width:0;border:1px solid #bdcbdd;border-radius:6px;padding:.45rem .55rem;font:inherit}
        textarea{min-height:12rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
        .raw-source textarea{min-height:9rem}
        .external{display:flex;gap:.6rem;align-items:center;justify-content:space-between;border:1px solid #e4bd68;background:#fff8e8;border-radius:8px;padding:.65rem .75rem}
        @media(max-width:840px){.toolbar{display:grid}.actions{justify-content:flex-start}.json-row{grid-template-columns:1fr}.picker{inset:.75rem}}
      </style>
      <div class="editor">
        <div class="toolbar">
          <div class="identity">
            <strong>${escapeHtml(this.fileName)}</strong>
            <span>${escapeHtml(this.filePath || `Start folder: ${this.startfolder}`)}</span>
          </div>
          <div class="actions">
            <button class="primary" type="button" data-open-file>Open File</button>
            <button class="icon" type="button" data-undo title="Undo" aria-label="Undo" ${this.canUndo ? '' : 'disabled'}>Undo</button>
            <button class="icon" type="button" data-redo title="Redo" aria-label="Redo" ${this.canRedo ? '' : 'disabled'}>Redo</button>
            <button type="button" data-toggle-layout ${this.currentFile ? '' : 'disabled'}>${this.layoutPanelCollapsed ? 'Show Layout' : 'Hide Layout'}</button>
            <button type="button" data-toggle-log>${this.logCollapsed ? 'Show Log' : 'Hide Log'}</button>
            <button class="icon" type="button" data-export-log title="Export event log" aria-label="Export event log">Log</button>
          </div>
        </div>
        <div class="status">
          <span class="badge ${this.dirty ? 'dirty' : 'saved'}">${this.dirty ? 'dirty' : 'saved'}</span>
          <span>${escapeHtml(this.statusMessage)}</span>
          ${this.saveRetryCount ? `<span class="warning">Retry ${this.saveRetryCount}/${MAX_SAVE_RETRIES}</span>` : ''}
        </div>
        ${this.externalChangeBlocked ? `
          <div class="external">
            <span>The file changed outside this editor. Reload before saving.</span>
            <button type="button" data-reload>Reload</button>
          </div>
        ` : ''}
        ${this.currentFile ? this.fileKind === 'json' ? this.renderJsonTree() : `
          <section class="panel ${this.layoutPanelCollapsed ? 'hidden' : ''}">
            <div class="panel-header">
              <h2>Layout Editor</h2>
            </div>
            <uib-layout-manager></uib-layout-manager>
          </section>
        ` : `
          <section class="panel">
            <h2>No File Open</h2>
            <p>Use Open File to pick the ${escapeHtml(this.startfolder)} folder and select a JavaScript, TypeScript, HTML, or JSON file.</p>
          </section>
        `}
        <section class="panel ${this.logCollapsed ? 'hidden' : ''}">
          <div class="panel-header">
            <h2>Event Log</h2>
            <span>${this.logs.length} events</span>
          </div>
          <div class="log">${this.logs.length ? this.logs.slice().reverse().map((entry) => `
            <article class="log-entry ${entry.level}">
              <strong>${escapeHtml(entry.message)}</strong>
              <time>${escapeHtml(entry.timestamp)} / ${escapeHtml(entry.eventType)}</time>
            </article>
          `).join('') : '<p>No events yet.</p>'}</div>
        </section>
        ${this.pickerOpen ? `
          <section class="picker" role="dialog" aria-modal="true" aria-label="Open file">
            <div class="panel-header">
              <h2>Open File</h2>
              <button type="button" data-close-picker>Close</button>
            </div>
            <div class="file-list">
              ${this.availableFiles.length ? this.availableFiles.map((file) => `
                <button type="button" data-file-path="${attr(file.path)}">
                  <span>${escapeHtml(file.name)}</span>
                  <small>${escapeHtml(file.path)}</small>
                </button>
              `).join('') : '<p>No supported files were found.</p>'}
            </div>
          </section>
        ` : ''}
      </div>
    `;
    this.bind();
  }
}

function renderJsonNode(value: unknown, path: string[], key?: string, depth = 0, parentIsArray = false): string {
  const pointer = encodePath(path);
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  const isContainer = value !== null && typeof value === 'object';
  const keyField = key === undefined ? '<span></span>' : parentIsArray ? `
    <label>Index
      <input value="${attr(key)}" disabled>
    </label>
  ` : `
    <label>Key
      <input data-json-key="${attr(encodePath(path.slice(0, -1)))}" data-old-key="${attr(key)}" value="${attr(key)}">
    </label>
  `;
  const valueField = isContainer ? `<span>${escapeHtml(type)}</span>` : `
    <label>Value
      <input data-json-value="${attr(pointer)}" value="${attr(JSON.stringify(value))}">
    </label>
  `;
  const children = Array.isArray(value)
    ? value.map((item, index) => renderJsonNode(item, [...path, String(index)], String(index), depth + 1, true)).join('')
    : value && typeof value === 'object'
      ? Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => renderJsonNode(childValue, [...path, childKey], childKey, depth + 1, false)).join('')
      : '';
  return `
    <div class="json-node" style="--depth:${depth}">
      <div class="json-row">
        ${keyField}
        ${valueField}
        ${isContainer ? `<button type="button" data-json-add="${attr(pointer)}">Add</button>` : '<span></span>'}
        ${path.length ? `<button type="button" data-json-remove="${attr(pointer)}">Remove</button>` : '<span></span>'}
      </div>
      ${children}
    </div>
  `;
}

function parseJsonLiteral(value: string): { value: unknown; warning?: string } {
  try {
    return { value: JSON.parse(value) as unknown };
  } catch {
    return {
      value,
      warning: `Value ${value} is not valid JSON literal syntax and was saved as a string.`,
    };
  }
}

function addJsonChild(root: unknown, path: string[]) {
  const target = getJsonPath(root, path);
  if (Array.isArray(target)) {
    target.push(null);
  } else if (target && typeof target === 'object') {
    const object = target as Record<string, unknown>;
    let index = 1;
    let key = 'newKey';
    while (Object.prototype.hasOwnProperty.call(object, key)) {
      index += 1;
      key = `newKey${index}`;
    }
    object[key] = '';
  }
}

function removeJsonPath(root: unknown, path: string[]) {
  const parent = getJsonPath(root, path.slice(0, -1));
  const key = path[path.length - 1];
  if (Array.isArray(parent)) parent.splice(Number(key), 1);
  else if (parent && typeof parent === 'object') delete (parent as Record<string, unknown>)[key];
}

function renameJsonKey(root: unknown, parentPath: string[], oldKey: string, newKey: string) {
  const parent = getJsonPath(root, parentPath);
  if (!parent || typeof parent !== 'object' || Array.isArray(parent) || !newKey || oldKey === newKey) return;
  const object = parent as Record<string, unknown>;
  const entries: Array<[string, unknown]> = Object.entries(object).map(([key, value]) => key === oldKey ? [newKey, value] : [key, value]);
  Object.keys(object).forEach((key) => delete object[key]);
  entries.forEach(([key, value]) => {
    object[key] = value;
  });
}

function setJsonPath(root: unknown, path: string[], value: unknown) {
  const parent = getJsonPath(root, path.slice(0, -1));
  const key = path[path.length - 1];
  if (Array.isArray(parent)) parent[Number(key)] = value;
  else if (parent && typeof parent === 'object') (parent as Record<string, unknown>)[key] = value;
}

function getJsonPath(root: unknown, path: string[]): unknown {
  return path.reduce((current, part) => {
    if (Array.isArray(current)) return current[Number(part)];
    if (current && typeof current === 'object') return (current as Record<string, unknown>)[part];
    return undefined;
  }, root);
}

function encodePath(path: string[]): string {
  return path.map((part) => part.replaceAll('~', '~0').replaceAll('/', '~1')).join('/');
}

function decodePath(value: string): string[] {
  if (!value) return [];
  return value.split('/').map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'));
}

function structuredCloneFallback<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function timestampForFileName(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'ui-layout-editor';
}

defineLayoutElement('uib-layout-editor', UibLayoutEditor);

declare global {
  interface HTMLElementTagNameMap {
    'uib-layout-editor': UibLayoutEditor;
  }
}
