import { describe, expect, it } from 'vitest';
import type { PageImportItem } from '../src/model/page-import-artifact.js';
import { matchImportedTextItem } from '../src/page-importer/text-component-matching.js';

describe('matchImportedTextItem', () => {
  it('maps short text without a period to uib-heading using the original heading tag level', () => {
    const item = textItem({
      label: 'Customer Intake',
      value: 'Customer Intake',
      sourceSnippet: '<h2>Customer Intake</h2>',
    });

    expect(matchImportedTextItem(item)).toMatchObject({
      kind: 'instruction',
      componentTag: 'uib-heading',
      headingLevel: 2,
    });
  });

  it('guesses heading level from font size when no heading tag is available', () => {
    const item = textItem({
      label: 'Overview',
      value: 'Overview',
      sourceSnippet: '<div>Overview</div>',
      cssSnippet: '.title {\n  font-size: 38px;\n}',
    });

    expect(matchImportedTextItem(item)).toMatchObject({
      componentTag: 'uib-heading',
      headingLevel: 2,
    });
  });

  it('keeps original heading tags as uib-heading even when text is not short', () => {
    const item = textItem({
      label: 'Review reservation details before you continue',
      value: 'Review reservation details before you continue',
      sourceSnippet: '<h4>Review reservation details before you continue</h4>',
    });

    expect(matchImportedTextItem(item)).toMatchObject({
      componentTag: 'uib-heading',
      headingLevel: 4,
    });
  });

  it('maps longer paragraph text to uib-instruction without adding heading metadata', () => {
    const item = textItem({
      label: 'Use this form to capture a new customer request.',
      value: 'Use this form to capture a new customer request.',
      sourceSnippet: '<p>Use this form to capture a new customer request.</p>',
    });

    expect(matchImportedTextItem(item)).toEqual({
      ...item,
      kind: 'instruction',
      componentTag: 'uib-instruction',
    });
  });

  it('leaves fields and non-text raw html alone', () => {
    const field = textItem({ kind: 'field', label: 'First name', value: 'Ada' });
    const raw = textItem({ kind: 'unknown', label: 'legacy-widget', value: '<legacy-widget></legacy-widget>' });

    expect(matchImportedTextItem(field)).toBe(field);
    expect(matchImportedTextItem(raw)).toBe(raw);
  });
});

function textItem(overrides: Partial<PageImportItem>): PageImportItem {
  return {
    id: 'item_text',
    kind: 'instruction',
    label: 'Text',
    value: 'Text',
    position: { order: 1 },
    ...overrides,
  };
}
