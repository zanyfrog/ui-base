import { UI_COMPONENT_API, UI_BASE_UI_COMPONENTS } from '../../../../packages/ui-base-ui/src/metadata/index.js';
import { appendEventLog, escapeAttr, escapeHtml, json } from './demo-utils.js';

const BOOLEAN_ATTRIBUTES = new Set(['active', 'checked', 'collapsible', 'complete', 'current', 'disabled', 'interactive', 'invalid', 'numbered', 'open', 'readonly', 'required', 'selectable', 'selected', 'show-progress', 'stacked', 'wrap', 'use-asset-picker']);
const NUMBER_ATTRIBUTES = new Set(['breakpoint', 'columns', 'index', 'level']);
const MULTILINE_ATTRIBUTES = new Set(['actions', 'asset-map', 'body', 'detail', 'details', 'error', 'help', 'subheadline', 'summary']);
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
  density: ['comfortable', 'compact'],
  size: ['compact', 'default', 'large'],
  target: ['', '_self', '_blank'],
  variant: ['outlined', 'elevated', 'flat', 'primary', 'secondary', 'tertiary', 'destructive', 'info', 'tip', 'warning', 'danger', 'success']
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
  'uib-panel': { label: 'Panel fixture', variant: 'outlined', density: 'comfortable', collapsible: true, open: true, children: '<button class="secondary-button compact-control-button" type="button" slot="actions">Edit</button><p>Panel body.</p><span slot="footer">Footer</span>' },
  'uib-card': { label: 'Card fixture', variant: 'elevated', density: 'comfortable', selectable: true, selected: false, 'action-token': 'CARD_ACTION', href: '', children: '<uib-media slot="media" src="/apps/demo/assets/icons/availability.svg" alt="Availability" fit="contain" ratio="16:9"></uib-media><p>Card body.</p><span slot="footer">Footer</span>' },
  'uib-dialog': { heading: 'Fixture dialog', children: '<p>Dialog body content.</p><span slot="footer">Footer</span>' },
  'uib-accordion': { heading: 'Accordion fixture', children: '<p>Accordion body content.</p>' },
  'uib-tabs': {
    selected: '0',
    orientation: 'horizontal',
    children: '<uib-tab>Overview</uib-tab><uib-tab aria-disabled="true">Billing</uib-tab><uib-tab>History</uib-tab><uib-tab-panel><p>Overview tab body.</p></uib-tab-panel><uib-tab-panel><p>Billing is disabled until enabled elsewhere.</p></uib-tab-panel><uib-tab-panel><p>History tab body.</p></uib-tab-panel>'
  },
  'uib-splitter': { children: '<div slot="start">Start pane</div><div slot="end">End pane</div>' },
  'uib-eyebrow': { text: 'Developer docs' },
  'uib-heading': {
    text: 'Reusable heading',
    level: '2',
    size: 'compact'
  },
  'uib-heading-block': {
    eyebrow: 'Section',
    headline: 'Heading block',
    subheadline: 'Reusable content heading.',
    body: 'Parent pages own the state.',
    level: '2',
    size: 'compact'
  },
  'uib-instruction': {
    heading: 'Before you publish',
    summary: 'Complete each setup step before the page goes live.',
    variant: 'tip',
    density: 'comfortable',
    collapsible: true,
    open: true,
    numbered: true,
    'show-progress': true,
    children: '<p>Use instruction blocks for procedural guidance, warnings, tips, or onboarding.</p><li slot="step" complete>Review required fields.</li><li slot="step" current>Preview the page.</li><li slot="step">Publish when ready.</li><uib-action-button slot="actions" label="Preview" variant="primary"></uib-action-button><span slot="footer">Progress updates automatically from slotted step attributes.</span>'
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

const ATTRIBUTE_HELP = {
  'uib-action-button': {
    action: 'Optional action identifier for parent apps that listen for generic action events.',
    'action-token': 'Stable event token. Use this when a parent workflow needs to distinguish which action fired.',
    disabled: 'Prevents the button or link from being activated.',
    href: 'When set, the action renders as a link. When empty, it renders as a button.',
    icon: 'Optional icon name or marker rendered before the label.',
    kind: 'Semantic action kind included in event detail for parent apps.',
    label: 'Visible button text. Slotted text can also provide the label.',
    rel: 'Forwarded to the anchor when href is set.',
    target: 'Forwarded to the anchor when href is set.',
    variant: 'Controls the visual treatment, such as primary, secondary, tertiary, or destructive.'
  },
  'uib-action-group': {
    actions: 'JSON array of action button definitions. Each item can include label, href, action, actionToken, variant, disabled, and icon.',
    align: 'Aligns the group within its available row. Use start, center, or end for placement.',
    stacked: 'Stacks actions vertically instead of laying them out in a row.'
  },
  'uib-card': {
    action: 'Action identifier emitted when an interactive card is activated.',
    'action-token': 'Stable action token emitted when the card is activated.',
    density: 'Adjusts internal spacing. Compact is tighter; comfortable gives content more room.',
    disabled: 'Prevents link, action, and selectable behavior.',
    heading: 'Optional heading text rendered in the card header area.',
    href: 'Makes the card navigate like a link.',
    interactive: 'Adds interactive affordances for cards that are handled by JavaScript instead of href.',
    label: 'Accessible label used when the card does not have enough visible text.',
    rel: 'Forwarded to the anchor when href is set.',
    selectable: 'Allows the card to toggle selected state.',
    selected: 'Current selected state for selectable cards.',
    target: 'Forwarded to the anchor when href is set.',
    variant: 'Changes surface treatment. Elevated adds shadow, outlined emphasizes the border, and flat is quiet.'
  },
  'uib-instruction': {
    collapsible: 'Uses native details/summary disclosure behavior so the instruction can expand and collapse.',
    complete: 'Marks the whole instruction as complete for parent-managed workflows.',
    current: 'Marks the whole instruction as the current guidance item in a larger flow.',
    density: 'Adjusts spacing. Compact keeps dense instructional UIs tighter.',
    disabled: 'Prevents a collapsible instruction from being toggled by the user.',
    heading: 'Primary instruction title shown in the summary/header row.',
    icon: 'Optional marker text shown in the circular accent badge. If empty, the variant supplies a default.',
    label: 'Fallback label used when heading is not set.',
    numbered: 'Displays slotted steps as an ordered sequence.',
    open: 'Controls whether a collapsible instruction starts expanded.',
    'show-progress': 'Shows the step progress meter. When steps are present, progress is shown automatically.',
    summary: 'Short explanatory line shown under the heading.',
    variant: 'Instruction tone: info, tip, warning, danger, or success.'
  },
  'uib-heading-block': {
    align: 'Sets text alignment for the whole block. Center also centers the block content; start and end follow the writing direction.',
    body: 'Supporting paragraph rendered after the subheadline. Use it for longer explanatory copy.',
    eyebrow: 'Small overline text rendered before the headline, often used for a section label.',
    headline: 'Primary heading text. This becomes the h1-h6 element selected by level.',
    level: 'Chooses the h1 through h6 tag and the default font scale for that heading level. Values outside 1-6 fall back to h1.',
    size: 'Applies a compact, default, or large scale to the selected heading level.',
    subheadline: 'Secondary supporting line rendered between the headline and body.'
  },
  'uib-heading': {
    align: 'Sets text alignment for the rendered heading.',
    heading: 'Fallback heading text when text is not set.',
    level: 'Chooses the h1 through h6 tag and the default font scale for that heading level. Values outside 1-6 fall back to h1.',
    size: 'Applies a compact, default, or large scale to the selected heading level.',
    text: 'Heading text. Default slotted content can also provide the heading.'
  },
  'uib-help': {
    label: 'Accessible label for the help trigger button when mode is tooltip.',
    mode: 'Choose tooltip for on-demand help or inline when the help should always be visible.',
    open: 'Controls tooltip visibility. Parent pages can set it, and the component updates it as users interact.',
    text: 'The help copy to render. Default slotted content can also provide the copy.'
  },
  'uib-label': {
    'accessible-text': 'Accessible-only label text when the visible label needs different wording.',
    for: 'ID of the control this label describes.',
    help: 'Optional helper copy shown with the label.',
    'help-mode': 'Choose tooltip for compact help or inline when guidance should remain visible.',
    required: 'Shows required state in the label.',
    text: 'Visible label text. Default slotted content can also provide the label.',
    title: 'Native title text for additional browser tooltip context.'
  },
  'uib-media': {
    alt: 'Accessible alternative text for meaningful images. Leave empty only for decorative images.',
    fit: 'Maps to object-fit. Cover fills the frame, contain shows the whole image, fill stretches, none keeps intrinsic size, and scale-down chooses the smaller result.',
    'fallback-label': 'Text shown when src is empty or media cannot be rendered.',
    position: 'Maps to object-position, such as center, top, bottom, left, or right.',
    ratio: 'Aspect ratio for the media frame, such as 1/1, 4/3, 16:9, or 21:9.',
    role: 'Sets the rendered media role. Use img for meaningful media, presentation for decorative media, and icon for icon-like imagery.',
    src: 'Image or media URL.'
  },
  'uib-tabs': {
    name: 'Name included in tab change events so parent pages can identify this tab set.',
    orientation: 'Controls keyboard and layout behavior. Horizontal uses left and right arrows; vertical uses up and down arrows.',
    selected: 'Zero-based index of the active tab.'
  }
};

export const UI_ROUTE_PATHS = [
  '/ui/',
  '/ui/tabs',
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
  summary: item.purpose || 'Component exported from @ui-base/ui.'
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
  if (name === 'variant') {
    if (component.tagName === 'uib-card') return 'elevated';
    if (component.tagName === 'uib-panel') return 'outlined';
    return 'secondary';
  }
  if (name === 'density') return 'comfortable';
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

function attributeHelpItem(component, name) {
  const apiItem = UI_COMPONENT_API[component.tagName]?.attributes?.find((item) => item.name === name);
  return {
    name,
    type: apiItem?.type || (BOOLEAN_ATTRIBUTES.has(name) ? 'boolean' : NUMBER_ATTRIBUTES.has(name) ? 'number' : 'string'),
    description: ATTRIBUTE_HELP[component.tagName]?.[name] || apiItem?.description || `${name} attribute.`
  };
}

function controlHelpMarkup(component, name) {
  return `
    <p class="control-help" id="ui-control-${escapeAttr(name)}-help">
      ${escapeHtml(attributeHelpItem(component, name).description)}
    </p>
  `;
}

function controlMarkup(component, name, value) {
  const id = `ui-control-${name}`;
  const describedBy = `ui-control-${name}-help`;

  if (BOOLEAN_ATTRIBUTES.has(name)) {
    return `
      <div class="field">
        <label class="checkbox-row forms-prop-check" for="${escapeAttr(id)}">
          <input id="${escapeAttr(id)}" type="checkbox" data-prop="${escapeAttr(name)}" aria-describedby="${escapeAttr(describedBy)}" ${value ? 'checked' : ''}>
          <span>${escapeHtml(name)}</span>
        </label>
        ${controlHelpMarkup(component, name)}
      </div>
    `;
  }

  if (SELECT_OPTIONS[name]) {
    return `
      <div class="field">
        <label for="${escapeAttr(id)}">${escapeHtml(name)}</label>
        <select id="${escapeAttr(id)}" data-prop="${escapeAttr(name)}" aria-describedby="${escapeAttr(describedBy)}">
          ${SELECT_OPTIONS[name].map((option) => `<option value="${escapeAttr(option)}" ${String(value) === option ? 'selected' : ''}>${escapeHtml(option || 'empty')}</option>`).join('')}
        </select>
        ${controlHelpMarkup(component, name)}
      </div>
    `;
  }

  if (MULTILINE_ATTRIBUTES.has(name)) {
    return `
      <div class="field">
        <label for="${escapeAttr(id)}">${escapeHtml(name)}</label>
        <textarea id="${escapeAttr(id)}" data-prop="${escapeAttr(name)}" aria-describedby="${escapeAttr(describedBy)}" spellcheck="false">${escapeHtml(value)}</textarea>
        ${controlHelpMarkup(component, name)}
      </div>
    `;
  }

  const type = NUMBER_ATTRIBUTES.has(name) ? 'number' : 'text';
  return `
    <div class="field">
      <label for="${escapeAttr(id)}">${escapeHtml(name)}</label>
      <input id="${escapeAttr(id)}" type="${escapeAttr(type)}" value="${escapeAttr(value)}" data-prop="${escapeAttr(name)}" aria-describedby="${escapeAttr(describedBy)}">
      ${controlHelpMarkup(component, name)}
    </div>
  `;
}

function renderAttributeHelp(component, attrs) {
  if (!attrs.length) return '';
  const helpItems = attrs.map((name) => attributeHelpItem(component, name));
  return `
    <uib-accordion class="ui-attribute-help" heading="Attribute help">
      <dl class="ui-attribute-help-list">
        ${helpItems.map((item) => `
          <div>
            <dt>
              <code>${escapeHtml(item.name)}</code>
              <span>${escapeHtml(item.type)}</span>
            </dt>
            <dd>${escapeHtml(item.description)}</dd>
          </div>
        `).join('')}
        <div>
          <dt>
            <code>children / slots</code>
            <span>HTML</span>
          </dt>
          <dd>Light DOM content passed into the component. Named slots only apply when the component documents matching slot names.</dd>
        </div>
      </dl>
    </uib-accordion>
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
        @ui-base/ui
      </p>
      <h1>
        UI primitive component demos.
      </h1>
      <p>
        Each exported UI primitive has a focused page with public prop controls, a live preview, event logging, markup output, and package API notes.
      </p>
    </section>
    <section class="card landing-callout">
      <div class="card-content">
        <p class="eyebrow">
          Dedicated demo
        </p>
        <h2>
          Tabs test bench
        </h2>
        <p class="muted">
          Test horizontal and vertical tabs, disabled tab recovery, dynamic children, keyboard behavior, panel coordination, and change events.
        </p>
        <a class="primary-button compact-control-button" href="/ui/tabs" data-link>
          Open Tabs Demo
        </a>
      </div>
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

function defaultTabsModel() {
  return {
    name: 'demoTabs',
    selected: 0,
    orientation: 'horizontal',
    tabs: [
      {
        label: 'Overview',
        disabled: false,
        ariaDisabled: false,
        attributes: {},
        panel: {
          heading: 'Overview',
          html: '<p>Account summary, current plan, owner, and primary workspace details.</p>',
          attributes: {}
        }
      },
      {
        label: 'Billing',
        disabled: true,
        ariaDisabled: true,
        attributes: {},
        panel: {
          heading: 'Billing',
          html: '<p>Billing starts disabled and can be enabled from the controls.</p>',
          attributes: {}
        }
      },
      {
        label: 'History',
        disabled: false,
        ariaDisabled: false,
        attributes: {},
        panel: {
          heading: 'History',
          html: '<p>Recent tab activity and account changes appear here.</p>',
          attributes: {}
        }
      }
    ]
  };
}

function safeAttributes(attributes = {}) {
  return Object.entries(attributes || {})
    .filter(([name, value]) => name && value !== false && value !== null && value !== undefined)
    .map(([name, value]) => value === true ? `${escapeAttr(name)}` : `${escapeAttr(name)}="${escapeAttr(value)}"`)
    .join(' ');
}

function normalizeTabsModel(value) {
  const fallback = defaultTabsModel();
  const source = value && typeof value === 'object' ? value : fallback;
  const tabs = Array.isArray(source.tabs) && source.tabs.length ? source.tabs : fallback.tabs;
  return {
    name: String(source.name ?? fallback.name),
    selected: Number.isInteger(Number(source.selected)) ? Math.max(0, Number(source.selected)) : 0,
    orientation: source.orientation === 'vertical' ? 'vertical' : 'horizontal',
    tabs: tabs.map((tab, index) => ({
      label: String(tab?.label ?? `Tab ${index + 1}`),
      disabled: Boolean(tab?.disabled),
      ariaDisabled: Boolean(tab?.ariaDisabled || tab?.disabled),
      attributes: tab?.attributes && typeof tab.attributes === 'object' ? tab.attributes : {},
      panel: {
        heading: String(tab?.panel?.heading ?? tab?.label ?? `Panel ${index + 1}`),
        html: String(tab?.panel?.html ?? '<p>Panel content.</p>'),
        attributes: tab?.panel?.attributes && typeof tab.panel.attributes === 'object' ? tab.panel.attributes : {}
      }
    }))
  };
}

function tabsMarkupFromModel(model) {
  const tabMarkup = model.tabs.map((tab) => {
    const attrs = [
      tab.disabled ? 'disabled' : '',
      tab.ariaDisabled ? 'aria-disabled="true"' : '',
      safeAttributes(tab.attributes)
    ].filter(Boolean).join(' ');
    return `<uib-tab${attrs ? ` ${attrs}` : ''}>${escapeHtml(tab.label)}</uib-tab>`;
  }).join('');
  const panelMarkup = model.tabs.map((tab) => {
    const attrs = safeAttributes(tab.panel.attributes);
    const heading = tab.panel.heading ? `<h2>${escapeHtml(tab.panel.heading)}</h2>` : '';
    return `<uib-tab-panel${attrs ? ` ${attrs}` : ''}>${heading}${tab.panel.html}</uib-tab-panel>`;
  }).join('');
  return `${tabMarkup}${panelMarkup}`;
}

function tabsElementMarkup(model) {
  const attrs = [
    `name="${escapeAttr(model.name)}"`,
    `selected="${escapeAttr(model.selected)}"`,
    `orientation="${escapeAttr(model.orientation)}"`
  ];
  return `<uib-tabs\n  ${attrs.join('\n  ')}>\n  ${tabsMarkupFromModel(model)}\n</uib-tabs>`;
}

function tabsEditorMarkup(model) {
  return model.tabs.map((tab, index) => `
    <fieldset class="control-section" data-tab-editor="${index}">
      <legend>
        Tab ${index}
      </legend>
      <div class="field">
        <label for="tabs-label-${index}">
          label
        </label>
        <input id="tabs-label-${index}" type="text" value="${escapeAttr(tab.label)}" data-tab-prop="label">
      </div>
      <div class="action-control-checks">
        <label class="checkbox-row" for="tabs-disabled-${index}">
          <input id="tabs-disabled-${index}" type="checkbox" ${tab.disabled ? 'checked' : ''} data-tab-prop="disabled">
          <span>disabled</span>
        </label>
        <label class="checkbox-row" for="tabs-aria-disabled-${index}">
          <input id="tabs-aria-disabled-${index}" type="checkbox" ${tab.ariaDisabled ? 'checked' : ''} data-tab-prop="ariaDisabled">
          <span>aria-disabled</span>
        </label>
      </div>
      <div class="field">
        <label for="tabs-tab-id-${index}">
          tab id
        </label>
        <input id="tabs-tab-id-${index}" type="text" value="${escapeAttr(tab.attributes.id || '')}" data-tab-attribute="id">
      </div>
      <div class="field">
        <label for="tabs-panel-heading-${index}">
          panel heading
        </label>
        <input id="tabs-panel-heading-${index}" type="text" value="${escapeAttr(tab.panel.heading)}" data-panel-prop="heading">
      </div>
      <div class="field">
        <label for="tabs-panel-id-${index}">
          panel id
        </label>
        <input id="tabs-panel-id-${index}" type="text" value="${escapeAttr(tab.panel.attributes.id || '')}" data-panel-attribute="id">
      </div>
      <div class="field">
        <label for="tabs-panel-html-${index}">
          panel HTML
        </label>
        <textarea id="tabs-panel-html-${index}" data-panel-prop="html" spellcheck="false">${escapeHtml(tab.panel.html)}</textarea>
      </div>
    </fieldset>
  `).join('');
}

function renderTabsDemo(main) {
  let model = defaultTabsModel();
  main.innerHTML = `
    <section class="page-heading forms-detail-heading">
      <p class="eyebrow">
        @ui-base/ui
      </p>
      <h1>
        <code>
          uib-tabs
        </code>
      </h1>
      <p>
        Dedicated test page for the coordinated <code>uib-tabs</code>, <code>uib-tab</code>, and <code>uib-tab-panel</code> components.
      </p>
      <div class="button-row">
        <a class="secondary-button compact-control-button" href="/ui/" data-link>
          Back to UI
        </a>
        <a class="secondary-button compact-control-button" href="/ui/uib-tabs" data-link>
          Component API Page
        </a>
      </div>
    </section>
    <section class="demo-layout forms-demo-layout">
      <aside class="card controls forms-controls" aria-label="Tabs demo controls">
        <div class="card-content">
          <div class="controls-header">
            <h2>
              Test controls
            </h2>
          </div>
          <div class="form-grid">
            <div class="field">
              <label for="tabs-demo-name">
                name
              </label>
              <input id="tabs-demo-name" type="text" value="demoTabs" data-tabs-name>
            </div>
            <div class="field">
              <label for="tabs-demo-orientation">
                orientation
              </label>
              <select id="tabs-demo-orientation" data-tabs-orientation>
                <option value="horizontal">
                  horizontal
                </option>
                <option value="vertical">
                  vertical
                </option>
              </select>
            </div>
            <div class="field">
              <label for="tabs-demo-selected">
                selected
              </label>
              <input id="tabs-demo-selected" type="number" min="0" step="1" value="0" data-tabs-selected>
            </div>
            <div data-tabs-editors>
            </div>
            <div class="button-row">
              <button class="secondary-button compact-control-button" type="button" data-tabs-add>
                Add Tab
              </button>
              <button class="secondary-button compact-control-button" type="button" data-tabs-remove>
                Remove Last
              </button>
              <button class="secondary-button compact-control-button" type="button" data-tabs-disable-all>
                Disable All
              </button>
              <button class="primary-button compact-control-button" type="button" data-tabs-reset>
                Reset
              </button>
            </div>
            <div class="field">
              <label for="tabs-demo-json">
                JSON model
              </label>
              <textarea id="tabs-demo-json" data-tabs-json spellcheck="false"></textarea>
            </div>
            <div class="button-row">
              <button class="primary-button compact-control-button" type="button" data-tabs-apply-json>
                Apply JSON
              </button>
              <button class="secondary-button compact-control-button" type="button" data-tabs-sync-json>
                Sync From Controls
              </button>
            </div>
            <div class="status-box" data-tabs-status>
            </div>
          </div>
        </div>
      </aside>
      <div class="forms-preview-stack">
        <section class="card">
          <div class="preview-toolbar">
            <div>
              <strong>
                Live tabs
              </strong>
              <span>
                Use click, focus, arrows, Home, End, Enter, and Space.
              </span>
            </div>
          </div>
          <div class="forms-live-preview ui-live-preview" data-tabs-preview>
          </div>
        </section>
        <section class="card">
          <div class="card-content">
            <h2>
              Latest event
            </h2>
            <pre class="code-block forms-event-log" data-tabs-event-log>
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
              <code data-tabs-state>
              </code>
            </pre>
          </div>
        </section>
      </div>
    </section>
  `;

  const preview = main.querySelector('[data-tabs-preview]');
  const nameInput = main.querySelector('[data-tabs-name]');
  const orientation = main.querySelector('[data-tabs-orientation]');
  const selected = main.querySelector('[data-tabs-selected]');
  const editors = main.querySelector('[data-tabs-editors]');
  const jsonInput = main.querySelector('[data-tabs-json]');
  const status = main.querySelector('[data-tabs-status]');
  const state = main.querySelector('[data-tabs-state]');
  const eventLog = main.querySelector('[data-tabs-event-log]');
  let addedCount = 0;

  const currentTabs = () => preview.querySelector('[data-tabs-demo]');
  const tabItems = () => Array.from(currentTabs()?.children || []).filter((child) => child.localName === 'uib-tab');
  const panelItems = () => Array.from(currentTabs()?.children || []).filter((child) => child.localName === 'uib-tab-panel');
  const scheduleUpdate = () => requestAnimationFrame(updateStatus);
  const syncJson = () => {
    jsonInput.value = json(model);
  };
  const renderEditors = () => {
    editors.innerHTML = tabsEditorMarkup(model);
  };
  const renderTabs = () => {
    preview.innerHTML = `<uib-tabs data-tabs-demo name="${escapeAttr(model.name)}" selected="${escapeAttr(model.selected)}" orientation="${escapeAttr(model.orientation)}">${tabsMarkupFromModel(model)}</uib-tabs>`;
  };
  const applyModel = ({ syncJsonInput = true, rebuildEditors = true } = {}) => {
    model = normalizeTabsModel(model);
    nameInput.value = model.name;
    orientation.value = model.orientation;
    selected.value = model.selected;
    if (rebuildEditors) renderEditors();
    renderTabs();
    if (syncJsonInput) syncJson();
    scheduleUpdate();
  };
  const updateModelFromParentControls = () => {
    model.name = nameInput.value;
    model.orientation = orientation.value;
    model.selected = Number(selected.value || 0);
    syncJson();
    renderTabs();
    scheduleUpdate();
  };
  const updateStatus = () => {
    const tabs = currentTabs();
    const items = tabItems();
    const selectedValue = tabs?.getAttribute('selected') || '';
    const disabledCount = items.filter((tab) => tab.hasAttribute('disabled') || tab.getAttribute('aria-disabled') === 'true').length;
    model.selected = selectedValue === '' ? model.selected : Number(selectedValue);
    nameInput.value = tabs?.getAttribute('name') || model.name;
    orientation.value = tabs?.getAttribute('orientation') || model.orientation;
    selected.value = selectedValue;
    status.textContent = `selected: ${selectedValue || 'none'} | orientation: ${orientation.value} | tabs: ${items.length} | disabled: ${disabledCount}`;
    state.textContent = tabsElementMarkup(model);
  };

  preview.addEventListener('uib-tabs-change', (event) => {
    model.selected = Number(event.detail?.newValue ?? model.selected);
    syncJson();
    appendEventLog(eventLog, 'uib-tabs-change', event.detail || {}, { tag: event.target?.localName || 'uib-tabs' });
    scheduleUpdate();
  });
  preview.addEventListener('focusin', scheduleUpdate);

  nameInput.addEventListener('input', updateModelFromParentControls);
  orientation.addEventListener('change', () => {
    updateModelFromParentControls();
  });

  selected.addEventListener('change', () => {
    updateModelFromParentControls();
  });

  editors.addEventListener('input', (event) => {
    const editor = event.target.closest('[data-tab-editor]');
    if (!editor) return;
    const tab = model.tabs[Number(editor.dataset.tabEditor)];
    if (!tab) return;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (event.target.dataset.tabProp) tab[event.target.dataset.tabProp] = value;
    if (event.target.dataset.panelProp) tab.panel[event.target.dataset.panelProp] = value;
    if (event.target.dataset.tabAttribute) {
      const attr = event.target.dataset.tabAttribute;
      if (value) tab.attributes[attr] = value;
      else delete tab.attributes[attr];
    }
    if (event.target.dataset.panelAttribute) {
      const attr = event.target.dataset.panelAttribute;
      if (value) tab.panel.attributes[attr] = value;
      else delete tab.panel.attributes[attr];
    }
    syncJson();
    renderTabs();
    scheduleUpdate();
  });

  main.querySelector('[data-tabs-add]')?.addEventListener('click', () => {
    addedCount += 1;
    model.tabs.push({
      label: `Extra ${addedCount}`,
      disabled: false,
      ariaDisabled: false,
      attributes: {},
      panel: {
        heading: `Extra ${addedCount}`,
        html: '<p>Dynamically added panel content.</p>',
        attributes: {}
      }
    });
    applyModel();
  });

  main.querySelector('[data-tabs-remove]')?.addEventListener('click', () => {
    if (model.tabs.length <= 1) return;
    model.tabs.pop();
    if (model.selected >= model.tabs.length) model.selected = Math.max(0, model.tabs.length - 1);
    applyModel();
  });

  main.querySelector('[data-tabs-disable-all]')?.addEventListener('click', () => {
    model.tabs.forEach((tab) => {
      tab.disabled = true;
      tab.ariaDisabled = true;
    });
    applyModel();
  });

  main.querySelector('[data-tabs-reset]')?.addEventListener('click', () => {
    model = defaultTabsModel();
    addedCount = 0;
    applyModel();
  });

  main.querySelector('[data-tabs-sync-json]')?.addEventListener('click', () => {
    syncJson();
    status.textContent = 'JSON synced from the current controls.';
  });

  main.querySelector('[data-tabs-apply-json]')?.addEventListener('click', () => {
    try {
      model = normalizeTabsModel(JSON.parse(jsonInput.value));
      applyModel({ syncJsonInput: true, rebuildEditors: true });
      status.textContent = 'JSON applied.';
    } catch (error) {
      status.textContent = `JSON error: ${error.message}`;
    }
  });

  applyModel();
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
        @ui-base/ui
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
            ${attrs.map((name) => controlMarkup(component, name, state[name])).join('')}
            <div class="field">
              <label for="ui-control-children">
                children / slots
              </label>
              <textarea id="ui-control-children" data-prop="children" aria-describedby="ui-control-children-help" spellcheck="false">
                ${escapeHtml(state.children)}
              </textarea>
              <p class="control-help" id="ui-control-children-help">
                Light DOM content passed into the component. Named slots only apply when the component documents matching slot names.
              </p>
            </div>
            ${renderAttributeHelp(component, attrs)}
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
  if (normalizePath(path) === '/ui/tabs') {
    renderTabsDemo(main);
    return;
  }
  const component = initialRouteComponent(path);
  if (!component) {
    renderIndex(main);
    return;
  }
  renderComponentPage(main, component);
}
