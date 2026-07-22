export type PageImportItemKind =
  | 'field'
  | 'instruction'
  | 'static-value'
  | 'action'
  | 'asset'
  | 'table'
  | 'dashboard'
  | 'unknown';

export type PageImportLogLevel = 'info' | 'success' | 'warning' | 'error';

export interface PageImportMetadata {
  projectName: string;
  routePath: string;
  pageName: string;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageImportSource {
  html: string;
  css: string;
  js: string;
}

export interface PageImportPosition {
  order: number;
  sectionId?: string;
  selector?: string;
  domPath?: string;
  gridColumn?: string;
  gridRow?: string;
}

export interface PageImportDatabaseSuggestion {
  fieldName: string;
  label: string;
  type: string;
  required: boolean;
  sampleValue?: string;
  entityGuess?: string;
  stale?: boolean;
}

export interface PageImportItem {
  id: string;
  kind: PageImportItemKind;
  label: string;
  value?: string;
  inputType?: string;
  name?: string;
  elementId?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  componentTag?: string;
  sourceSnippet?: string;
  cssSnippet?: string;
  position?: PageImportPosition;
  database?: PageImportDatabaseSuggestion;
  hidden?: boolean;
  notes?: string;
}

export interface PageImportTreeNode {
  id: string;
  label: string;
  kind: 'page' | 'section' | 'group' | PageImportItemKind;
  itemId?: string;
  children: PageImportTreeNode[];
}

export interface PageImportAsset {
  id: string;
  url: string;
  type: 'image' | 'script' | 'stylesheet' | 'font' | 'download' | 'unknown';
  label?: string;
  usedBy: string[];
}

export interface PageImportLogEntry {
  id: string;
  timestamp: string;
  level: PageImportLogLevel;
  message: string;
}

export interface PageExtractionResult {
  source: PageImportSource;
  items: PageImportItem[];
  tree: PageImportTreeNode;
  assets: PageImportAsset[];
  logs: PageImportLogEntry[];
}

export interface PageImportArtifact {
  id: string;
  schemaVersion: 1;
  metadata: PageImportMetadata;
  source: PageImportSource;
  items: PageImportItem[];
  tree: PageImportTreeNode;
  assets: PageImportAsset[];
  logs: PageImportLogEntry[];
}

export function createPageImportArtifact(input: {
  id?: string;
  metadata: Partial<PageImportMetadata>;
  extraction: PageExtractionResult;
  now?: string;
}): PageImportArtifact {
  const now = input.now ?? new Date().toISOString();
  return {
    id: input.id ?? createId('artifact'),
    schemaVersion: 1,
    metadata: {
      projectName: input.metadata.projectName || 'Modernization Project',
      routePath: input.metadata.routePath || '/',
      pageName: input.metadata.pageName || 'Imported Page',
      sourceUrl: input.metadata.sourceUrl || '',
      createdAt: input.metadata.createdAt || now,
      updatedAt: now,
    },
    source: input.extraction.source,
    items: input.extraction.items,
    tree: input.extraction.tree,
    assets: input.extraction.assets,
    logs: input.extraction.logs,
  };
}

export function createId(prefix: string): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') return `${prefix}_${cryptoApi.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
