export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toDate(value, fallback = new Date()) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === 'string' && value.trim()) {
    const parts = value.trim().split('-').map(Number);
    if (parts.length === 3 && parts.every(Number.isFinite)) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
  return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
}

export function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date, days) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfWeek(date, weekStartsOn = 0) {
  const normalized = toDate(date);
  const diff = (normalized.getDay() - weekStartsOn + 7) % 7;
  return addDays(normalized, -diff);
}

export function firstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1);
}

export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function isSameDay(a, b) {
  return toIsoDate(toDate(a)) === toIsoDate(toDate(b));
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function boolFromAttribute(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (value === '') return true;
  return !['false', '0', 'no', 'off'].includes(String(value).trim().toLowerCase());
}

export function formatLong(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function firstWeekdayOnOrAfter(anchor, dayOfWeek) {
  const date = toDate(anchor);
  const diff = (dayOfWeek - date.getDay() + 7) % 7;
  return addDays(date, diff);
}

export function dispatchDateSelect(host, date) {
  host.dispatchEvent(new CustomEvent('uib-calendar-date-select', {
    bubbles: true,
    composed: true,
    detail: { date: toIsoDate(date) }
  }));
}

export function cssClassTokens(element) {
  return String(element?.getAttribute?.('css-class') ?? element?.cssClass ?? '')
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function applyCssClassToShadowRoot(element) {
  if (!element) return;
  const root = element.shadowRoot || element;
  const target = root.querySelector('[data-uib-css-class-root]')
    || Array.from(root.children).find((child) => child instanceof HTMLElement && child.localName !== 'style');
  if (!target) return;
  target.classList.remove(...(element.__uibCssClassTokens || []));
  const next = cssClassTokens(element);
  if (next.length) target.classList.add(...next);
  element.__uibCssClassTokens = next;
}

export function registerCalendarElement(tagName, elementClass) {
  const prototype = elementClass?.prototype;
  if (prototype && !Object.getOwnPropertyDescriptor(prototype, 'cssClass')) {
    Object.defineProperty(prototype, 'cssClass', {
      configurable: true,
      enumerable: true,
      get() { return this.getAttribute('css-class') || ''; },
      set(value) {
        if (value === null || value === undefined || value === false) this.removeAttribute('css-class');
        else this.setAttribute('css-class', String(value));
      }
    });
  }

  const observed = Array.isArray(elementClass.observedAttributes) ? elementClass.observedAttributes : [];
  if (!observed.includes('css-class')) {
    Object.defineProperty(elementClass, 'observedAttributes', {
      configurable: true,
      value: [...observed, 'css-class']
    });
  }

  if (prototype && typeof prototype.render === 'function' && !prototype.__uibCssClassRenderWrapped) {
    const render = prototype.render;
    prototype.render = function renderWithCssClass(...args) {
      const result = render.apply(this, args);
      applyCssClassToShadowRoot(this);
      return result;
    };
    prototype.__uibCssClassRenderWrapped = true;
  }

  if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  }
  return elementClass;
}

export const baseCalendarStyles = `
  :host {
    display: block;
    color: var(--uib-color-ink, #13294b);
    font-family: var(--uib-font-family-sans, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  }

  *, *::before, *::after { box-sizing: border-box; }

  .calendar-card {
    border: 1px solid var(--uib-color-border, #d9e2f0);
    border-radius: var(--uib-radius-lg, 1rem);
    background: var(--uib-color-surface, #ffffff);
    overflow: hidden;
    box-shadow: var(--uib-shadow-sm, 0 6px 18px rgba(10, 31, 68, 0.08));
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uib-space-4, 1rem);
    padding: var(--uib-space-4, 1rem) var(--uib-space-5, 1.25rem);
    border-bottom: 1px solid var(--uib-color-border, #d9e2f0);
    background: var(--uib-color-surface-soft, #f8fbff);
  }

  .calendar-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 850;
  }

  .calendar-subtitle {
    margin: 0.15rem 0 0;
    color: var(--uib-color-muted, #53657f);
    font-size: 0.84rem;
  }

  button {
    appearance: none;
    border: 1px solid var(--uib-color-border, #d9e2f0);
    border-radius: var(--uib-radius-md, 0.75rem);
    background: var(--uib-color-surface, #ffffff);
    color: inherit;
    font: inherit;
    font-weight: 750;
    cursor: pointer;
    padding: 0.7rem 0.85rem;
  }

  button:hover:not(:disabled) {
    background: var(--uib-color-primary-soft, #dfeafa);
    border-color: var(--uib-color-primary, #174a8b);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .grid {
    display: grid;
    gap: 0.5rem;
    padding: 1rem;
  }

  .date-button {
    min-height: 3.2rem;
    display: grid;
    place-items: center;
  }

  .date-button[aria-current="date"] {
    background: var(--uib-color-primary, #174a8b);
    color: #ffffff;
    border-color: var(--uib-color-primary, #174a8b);
  }

  .muted {
    color: var(--uib-color-muted, #53657f);
  }
`;
