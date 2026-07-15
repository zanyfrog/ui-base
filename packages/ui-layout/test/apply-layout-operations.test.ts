import { describe, expect, it } from 'vitest';
import { analyzeComponentSource } from '../src/analyzer/analyze-component.js';
import { applyLayoutOperationsToSource } from '../src/writer/apply-layout-operations.js';
import { simpleStaticHtml } from './fixtures/simple-static-html.js';

describe('applyLayoutOperationsToSource', () => {
  it('adds and removes static classes', () => {
    const analysis = analyzeComponentSource({ sourceText: simpleStaticHtml, fileName: 'example.html' });
    const result = applyLayoutOperationsToSource(simpleStaticHtml, [
      { id: 'op_add', type: 'add-class', nodeId: 'page', className: 'selected' },
      { id: 'op_remove', type: 'remove-class', nodeId: 'page', className: 'page' },
    ], { fileName: 'example.html', analysis });

    expect(result.changed).toBe(true);
    expect(result.updatedText).toContain('class="selected"');
    expect(result.updatedText).not.toContain('class="page"');
    expect(result.diffText).toContain('--- example.html');
  });

  it('sets static attributes and edits static text', () => {
    const analysis = analyzeComponentSource({ sourceText: simpleStaticHtml, fileName: 'example.html' });
    const intro = analysis.rootNodes[0]?.children[1]?.children[0];
    const text = intro?.children[0];
    expect(intro?.id).toBe('intro');
    expect(text?.kind).toBe('text');

    const result = applyLayoutOperationsToSource(simpleStaticHtml, [
      { id: 'op_attr', type: 'set-attribute', nodeId: 'intro', name: 'data-layout-role', value: 'intro' },
      { id: 'op_text', type: 'set-text', nodeId: text?.id ?? '', value: 'Continue here' },
    ], { fileName: 'example.html', analysis });

    expect(result.updatedText).toContain('data-layout-role="intro"');
    expect(result.updatedText).toContain('Continue here');
  });

  it('removes static attributes', () => {
    const source = '<section data-layout-id="root"><p data-layout-id="item" class="lead">Text</p></section>';
    const analysis = analyzeComponentSource({ sourceText: source, fileName: 'example.html' });
    const result = applyLayoutOperationsToSource(source, [
      { id: 'op_remove_attr', type: 'remove-attribute', nodeId: 'item', name: 'class' },
    ], { fileName: 'example.html', analysis });

    expect(result.updatedText).toContain('<p data-layout-id="item">Text</p>');
  });

  it('moves static sibling nodes', () => {
    const source = '<section data-layout-id="root"><p data-layout-id="a">A</p><p data-layout-id="b">B</p></section>';
    const analysis = analyzeComponentSource({ sourceText: source, fileName: 'example.html' });
    const result = applyLayoutOperationsToSource(source, [
      { id: 'op_move', type: 'move-node', nodeId: 'b', newParentNodeId: 'root', newIndex: 0 },
    ], { fileName: 'example.html', analysis });

    expect(result.updatedText).toContain('<p data-layout-id="b">B</p><p data-layout-id="a">A</p>');
  });
});
