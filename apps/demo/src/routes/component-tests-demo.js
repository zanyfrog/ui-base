import '@ui-base/tour-ui';
import { UI_BASE_UI_COMPONENTS } from '../../../../packages/ui-base-ui/src/metadata/index.js';
import { UI_BASE_FORM_COMPONENTS } from '../../../../packages/ui-base-forms/src/metadata.js';
import { UI_BASE_ASSET_COMPONENTS } from '../../../../packages/ui-base-assets/src/metadata.js';
import { appendEventLog, escapeAttr, escapeHtml, json } from './demo-utils.js';

const DESIGN_ROUTE = '/design-system/';
const COMPONENT_ROUTE = '/components/';
const ASSETS_ROUTE = '/assets-demo/';
const CALENDAR_ROUTE = '/calendar-demo/';
const HERO_ROUTE = '/hero/';
const TOUR_ROUTE = '/tour-ui/';

function componentDoc(data) {
  return {
    attributes: [],
    properties: [],
    events: [],
    slots: [],
    cssParts: [],
    cssVariables: [],
    fixtures: [],
    notes: [],
    ...data
  };
}

function uniqueComponents(components) {
  const seen = new Set();
  return components.filter((component) => {
    if (!component?.tagName || seen.has(component.tagName)) return false;
    seen.add(component.tagName);
    return true;
  });
}

const UI_FIXTURES = {
  'uib-toggle': '<uib-toggle name="published" label="Published" help="Nullable boolean control"></uib-toggle>',
  'uib-checkbox': '<uib-checkbox name="confirmed" label="Confirmed" help="Boolean field"></uib-checkbox>',
  'uib-label': '<uib-label text="Field label" help="Tooltip help" required></uib-label>',
  'uib-help': '<uib-help text="Helpful context appears here."></uib-help>',
  'uib-menu': '<uib-menu label="Fixture navigation" breakpoint="640"><uib-menuitem href="/component-tests/" active>Tests</uib-menuitem><uib-menuitem label="Packages"><uib-menuitem href="/hero/">Hero</uib-menuitem><uib-menuitem href="/assets-demo/">Assets</uib-menuitem></uib-menuitem></uib-menu>',
  'uib-menuitem': '<uib-menu label="Menu item fixture"><uib-menuitem href="/component-tests/" active>Component tests</uib-menuitem></uib-menu>',
  'uib-stack': '<uib-stack gap="0.75rem"><button class="primary-button" type="button">Primary</button><button class="secondary-button" type="button">Secondary</button></uib-stack>',
  'uib-grid': '<uib-grid min="8rem"><span class="fixture-chip">One</span><span class="fixture-chip">Two</span><span class="fixture-chip">Three</span></uib-grid>',
  'uib-row': '<uib-row wrap><span class="fixture-chip">Row A</span><span class="fixture-chip">Row B</span></uib-row>',
  'uib-column': '<uib-column><span class="fixture-chip">Column A</span><span class="fixture-chip">Column B</span></uib-column>',
  'uib-panel': '<uib-panel label="Panel fixture"><p>Panel body.</p><span slot="footer">Footer</span></uib-panel>',
  'uib-card': '<uib-card label="Card fixture"><p>Card body.</p><span slot="footer">Footer</span></uib-card>',
  'uib-dialog': '<button class="secondary-button" type="button" data-open-component-dialog>Open fixture dialog</button><uib-dialog id="componentTestsDialog" label="Fixture dialog"><p>Dialog body content.</p><span slot="footer">Footer</span></uib-dialog>',
  'uib-accordion': '<uib-accordion label="Accordion fixture"><p>Accordion body content.</p></uib-accordion>',
  'uib-tabs': '<uib-tabs label="Fixture tab"><p>Experimental tab body.</p></uib-tabs>',
  'uib-splitter': '<uib-splitter><div slot="start">Start pane</div><div slot="end">End pane</div></uib-splitter>'
};

const FORM_FIXTURES = {
  'uib-forms-form': '<uib-forms-form name="contact" label="Contact form" submit-label="Submit"><uib-forms-textbox name="name" label="Name" required></uib-forms-textbox></uib-forms-form>',
  'uib-forms-textbox': '<uib-forms-textbox name="visitorName" label="Name" value="Ada"></uib-forms-textbox>',
  'uib-forms-number': '<uib-forms-number name="groupSize" label="Group size" min="1" max="30" value="4"></uib-forms-number>',
  'uib-forms-date': '<uib-forms-date name="visitDate" label="Visit date"></uib-forms-date>',
  'uib-forms-email': '<uib-forms-email name="email" label="Email" placeholder="person@example.local"></uib-forms-email>',
  'uib-forms-password': '<uib-forms-password name="accessCode" label="Access code"></uib-forms-password>',
  'uib-forms-phone': '<uib-forms-phone name="phone" label="Phone"></uib-forms-phone>',
  'uib-forms-textarea': '<uib-forms-textarea name="notes" label="Notes" value="Accessible entrance preferred."></uib-forms-textarea>',
  'uib-forms-select': '<uib-forms-select name="location" label="Location" options="Main Hall,Annex,Remote"></uib-forms-select>',
  'uib-forms-field': '<uib-forms-field label="Wrapped field" help="Slotted control"><input class="native-input" value="Native input"></uib-forms-field>',
  'uib-forms-input-group': '<uib-forms-input-group><uib-forms-textbox name="first" label="First"></uib-forms-textbox><uib-forms-textbox name="second" label="Second"></uib-forms-textbox></uib-forms-input-group>',
  'uib-forms-wizard': '<uib-forms-wizard label="Wizard fixture"><p>Wizard step content.</p></uib-forms-wizard>'
};

const ASSET_FIXTURES = {
  'uib-asset-browser': '<uib-asset-browser variant="simple" application-key="demo-app" selection-mode="single"></uib-asset-browser>',
  'uib-asset-picker': '<uib-asset-picker name="heroAsset" label="Hero asset" application-key="demo-app" selection-mode="single" allow-upload></uib-asset-picker>',
  'uib-asset-picker-dialog': '<uib-asset-picker-dialog application-key="demo-app" data-picker-mode="pick" selection-mode="single"></uib-asset-picker-dialog>',
  'uib-asset-image': '<uib-asset-image src="/apps/demo/assets/icons/tour-size.svg" alt="Tour size" role="icon" fit="contain" ratio="1/1"></uib-asset-image>',
  'uib-visual-source-control': '<uib-visual-source-control label="Hero visual source"></uib-visual-source-control>',
  'uib-asset-list': '<uib-asset-list selection-mode="single"></uib-asset-list>',
  'uib-asset-grid': '<uib-asset-grid selection-mode="single"></uib-asset-grid>',
  'uib-asset-preview': '<uib-asset-preview></uib-asset-preview>',
  'uib-asset-details': '<uib-asset-details tab="summary"></uib-asset-details>',
  'uib-asset-search': '<uib-asset-search placeholder="Search assets"></uib-asset-search>',
  'uib-asset-thumbnail': '<uib-asset-thumbnail label="Tour size" file-type="svg" url="/apps/demo/assets/icons/tour-size.svg"></uib-asset-thumbnail>',
  'uib-asset-uploader': '<uib-asset-uploader></uib-asset-uploader>',
  'uib-asset-metadata-editor': '<uib-asset-metadata-editor></uib-asset-metadata-editor>',
  'uib-asset-version-history': '<uib-asset-version-history></uib-asset-version-history>',
  'uib-asset-usage': '<uib-asset-usage></uib-asset-usage>',
  'uib-asset-permission-panel': '<uib-asset-permission-panel></uib-asset-permission-panel>',
  'uib-asset-permission-set-picker': '<uib-asset-permission-set-picker value="application-asset-manager"></uib-asset-permission-set-picker>'
};

const BASE_PACKAGE_DOCS = [
  {
    id: 'core',
    name: '@ui-base/core',
    title: 'Core utilities',
    summary: 'Shared base classes, events, validation helpers, localization, metadata, and DOM utilities used by the component packages.',
    testRoute: DESIGN_ROUTE,
    updateSource: 'packages/ui-base-core/src',
    smokeChecks: ['Exports load without syntax errors.', 'Shared helpers support every package fixture.', 'Component metadata can be rendered by this route.'],
    apiItems: [
      'UibBaseElement',
      'defineUiBaseElement',
      'escapeHtml',
      'parseBoolean',
      'createComponentMetadata',
      'MATURITY_LEVELS'
    ],
    notes: ['Core has no public custom element fixture. It is exercised through every registered Web Component on this page.']
  },
  {
    id: 'design-system',
    name: '@ui-base/design-system',
    title: 'Design system',
    summary: 'Design guidance, token files, accessibility CSS, component specification templates, and lifecycle standards.',
    testRoute: DESIGN_ROUTE,
    updateSource: 'packages/ui-base-design-system',
    smokeChecks: ['Token and accessibility stylesheets load.', 'Design-system route renders docs.', 'Package roadmap and lifecycle docs remain linked.'],
    apiItems: ['tokens.css', 'a11y.css', 'DESIGN_SYSTEM.md', 'ACCESSIBILITY_STANDARD.md', 'COMPONENT_SPECIFICATION_TEMPLATE.md']
  },
  {
    id: 'theme',
    name: '@ui-base/theme',
    title: 'Theme stylesheets',
    summary: 'Default, dark, and sample-tour CSS variable themes for UI Base applications.',
    testRoute: DESIGN_ROUTE,
    updateSource: 'packages/ui-base-theme/src',
    smokeChecks: ['Theme CSS files load.', 'Token swatches render on the design-system demo.', 'Theme package exports stay aligned with package.json.'],
    apiItems: ['default.css', 'dark.css', 'sample-tour.css']
  },
  {
    id: 'icons',
    name: '@ui-base/icons',
    title: 'Icons',
    summary: 'Named SVG icon registry, URL icon support, and the accessible <uib-icon> custom element.',
    testRoute: COMPONENT_ROUTE,
    updateSource: 'packages/ui-base-icons/src',
    smokeChecks: ['Named icons render.', 'URL icons render.', 'Accessible and decorative icon modes are available.'],
    components: [
      componentDoc({
        tagName: 'uib-icon',
        package: '@ui-base/icons',
        maturity: 'preview',
        purpose: 'Renders a registered SVG icon or URL-backed image icon.',
        attributes: ['name', 'src', 'url', 'size', 'label', 'aria-label', 'title', 'decorative'],
        events: [],
        cssParts: ['icon'],
        fixtures: ['<uib-icon name="calendar" label="Calendar" size="2rem"></uib-icon><uib-icon name="warning" label="Warning" size="2rem"></uib-icon><uib-icon src="/apps/demo/assets/icons/accessibility.svg" label="Accessibility" size="2rem"></uib-icon>']
      })
    ],
    apiItems: ['registerMtIcon(name, svg)', 'getMtIcon(name)', 'hasMtIcon(name)', 'listMtIcons()']
  }
];

const UI_PACKAGE = {
  id: 'ui',
  name: '@ui-base/ui',
  title: 'UI primitives',
  summary: 'Generic controls, content blocks, action buttons, media, details, navigation, layout, and overlay primitives.',
  testRoute: COMPONENT_ROUTE,
  updateSource: 'packages/ui-base-ui/src',
  smokeChecks: ['Interactive controls emit change events.', 'Layout primitives render without throwing.', 'Compatibility exports continue to point at owning packages.'],
  components: uniqueComponents(UI_BASE_UI_COMPONENTS.map((item) => componentDoc({
    ...item,
    fixtures: UI_FIXTURES[item.tagName] ? [UI_FIXTURES[item.tagName]] : []
  })).concat([
    componentDoc({
      tagName: 'uib-eyebrow',
      package: '@ui-base/ui',
      maturity: 'preview',
      purpose: 'Small section label or overline text.',
      attributes: ['text'],
      slots: ['default'],
      cssParts: ['eyebrow'],
      fixtures: ['<uib-eyebrow text="Developer docs"></uib-eyebrow>']
    }),
    componentDoc({
      tagName: 'uib-heading-block',
      package: '@ui-base/ui',
      maturity: 'preview',
      purpose: 'Reusable heading group with eyebrow, headline, subheadline, and body slots.',
      attributes: ['eyebrow', 'headline', 'subheadline', 'body', 'size', 'align'],
      slots: ['eyebrow', 'headline', 'subheadline', 'body'],
      cssParts: ['block', 'headline', 'subheadline', 'body'],
      fixtures: ['<uib-heading-block eyebrow="Section" headline="Heading block" subheadline="Reusable content heading." body="Parent pages own the state."></uib-heading-block>']
    }),
    componentDoc({
      tagName: 'uib-action-button',
      package: '@ui-base/ui',
      maturity: 'preview',
      purpose: 'Single action rendered as a button or link.',
      attributes: ['label', 'href', 'action', 'action-token', 'variant', 'kind', 'disabled', 'target', 'rel', 'icon'],
      events: ['uib-action-button-click', 'uib-action'],
      slots: ['default'],
      cssParts: ['button'],
      fixtures: ['<uib-action-button label="Run action" action-token="RUN_ACTION" variant="primary"></uib-action-button>']
    }),
    componentDoc({
      tagName: 'uib-action-group',
      package: '@ui-base/ui',
      maturity: 'preview',
      purpose: 'Renders an ordered group of action buttons from a JSON array or property.',
      attributes: ['actions', 'align', 'stacked'],
      properties: ['actions'],
      events: ['uib-action-button-click', 'uib-action'],
      slots: ['default'],
      cssParts: ['group'],
      fixtures: ['<uib-action-group actions=\'[{"label":"Save","variant":"primary","actionToken":"SAVE"},{"label":"Cancel","variant":"secondary","actionToken":"CANCEL"}]\'></uib-action-group>']
    }),
    componentDoc({
      tagName: 'uib-media',
      package: '@ui-base/ui',
      maturity: 'preview',
      purpose: 'Safe image/media presenter with fit, ratio, alt text, and fallback handling.',
      attributes: ['src', 'alt', 'role', 'fit', 'ratio', 'position', 'fallback-label'],
      cssParts: ['media', 'fallback'],
      fixtures: ['<uib-media src="/apps/demo/assets/icons/availability.svg" alt="Availability" role="icon" fit="contain" ratio="16:9"></uib-media>']
    }),
    componentDoc({
      tagName: 'uib-detail-item',
      package: '@ui-base/ui',
      maturity: 'preview',
      purpose: 'Displays one label/value detail item with an asset-backed icon, URL override, and text fallback.',
      attributes: ['label', 'value', 'description', 'icon', 'asset-id', 'icon-url', 'icon-alt', 'asset-map', 'detail'],
      properties: ['detail', 'assetMap'],
      cssParts: ['item', 'label', 'value', 'description'],
      fixtures: ['<uib-detail-item label="Duration" value="60 minutes" icon="60" asset-id="asset-duration" asset-map=\'{"asset-duration":{"url":"/apps/demo/assets/icons/tour-length.svg","alt":"Duration"}}\'></uib-detail-item>']
    }),
    componentDoc({
      tagName: 'uib-detail-item-edit',
      package: '@ui-base/ui',
      maturity: 'preview',
      purpose: 'Edits one detail item, including text fallback, asset ID, URL/alt overrides, and optional asset picker.',
      attributes: ['detail', 'label', 'asset-map', 'use-asset-picker', 'application-key', 'api-base-url', 'index'],
      properties: ['detail', 'headers', 'getAuthHeaders'],
      events: ['uib-detail-item-edit-change', 'uib-detail-item-asset-change', 'change'],
      cssParts: ['fields'],
      fixtures: ['<uib-detail-item-edit use-asset-picker application-key="demo-app" api-base-url="http://localhost:4020" index="0" detail=\'{"label":"Duration","value":"60 minutes","iconAssetId":"asset-duration","icon":"60"}\'></uib-detail-item-edit>']
    }),
    componentDoc({
      tagName: 'uib-detail-list',
      package: '@ui-base/ui',
      maturity: 'preview',
      purpose: 'Displays label/value/detail rows with text, URL, or asset-backed icons.',
      attributes: ['details', 'asset-map'],
      properties: ['details', 'assetMap'],
      cssParts: ['list', 'item', 'label', 'value'],
      fixtures: ['<uib-detail-list asset-map=\'{"asset-capacity":{"url":"/apps/demo/assets/icons/tour-size.svg","alt":"Capacity"}}\' details=\'[{"label":"Duration","value":"60 minutes","icon":"60"},{"label":"Capacity","value":"20 people","iconAssetId":"asset-capacity"}]\'></uib-detail-list>']
    }),
    componentDoc({
      tagName: 'uib-detail-list-editor',
      package: '@ui-base/ui',
      maturity: 'preview',
      purpose: 'Editable detail-row authoring component that emits clean detail arrays.',
      attributes: ['details', 'asset-map', 'label'],
      properties: ['details', 'assetMap'],
      events: ['uib-detail-add', 'uib-detail-update', 'uib-detail-asset-change', 'uib-detail-remove', 'uib-detail-list-editor-change'],
      cssParts: ['editor'],
      fixtures: ['<uib-detail-list-editor label="Editable detail fixture" application-key="demo-app" api-base-url="http://localhost:4020" use-asset-picker details=\'[{"label":"Duration","value":"60 minutes","iconAssetId":"asset-duration","icon":"60"}]\'></uib-detail-list-editor>']
    })
  ]))
};

const FORMS_PACKAGE = {
  id: 'forms',
  name: '@ui-base/forms',
  title: 'Forms',
  summary: 'Form container, text/date/number/select controls, validation states, and form layout components.',
  testRoute: COMPONENT_ROUTE,
  updateSource: 'packages/ui-base-forms/src',
  smokeChecks: ['Controls render with labels.', 'Change events bubble with name and value.', 'Form submit event exposes serialized form data.'],
  components: UI_BASE_FORM_COMPONENTS.map((item) => componentDoc({
    ...item,
    fixtures: FORM_FIXTURES[item.tagName] ? [FORM_FIXTURES[item.tagName]] : []
  }))
};

const CALENDAR_PACKAGE = {
  id: 'calendar',
  name: '@ui-base/calendar',
  title: 'Calendar',
  summary: 'Day, week, month, year, date-window, and day-of-week calendar views controlled by parent state.',
  testRoute: CALENDAR_ROUTE,
  updateSource: 'packages/ui-base-calendar/src',
  smokeChecks: ['Calendar views render for fixed dates.', 'Date selection events bubble.', 'Dedicated calendar demo routes continue to load.'],
  components: [
    componentDoc({ tagName: 'uib-calendar-day-view', package: '@ui-base/calendar', maturity: 'preview', purpose: 'Single day schedule/date view.', attributes: ['date', 'selected-date'], events: ['uib-calendar-date-select'], fixtures: ['<uib-calendar-day-view date="2026-07-07"></uib-calendar-day-view>'] }),
    componentDoc({ tagName: 'uib-calendar-week-view', package: '@ui-base/calendar', maturity: 'preview', purpose: 'Seven-day week view.', attributes: ['date', 'selected-date'], events: ['uib-calendar-date-select'], fixtures: ['<uib-calendar-week-view date="2026-07-07"></uib-calendar-week-view>'] }),
    componentDoc({ tagName: 'uib-calendar-month-view', package: '@ui-base/calendar', maturity: 'preview', purpose: 'Month grid with selectable dates.', attributes: ['year', 'month', 'selected-date'], events: ['uib-calendar-date-select'], fixtures: ['<uib-calendar-month-view year="2026" month="7" selected-date="2026-07-07"></uib-calendar-month-view>'] }),
    componentDoc({ tagName: 'uib-calendar-year-view', package: '@ui-base/calendar', maturity: 'preview', purpose: 'Year overview.', attributes: ['year', 'selected-date'], events: ['uib-calendar-date-select'], fixtures: ['<uib-calendar-year-view year="2026" selected-date="2026-07-07"></uib-calendar-year-view>'] }),
    componentDoc({ tagName: 'uib-date-window-view', package: '@ui-base/calendar', maturity: 'preview', purpose: 'Rolling date window view.', attributes: ['start-date', 'days', 'selected-date'], events: ['uib-calendar-date-select'], fixtures: ['<uib-date-window-view start-date="2026-07-07" days="7"></uib-date-window-view>'] }),
    componentDoc({ tagName: 'uib-day-of-week-view', package: '@ui-base/calendar', maturity: 'preview', purpose: 'Day-of-week pattern view.', attributes: ['day', 'selected-date', 'start-date', 'weeks'], events: ['uib-calendar-date-select'], fixtures: ['<uib-day-of-week-view day="tuesday" start-date="2026-07-07" weeks="4"></uib-day-of-week-view>'] })
  ]
};

const HERO_PACKAGE = {
  id: 'hero',
  name: '@ui-base/hero',
  title: 'Hero',
  summary: 'Visitor-facing hero renderer with CTA JSON, visual source modes, navigation, details, slots, and asset-backed visuals.',
  testRoute: HERO_ROUTE,
  updateSource: 'packages/ui-base-hero/src',
  smokeChecks: ['Hero renders headline, CTAs, details, and visual.', 'CTA events bubble and can be canceled.', 'Hero data JSON normalizes to attributes.'],
  components: [
    componentDoc({
      tagName: 'uib-hero',
      package: '@ui-base/hero',
      maturity: 'preview',
      purpose: 'Top-of-page hero section for landing, product, organization, and tour pages.',
      attributes: ['hero-data', 'hero-json', 'eyebrow', 'headline', 'subheadline', 'action-components', 'hero-action-buttons', 'actions', 'visual-source', 'visual-role', 'visual-src', 'visual-asset-id', 'visual-alt', 'visual-mode', 'layout-opacity', 'trust-signal', 'nav-items', 'details', 'asset-map', 'theme', 'size', 'brand-label', 'brand-mark'],
      properties: ['heroData', 'details', 'navItems'],
      events: ['uib-hero-cta', 'uib-hero-primary-cta', 'uib-hero-secondary-cta', 'uib-hero-third-cta', 'uib-hero-fourth-cta'],
      slots: ['navigation', 'visual', 'trust', 'after-content'],
      cssParts: [],
      fixtures: ['<uib-hero eyebrow="Component test" headline="Hero fixture" subheadline="Action Component and detail events are observable here." brand-label="UI Base" action-components=\'[{"id":"primary-action","name":"primaryCta","kind":"primary","label":"Primary action","type":"action","value":"PRIMARY_ACTION","show":true,"disabled":false,"variant":"primary"},{"id":"secondary-link","name":"secondaryCta","kind":"secondary","label":"Secondary link","type":"link","value":"#secondary","show":true,"disabled":false,"variant":"secondary"}]\' visual-source="url" visual-src="/apps/demo/assets/icons/availability.svg" visual-role="icon" visual-alt="Availability" details=\'[{"label":"Mode","value":"Preview","icon":"PV"},{"label":"Source","value":"Demo fixture","icon":"DF"}]\'></uib-hero>']
    })
  ],
  apiItems: ['applyHeroDefaults', 'createSampleTourHeroDefaults', 'normalizeHeroDefaults', 'SAMPLE_TOUR_HERO_DEFAULTS']
};

const ASSETS_PACKAGE = {
  id: 'assets',
  name: '@ui-base/assets',
  title: 'Assets',
  summary: 'Backend-neutral asset browser, picker, upload, metadata, permissions, versioning, preview, and usage components.',
  testRoute: ASSETS_ROUTE,
  updateSource: 'packages/ui-base-assets/src',
  smokeChecks: ['Mock provider examples render.', 'Picker emits selection and upload events.', 'Asset image resolves direct URLs and asset-map URLs.'],
  components: UI_BASE_ASSET_COMPONENTS.map((item) => componentDoc({
    ...item,
    fixtures: ASSET_FIXTURES[item.tagName] ? [ASSET_FIXTURES[item.tagName]] : []
  })),
  apiItems: ['createMockAssetProvider', 'createOrmAssetProvider', 'normalizeAsset', 'normalizeAssets', 'assetSelection']
};

const TOUR_PACKAGE = {
  id: 'tour-ui',
  name: '@ui-base/tour-ui',
  title: 'Tour action components',
  summary: 'Reusable action components for reservation-style workflows.',
  testRoute: TOUR_ROUTE,
  updateSource: 'packages/ui-base-tour-ui/src',
  smokeChecks: ['Each action component renders.', 'Action buttons emit generic and component-specific events.', 'Disabled state prevents action and shows feedback.'],
  components: [
    componentDoc({ tagName: 'uib-new-reservation', package: '@ui-base/tour-ui', maturity: 'preview', purpose: 'New reservation action card.', attributes: ['heading', 'eyebrow', 'description', 'action-label', 'toast-message', 'toast-duration', 'disabled', 'variant'], methods: ['call()', 'showToast()', 'hideToast()'], events: ['uib-tour-reservation-action', 'uib-tour-new-reservation', 'uib-tour-toast-show'], fixtures: ['<uib-new-reservation></uib-new-reservation>'] }),
    componentDoc({ tagName: 'uib-cancel-reservation', package: '@ui-base/tour-ui', maturity: 'preview', purpose: 'Cancel reservation action card.', attributes: ['heading', 'eyebrow', 'description', 'action-label', 'toast-message', 'toast-duration', 'disabled', 'variant'], methods: ['call()', 'showToast()', 'hideToast()'], events: ['uib-tour-reservation-action', 'uib-tour-cancel-reservation', 'uib-tour-toast-show'], fixtures: ['<uib-cancel-reservation></uib-cancel-reservation>'] }),
    componentDoc({ tagName: 'uib-find-reservation', package: '@ui-base/tour-ui', maturity: 'preview', purpose: 'Find reservation action card.', attributes: ['heading', 'eyebrow', 'description', 'action-label', 'toast-message', 'toast-duration', 'disabled', 'variant'], methods: ['call()', 'showToast()', 'hideToast()'], events: ['uib-tour-reservation-action', 'uib-tour-find-reservation', 'uib-tour-toast-show'], fixtures: ['<uib-find-reservation></uib-find-reservation>'] }),
    componentDoc({ tagName: 'uib-book-group-reservation', package: '@ui-base/tour-ui', maturity: 'preview', purpose: 'Group reservation action card.', attributes: ['heading', 'eyebrow', 'description', 'action-label', 'toast-message', 'toast-duration', 'disabled', 'variant'], methods: ['call()', 'showToast()', 'hideToast()'], events: ['uib-tour-reservation-action', 'uib-tour-book-group-reservation', 'uib-tour-toast-show'], fixtures: ['<uib-book-group-reservation></uib-book-group-reservation>'] })
  ]
};

const APP_MANAGER_PACKAGE = {
  id: 'app-manager-ui',
  name: '@ui-base/app-manager-ui',
  title: 'App Manager UI',
  summary: 'Framework-neutral administrative components for application, hero, and asset configuration.',
  testRoute: '',
  updateSource: 'packages/app-manager-ui/src',
  smokeChecks: ['Manager app builds with Vite.', 'Hero editor can save canonical action JSON and legacy compatibility fields.', 'Asset picker integration resolves detail icons.'],
  components: [
    componentDoc({ tagName: 'uib-application-manager', package: '@ui-base/app-manager-ui', maturity: 'preview', purpose: 'Top-level manager shell for applications, heroes, and assets.', attributes: ['orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token'] }),
    componentDoc({ tagName: 'uib-application-list', package: '@ui-base/app-manager-ui', maturity: 'preview', purpose: 'Application list and row actions.', attributes: ['orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token'] }),
    componentDoc({ tagName: 'uib-application-editor', package: '@ui-base/app-manager-ui', maturity: 'preview', purpose: 'Application create/edit form.', attributes: ['application-key', 'orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token'] }),
    componentDoc({ tagName: 'uib-application-hero-list', package: '@ui-base/app-manager-ui', maturity: 'preview', purpose: 'Hero list for one application.', attributes: ['application-key', 'orm-base-url', 'dev-actor-id', 'dev-token'] }),
    componentDoc({ tagName: 'uib-application-hero-editor', package: '@ui-base/app-manager-ui', maturity: 'preview', purpose: 'Hero editor with live preview, autosave, navigation/details editors, and CTA action JSON.', attributes: ['application-key', 'hero-key', 'orm-base-url', 'dev-actor-id', 'dev-token'] }),
    componentDoc({ tagName: 'uib-application-hero-preview', package: '@ui-base/app-manager-ui', maturity: 'preview', purpose: 'Admin preview wrapper that feeds App Manager hero records into <uib-hero>.', attributes: ['application-key', 'hero-key'] }),
    componentDoc({ tagName: 'uib-application-asset-list', package: '@ui-base/app-manager-ui', maturity: 'preview', purpose: 'Application asset list.', attributes: ['application-key', 'orm-base-url', 'dev-actor-id', 'dev-token'] }),
    componentDoc({ tagName: 'uib-application-asset-editor', package: '@ui-base/app-manager-ui', maturity: 'preview', purpose: 'Application asset editor.', attributes: ['application-key', 'asset-id', 'orm-base-url', 'dev-actor-id', 'dev-token'] }),
    componentDoc({ tagName: 'uib-hero-action-button', package: '@ui-base/app-manager-ui', maturity: 'preview', purpose: 'Single admin CTA action config editor.', attributes: ['heading', 'name', 'action', 'default-action-token'] }),
    componentDoc({ tagName: 'uib-hero-action-buttons', package: '@ui-base/app-manager-ui', maturity: 'preview', purpose: 'Ordered admin CTA action array editor.', attributes: ['label', 'actions', 'allow-add', 'allow-remove'], events: ['change', 'uib-hero-action-buttons-change'] })
  ],
  apiItems: ['hero-action-config', 'hero-action-model', 'record-fields']
};

const API_CLIENT_PACKAGE = {
  id: 'app-manager-api-client',
  name: '@ui-base/app-manager-api-client',
  title: 'App Manager API client',
  summary: 'Typed fetch client for ORM and IAM endpoints used by the App Manager.',
  testRoute: '',
  updateSource: 'packages/app-manager-api-client/src/index.ts',
  smokeChecks: ['Client constructs default URLs.', 'API errors preserve status and response body details.', 'Fallback upload paths remain documented.'],
  apiItems: ['AppManagerApiClient', 'createAppManagerApiClient', 'ApiError', 'listApplications()', 'listHeroes()', 'uploadAsset()', 'uploadDetailIcon()', 'bootstrapApplication()'],
  notes: ['This is not a visual package, so smoke tests should exercise it through unit tests or a mocked fetch client rather than a browser fixture.']
};

const APP_MANAGER_TOKENS_PACKAGE = {
  id: 'app-manager-design-tokens',
  name: '@ui-base/app-manager-design-tokens',
  title: 'App Manager design tokens',
  summary: 'Manager-specific administrative token layer over UI Base primitives.',
  testRoute: '',
  updateSource: 'packages/app-manager-design-tokens/src/tokens.css',
  smokeChecks: ['Token stylesheet is importable by the manager app.', 'Manager UI uses app-manager token variables without breaking generic UI package styles.'],
  apiItems: ['tokens.css']
};

const PACKAGE_DOCS = [
  ...BASE_PACKAGE_DOCS,
  UI_PACKAGE,
  FORMS_PACKAGE,
  CALENDAR_PACKAGE,
  HERO_PACKAGE,
  ASSETS_PACKAGE,
  TOUR_PACKAGE,
  APP_MANAGER_PACKAGE,
  API_CLIENT_PACKAGE,
  APP_MANAGER_TOKENS_PACKAGE
];

const ALL_COMPONENTS = PACKAGE_DOCS.flatMap((item) => item.components || []);
const ALL_EVENT_NAMES = Array.from(new Set(ALL_COMPONENTS.flatMap((item) => item.events || []))).filter(Boolean).sort();

function listMarkup(items, className = 'doc-pill-list') {
  if (!items?.length) return '<p class="muted compact-doc-copy">None documented.</p>';
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function runtimeAttributes(tagName, fallback = []) {
  const elementClass = customElements.get(tagName);
  const observed = elementClass?.observedAttributes;
  if (Array.isArray(observed) && observed.length) return observed;
  return fallback || [];
}

function runtimeStatus(tagName) {
  return customElements.get(tagName) ? 'registered' : 'documented';
}

function componentAnchor(tagName) {
  return `component-${tagName}`;
}

function testId(value) {
  return String(value || '').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function renderFixture(component, packageId, index) {
  const fixture = component.fixtures?.[0];
  if (!fixture) {
    return `
      <div class="component-fixture component-fixture--empty" data-test-id="fixture-${escapeAttr(testId(component.tagName))}">
        <p>
          No live fixture on this page. Use the linked route for the full workflow test.
        </p>
      </div>
    `;
  }

  return `
    <div class="component-fixture" data-test-id="fixture-${escapeAttr(testId(component.tagName))}-${index}">
      ${fixture}
    </div>
    <details class="component-code-sample">
      <summary>Markup</summary>
      <pre class="code-block"><code>${escapeHtml(fixture)}</code></pre>
    </details>
  `;
}

function renderComponentCard(component, packageDoc, index) {
  const attrs = runtimeAttributes(component.tagName, component.attributes);
  const status = runtimeStatus(component.tagName);
  const runtimeNote = status === 'registered'
    ? 'Observed attributes are read from the loaded custom element class.'
    : 'This component is documented here but not loaded in the static demo runtime.';

  return `
    <article id="${escapeAttr(componentAnchor(component.tagName))}" class="card component-doc-card" data-test-id="component-doc-${escapeAttr(testId(component.tagName))}">
      <div class="card-content component-doc-card__content">
        <div class="component-doc-header">
          <div>
            <p class="eyebrow">
              ${escapeHtml(component.package || packageDoc.name)}
            </p>
            <h3>
              <code>
                ${escapeHtml(component.tagName)}
              </code>
            </h3>
            <p class="muted">
              ${escapeHtml(component.purpose || 'Component documentation fixture.')}
            </p>
          </div>
          <span class="component-status component-status--${escapeAttr(status)}">
            ${escapeHtml(status)}
          </span>
        </div>
        <div class="component-doc-grid">
          <section>
            <h4>
              Observed attributes
            </h4>
            ${listMarkup(attrs)}
          </section>
          <section>
            <h4>
              Properties / methods
            </h4>
            ${listMarkup([...(component.properties || []), ...(component.methods || [])])}
          </section>
          <section>
            <h4>
              Events
            </h4>
            ${listMarkup(component.events || [])}
          </section>
          <section>
            <h4>
              Slots / CSS hooks
            </h4>
            ${listMarkup([...(component.slots || []).map((slot) => `slot:${slot}`), ...(component.cssParts || []).map((part) => `part:${part}`), ...(component.cssVariables || []).map((variable) => `var:${variable}`)])}
          </section>
        </div>
        <p class="runtime-note">
          ${escapeHtml(runtimeNote)}
        </p>
        ${component.notes?.length ? `<div class="doc-note-list">${listMarkup(component.notes, 'plain-doc-list')}</div>` : ''}
        ${renderFixture(component, packageDoc.id, index)}
      </div>
    </article>
  `;
}

function renderApiItems(packageDoc) {
  if (!packageDoc.apiItems?.length) return '';
  return `
    <section class="package-api-list">
      <h3>Developer API surface</h3>
      ${listMarkup(packageDoc.apiItems)}
    </section>
  `;
}

function renderSmokeChecks(packageDoc) {
  return `
    <section class="package-smoke-list">
      <h3>Suggested smoke checks</h3>
      ${listMarkup(packageDoc.smokeChecks || [])}
    </section>
  `;
}

function renderPackageSection(packageDoc) {
  const components = packageDoc.components || [];
  const focusedDemoControl = packageDoc.testRoute
    ? `
      <a class="primary-button" href="${escapeAttr(packageDoc.testRoute)}" data-link>
        Open focused demo
      </a>
    `
    : '<span class="secondary-button disabled-link" aria-disabled="true">No static demo route</span>';
  return `
    <section id="${escapeAttr(packageDoc.id)}" class="component-package-section" data-test-id="component-package-${escapeAttr(packageDoc.id)}">
      <div class="card package-doc-card">
        <div class="card-content">
          <div class="package-doc-header">
            <div>
              <p class="eyebrow">
                ${escapeHtml(packageDoc.name)}
              </p>
              <h2>
                ${escapeHtml(packageDoc.title)}
              </h2>
              <p class="muted">
                ${escapeHtml(packageDoc.summary)}
              </p>
            </div>
            ${focusedDemoControl}
          </div>
          <div class="package-doc-meta">
            <span>
              <strong>
                Source:
              </strong>
              <code>
                ${escapeHtml(packageDoc.updateSource || 'package source')}
              </code>
            </span>
            <span>
              <strong>
                Component docs:
              </strong>
              ${components.length ? `${components.length} item${components.length === 1 ? '' : 's'}` : 'API-only package'}
            </span>
          </div>
          <div class="package-doc-columns">
            ${renderApiItems(packageDoc)}
            ${renderSmokeChecks(packageDoc)}
          </div>
        </div>
      </div>
      ${components.length ? `<div class="component-doc-grid-list">${components.map((component, index) => renderComponentCard(component, packageDoc, index)).join('')}</div>` : ''}
    </section>
  `;
}

function renderPackageNav() {
  return `
    <nav class="component-tests-nav card" aria-label="Component test package navigation">
      <div class="card-content">
        <h2>Packages</h2>
        <div class="component-tests-link-grid">
          ${PACKAGE_DOCS.map((item) => `<a href="#${escapeAttr(item.id)}">${escapeHtml(item.name)}</a>`).join('')}
        </div>
      </div>
    </nav>
  `;
}

function renderSmokeStrategy() {
  return `
    <section class="card component-strategy-card" data-test-id="component-tests-strategy">
      <div class="card-content">
        <p class="eyebrow">
          Demo-first test strategy
        </p>
        <h2>
          Human docs now, automation hooks ready.
        </h2>
        <div class="component-strategy-grid">
          <div>
            <h3>
              What this page does
            </h3>
            <p class="muted">
              It gives testers and developers a single route with package summaries, component options, runtime attribute reflection, stable test IDs, live fixtures, event logs, and focused demo links.
            </p>
          </div>
          <div>
            <h3>
              How docs stay current
            </h3>
            <p class="muted">
              Registered Web Components expose their current
              <code>
                observedAttributes
              </code>
              directly from the loaded class. Package-owned metadata fills in purpose, events, slots, CSS parts, and examples.
            </p>
          </div>
          <div>
            <h3>
              Automation recommendation
            </h3>
            <p class="muted">
              Do not create a daily documentation automation yet. Keep this source-driven, then add CI or a scheduled browser smoke job once generated metadata or a browser runner is available.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function bindComponentTests(main) {
  const eventLog = main.querySelector('#componentTestsEventLog');
  const status = main.querySelector('#componentTestsStatus');
  const eventNames = ALL_EVENT_NAMES.concat(['change', 'input']);

  eventNames.forEach((eventName) => {
    main.addEventListener(eventName, (event) => {
      const targetName = event.target?.localName || event.target?.tagName || 'unknown';
      appendEventLog(eventLog, eventName, event.detail || {}, { tag: targetName });
      if (status) status.textContent = `Latest event: ${eventName} from ${targetName}.`;
      if (eventName.includes('action') || eventName.includes('cta')) event.preventDefault?.();
    });
  });

  main.querySelector('[data-open-component-dialog]')?.addEventListener('click', () => {
    main.querySelector('#componentTestsDialog')?.show?.();
    if (status) status.textContent = 'Opened fixture dialog from the parent page.';
  });
}

export function renderComponentTestsRoute(main) {
  const registeredCount = ALL_COMPONENTS.filter((component) => customElements.get(component.tagName)).length;
  main.innerHTML = `
    <section class="page-heading component-tests-heading" data-test-id="component-tests-heading">
      <p class="eyebrow">
        Component tests
      </p>
      <h1>
        Interactive developer documentation for every UI Base package.
      </h1>
      <p>
        Use this route as a human-friendly test gallery and as the future foundation for smoke tests. It documents package purpose, component options, runtime attributes, event payloads, fixture markup, and focused demo routes.
      </p>
    </section>
    <section class="component-tests-summary-grid" aria-label="Component test summary">
      <article class="card summary-stat-card">
        <div class="card-content">
          <span>
            ${PACKAGE_DOCS.length}
          </span>
          <p>
            packages covered
          </p>
        </div>
      </article>
      <article class="card summary-stat-card">
        <div class="card-content">
          <span>
            ${ALL_COMPONENTS.length}
          </span>
          <p>
            components documented
          </p>
        </div>
      </article>
      <article class="card summary-stat-card">
        <div class="card-content">
          <span>
            ${registeredCount}
          </span>
          <p>
            registered in this runtime
          </p>
        </div>
      </article>
    </section>
    ${renderSmokeStrategy()}
    ${renderPackageNav()}
    <section class="card component-events-card" data-test-id="component-tests-event-log">
      <div class="card-content">
        <div class="package-doc-header">
          <div>
            <p class="eyebrow">
              Event harness
            </p>
            <h2>
              Latest fixture event
            </h2>
            <p id="componentTestsStatus" class="muted">
              Interact with live fixtures to see the latest event payload.
            </p>
          </div>
        </div>
        <pre id="componentTestsEventLog" class="code-block">
          ${escapeHtml(json({}))}
        </pre>
      </div>
    </section>
    ${PACKAGE_DOCS.map(renderPackageSection).join('')}
  `;

  bindComponentTests(main);
}
