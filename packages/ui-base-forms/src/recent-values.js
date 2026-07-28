export const RECENT_VALUES_PREFIX = 'uib:recent:';
export const DEFAULT_RECENT_VALUES_LIMIT = 5;
export const MAX_RECENT_VALUE_LENGTH = 100;

export function normalizeRecentValue(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function parseRecentValuesLimit(value) {
  if (value === null || value === undefined || String(value).trim() === '') return DEFAULT_RECENT_VALUES_LIMIT;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_RECENT_VALUES_LIMIT;
  return parsed;
}

export function recentValuesStorageKey(keyOrName) {
  const key = normalizeRecentValue(keyOrName);
  return key ? `${RECENT_VALUES_PREFIX}${key}` : '';
}

export function safeLocalStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const storage = window.localStorage;
    const testKey = `${RECENT_VALUES_PREFIX}test`;
    storage.setItem(testKey, '[]');
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

export function loadRecentValues(storageKey) {
  const storage = safeLocalStorage();
  if (!storage || !storageKey) return [];
  try {
    const parsed = JSON.parse(storage.getItem(storageKey) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value) => typeof value === 'string')
      .map((value) => normalizeRecentValue(value))
      .filter(Boolean)
      .filter((value) => value.length <= MAX_RECENT_VALUE_LENGTH);
  } catch {
    return [];
  }
}

export function saveRecentValue(storageKey, value, limit) {
  const storage = safeLocalStorage();
  const normalizedLimit = parseRecentValuesLimit(limit);
  const normalizedValue = normalizeRecentValue(value);
  if (!storage || !storageKey || normalizedLimit <= 0 || !normalizedValue || normalizedValue.length > MAX_RECENT_VALUE_LENGTH) return [];

  const current = loadRecentValues(storageKey);
  const compareValue = normalizedValue.toLocaleLowerCase();
  const next = [
    normalizedValue,
    ...current.filter((item) => item.toLocaleLowerCase() !== compareValue)
  ].slice(0, normalizedLimit);

  try {
    storage.setItem(storageKey, JSON.stringify(next));
  } catch {
    return [];
  }

  return next;
}

export function listRecentValueGroups() {
  const storage = safeLocalStorage();
  if (!storage) return [];
  const groups = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !key.startsWith(RECENT_VALUES_PREFIX)) continue;
    const values = loadRecentValues(key);
    if (!values.length) continue;
    groups.push({
      key,
      name: key.slice(RECENT_VALUES_PREFIX.length),
      label: key.slice(RECENT_VALUES_PREFIX.length),
      values
    });
  }

  return groups.sort((left, right) => left.key.localeCompare(right.key));
}

export function removeRecentValue(storageKey, value) {
  const storage = safeLocalStorage();
  if (!storage || !storageKey) return [];
  const compareValue = normalizeRecentValue(value).toLocaleLowerCase();
  const next = loadRecentValues(storageKey).filter((item) => item.toLocaleLowerCase() !== compareValue);

  try {
    if (next.length) storage.setItem(storageKey, JSON.stringify(next));
    else storage.removeItem(storageKey);
  } catch {
    return [];
  }

  return next;
}

export function clearRecentValues(storageKey) {
  const storage = safeLocalStorage();
  if (!storage || !storageKey) return;
  try {
    storage.removeItem(storageKey);
  } catch {
    // Ignore blocked storage.
  }
}
