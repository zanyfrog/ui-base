import type { LayoutNode } from '../model/layout-node.js';

export function extractCssClasses(nodes: LayoutNode[]): string[] {
  const classes = new Set<string>();
  visit(nodes, (node) => node.classList.forEach((className) => classes.add(className)));
  return [...classes].sort();
}

function visit(nodes: LayoutNode[], callback: (node: LayoutNode) => void): void {
  for (const node of nodes) {
    callback(node);
    visit(node.children, callback);
  }
}
