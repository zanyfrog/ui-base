                                                          

export function extractCssClasses(nodes              )           {
  const classes = new Set        ();
  visit(nodes, (node) => node.classList.forEach((className) => classes.add(className)));
  return [...classes].sort();
}

function visit(nodes              , callback                            )       {
  for (const node of nodes) {
    callback(node);
    visit(node.children, callback);
  }
}
