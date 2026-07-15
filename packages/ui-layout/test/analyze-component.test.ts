import { describe, expect, it } from 'vitest';
import { analyzeComponentSource } from '../src/analyzer/analyze-component.js';
import { simpleStaticHtml } from './fixtures/simple-static-html.js';
import { simpleWebComponent } from './fixtures/simple-web-component.js';
import { nestedTemplateMethods } from './fixtures/nested-template-methods.js';

describe('analyzeComponentSource', () => {
  it('analyzes plain HTML content', () => {
    const analysis = analyzeComponentSource({ sourceText: simpleStaticHtml, fileName: 'example.html' });
    expect(analysis.framework).toBe('html');
    expect(analysis.rootNodes[0]?.id).toBe('page');
    expect(analysis.rootNodes[0]?.children[0]?.tagName).toBe('header');
  });

  it('detects Web Component metadata and dynamic nodes', () => {
    const analysis = analyzeComponentSource({ sourceText: simpleWebComponent, fileName: 'uib-example.ts' });
    expect(analysis.framework).toBe('web-component');
    expect(analysis.componentName).toBe('UibExample');
    expect(analysis.customElementName).toBe('uib-example');
    const section = analysis.templateFragments[0]?.rootNodes[0];
    expect(section?.id).toBe('shell');
    expect(section?.children.some((node) => node.kind === 'dynamic')).toBe(true);
  });

  it('extracts helper method template fragments', () => {
    const analysis = analyzeComponentSource({ sourceText: nestedTemplateMethods, fileName: 'uib-nested.ts' });
    expect(analysis.templateFragments.map((fragment) => fragment.methodName)).toContain('render');
    expect(analysis.templateFragments.map((fragment) => fragment.methodName)).toContain('toolbarMarkup');
    expect(analysis.rootNodes.length).toBeGreaterThan(1);
  });
});
