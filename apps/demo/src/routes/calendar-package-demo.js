import { CALENDAR_COMPONENT_API, UI_BASE_CALENDAR_COMPONENTS } from '../../../../packages/ui-base-calendar/src/metadata.js';
import { appendEventLog, escapeAttr, escapeHtml, json } from './demo-utils.js';

const SAMPLE_DATE = '2026-08-20';
const BOOLEAN_ATTRIBUTES = new Set(['show-paging']);
const NUMBER_ATTRIBUTES = new Set(['count', 'day-of-week', 'days', 'month', 'selected-month', 'year']);
const DATE_ATTRIBUTES = new Set(['date', 'max-date', 'min-date', 'selected-date', 'start-date']);
const PUBLIC_EVENTS = Array.from(new Set(UI_BASE_CALENDAR_COMPONENTS.flatMap((item) => item.events || [])));

const COMPONENT_DEFAULTS = {
  'uib-calendar-day-view': { date: SAMPLE_DATE },
  'uib-calendar-week-view': { 'start-date': SAMPLE_DATE, 'selected-date': SAMPLE_DATE },
  'uib-calendar-month-view': { year: '2026', month: '8', 'selected-date': SAMPLE_DATE },
  'uib-calendar-year-view': { year: '2026', 'selected-month': '8' },
  'uib-date-window-view': { 'start-date': SAMPLE_DATE, days: '10', 'selected-date': SAMPLE_DATE },
  'uib-day-of-week-view': {
    'day-of-week': '4',
    'start-date': SAMPLE_DATE,
    count: '8',
    'selected-date': SAMPLE_DATE,
    'min-date': '2026-07-01',
    'max-date': '2026-12-31',
    'show-paging': true
  }
};

export const CALENDAR_ROUTE_PATHS = [
  '/calendar/',
  '/calendar/uib-calendar-day-view',
  '/calendar/uib-calendar-week-view',
  '/calendar/uib-calendar-month-view',
  '/calendar/uib-calendar-year-view',
  '/calendar/uib-date-window-view',
  '/calendar/uib-day-of-week-view'
];

const componentEntries = UI_BASE_CALENDAR_COMPONENTS.map((item) => ({
  ...item,
  route: `/calendar/${item.tagName}`,
  title: item.tagName.replace(/^uib-/, '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
  summary: item.purpose || 'Calendar component exported from @ui-base/calendar.'
}));

function normalizePath(pathname) {
  if (!pathname || pathname === '') return '/calendar';
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function visibleAttributes(component) {
  const apiAttributes = CALENDAR_COMPONENT_API[component.tagName]?.attributes?.map((item) => item.name);
  const elementClass = customElements.get(component.tagName);
  const observed = Array.isArray(elementClass?.observedAttributes) ? elementClass.observedAttributes : [];
  return Array.from(new Set([...(apiAttributes || []), ...observed]))
    .filter((name) => name !== 'css-class')
    .sort((a, b) => a.localeCompare(b));
}

function defaultValueFor(name, component) {
  if (name === 'date' || name === 'selected-date' || name === 'start-date') return SAMPLE_DATE;
  if (name === 'min-date') return '2026-07-01';
  if (name === 'max-date') return '2026-12-31';
  if (name === 'year') return '2026';
  if (name === 'month' || name === 'selected-month') return '8';
  if (name === 'day-of-week') return '4';
  if (name === 'days') return '10';
  if (name === 'count') return '8';
  return '';
}

function defaultState(component) {
  const defaults = COMPONENT_DEFAULTS[component.tagName] || {};
  const state = {};
  visibleAttributes(component).forEach((name) => {
    if (BOOLEAN_ATTRIBUTES.has(name)) {
      state[name] = Boolean(defaults[name]);
      return;
    }
    state[name] = defaults[name] ?? defaultValueFor(name, component);
  });
  return state;
}

function initialRouteComponent(path) {
  const slug = normalizePath(path).replace(/^\/calendar\/?/, '');
  return componentEntries.find((item) => item.tagName === slug) || null;
}

function controlMarkup(name, value) {
  const id = `calendar-control-${name}`;

  if (BOOLEAN_ATTRIBUTES.has(name)) {
    return `
      <label class="checkbox-row forms-prop-check" for="${escapeAttr(id)}">
        <input id="${escapeAttr(id)}" type="checkbox" data-prop="${escapeAttr(name)}" ${value ? 'checked' : ''}>
        <span>${escapeHtml(name)}</span>
      </label>
    `;
  }

  const type = DATE_ATTRIBUTES.has(name) ? 'date' : NUMBER_ATTRIBUTES.has(name) ? 'number' : 'text';
  return `
    <div class="field">
      <label for="${escapeAttr(id)}">${escapeHtml(name)}</label>
      <input id="${escapeAttr(id)}" type="${escapeAttr(type)}" value="${escapeAttr(value)}" data-prop="${escapeAttr(name)}">
    </div>
  `;
}

function setAttributeValue(element, name, value) {
  if (BOOLEAN_ATTRIBUTES.has(name)) {
    element.toggleAttribute(name, Boolean(value));
    return;
  }
  if (value === null || value === undefined || String(value) === '') element.removeAttribute(name);
  else element.setAttribute(name, String(value));
}

function renderPreviewElement(container, component, state) {
  container.textContent = '';
  const element = document.createElement(component.tagName);
  visibleAttributes(component).forEach((name) => setAttributeValue(element, name, state[name]));
  container.append(element);
  return element;
}

function serializedMarkup(component, state) {
  const attrs = visibleAttributes(component)
    .filter((name) => BOOLEAN_ATTRIBUTES.has(name) ? state[name] : String(state[name] ?? '') !== '')
    .map((name) => BOOLEAN_ATTRIBUTES.has(name) ? name : `${name}="${escapeAttr(state[name])}"`);
  const open = attrs.length ? `<${component.tagName}\n  ${attrs.join('\n  ')}>` : `<${component.tagName}>`;
  return `${open}</${component.tagName}>`;
}

function apiItems(items, emptyText = 'None documented.') {
  if (!items?.length) return `
    <p class="forms-api-empty">
      ${escapeHtml(emptyText)}
    </p>
  `;
  return `
    <dl class="forms-api-list">
      ${items.map((item) => `
        <div>
          <dt><code>${escapeHtml(item.name)}</code>${item.type ? ` <span>${escapeHtml(item.type)}</span>` : ''}</dt>
          <dd>${escapeHtml(item.description)}</dd>
        </div>
      `).join('')}
    </dl>
  `;
}

function renderComponentApi(component) {
  const api = CALENDAR_COMPONENT_API[component.tagName];
  if (!api) return '';

  return `
    <details class="card forms-api-card">
      <summary>
        <span>
          <strong>Component API</strong>
          <small>Attributes, public events, styling hooks, and examples.</small>
        </span>
      </summary>
      <div class="forms-api-content">
        <section>
          <h2>Attributes</h2>
          ${apiItems(api.attributes)}
        </section>
        <section>
          <h2>Properties</h2>
          ${apiItems(api.properties)}
        </section>
        <section>
          <h2>Custom Events</h2>
          ${apiItems(api.events, 'No custom events documented for this component.')}
        </section>
        <section>
          <h2>Slots</h2>
          ${apiItems(api.slots)}
        </section>
        <section>
          <h2>CSS Parts</h2>
          ${apiItems(api.cssParts)}
        </section>
        <section class="forms-api-example-section">
          <h2>Example</h2>
          <pre class="code-block forms-api-code"><code>${escapeHtml(api.examples?.[0] || `<${component.tagName}></${component.tagName}>`)}</code></pre>
        </section>
      </div>
    </details>
  `;
}

function renderIndex(main) {
  main.innerHTML = `
    <section class="page-heading">
      <p class="eyebrow">
        @ui-base/calendar
      </p>
      <h1>
        Calendar component demos.
      </h1>
      <p>
        Each exported calendar component has a focused page with public prop controls, stable sample dates, parent-state event handling, and API notes.
      </p>
    </section>
    <section class="forms-component-grid" aria-label="Calendar components">
      ${componentEntries.map((component) => `
        <a class="card forms-component-card" href="${escapeAttr(component.route)}" data-link>
          <span>
            <p class="eyebrow">
              ${escapeHtml(component.package)}
            </p>
            <h2>
              <code>
                ${escapeHtml(component.tagName)}
              </code>
            </h2>
            <p>
              ${escapeHtml(component.summary)}
            </p>
          </span>
          <div class="forms-card-preview calendar-card-preview" aria-hidden="true" data-card-preview="${escapeAttr(component.tagName)}">
          </div>
        </a>
      `).join('')}
    </section>
  `;

  componentEntries.forEach((component) => {
    const preview = main.querySelector(`[data-card-preview="${component.tagName}"]`);
    if (preview) renderPreviewElement(preview, component, defaultState(component));
  });
}

function syncControl(main, name, value) {
  const control = main.querySelector(`[data-prop="${CSS.escape(name)}"]`);
  if (!control) return;
  if (control.type === 'checkbox') control.checked = Boolean(value);
  else control.value = value;
}

function applyParentStateFromEvent(component, state, detail = {}) {
  if (detail.date) {
    if ('selected-date' in state) state['selected-date'] = detail.date;
    if (component.tagName === 'uib-calendar-day-view' && 'date' in state) state.date = detail.date;
  }

  if (detail.month) {
    if ('selected-month' in state) state['selected-month'] = String(detail.month);
    if ('month' in state) state.month = String(detail.month);
  }

  if (detail.year && 'year' in state) state.year = String(detail.year);
  if (detail.nextStartDate && 'start-date' in state) state['start-date'] = detail.nextStartDate;
}

function bindPreviewEvents(main, preview, eventLog, component, state, updatePreview) {
  PUBLIC_EVENTS.forEach((eventName) => {
    preview.addEventListener(eventName, (event) => {
      applyParentStateFromEvent(component, state, event.detail || {});
      Object.entries(state).forEach(([name, value]) => syncControl(main, name, value));
      appendEventLog(eventLog, eventName, event.detail || {}, { tag: event.target?.localName || component.tagName });
      updatePreview();
    });
  });
}

function renderComponentPage(main, component) {
  const state = defaultState(component);
  const attrs = visibleAttributes(component);

  main.innerHTML = `
    <section class="page-heading forms-detail-heading">
      <p class="eyebrow">
        @ui-base/calendar
      </p>
      <h1>
        <code>
          ${escapeHtml(component.tagName)}
        </code>
      </h1>
      <p>
        ${escapeHtml(component.summary)}
      </p>
      <a class="secondary-button compact-control-button" href="/calendar/" data-link>
        Back to Calendar
      </a>
    </section>
    <section class="demo-layout forms-demo-layout calendar-demo-layout">
      <aside class="card controls forms-controls" aria-label="${escapeAttr(component.tagName)} prop controls">
        <div class="card-content">
          <div class="controls-header">
            <h2>
              Public props
            </h2>
            <span class="forms-control-count">
              ${attrs.length}
            </span>
          </div>
          <div class="form-grid" data-calendar-controls>
            ${attrs.map((name) => controlMarkup(name, state[name])).join('')}
          </div>
        </div>
      </aside>
      <div class="forms-preview-stack">
        ${renderComponentApi(component)}
        <section class="card">
          <div class="preview-toolbar">
            <div>
              <strong>
                Live preview
              </strong>
              <span>
                Event selections update parent-owned state and rerender the component.
              </span>
            </div>
          </div>
          <div class="forms-live-preview calendar-live-preview" data-calendar-preview>
          </div>
        </section>
        <section class="card">
          <div class="card-content">
            <h2>
              Latest event
            </h2>
            <pre class="code-block forms-event-log" data-calendar-event-log>
              ${escapeHtml(json({}))}
            </pre>
          </div>
        </section>
        <section class="card">
          <div class="card-content">
            <h2>
              Current markup
            </h2>
            <pre class="code-block forms-markup-output">
              <code data-calendar-markup>
              </code>
            </pre>
          </div>
        </section>
      </div>
    </section>
  `;

  const preview = main.querySelector('[data-calendar-preview]');
  const markup = main.querySelector('[data-calendar-markup]');
  const eventLog = main.querySelector('[data-calendar-event-log]');

  const updatePreview = () => {
    renderPreviewElement(preview, component, state);
    markup.textContent = serializedMarkup(component, state);
  };

  main.querySelector('[data-calendar-controls]')?.addEventListener('input', (event) => {
    const prop = event.target?.dataset?.prop;
    if (!prop) return;
    state[prop] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updatePreview();
  });

  main.querySelector('[data-calendar-controls]')?.addEventListener('change', (event) => {
    const prop = event.target?.dataset?.prop;
    if (!prop) return;
    state[prop] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updatePreview();
  });

  bindPreviewEvents(main, preview, eventLog, component, state, updatePreview);
  updatePreview();
}

export function renderCalendarPackageRoute(main, path) {
  const component = initialRouteComponent(path);
  if (!component) {
    renderIndex(main);
    return;
  }
  renderComponentPage(main, component);
}
