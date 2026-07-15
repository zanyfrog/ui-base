export function stableId(parts                                           , prefix = 'node')         {
  const value = parts.filter((part) => part !== undefined && part !== null).join('|');
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }
  return `${prefix}_${(hash >>> 0).toString(36)}`;
}
