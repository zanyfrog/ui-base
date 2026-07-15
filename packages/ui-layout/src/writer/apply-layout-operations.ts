import { analyzeComponentSource } from '../analyzer/analyze-component.js';
import type { LayoutAnalysis } from '../model/layout-analysis.js';
import type { LayoutNode } from '../model/layout-node.js';
import type { LayoutOperation } from '../model/layout-operation.js';
import { generateSourcePatch } from './generate-source-patch.js';

export interface PatchOptions {
  fileName?: string;
  analysis?: LayoutAnalysis;
}

export interface PatchResult {
  fileName?: string;
  originalText: string;
  updatedText: string;
  diffText: string;
  changed: boolean;
  warnings: string[];
}

interface SourceEdit {
  start: number;
  end: number;
  value: string;
}

interface IndexedLayoutNode {
  node: LayoutNode;
  parent: LayoutNode | null;
}

export function applyLayoutOperationsToSource(sourceText: string, operations: LayoutOperation[], options: PatchOptions = {}): PatchResult {
  const analysis = options.analysis ?? analyzeComponentSource({ sourceText, fileName: options.fileName });
  const nodes = flattenNodes(analysis.rootNodes);
  const warnings: string[] = [...analysis.warnings];
  const edits: SourceEdit[] = [];
  const tagEdits = new Map<string, SourceEdit>();

  for (const operation of operations) {
    const node = nodes.get(operation.nodeId);
    if (!node) {
      warnings.push(`Operation ${operation.id} skipped because node ${operation.nodeId} was not found.`);
      continue;
    }
    if (!node.editable || !node.source || node.source.start === undefined || node.source.end === undefined) {
      warnings.push(`Operation ${operation.id} skipped because ${node.label} is read-only or has no safe source range.`);
      continue;
    }

    if (operation.type === 'add-class' || operation.type === 'remove-class' || operation.type === 'set-attribute' || operation.type === 'remove-attribute') {
      if (node.kind !== 'element' && node.kind !== 'component') {
        warnings.push(`Operation ${operation.id} skipped because ${node.label} is not an element.`);
        continue;
      }
      const key = `${node.source.start}:${node.source.end}`;
      const existing = tagEdits.get(key);
      const openingTag = existing?.value ?? sourceText.slice(node.source.start, node.source.end);
      tagEdits.set(key, {
        start: node.source.start,
        end: node.source.end,
        value: updateOpeningTag(openingTag, operation),
      });
      continue;
    }

    if (operation.type === 'move-node') {
      const moveEdit = createMoveEdit(sourceText, analysis.rootNodes, operation.nodeId, operation.newParentNodeId, operation.newIndex, warnings);
      if (moveEdit) edits.push(moveEdit);
      continue;
    }

    if (operation.type === 'set-text') {
      if (node.kind !== 'text') {
        warnings.push(`Operation ${operation.id} skipped because ${node.label} is not static text.`);
        continue;
      }
      edits.push({
        start: node.source.start,
        end: node.source.end,
        value: escapeStaticText(operation.value, options.fileName),
      });
      continue;
    }

    warnings.push(`Operation ${operation.id} skipped because ${operation.type} is not writable in the MVP.`);
  }

  const updatedText = applyEdits(sourceText, [...tagEdits.values(), ...edits], warnings);
  return {
    fileName: options.fileName,
    originalText: sourceText,
    updatedText,
    diffText: generateSourcePatch(sourceText, updatedText, options.fileName ?? 'source'),
    changed: updatedText !== sourceText,
    warnings,
  };
}

export const applyLayoutOperations = applyLayoutOperationsToSource;

function flattenNodes(nodes: LayoutNode[], map = new Map<string, LayoutNode>()): Map<string, LayoutNode> {
  for (const node of nodes) {
    map.set(node.id, node);
    flattenNodes(node.children, map);
  }
  return map;
}

function applyEdits(sourceText: string, edits: SourceEdit[], warnings: string[]): string {
  const ordered = [...edits].sort((left, right) => left.start - right.start || right.end - left.end);
  let updated = '';
  let cursor = 0;
  let lastEnd = -1;

  for (const edit of ordered) {
    if (edit.start < lastEnd) {
      warnings.push(`Skipped overlapping edit at ${edit.start}-${edit.end}.`);
      continue;
    }
    updated += sourceText.slice(cursor, edit.start);
    updated += edit.value;
    cursor = edit.end;
    lastEnd = edit.end;
  }

  return updated + sourceText.slice(cursor);
}

function updateOpeningTag(openingTag: string, operation: LayoutOperation): string {
  if (operation.type === 'add-class') return setClassList(openingTag, (classes) => [...new Set([...classes, operation.className].filter(Boolean))]);
  if (operation.type === 'remove-class') return setClassList(openingTag, (classes) => classes.filter((className) => className !== operation.className));
  if (operation.type === 'set-attribute') return setAttribute(openingTag, operation.name, operation.value);
  if (operation.type === 'remove-attribute') return removeAttribute(openingTag, operation.name);
  return openingTag;
}

function setClassList(openingTag: string, update: (classes: string[]) => string[]): string {
  const match = openingTag.match(/\sclass\s*=\s*(["'])(.*?)\1/s);
  const classValue = update((match?.[2] ?? '').split(/\s+/).filter(Boolean)).join(' ');
  if (match) return openingTag.slice(0, match.index) + ` class=${match[1]}${classValue}${match[1]}` + openingTag.slice((match.index ?? 0) + match[0].length);
  return insertAttribute(openingTag, `class="${classValue}"`);
}

function setAttribute(openingTag: string, name: string, value: string): string {
  const safeName = name.trim();
  if (!/^[a-zA-Z_:][\w:.-]*$/.test(safeName)) return openingTag;
  const pattern = new RegExp(`\\s${escapeRegExp(safeName)}\\s*=\\s*(["'])(.*?)\\1`, 's');
  const match = openingTag.match(pattern);
  if (match) return openingTag.slice(0, match.index) + ` ${safeName}=${match[1]}${escapeAttribute(value)}${match[1]}` + openingTag.slice((match.index ?? 0) + match[0].length);
  return insertAttribute(openingTag, `${safeName}="${escapeAttribute(value)}"`);
}

function removeAttribute(openingTag: string, name: string): string {
  const safeName = name.trim();
  if (!/^[a-zA-Z_:][\w:.-]*$/.test(safeName)) return openingTag;
  const pattern = new RegExp(`\\s${escapeRegExp(safeName)}(?:\\s*=\\s*(["']).*?\\1|\\s*=\\s*[^\\s"'=<>]+)?`, 's');
  return openingTag.replace(pattern, '');
}

function createMoveEdit(
  sourceText: string,
  roots: LayoutNode[],
  nodeId: string,
  newParentNodeId: string,
  newIndex: number,
  warnings: string[],
): SourceEdit | null {
  const indexed = indexNodes(roots);
  const moving = indexed.get(nodeId);
  const newParent = indexed.get(newParentNodeId);
  if (!moving || !newParent) {
    warnings.push('Move skipped because the source or target node was not found.');
    return null;
  }
  if (!moving.parent || moving.parent.id !== newParent.node.id) {
    warnings.push('Move skipped because only static sibling moves within the same parent are supported.');
    return null;
  }
  if (!isStaticMovableNode(moving.node)) {
    warnings.push(`Move skipped because ${moving.node.label} is read-only or dynamic.`);
    return null;
  }

  const siblings = newParent.node.children.filter(isStaticMovableNode);
  const fromIndex = siblings.findIndex((node) => node.id === moving.node.id);
  if (fromIndex < 0) {
    warnings.push(`Move skipped because ${moving.node.label} is not a movable child of ${newParent.node.label}.`);
    return null;
  }

  const boundedIndex = Math.max(0, Math.min(newIndex, siblings.length));
  let insertionIndex = boundedIndex;
  if (fromIndex < insertionIndex) insertionIndex -= 1;
  if (fromIndex === insertionIndex) return null;

  const movingRange = fullNodeRange(sourceText, moving.node);
  if (!movingRange) {
    warnings.push(`Move skipped because ${moving.node.label} has no safe source range.`);
    return null;
  }

  const remainingSiblings = siblings.filter((node) => node.id !== moving.node.id);
  const targetNode = remainingSiblings[insertionIndex];
  const targetRange = targetNode ? fullNodeRange(sourceText, targetNode) : null;
  const parentRange = fullNodeRange(sourceText, newParent.node);
  const insertAt = targetRange
    ? targetRange.start
    : parentRange
      ? closingTagStart(sourceText, newParent.node, parentRange) ?? parentRange.end
      : null;
  if (insertAt === null) {
    warnings.push('Move skipped because the target location has no safe source range.');
    return null;
  }
  if (insertAt >= movingRange.start && insertAt <= movingRange.end) {
    warnings.push('Move skipped because the target location overlaps the moved node.');
    return null;
  }

  const movedText = sourceText.slice(movingRange.start, movingRange.end);
  if (insertAt < movingRange.start) {
    return {
      start: insertAt,
      end: movingRange.end,
      value: `${movedText}${sourceText.slice(insertAt, movingRange.start)}`,
    };
  }

  return {
    start: movingRange.start,
    end: insertAt,
    value: `${sourceText.slice(movingRange.end, insertAt)}${movedText}`,
  };
}

function indexNodes(nodes: LayoutNode[], parent: LayoutNode | null = null, map = new Map<string, IndexedLayoutNode>()): Map<string, IndexedLayoutNode> {
  for (const node of nodes) {
    map.set(node.id, { node, parent });
    indexNodes(node.children, node, map);
  }
  return map;
}

function isStaticMovableNode(node: LayoutNode): boolean {
  return node.editable && node.kind !== 'dynamic' && node.kind !== 'fragment' && node.source?.start !== undefined && node.source.end !== undefined;
}

function fullNodeRange(sourceText: string, node: LayoutNode): { start: number; end: number } | null {
  if (!node.source || node.source.start === undefined || node.source.end === undefined) return null;
  if (node.kind === 'text') return { start: node.source.start, end: node.source.end };
  if (!node.tagName) return { start: node.source.start, end: node.source.end };
  const openingTag = sourceText.slice(node.source.start, node.source.end);
  if (/\/>\s*$/.test(openingTag) || isVoidElement(node.tagName)) return { start: node.source.start, end: node.source.end };
  const closeStart = closingTagStart(sourceText, node, { start: node.source.start, end: sourceText.length });
  if (closeStart === null) return { start: node.source.start, end: node.source.end };
  const closeEnd = sourceText.indexOf('>', closeStart);
  return { start: node.source.start, end: closeEnd >= 0 ? closeEnd + 1 : closeStart };
}

function closingTagStart(sourceText: string, node: LayoutNode, range: { start: number; end: number }): number | null {
  if (!node.tagName || node.source?.end === undefined) return null;
  const pattern = new RegExp(`<\\/?${escapeRegExp(node.tagName)}(?:\\s|>|\\/>)`, 'gi');
  pattern.lastIndex = node.source.end;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sourceText)) && match.index < range.end) {
    const text = match[0];
    if (text.startsWith('</')) {
      depth -= 1;
      if (depth === 0) return match.index;
    } else if (!text.endsWith('/>') && !isVoidElement(node.tagName)) {
      depth += 1;
    }
  }
  return null;
}

function isVoidElement(tagName: string): boolean {
  return ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(tagName.toLowerCase());
}

function insertAttribute(openingTag: string, attribute: string): string {
  const closing = openingTag.match(/\s*\/?>$/);
  if (!closing || closing.index === undefined) return openingTag;
  return `${openingTag.slice(0, closing.index)} ${attribute}${openingTag.slice(closing.index)}`;
}

function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

function escapeStaticText(value: string, fileName?: string): string {
  const escaped = value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  if (/\.[cm]?[jt]s$/i.test(fileName ?? '')) return escaped.replaceAll('`', '\\`').replaceAll('${', '\\${');
  return escaped;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
