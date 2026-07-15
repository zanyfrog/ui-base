import { AppManagerApiClient } from '@ui.base/app-manager-api-client';

export type AnyRecord = Record<string, string>;

const FallbackHTMLElement = class {};
export const BaseHTMLElement: typeof HTMLElement = (typeof HTMLElement === 'undefined' ? FallbackHTMLElement : HTMLElement) as typeof HTMLElement;

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function attr(value: unknown): string {
  return escapeHtml(value);
}

export function cssClassTokens(element: HTMLElement): string[] {
  return String(element.getAttribute('css-class') ?? (element as HTMLElement & { cssClass?: string }).cssClass ?? '')
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function applyCssClassToRoot(element: HTMLElement): void {
  const root = element.shadowRoot ?? element;
  const target = root.querySelector('[data-uib-css-class-root]')
    ?? Array.from(root.children).find((child) => child instanceof HTMLElement && child.localName !== 'style');
  if (!(target instanceof HTMLElement)) return;
  const state = element as HTMLElement & { __uibCssClassTokens?: string[] };
  target.classList.remove(...(state.__uibCssClassTokens ?? []));
  const next = cssClassTokens(element);
  if (next.length) target.classList.add(...next);
  state.__uibCssClassTokens = next;
}

export function defineAppManagerElement(tagName: string, elementClass: CustomElementConstructor): CustomElementConstructor {
  const prototype = elementClass.prototype as HTMLElement & { render?: (...args: unknown[]) => unknown; __uibCssClassRenderWrapped?: boolean };
  if (!Object.getOwnPropertyDescriptor(prototype, 'cssClass')) {
    Object.defineProperty(prototype, 'cssClass', {
      configurable: true,
      enumerable: true,
      get() { return this.getAttribute('css-class') || ''; },
      set(value: unknown) {
        if (value === null || value === undefined || value === false) this.removeAttribute('css-class');
        else this.setAttribute('css-class', String(value));
      },
    });
  }

  const observed = Array.isArray((elementClass as unknown as { observedAttributes?: string[] }).observedAttributes)
    ? [...((elementClass as unknown as { observedAttributes: string[] }).observedAttributes)]
    : [];
  if (!observed.includes('css-class')) {
    Object.defineProperty(elementClass, 'observedAttributes', {
      configurable: true,
      value: [...observed, 'css-class'],
    });
  }

  if (typeof prototype.render === 'function' && !prototype.__uibCssClassRenderWrapped) {
    const render = prototype.render;
    prototype.render = function renderWithCssClass(this: HTMLElement, ...args: unknown[]): unknown {
      const result = render.apply(this, args);
      applyCssClassToRoot(this);
      return result;
    };
    prototype.__uibCssClassRenderWrapped = true;
  }

  if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  }
  return elementClass;
}

export function slugify(value: string): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function safeParseJson<T>(value: string, fallback: T): T {
  if (!String(value ?? '').trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function stringifyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function cloneRecord(record: AnyRecord): AnyRecord {
  return { ...record };
}

export function recordsEqual(left: AnyRecord, right: AnyRecord): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if ((left[key] ?? '') !== (right[key] ?? '')) return false;
  }
  return true;
}

export function eventDetail<T>(event: Event): T {
  return (event as CustomEvent<T>).detail;
}

export function dispatch(element: HTMLElement, type: string, detail: unknown = {}): void {
  element.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}

export function clientFromElement(element: HTMLElement): AppManagerApiClient {
  return new AppManagerApiClient({
    ormBaseUrl: element.getAttribute('orm-base-url') || 'http://localhost:4020',
    iamBaseUrl: element.getAttribute('iam-base-url') || 'http://localhost:4010',
    actorId: element.getAttribute('dev-actor-id') || 'original-creator',
    token: element.getAttribute('dev-token') || 'dev-token',
  });
}

export function passClientAttributes(from: HTMLElement): string {
  return [
    ['orm-base-url', from.getAttribute('orm-base-url') || 'http://localhost:4020'],
    ['iam-base-url', from.getAttribute('iam-base-url') || 'http://localhost:4010'],
    ['dev-actor-id', from.getAttribute('dev-actor-id') || 'original-creator'],
    ['dev-token', from.getAttribute('dev-token') || 'dev-token'],
  ].map(([name, value]) => `${name}="${attr(value)}"`).join(' ');
}

export function statusBadge(value: string): string {
  const active = String(value).toLowerCase() === 'true';
  return `<span class="uibam-badge ${active ? 'uibam-badge--success' : 'uibam-badge--muted'}">${active ? 'active' : 'inactive'}</span>`;
}

export function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
