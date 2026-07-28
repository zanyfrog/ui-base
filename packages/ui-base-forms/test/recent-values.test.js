import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearRecentValues,
  listRecentValueGroups,
  loadRecentValues,
  normalizeRecentValue,
  parseRecentValuesLimit,
  recentValuesStorageKey,
  removeRecentValue,
  saveRecentValue
} from '../src/recent-values.js';

function createStorage() {
  const data = new Map();
  return {
    get length() {
      return data.size;
    },
    key(index) {
      return Array.from(data.keys())[index] || null;
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(String(key), String(value));
    },
    removeItem(key) {
      data.delete(String(key));
    },
    clear() {
      data.clear();
    }
  };
}

beforeEach(() => {
  globalThis.window = { localStorage: createStorage() };
});

describe('recent-values storage', () => {
  it('normalizes values and uses a namespaced storage key', () => {
    expect(normalizeRecentValue('  New   York  ')).toBe('New York');
    expect(recentValuesStorageKey(' projectName ')).toBe('uib:recent:projectName');
  });

  it('defaults empty and invalid limits to 5 and leaves zero or negative as disabled values', () => {
    expect(parseRecentValuesLimit(null)).toBe(5);
    expect(parseRecentValuesLimit('')).toBe(5);
    expect(parseRecentValuesLimit('abc')).toBe(5);
    expect(parseRecentValuesLimit('0')).toBe(0);
    expect(parseRecentValuesLimit('-2')).toBe(-2);
  });

  it('saves trimmed values, de-dupes case-insensitively, and caps to the limit', () => {
    const key = recentValuesStorageKey('city');

    saveRecentValue(key, ' New   York ', 3);
    saveRecentValue(key, 'Boston', 3);
    saveRecentValue(key, 'Chicago', 3);
    saveRecentValue(key, 'new york', 3);

    expect(loadRecentValues(key)).toEqual(['new york', 'Chicago', 'Boston']);
  });

  it('does not save when disabled or when values are over 100 characters', () => {
    const key = recentValuesStorageKey('notes');

    expect(saveRecentValue(key, 'Alpha', 0)).toEqual([]);
    expect(saveRecentValue(key, 'Beta', -1)).toEqual([]);
    expect(saveRecentValue(key, 'x'.repeat(101), 5)).toEqual([]);
    expect(loadRecentValues(key)).toEqual([]);
  });

  it('ignores malformed data and overwrites with a clean array on save', () => {
    const key = recentValuesStorageKey('project');
    window.localStorage.setItem(key, '{broken');

    expect(loadRecentValues(key)).toEqual([]);
    expect(saveRecentValue(key, 'Alpha', 5)).toEqual(['Alpha']);
    expect(JSON.parse(window.localStorage.getItem(key))).toEqual(['Alpha']);
  });

  it('lists, deletes individual values, and removes a key when cleared', () => {
    const key = recentValuesStorageKey('search');
    saveRecentValue(key, 'Alpha', 5);
    saveRecentValue(key, 'Beta', 5);

    expect(listRecentValueGroups()).toEqual([
      { key, name: 'search', label: 'search', values: ['Beta', 'Alpha'] }
    ]);

    expect(removeRecentValue(key, 'beta')).toEqual(['Alpha']);
    clearRecentValues(key);
    expect(loadRecentValues(key)).toEqual([]);
    expect(window.localStorage.getItem(key)).toBeNull();
  });
});
