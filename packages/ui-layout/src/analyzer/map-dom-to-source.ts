import type { LayoutNode } from '../model/layout-node.js';

export function flattenLayoutNodes(nodes: LayoutNode[], map = new Map<string, LayoutNode>()): Map<string, LayoutNode> {
  for (const node of nodes) {
    map.set(node.id, node);
    flattenLayoutNodes(node.children, map);
  }
  return map;
}
