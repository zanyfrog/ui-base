import { UI_COMPONENT_API, UI_BASE_UI_COMPONENTS } from '../../../../packages/ui-base-ui/src/metadata/index.js';
import { appendEventLog, escapeAttr, escapeHtml, json } from './demo-utils.js';

const BOOLEAN_ATTRIBUTES = new Set(['active', 'checked', 'disabled', 'invalid', 'open', 'readonly', 'required', 'stacked', 'wrap', 'use-asset-picker']);
const NUMBER_ATTRIBUTES = new Set(['breakpoint', 'columns', 'index', 'level']);
const MULTILINE_ATTRIBUTES = new Set(['actions', 'asset-map', 'body', 'detail', 'details', 'error', 'help', 'subheadline']);
const SELECT_OPTIONS = {
  align: ['start', 'center', 'end', 'stretch'],
  direction: ['column', 'row', 'column-reverse', 'row-reverse'],
  fit: ['cover', 'contain', 'fill', 'none', 'scale-down'],
  'help-mode': ['tooltip', 'inline'],
  justify: ['start', 'center', 'end', 'space-between'],
  mode: ['tooltip', 'inline'],
  position: ['center', 'top', 'bottom', 'left', 'right', '1fr 1fr', '2fr 1fr'],
  ratio: ['1/1', '4/3', '16:9', '21:9'],
  role: ['', 'img', 'presentation', 'icon'],
  size: ['compact', 'default', 'large'],
  target: ['', '_self', '_blank'],
  variant: ['primary', 'secondary', 'tertiary', 'destructive']
};

const COMPONENT_DEFAULTS = {
  'uib-toggle': { name: 'published', label: 'Published', help: 'Use N/A when publication status has not been decided.', labels: 'N/A,Yes,No' },
  'uib-checkbox': { name: 'confirmed', label: 'Confirmed', help: 'Boolean field value.' },
  'uib-label': { text: 'Field label', help: 'Helpful context.', required: true },
  'uib-help': { text: 'Helpful context appears here.', mode: 'tooltip', label: 'More information' },
  'uib-menu': {
    label: 'Fixture navigation',
    breakpoint: '640',
    children: '<uib-menuitem href="/ui/" active>UI</uib-menuitem><uib-menuitem label="Packages"><uib-menuitem href="/forms/">Forms</uib-menuitem><uib-menuitem href="/assets-demo/">Assets</uib-menuitem></uib-menuitem>'
  },
  'uib-menuitem': { href: '/ui/', active: true, children: 'Component demos' },
  'uib-stack': { gap: '0.75rem', children: '<button class="primary-button" type="button">Primary</button><button class="secondary-button" type="button">Secondary</button>' },
  'uib-grid': { min: '8rem', children: '<span class="fixture-chip">One</span><span class="fixture-chip">Two</span><span class="fixture-chip">Three</span>' },
  'uib-row': { wrap: true, gap: '0.75rem', children: '<span class="fixture-chip">Row A</span><span class="fixture-chip">Row B</span>' },
  'uib-column': { gap: '0.75rem', children: '<span class="fixture-chip">Column A</span><span class="fixture-chip">Column B</span>' },
  'uib-panel': { label: 'Panel fixture', children: '<p>Panel body.</p><span slot="footer">Footer</span>' },
  'uib-card': { label: 'Card fixture', children: '<p>Card body.</p><span slot="footer">Footer</span>' },
  'uib-dialog': { heading: 'Fixture dialog', children: '<p>Dialog body content.</p><span slot="footer">Footer</span>' },
  'uib-accordion': { heading: 'Accordion fixture', children: '<p>Accordion body content.</p>' },
  'uib-tabs': { label: 'Fixture tab', children: '<p>Experimental tab body.</p>' },
  'uib-splitter': { children: '<div slot="start">Start pane</div><div slot="end">End pane</div>' },
  'uib-eyebrow': { text: 'Developer docs' },
  'uib-heading-block': {
    eyebrow: 'Section',
    headline: 'Heading block',
    subheadline: 'Reusable content heading.',
    body: 'Parent pages own the state.',
    level: '2',
    size: 'compact'
  },
  'uib-action-button': { label: 'Run action', 'action-token': 'RUN_ACTION', variant: 'primary' },
  'uib-action-group': {
    actions: '[{"label":"Save","variant":"primary","actionToken":"SAVE"},{"label":"Cancel","variant":"secondary","actionToken":"CANCEL"}]'
  },
  'uib-media': { src: '/apps/demo/assets/icons/availability.svg', alt: 'Availability', fit: 'contain', ratio: '16:9', 'fallback-label': 'No media' },
  'uib-detail-item': {
    label: 'Duration',
    value: '60 minutes',
    icon: '60',
    'asset-map': '{"asset-capacity":{"url":"/apps/demo/assets/icons/tour-size.svg","alt":"Capacity"}}'
  },
  'uib-detail-item-edit': { index: '0', detail: '{"label":"Duration","value":"60 minutes","icon":"60"}' },
  'uib-detail-list': { details: '[{"label":"Duration","value":"60 minutes","icon":"60"},{"label":"Capacity","value":"20 people","iconUrl":"/apps/demo/assets/icons/tour-size.svg","iconAlt":"Capacity"}]' },
  'uib-detail-list-editor': { label: 'Editable details', details: '[{"label":"Duration","value":"60 minutes","icon":"60"}]' }
};

export const UI_ROUTE_PATHS = [
  '/ui/',
  ...UI_BASE_UI_COMPONENTS.map((item) => `/ui/${item.tagName}`)
];

const componentEntries = UI_BASE_UI_COMPONENTS.map((item) => ({
  ...item,
  route: `/ui/${item.tagName}`,
  title: item.tagName
    .replace(/^uib-/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' '),
  summary: item.purpose || 'Component exported from @ui.base/ui.'
}));

function normalizePath(pathname) {
  if (!pathname || pathname === '') return '/ui';
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function visibleAttributes(component) {
  const apiAttributes = UI_COMPONENT_API[component.tagName]?.attributes?.map((item) => item.name);
  return Array.from(new Set(apiAttributes || component.attributes || []))
    .filter((name) => !['aria-describedby', 'class'].includes(name))
    .sort((a, b) => a.localeCompare(b));
}

function defaultValueFor(name, component) {
  if (name === 'name') return component.tagName.replace(/^uib-/, '').replace(/-/g, '');
  if (name === 'label') return component.title;
  if (name === 'heading') return component.title;
  if (name === 'text') return component.title;
  if (name === 'href') return '#';
  if (name === 'breakpoint') return '640';
  if (name === 'gap') return '0.75rem';
  if (name === 'min') return '8rem';
  if (name === 'ratio') return '16:9';
  if (name === 'variant') return 'secondary';
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
  state.children = defaults.children || '';
  return state;
}

function initialRouteComponent(path) {
  const slug = normalizePath(path).replace(/^\/ui\/?/, '');
  return componentEntries.find((item) => item.tagName === slug) || null;
}

function controlMarkup(name, value) {
  const id = `ui-control-${name}`;

  if (BOOLEAN_ATTRIBUTES.has(name)) {
    return `
      <label class="checkbox-row forms-prop-check" for="${escapeAttr(id)}">
        <input id="${escapeAttr(id)}" type="checkbox" data-prop="${escapeAttr(name)}" ${value ? 'checked' : ''}>
        <span>${escapeHtml(name)}</span>
      </label>
    `;
  }

  if (SELECT_OPTIONS[name]) {
    return `
      <div class="field">
        <label for="${escapeAttr(id)}">${escapeHtml(name)}</label>
        <select id="${escapeAttr(id)}" data-prop="${escapeAttr(name)}">
          ${SELECT_OPTIONS[name].map((option) => `<option value="${escapeAttr(option)}" ${String(value) === option ? 'selected' : ''}>${escapeHtml(option || 'empty')}</option>`).join('')}
        </select>
      </div>
    `;
  }

  if (MULTILINE_ATTRIBUTES.has(name)) {
    return `
      <div class="field">
        <label for="${escapeAttr(id)}">${escapeHtml(name)}</label>
        <textarea id="${escapeAttr(id)}" data-prop="${escapeAttr(name)}" spellcheck="false">${escapeHtml(value)}</textarea>
      </div>
    `;
  }

  const type = NUMBER_ATTRIBUTES.has(name) ? 'number' : 'text';
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

function renderPreviewElement(container, component, state, { clear = true } = {}) {
  if (clear) container.textContent = '';
  const element = document.createElement(component.tagName);
  visibleAttributes(component).forEach((name) => setAttributeValue(element, name, state[name]));
  element.innerHTML = state.children || '';
  container.append(element);
  return element;
}

function serializedMarkup(component, state) {
  const attrs = visibleAttributes(component)
    .filter((name) => BOOLEAN_ATTRIBUTES.has(name) ? state[name] : String(state[name] ?? '') !== '')
    .map((name) => BOOLEAN_ATTRIBUTES.has(name) ? name : `${name}="${escapeAttr(state[name])}"`);
  const children = state.children || '';
  const open = attrs.length ? `<${component.tagName}\n  ${attrs.join('\n  ')}>` : `<${component.tagName}>`;
  return `${open}${children ? `\n  ${children}\n` : ''}</${component.tagName}>`;
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
  const api = UI_COMPONENT_API[component.tagName];
  if (!api) return '';

  return `
    <details class="card forms-api-card">
      <summary>
        <span>
          <strong>Component API</strong>
          <small>Attributes, properties, custom events, slots, styling hooks, and examples.</small>
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
        <section>
          <h2>CSS Variables</h2>
          ${apiItems(api.cssVariables)}
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
        @ui.base/ui
      </p>
      <h1>
        UI primitive component demos.
      </h1>
      <p>
        Each exported UI primitive has a focused page with public prop controls, a live preview, event logging, markup output, and package API notes.
      </p>
    </section>
    <section class="forms-component-grid" aria-label="UI components">
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
          <div class="forms-card-preview ui-card-preview" aria-hidden="true" data-card-preview="${escapeAttr(component.tagName)}">
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

function bindPreviewEvents(preview, eventLog, component) {
  preview.addEventListener('click', (event) => {
    if (event.target.closest?.('a')) event.preventDefault();
    const dialog = preview.querySelector('uib-dialog');
    if (event.target.matches?.('[data-open-component-dialog]') && dialog) dialog.open = true;
  });

  const eventNames = Array.from(new Set([...(component.events || []), 'change', 'uib-action', 'uib-action-button-click', 'uib-menu-select']));
  eventNames.forEach((eventName) => {
    preview.addEventListener(eventName, (event) => {
      if (eventName === 'uib-action-button-click') event.preventDefault();
      appendEventLog(eventLog, eventName, event.detail || {}, { tag: event.target?.localName || component.tagName });
    });
  });
}

function renderComponentPage(main, component) {
  const state = defaultState(component);
  const attrs = visibleAttributes(component);

  main.innerHTML = `
    <section class="page-heading forms-detail-heading">
      <p class="eyebrow">
        @ui.base/ui
      </p>
      <h1>
        <code>
          ${escapeHtml(component.tagName)}
        </code>
      </h1>
      <p>
        ${escapeHtml(component.summary)}
      </p>
      <a class="secondary-button compact-control-button" href="/ui/" data-link>
        Back to UI
      </a>
    </section>
    <section class="demo-layout forms-demo-layout">
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
          <div class="form-grid" data-ui-controls>
            ${attrs.map((name) => controlMarkup(name, state[name])).join('')}
            <div class="field">
              <label for="ui-control-children">
                children / slots
              </label>
              <textarea id="ui-control-children" data-prop="children" spellcheck="false">
                ${escapeHtml(state.children)}
              </textarea>
            </div>
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
                Updates as controls change.
              </span>
            </div>
          </div>
          <div class="forms-live-preview ui-live-preview" data-ui-preview>
            ${component.tagName === 'uib-dialog' ? '<button class="secondary-button compact-control-button" type="button" data-open-component-dialog>Open dialog</button>' : ''}
          </div>
        </section>
        <section class="card">
          <div class="card-content">
            <h2>
              Latest event
            </h2>
            <pre class="code-block forms-event-log" data-ui-event-log>
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
              <code data-ui-markup>
              </code>
            </pre>
          </div>
        </section>
      </div>
    </section>
  `;

  const preview = main.querySelector('[data-ui-preview]');
  const markup = main.querySelector('[data-ui-markup]');
  const eventLog = main.querySelector('[data-ui-event-log]');

  const updatePreview = () => {
    preview.textContent = '';
    if (component.tagName === 'uib-dialog') {
      const opener = document.createElement('button');
      opener.className = 'secondary-button compact-control-button';
      opener.type = 'button';
      opener.dataset.openComponentDialog = '';
      opener.textContent = 'Open dialog';
      preview.append(opener);
    }
    renderPreviewElement(preview, component, state, { clear: false });
    markup.textContent = serializedMarkup(component, state);
  };

  main.querySelector('[data-ui-controls]')?.addEventListener('input', (event) => {
    const prop = event.target?.dataset?.prop;
    if (!prop) return;
    state[prop] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updatePreview();
  });

  main.querySelector('[data-ui-controls]')?.addEventListener('change', (event) => {
    const prop = event.target?.dataset?.prop;
    if (!prop) return;
    state[prop] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updatePreview();
  });

  bindPreviewEvents(preview, eventLog, component);
  updatePreview();
}

export function renderUiRoute(main, path) {
  const component = initialRouteComponent(path);
  if (!component) {
    renderIndex(main);
    return;
  }
  renderComponentPage(main, component);
}
