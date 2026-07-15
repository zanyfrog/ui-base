import type { AnalyzeSourceInput, LayoutAnalysis } from '../model/layout-analysis.js';
import { extractLayoutTree } from './extract-layout-tree.js';
import { extractTemplateFragments } from './extract-template-fragments.js';

export function analyzeComponentSource(input: AnalyzeSourceInput | string): LayoutAnalysis {
  const normalized = typeof input === 'string' ? { sourceText: input } : input;
  const sourceText = normalized.sourceText ?? '';
  const templateFragments = extractTemplateFragments({
    sourceText,
    fileName: normalized.fileName,
  });
  const componentName = sourceText.match(/class\s+([A-Za-z_$][\w$]*)\s+extends\s+[A-Za-z_$][\w$.]*/)?.[1];
  const customElementName = sourceText.match(/customElements\.define\(\s*['"`]([^'"`]+)['"`]/)?.[1];
  const framework = /\.html?$/i.test(normalized.fileName ?? '')
    ? 'html'
    : customElementName || /extends\s+(?:HTMLElement|BaseHTMLElement)/.test(sourceText)
      ? 'web-component'
      : templateFragments.length
        ? 'unknown'
        : 'html';
  const warnings = templateFragments.length
    ? []
    : ['No HTML-like template content was found.'];

  return {
    fileName: normalized.fileName,
    fileAttributes: normalized.fileAttributes ?? {},
    componentName,
    customElementName,
    framework,
    rootNodes: extractLayoutTree(templateFragments),
    templateFragments,
    warnings,
  };
}

export const analyzeComponent = analyzeComponentSource;
