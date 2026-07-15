import type { LayoutNode, LayoutSourceRef } from './layout-node.js';

export interface TemplateFragment {
  id: string;
  methodName?: string;
  propertyName?: string;
  source: LayoutSourceRef;
  rawText: string;
  rootNodes: LayoutNode[];
}

export interface LayoutAnalysis {
  fileName?: string;
  fileAttributes: Record<string, unknown>;
  componentName?: string;
  customElementName?: string;
  framework: 'web-component' | 'html' | 'jsx' | 'unknown';
  rootNodes: LayoutNode[];
  templateFragments: TemplateFragment[];
  warnings: string[];
}

export interface AnalyzeSourceInput {
  sourceText: string;
  fileName?: string;
  fileAttributes?: Record<string, unknown>;
}
