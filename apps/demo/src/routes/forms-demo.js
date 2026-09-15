import { FORM_COMPONENT_API, UI_BASE_FORM_COMPONENTS } from '../../../../packages/ui-base-forms/src/metadata.js';
import { appendEventLog, escapeAttr, escapeHtml, json } from './demo-utils.js';

const BOOLEAN_ATTRIBUTES = new Set(['checked', 'disabled', 'readonly', 'required', 'hidden', 'invalid', 'novalidate', 'recent-values']);
const NUMBER_ATTRIBUTES = new Set(['minlength', 'maxlength', 'step', 'recent-values-limit']);
const MULTILINE_ATTRIBUTES = new Set(['help', 'error', 'placeholder', 'options', 'value']);
const SELECT_OPTIONS = {
  'help-mode': ['tooltip', 'inline'],
  autocomplete: ['', 'off', 'on', 'name', 'email', 'tel', 'current-password', 'new-password'],
  orientation: ['vertical', 'horizontal', 'auto'],
  type: ['text', 'password']
};

const COMPONENT_DEFAULTS = {
  'uib-forms-form': {
    name: 'contact',
    label: 'Contact form',
    'submit-label': 'Send',
    children: '<uib-forms-textbox name="fullName" label="Full name" value="Ada" required></uib-forms-textbox><uib-forms-email name="email" label="Email" value="ada@example.com"></uib-forms-email>'
  },
  'uib-forms-textbox': { name: 'visitorName', label: 'Name', value: 'Ada', placeholder: 'Enter a name' },
  'uib-forms-number': { name: 'groupSize', label: 'Group size', value: '4', min: '1', max: '30', step: '1' },
  'uib-forms-date': { name: 'visitDate', label: 'Visit date', value: '2026-07-14' },
  'uib-forms-email': { name: 'email', label: 'Email', value: 'person@example.local', placeholder: 'person@example.local' },
  'uib-forms-display-field': {
    name: 'email',
    label: 'Email',
    'display-value': 'person@example.local',
    orientation: 'vertical',
    'empty-value': '-',
    type: 'text',
    help: 'Read-only label and value display.'
  },
  'uib-forms-password': {
    name: 'accessCode',
    label: 'Access code',
    value: 'demo-password',
    placeholder: 'Enter access code',
    help: 'Use the visibility button to confirm the typed value.',
    autocomplete: 'current-password',
    minlength: '8',
    maxlength: '32',
    required: true
  },
  'uib-forms-phone': { name: 'phone', label: 'Phone', value: '555-0100', autocomplete: 'tel' },
  'uib-forms-textarea': { name: 'notes', label: 'Notes', value: 'Accessible entrance preferred.', placeholder: 'Add notes' },
  'uib-forms-rich-text': { name: 'description', label: 'Description', value: '<h2>Reservation details</h2><p><strong>Reservations are required.</strong> Book in advance.</p><ul><li>Bring photo ID</li><li>Arrive early</li></ul>', placeholder: 'Add formatted content' },
  'uib-forms-select': { name: 'location', label: 'Location', value: 'Annex', options: 'Main Hall,Annex,Remote' },
  'uib-forms-checkbox': { name: 'confirmed', label: 'Confirmed', value: 'yes', checked: true, help: 'Form-associated checkbox.' },
  'uib-recent-values-manager': {},
  'uib-forms-field': {
    label: 'Wrapped field',
    help: 'Slotted native control.',
    children: '<input class="native-input" value="Native input">'
  },
  'uib-forms-input-group': {
    label: 'Input group',
    children: '<uib-forms-textbox name="first" label="First"></uib-forms-textbox><uib-forms-textbox name="second" label="Second"></uib-forms-textbox>'
  },
  'uib-forms-wizard': {
    label: 'Wizard fixture',
    children: '<p class="muted">Wizard step content controlled by the parent page.</p>'
  }
};

const COMPONENT_SUMMARIES = {
  'uib-forms-form': 'Form container with submit serialization and validation coordination.',
  'uib-forms-textbox': 'Single-line text input with value, validation, and change events.',
  'uib-forms-number': 'Numeric input with min, max, and step constraints.',
  'uib-forms-date': 'Date input with shared form-control behavior.',
  'uib-forms-email': 'Email input with validation semantics.',
  'uib-forms-display-field': 'Read-only label and value display with vertical or horizontal layout.',
  'uib-forms-password': 'Password input for sensitive form values.',
  'uib-forms-phone': 'Telephone input with shared form-control behavior.',
  'uib-forms-textarea': 'Multiline text input.',
  'uib-forms-rich-text': 'Form-associated rich-text editor with visual, HTML source, and read-only preview modes.',
  'uib-forms-select': 'Select input backed by comma-separated options.',
  'uib-forms-checkbox': 'Form-associated checkbox input with checked state, validation, and common form events.',
  'uib-recent-values-manager': 'Responsive Settings panel for managing local recent input values.',
  'uib-forms-field': 'Label, help, and slot wrapper for native or custom controls.',
  'uib-forms-input-group': 'Responsive grouping layout for related inputs.',
  'uib-forms-wizard': 'Experimental wizard shell for step-based form flows.'
};

export const FORMS_ROUTE_PATHS = [
  '/forms/',
  '/forms/uib-forms-date',
  '/forms/uib-forms-checkbox',
  '/forms/uib-forms-display-field',
  '/forms/uib-forms-email',
  '/forms/uib-forms-field',
  '/forms/uib-forms-form',
  '/forms/uib-forms-input-group',
  '/forms/uib-forms-number',
  '/forms/uib-forms-password',
  '/forms/uib-forms-phone',
  '/forms/uib-forms-select',
  '/forms/uib-forms-textarea',
  '/forms/uib-forms-rich-text',
  '/forms/uib-forms-textbox',
  '/forms/uib-recent-values-manager',
  '/forms/uib-forms-wizard'
];

const componentEntries = UI_BASE_FORM_COMPONENTS.map((item) => ({
  ...item,
  route: `/forms/${item.tagName}`,
  title: item.tagName
    .replace(/^uib-/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' '),
  summary: COMPONENT_SUMMARIES[item.tagName] || 'Form component exported from @ui-base/forms.'
}));

function normalizePath(pathname) {
  if (!pathname || pathname === '') return '/forms';
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function visibleAttributes(component) {
  const apiAttributes = FORM_COMPONENT_API[component.tagName]?.attributes?.map((item) => item.name);
  return Array.from(new Set(apiAttributes || component.attributes || []))
    .filter((name) => name !== 'css-class' && name !== 'aria-describedby')
    .sort((a, b) => a.localeCompare(b));
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

function defaultValueFor(name, component) {
  if (component.tagName === 'uib-forms-rich-text' && ['minlength', 'maxlength', 'pattern'].includes(name)) return '';
  if (name === 'name') return component.tagName.replace(/^uib-/, '').replace(/-/g, '');
  if (name === 'label') return component.title;
  if (name === 'title') return component.title;
  if (name === 'help-mode') return 'tooltip';
  if (name === 'submit-label') return 'Submit';
  if (name === 'options') return 'One,Two,Three';
  if (name === 'minlength') return '2';
  if (name === 'maxlength') return '40';
  if (name === 'step') return '1';
  if (name === 'recent-values-limit') return '5';
  return '';
}

function initialRouteComponent(path) {
  const slug = normalizePath(path).replace(/^\/forms\/?/, '');
  return componentEntries.find((item) => item.tagName === slug) || null;
}

function attributeHelpItem(component, name) {
  const apiItem = FORM_COMPONENT_API[component.tagName]?.attributes?.find((item) => item.name === name);
  return {
    name,
    type: apiItem?.type || (BOOLEAN_ATTRIBUTES.has(name) ? 'boolean' : NUMBER_ATTRIBUTES.has(name) ? 'number' : 'string'),
    description: apiItem?.description || `${name} attribute.`
  };
}

function controlHelp(component, name) {
  return attributeHelpItem(component, name).description;
}

function controlMarkup(component, name, value) {
  const id = `forms-control-${name}`;
  const label = name;
  const help = controlHelp(component, name);

  if (BOOLEAN_ATTRIBUTES.has(name)) {
    return `
      <uib-forms-checkbox class="forms-prop-check" id="${escapeAttr(id)}" data-prop="${escapeAttr(name)}" label="${escapeAttr(label)}" help="${escapeAttr(help)}" ${value ? 'checked' : ''}></uib-forms-checkbox>
    `;
  }

  if (SELECT_OPTIONS[name]) {
    const describedBy = `${id}-help`;
    return `
      <div class="field">
        <uib-label for="${escapeAttr(id)}" text="${escapeAttr(label)}"></uib-label>
        <select id="${escapeAttr(id)}" data-prop="${escapeAttr(name)}" aria-describedby="${escapeAttr(describedBy)}">
          ${SELECT_OPTIONS[name].map((option) => `<option value="${escapeAttr(option)}" ${String(value) === option ? 'selected' : ''}>${escapeHtml(option || 'empty')}</option>`).join('')}
        </select>
        <p class="control-help" id="${escapeAttr(describedBy)}">
          ${escapeHtml(help)}
        </p>
      </div>
    `;
  }

  if (MULTILINE_ATTRIBUTES.has(name)) {
    return `
      <div class="field">
        <uib-forms-textarea id="${escapeAttr(id)}" data-prop="${escapeAttr(name)}" label="${escapeAttr(label)}" value="${escapeAttr(value)}" help="${escapeAttr(help)}"></uib-forms-textarea>
      </div>
    `;
  }

  const controlTag = NUMBER_ATTRIBUTES.has(name) ? 'uib-forms-number' : 'uib-forms-textbox';
  return `
    <div class="field">
      <${controlTag} id="${escapeAttr(id)}" data-prop="${escapeAttr(name)}" label="${escapeAttr(label)}" value="${escapeAttr(value)}" help="${escapeAttr(help)}"></${controlTag}>
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
  const api = FORM_COMPONENT_API[component.tagName];
  if (!api) return '';

  return `
    <details class="card forms-api-card">
      <summary>
        <span>
          <strong>Component API</strong>
          <small>Attributes, custom events, slots, styling hooks, and examples.</small>
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

function renderComponentNotes(component) {
  if (component.tagName !== 'uib-forms-password') return '';

  return `
    <section class="card forms-feature-card forms-password-card">
      <div class="card-content">
        <h2>
          Password behavior
        </h2>
        <div class="forms-feature-grid">
          <div>
            <h3>
              Visibility toggle
            </h3>
            <p>
              The preview includes the built-in show or hide button and exposes the <code>toggle</code> CSS part.
            </p>
          </div>
          <div>
            <h3>
              Browser hints
            </h3>
            <p>
              Switch <code>autocomplete</code> between current and new password values to inspect generated markup.
            </p>
          </div>
          <div>
            <h3>
              Sensitive values
            </h3>
            <p>
              Recent values are intentionally omitted from this component so password values are not stored locally.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderIndex(main) {
  main.innerHTML = `
    <section class="page-heading">
      <p class="eyebrow">
        @ui-base/forms
      </p>
      <h1>
        Forms component demos.
      </h1>
      <p>
        Each exported form component has a focused page with public prop controls, a live preview, and an event log.
      </p>
    </section>
    <section class="forms-component-grid" aria-label="Forms components">
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
          <div class="forms-card-preview" aria-hidden="true" data-card-preview="${escapeAttr(component.tagName)}">
          </div>
        </a>
      `).join('')}
    </section>
    <section class="card forms-settings-card">
      <div class="card-content">
        <div class="controls-header">
          <h2>
            Settings
          </h2>
          <a class="secondary-button compact-control-button" href="/forms/uib-recent-values-manager" data-link>
            Open
          </a>
        </div>
        <uib-recent-values-manager></uib-recent-values-manager>
      </div>
    </section>
  `;

  componentEntries.forEach((component) => {
    const preview = main.querySelector(`[data-card-preview="${component.tagName}"]`);
    if (preview) renderPreviewElement(preview, component, defaultState(component));
  });
}

function renderComponentPage(main, component) {
  const state = defaultState(component);
  const attrs = visibleAttributes(component);

  main.innerHTML = `
    <section class="page-heading forms-detail-heading">
      <p class="eyebrow">
        @ui-base/forms
      </p>
      <h1>
        <code>
          ${escapeHtml(component.tagName)}
        </code>
      </h1>
      <p>
        ${escapeHtml(component.summary)}
      </p>
      <a class="secondary-button compact-control-button" href="/forms/" data-link>
        Back to forms
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
          <div class="form-grid" data-forms-controls>
            ${attrs.map((name) => controlMarkup(component, name, state[name])).join('')}
            <div class="field">
              <uib-forms-textarea id="forms-control-children" data-prop="children" label="children / slots" value="${escapeAttr(state.children)}" help="Light DOM content passed into the component. Named slots only apply when the component documents matching slot names.">
              </uib-forms-textarea>
            </div>
          </div>
        </div>
      </aside>
      <div class="forms-preview-stack">
        ${renderComponentNotes(component)}
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
          <div class="forms-live-preview" data-forms-preview>
          </div>
        </section>
        <section class="card">
          <div class="card-content">
            <h2>
              Latest event
            </h2>
            <pre class="code-block forms-event-log" data-forms-event-log>
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
              <code data-forms-markup>
              </code>
            </pre>
          </div>
        </section>
      </div>
    </section>
  `;

  const preview = main.querySelector('[data-forms-preview]');
  const markup = main.querySelector('[data-forms-markup]');
  const eventLog = main.querySelector('[data-forms-event-log]');

  const updatePreview = () => {
    renderPreviewElement(preview, component, state);
    markup.textContent = serializedMarkup(component, state);
  };

  main.querySelector('[data-forms-controls]')?.addEventListener('input', (event) => {
    const prop = event.target?.dataset?.prop;
    if (!prop) return;
    state[prop] = event.target.type === 'checkbox' || event.target.localName === 'uib-forms-checkbox'
      ? event.target.checked
      : event.target.value;
    updatePreview();
  });

  main.querySelector('[data-forms-controls]')?.addEventListener('change', (event) => {
    const prop = event.target?.dataset?.prop;
    if (!prop) return;
    state[prop] = event.target.type === 'checkbox' || event.target.localName === 'uib-forms-checkbox'
      ? event.target.checked
      : event.target.value;
    updatePreview();
  });

  const eventNames = Array.from(new Set([...(component.events || []), 'input', 'change', 'uib-forms-form-submit']));
  eventNames.forEach((eventName) => {
    preview.addEventListener(eventName, (event) => {
      appendEventLog(eventLog, eventName, event.detail || {}, { tag: event.target?.localName || component.tagName });
    });
  });

  updatePreview();
}

export function renderFormsRoute(main, path) {
  const component = initialRouteComponent(path);
  if (!component) {
    renderIndex(main);
    return;
  }
  renderComponentPage(main, component);
}
