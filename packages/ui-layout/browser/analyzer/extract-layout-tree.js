                                                          
                                                                    

export function extractLayoutTree(fragments                    )               {
  if (fragments.length === 1) return fragments[0]?.rootNodes ?? [];
  return fragments.map((fragment) => ({
    id: fragment.id,
    kind: 'fragment',
    label: fragment.methodName ? `${fragment.methodName}()` : fragment.propertyName ?? 'template fragment',
    classList: [],
    attributes: {},
    children: fragment.rootNodes,
    source: fragment.source,
    editable: false,
    allowedOperations: ['readonly'],
    warnings: [],
  }));
}
