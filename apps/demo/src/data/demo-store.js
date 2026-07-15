const DEMO_DATA_URL = '/apps/demo/src/data/demo-data.json';
const STORAGE_KEY = 'ui-base-demo-data';

let seedData;
let currentData;

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeData(seedValue, savedValue) {
  if (Array.isArray(seedValue)) return Array.isArray(savedValue) ? savedValue : clone(seedValue);
  if (!isPlainObject(seedValue)) return savedValue === undefined ? seedValue : savedValue;

  const merged = {};
  Object.entries(seedValue).forEach(([key, value]) => {
    merged[key] = mergeData(value, savedValue?.[key]);
  });
  if (isPlainObject(savedValue)) {
    Object.entries(savedValue).forEach(([key, value]) => {
      if (!(key in merged)) merged[key] = clone(value);
    });
  }
  return merged;
}

function readSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function persistData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    window.dispatchEvent(new CustomEvent('demo-data-change', { detail: { data: getDemoData() } }));
    return true;
  } catch {
    return false;
  }
}

export async function initDemoStore() {
  if (currentData) return getDemoData();
  const response = await fetch(DEMO_DATA_URL);
  if (!response.ok) throw new Error(`Unable to load demo data: ${response.status}`);
  seedData = await response.json();
  currentData = mergeData(seedData, readSavedData());
  persistData();
  return getDemoData();
}

export function getDemoData() {
  return currentData;
}

export function updateDemoData(updater) {
  const draft = clone(currentData);
  updater(draft);
  currentData = mergeData(seedData, draft);
  persistData();
  return getDemoData();
}

export function resetDemoData() {
  currentData = clone(seedData);
  persistData();
  return getDemoData();
}

export function replaceDemoData(nextData) {
  currentData = mergeData(seedData, nextData);
  persistData();
  return getDemoData();
}

export function exportDemoData() {
  return JSON.stringify(currentData, null, 2);
}
