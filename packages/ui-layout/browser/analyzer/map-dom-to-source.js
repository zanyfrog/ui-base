                                                          

export function flattenLayoutNodes(nodes              , map = new Map                    ())                          {
  for (const node of nodes) {
    map.set(node.id, node);
    flattenLayoutNodes(node.children, map);
  }
  return map;
}
