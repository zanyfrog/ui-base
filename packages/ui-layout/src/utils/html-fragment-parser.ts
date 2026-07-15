import type { LayoutEditOperation, LayoutNode, LayoutSourceRef } from '../model/layout-node.js';
import { stableId } from './stable-id.js';
import { lineColumnForIndex, truncateLabel } from './source-ranges.js';

export interface HtmlFragmentParseContext {
  fileName?: string;
  methodName?: string;
  propertyName?: string;
  sourceText: string;
  sourceOffset: number;
  idPrefix?: string;
}

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export function parseHtmlFragment(rawText: string, context: HtmlFragmentParseContext): LayoutNode[] {
  const roots: LayoutNode[] = [];
  const stack: LayoutNode[] = [];
  let cursor = 0;

  while (cursor < rawText.length) {
    if (rawText.startsWith('<!--', cursor)) {
      const closeIndex = rawText.indexOf('-->', cursor + 4);
      cursor = closeIndex >= 0 ? closeIndex + 3 : rawText.length;
      continue;
    }

    if (rawText.startsWith('${', cursor)) {
      const end = findDynamicExpressionEnd(rawText, cursor);
      appendNode(dynamicNode(rawText.slice(cursor + 2, end - 1), cursor, end, context), roots, stack);
      cursor = end;
      continue;
    }

    if (rawText[cursor] === '<') {
      if (rawText[cursor + 1] === '/') {
        const closeIndex = rawText.indexOf('>', cursor + 2);
        const tagName = rawText.slice(cursor + 2, closeIndex >= 0 ? closeIndex : rawText.length).trim().toLowerCase();
        while (stack.length) {
          const node = stack.pop();
          if (node?.tagName?.toLowerCase() === tagName) break;
        }
        cursor = closeIndex >= 0 ? closeIndex + 1 : rawText.length;
        continue;
      }

      const tagEnd = findTagEnd(rawText, cursor);
      if (tagEnd > cursor) {
        const openingTag = rawText.slice(cursor, tagEnd);
        const parsed = parseOpeningTag(openingTag);
        if (parsed) {
          const node = elementNode(parsed.tagName, parsed.attributes, cursor, tagEnd, context);
          appendNode(node, roots, stack);
          if (!parsed.selfClosing && !VOID_ELEMENTS.has(parsed.tagName.toLowerCase())) stack.push(node);
          cursor = tagEnd;
          continue;
        }
      }
    }

    const nextTag = nextSpecialIndex(rawText, cursor + 1);
    const textEnd = nextTag >= 0 ? nextTag : rawText.length;
    const text = rawText.slice(cursor, textEnd);
    if (text.trim()) appendNode(textNode(text, cursor, textEnd, context), roots, stack);
    cursor = textEnd;
  }

  return roots;
}

function appendNode(node: LayoutNode, roots: LayoutNode[], stack: LayoutNode[]): void {
  const parent = stack[stack.length - 1];
  if (parent) parent.children.push(node);
  else roots.push(node);
}

function elementNode(tagName: string, attributes: Record<string, string>, start: number, end: number, context: HtmlFragmentParseContext): LayoutNode {
  const absoluteStart = context.sourceOffset + start;
  const position = lineColumnForIndex(context.sourceText, absoluteStart);
  const layoutId = attributes['data-layout-id'];
  const readonly = attributes['data-layout-edit'] === 'readonly';
  const kind = tagName.includes('-') ? 'component' : tagName === 'slot' ? 'slot' : 'element';
  const label = attributes['data-layout-label'] || `${tagName}${attributes.class ? `.${attributes.class.split(/\s+/).filter(Boolean).join('.')}` : ''}`;
  const editable = !readonly;
  const allowedOperations: LayoutEditOperation[] = editable
    ? ['edit-class', 'add-class', 'remove-class', 'edit-attribute', 'remove-attribute', 'move', 'wrap', 'unwrap']
    : ['readonly'];

  return {
    id: layoutId || stableId([context.idPrefix, context.fileName, context.methodName, tagName, absoluteStart]),
    kind,
    tagName,
    label,
    classList: (attributes.class ?? '').split(/\s+/).filter(Boolean),
    attributes,
    children: [],
    source: {
      fileName: context.fileName,
      methodName: context.methodName,
      propertyName: context.propertyName,
      start: absoluteStart,
      end: context.sourceOffset + end,
      line: position.line,
      column: position.column,
      confidence: layoutId ? 'high' : 'medium',
    },
    editable,
    allowedOperations,
    warnings: readonly ? ['Node is marked read-only by data-layout-edit.'] : [],
  };
}

function textNode(text: string, start: number, end: number, context: HtmlFragmentParseContext): LayoutNode {
  const absoluteStart = context.sourceOffset + start;
  const position = lineColumnForIndex(context.sourceText, absoluteStart);
  return {
    id: stableId([context.idPrefix, context.fileName, context.methodName, 'text', absoluteStart]),
    kind: 'text',
    label: truncateLabel(text),
    text: text.trim(),
    classList: [],
    attributes: {},
    children: [],
    source: {
      fileName: context.fileName,
      methodName: context.methodName,
      propertyName: context.propertyName,
      start: absoluteStart,
      end: context.sourceOffset + end,
      line: position.line,
      column: position.column,
      confidence: 'high',
    },
    editable: true,
    allowedOperations: ['edit-text'],
    warnings: [],
  };
}

function dynamicNode(expression: string, start: number, end: number, context: HtmlFragmentParseContext): LayoutNode {
  const absoluteStart = context.sourceOffset + start;
  const position = lineColumnForIndex(context.sourceText, absoluteStart);
  return {
    id: stableId([context.idPrefix, context.fileName, context.methodName, 'dynamic', absoluteStart, expression]),
    kind: 'dynamic',
    label: `dynamic: ${truncateLabel(expression, 56)}`,
    text: expression.trim(),
    classList: [],
    attributes: {},
    children: [],
    source: {
      fileName: context.fileName,
      methodName: context.methodName,
      propertyName: context.propertyName,
      start: absoluteStart,
      end: context.sourceOffset + end,
      line: position.line,
      column: position.column,
      confidence: 'low',
    },
    editable: false,
    allowedOperations: ['readonly'],
    warnings: ['Dynamic expression could not be safely resolved and is read-only.'],
  };
}

function nextSpecialIndex(rawText: string, from: number): number {
  const nextTag = rawText.indexOf('<', from);
  const nextDynamic = rawText.indexOf('${', from);
  if (nextTag < 0) return nextDynamic;
  if (nextDynamic < 0) return nextTag;
  return Math.min(nextTag, nextDynamic);
}

function findTagEnd(rawText: string, start: number): number {
  let quote = '';
  for (let index = start + 1; index < rawText.length; index += 1) {
    const char = rawText[index];
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '>') return index + 1;
  }
  return -1;
}

function findDynamicExpressionEnd(rawText: string, start: number): number {
  let depth = 0;
  let quote = '';
  for (let index = start + 2; index < rawText.length; index += 1) {
    const char = rawText[index];
    const previous = rawText[index - 1];
    if (quote) {
      if (char === quote && previous !== '\\') quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      if (depth === 0) return index + 1;
      depth -= 1;
    }
  }
  return rawText.length;
}

function parseOpeningTag(openingTag: string): { tagName: string; attributes: Record<string, string>; selfClosing: boolean } | null {
  const match = openingTag.match(/^<\s*([a-zA-Z][\w:.-]*)/);
  if (!match) return null;
  const tagName = match[1];
  const attributes: Record<string, string> = {};
  const attrSource = openingTag.slice(match[0].length, openingTag.replace(/\/?>\s*$/, '').length);
  const attrPattern = /([:@a-zA-Z_][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = attrPattern.exec(attrSource))) {
    attributes[attrMatch[1]] = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
  }
  return {
    tagName,
    attributes,
    selfClosing: /\/>\s*$/.test(openingTag),
  };
}
