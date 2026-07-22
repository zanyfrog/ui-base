import {
  appendEventLog,
  checkboxField,
  escapeAttr,
  escapeHtml,
  field,
  json,
  selectField,
  serializeElement,
  setBooleanAttribute,
  setOrRemoveAttribute,
  textareaField
} from './demo-utils.js';
import { updateDemoData } from '../data/demo-store.js';

const FALLBACK_CATALOG_DATA = {
  defaultDetails: [],
  detailAssetMap: {},
  controls: {
    headingEyebrow: 'Reusable primitive',
    headingHeadline: 'Component options update live',
    headingSubheadline: 'Change labels, alignment, sizing, and body copy from parent controls.',
    headingBody: 'The parent owns the state and the Web Component renders from attributes/properties.',
    headingSize: 'compact',
    headingAlign: 'start',
    actionLabel: 'Open workflow',
    secondaryActionLabel: 'Learn more',
    actionVariant: 'primary',
    actionHref: '',
    actionToken: 'OPEN_WORKFLOW',
    actionDisabled: false,
    actionAlign: 'start',
    actionStacked: false,
    mediaSrc: '/apps/demo/assets/icons/availability.svg',
    mediaAlt: 'Availability icon',
    mediaFit: 'contain',
    mediaRatio: '16:9',
    mediaFallback: 'No media',
    fieldLabel: 'Example label',
    fieldHelp: 'Change this helper text from the parent page.',
    fieldHelpMode: 'tooltip',
    fieldAccessibleText: 'Additional screen reader text',
    fieldPlaceholder: 'Type a sample value',
    fieldValue: 'Editable value',
    fieldDisabled: false,
    fieldRequired: false,
    menuBreakpoint: '700'
  }
};

let catalogData = FALLBACK_CATALOG_DATA;

function controlValue(key) {
  return catalogData.controls?.[key] ?? FALLBACK_CATALOG_DATA.controls[key] ?? '';
}

function controlChecked(key) {
  return Boolean(catalogData.controls?.[key] ?? FALLBACK_CATALOG_DATA.controls[key]);
}

function routeHelp() {
  return `
    <section class="card catalog-section">
      <div class="card-content">
        <h2>
          What this route tests
        </h2>
        <p class="muted">
          Use the controls to change labels, text, display options, disabled state, required state, action behavior, media rendering, and detail rows. Interact with the rendered components to verify callbacks and event payloads.
        </p>
      </div>
    </section>
  `;
}

function currentActionJson(main) {
  const label = main.querySelector('#actionLabel')?.value || 'Open workflow';
  const secondaryLabel = main.querySelector('#secondaryActionLabel')?.value || 'Learn more';
  return [
    {
      label,
      variant: main.querySelector('#actionVariant')?.value || 'primary',
      href: main.querySelector('#actionHref')?.value || '',
      actionToken: main.querySelector('#actionToken')?.value || '',
      disabled: Boolean(main.querySelector('#actionDisabled')?.checked)
    },
    {
      label: secondaryLabel,
      variant: 'secondary',
      href: '#secondary',
      actionToken: 'SECONDARY_ACTION'
    }
  ];
}

function applyCatalogOptions(main) {
  const heading = main.querySelector('#catalogHeadingBlock');
  const eyebrow = main.querySelector('#catalogEyebrow');
  const actionGroup = main.querySelector('#catalogActionGroup');
  const media = main.querySelector('#catalogMedia');
  const detailList = main.querySelector('#catalogDetailList');
  const detailEditor = main.querySelector('#catalogDetailEditor');
  const label = main.querySelector('#catalogLabel');
  const nativeInput = main.querySelector('#nativeComponentValue');
  const menu = main.querySelector('#catalogMenu');
  const markup = main.querySelector('#catalogMarkup');

  setOrRemoveAttribute(heading, 'eyebrow', main.querySelector('#headingEyebrow')?.value);
  setOrRemoveAttribute(heading, 'headline', main.querySelector('#headingHeadline')?.value);
  setOrRemoveAttribute(heading, 'subheadline', main.querySelector('#headingSubheadline')?.value);
  setOrRemoveAttribute(heading, 'body', main.querySelector('#headingBody')?.value);
  setOrRemoveAttribute(heading, 'size', main.querySelector('#headingSize')?.value);
  setOrRemoveAttribute(heading, 'align', main.querySelector('#headingAlign')?.value);

  setOrRemoveAttribute(eyebrow, 'text', main.querySelector('#headingEyebrow')?.value);

  actionGroup.actions = currentActionJson(main);
  setOrRemoveAttribute(actionGroup, 'align', main.querySelector('#actionAlign')?.value);
  setBooleanAttribute(actionGroup, 'stacked', main.querySelector('#actionStacked')?.checked);

  setOrRemoveAttribute(media, 'src', main.querySelector('#mediaSrc')?.value);
  setOrRemoveAttribute(media, 'alt', main.querySelector('#mediaAlt')?.value);
  setOrRemoveAttribute(media, 'fit', main.querySelector('#mediaFit')?.value);
  setOrRemoveAttribute(media, 'ratio', main.querySelector('#mediaRatio')?.value);
  setOrRemoveAttribute(media, 'fallback-label', main.querySelector('#mediaFallback')?.value);

  let parsedDetails = catalogData.defaultDetails || [];
  try {
    parsedDetails = JSON.parse(main.querySelector('#detailsJson')?.value || '[]');
    if (!Array.isArray(parsedDetails)) throw new Error('Details must be an array.');
    detailList.details = parsedDetails;
    detailEditor.details = parsedDetails;
    detailList.assetMap = catalogData.detailAssetMap || {};
    detailEditor.setAttribute('asset-map', JSON.stringify(catalogData.detailAssetMap || {}));
  } catch (error) {
    const status = main.querySelector('#catalogStatus');
    if (status) status.textContent = `Details JSON is invalid: ${error.message}`;
  }

  setOrRemoveAttribute(label, 'text', main.querySelector('#fieldLabel')?.value);
  setOrRemoveAttribute(label, 'help', main.querySelector('#fieldHelp')?.value);
  setOrRemoveAttribute(label, 'help-mode', main.querySelector('#fieldHelpMode')?.value);
  setOrRemoveAttribute(label, 'accessible-text', main.querySelector('#fieldAccessibleText')?.value);
  if (nativeInput) {
    nativeInput.placeholder = main.querySelector('#fieldPlaceholder')?.value || '';
    nativeInput.value = main.querySelector('#fieldValue')?.value || '';
    nativeInput.disabled = Boolean(main.querySelector('#fieldDisabled')?.checked);
    nativeInput.required = Boolean(main.querySelector('#fieldRequired')?.checked);
  }

  setOrRemoveAttribute(menu, 'breakpoint', main.querySelector('#menuBreakpoint')?.value);

  if (markup) {
    markup.textContent = [
      serializeElement(heading),
      serializeElement(actionGroup),
      serializeElement(media),
      serializeElement(detailList)
    ].join('\n\n');
  }

  const status = main.querySelector('#catalogStatus');
  if (status) status.textContent = 'Component options applied. Interact with the preview to see callback events.';
}

function saveCatalogOptions(main) {
  updateDemoData((data) => {
    const componentData = data.components.componentCatalog;
    componentData.controls = {
      headingEyebrow: main.querySelector('#headingEyebrow')?.value || '',
      headingHeadline: main.querySelector('#headingHeadline')?.value || '',
      headingSubheadline: main.querySelector('#headingSubheadline')?.value || '',
      headingBody: main.querySelector('#headingBody')?.value || '',
      headingSize: main.querySelector('#headingSize')?.value || '',
      headingAlign: main.querySelector('#headingAlign')?.value || '',
      actionLabel: main.querySelector('#actionLabel')?.value || '',
      secondaryActionLabel: main.querySelector('#secondaryActionLabel')?.value || '',
      actionVariant: main.querySelector('#actionVariant')?.value || '',
      actionHref: main.querySelector('#actionHref')?.value || '',
      actionToken: main.querySelector('#actionToken')?.value || '',
      actionDisabled: Boolean(main.querySelector('#actionDisabled')?.checked),
      actionAlign: main.querySelector('#actionAlign')?.value || '',
      actionStacked: Boolean(main.querySelector('#actionStacked')?.checked),
      mediaSrc: main.querySelector('#mediaSrc')?.value || '',
      mediaAlt: main.querySelector('#mediaAlt')?.value || '',
      mediaFit: main.querySelector('#mediaFit')?.value || '',
      mediaRatio: main.querySelector('#mediaRatio')?.value || '',
      mediaFallback: main.querySelector('#mediaFallback')?.value || '',
      fieldLabel: main.querySelector('#fieldLabel')?.value || '',
      fieldHelp: main.querySelector('#fieldHelp')?.value || '',
      fieldHelpMode: main.querySelector('#fieldHelpMode')?.value || '',
      fieldAccessibleText: main.querySelector('#fieldAccessibleText')?.value || '',
      fieldPlaceholder: main.querySelector('#fieldPlaceholder')?.value || '',
      fieldValue: main.querySelector('#fieldValue')?.value || '',
      fieldDisabled: Boolean(main.querySelector('#fieldDisabled')?.checked),
      fieldRequired: Boolean(main.querySelector('#fieldRequired')?.checked),
      menuBreakpoint: main.querySelector('#menuBreakpoint')?.value || ''
    };
    try {
      const details = JSON.parse(main.querySelector('#detailsJson')?.value || '[]');
      if (Array.isArray(details)) componentData.defaultDetails = details;
    } catch {
      // Invalid editor JSON is shown in the page and is not persisted.
    }
  });
}

function bindCatalog(main) {
  const eventBox = main.querySelector('#catalogEventLog');
  const status = main.querySelector('#catalogStatus');

  [
    'headingEyebrow', 'headingHeadline', 'headingSubheadline', 'headingBody', 'headingSize', 'headingAlign',
    'actionLabel', 'secondaryActionLabel', 'actionVariant', 'actionHref', 'actionToken', 'actionDisabled', 'actionAlign', 'actionStacked',
    'mediaSrc', 'mediaAlt', 'mediaFit', 'mediaRatio', 'mediaFallback',
    'detailsJson',
    'fieldLabel', 'fieldHelp', 'fieldHelpMode', 'fieldAccessibleText', 'fieldPlaceholder', 'fieldValue', 'fieldDisabled', 'fieldRequired',
    'menuBreakpoint'
  ].forEach((id) => {
    const input = main.querySelector(`#${id}`);
    const eventName = input?.type === 'checkbox' || input?.tagName === 'SELECT' ? 'change' : 'input';
    input?.addEventListener(eventName, () => {
      applyCatalogOptions(main);
      saveCatalogOptions(main);
    });
  });

  main.querySelector('[data-open-dialog]')?.addEventListener('click', () => {
    main.querySelector('#catalogDialog')?.show();
    status.textContent = 'Dialog opened from parent page.';
  });

  main.querySelector('[data-reset-catalog]')?.addEventListener('click', () => {
    const controls = FALLBACK_CATALOG_DATA.controls;
    main.querySelector('#headingEyebrow').value = controls.headingEyebrow;
    main.querySelector('#headingHeadline').value = controls.headingHeadline;
    main.querySelector('#headingSubheadline').value = controls.headingSubheadline;
    main.querySelector('#headingBody').value = controls.headingBody;
    main.querySelector('#headingSize').value = controls.headingSize;
    main.querySelector('#headingAlign').value = controls.headingAlign;
    main.querySelector('#actionLabel').value = controls.actionLabel;
    main.querySelector('#secondaryActionLabel').value = controls.secondaryActionLabel;
    main.querySelector('#actionVariant').value = controls.actionVariant;
    main.querySelector('#actionHref').value = controls.actionHref;
    main.querySelector('#actionToken').value = controls.actionToken;
    main.querySelector('#actionDisabled').checked = controls.actionDisabled;
    main.querySelector('#actionAlign').value = controls.actionAlign;
    main.querySelector('#actionStacked').checked = controls.actionStacked;
    main.querySelector('#mediaSrc').value = controls.mediaSrc;
    main.querySelector('#mediaAlt').value = controls.mediaAlt;
    main.querySelector('#mediaFit').value = controls.mediaFit;
    main.querySelector('#mediaRatio').value = controls.mediaRatio;
    main.querySelector('#mediaFallback').value = controls.mediaFallback;
    main.querySelector('#detailsJson').value = json(catalogData.defaultDetails || []);
    main.querySelector('#fieldLabel').value = controls.fieldLabel;
    main.querySelector('#fieldHelp').value = controls.fieldHelp;
    main.querySelector('#fieldHelpMode').value = controls.fieldHelpMode;
    main.querySelector('#fieldAccessibleText').value = controls.fieldAccessibleText;
    main.querySelector('#fieldPlaceholder').value = controls.fieldPlaceholder;
    main.querySelector('#fieldValue').value = controls.fieldValue;
    main.querySelector('#fieldDisabled').checked = controls.fieldDisabled;
    main.querySelector('#fieldRequired').checked = controls.fieldRequired;
    main.querySelector('#menuBreakpoint').value = controls.menuBreakpoint;
    applyCatalogOptions(main);
    saveCatalogOptions(main);
  });

  main.addEventListener('uib-menu-select', (event) => appendEventLog(eventBox, 'uib-menu-select', event.detail));
  main.addEventListener('uib-menuitem-select', (event) => appendEventLog(eventBox, 'uib-menuitem-select', event.detail));
  main.addEventListener('uib-action-button-click', (event) => {
    event.preventDefault();
    appendEventLog(eventBox, 'uib-action-button-click', event.detail);
    status.textContent = `Action callback received: ${event.detail.label}. The parent prevented navigation/action by calling preventDefault().`;
  });
  main.addEventListener('uib-action', (event) => appendEventLog(eventBox, 'uib-action', event.detail));
  main.addEventListener('uib-forms-form-submit', (event) => appendEventLog(eventBox, 'uib-forms-form-submit', event.detail));
  main.addEventListener('uib-detail-add', (event) => appendEventLog(eventBox, 'uib-detail-add', event.detail));
  main.addEventListener('uib-detail-update', (event) => appendEventLog(eventBox, 'uib-detail-update', event.detail));
  main.addEventListener('uib-detail-remove', (event) => appendEventLog(eventBox, 'uib-detail-remove', event.detail));
  main.addEventListener('uib-detail-list-editor-change', (event) => {
    main.querySelector('#detailsJson').value = json(event.detail.details || []);
    main.querySelector('#catalogDetailList').details = event.detail.details || [];
    saveCatalogOptions(main);
    appendEventLog(eventBox, 'uib-detail-list-editor-change', event.detail);
  });
  main.addEventListener('change', (event) => {
    if (!event.target.matches?.('uib-toggle, uib-checkbox, uib-forms-textbox, uib-forms-number, uib-forms-date, uib-forms-email, uib-forms-password, uib-forms-phone, uib-forms-textarea, uib-forms-select')) return;
    appendEventLog(eventBox, 'change', event.detail, { tag: event.target.localName });
  });

  applyCatalogOptions(main);
}

function usageBlock() {
  return `
    <section class="catalog-section card">
      <div class="card-content">
        <h2>
          Usage pattern
        </h2>
        <p class="muted">
          Import the package once, set component attributes/properties from parent state, and listen for bubbling events.
        </p>
        <pre class="code-block">
          <code>
            ${escapeHtml(`<script type="module">
  import '@ui-base/ui';
  import '@ui-base/forms';

  const heading = document.querySelector('uib-heading-block');
  heading.setAttribute('headline', 'Updated by parent state');

  document.addEventListener('uib-action-button-click', (event) => {
    event.preventDefault();
    console.log(event.detail.actionToken, event.detail.label);
  });
</script>

<uib-heading-block eyebrow="Section" headline="Reusable heading"></uib-heading-block>
<uib-action-group actions='[{"label":"Save","actionToken":"SAVE","variant":"primary"}]'></uib-action-group>`)}
          </code>
        </pre>
      </div>
    </section>
  `;
}

export function renderComponentCatalogRoute(main, data = FALLBACK_CATALOG_DATA) {
  catalogData = data;
  main.innerHTML = `
    <section class="page-heading">
      <p class="eyebrow">
        Live component catalog
      </p>
      <h1>
        Component playground with parent controls and event callbacks.
      </h1>
      <p>
        This route shows reusable UI, form, icon, layout, media, action, and detail components. A user can change labels, text, display options, disabled states, and callback behavior without editing source code.
      </p>
    </section>
    ${routeHelp()}
    <section class="demo-layout component-playground-layout">
      <aside class="card controls">
        <div class="card-content">
          <div class="controls-header">
            <h2>
              Component option controls
            </h2>
            <button class="secondary-button compact-control-button" type="button" data-reset-catalog>
              Reset
            </button>
          </div>
          <div class="form-grid">
            <fieldset class="control-section">
              <legend>
                Heading / eyebrow
              </legend>
              ${field('headingEyebrow', 'Eyebrow text', controlValue('headingEyebrow'))}
              ${field('headingHeadline', 'Headline/title', controlValue('headingHeadline'))}
              ${textareaField('headingSubheadline', 'Subheadline/subtitle', controlValue('headingSubheadline'))}
              ${textareaField('headingBody', 'Body copy', controlValue('headingBody'))}
              ${selectField('headingSize', 'Size', ['compact', 'default', 'large'], controlValue('headingSize'))}
              ${selectField('headingAlign', 'Alignment', ['start', 'center'], controlValue('headingAlign'))}
            </fieldset>
            <fieldset class="control-section">
              <legend>
                Action group
              </legend>
              ${field('actionLabel', 'Primary action label', controlValue('actionLabel'))}
              ${field('secondaryActionLabel', 'Secondary action label', controlValue('secondaryActionLabel'))}
              ${selectField('actionVariant', 'Primary variant', ['primary', 'secondary', 'tertiary', 'destructive'], controlValue('actionVariant'))}
              ${field('actionHref', 'Primary href', controlValue('actionHref'))}
              ${field('actionToken', 'Primary action token', controlValue('actionToken'))}
              ${checkboxField('actionDisabled', 'Disable primary action', controlChecked('actionDisabled'))}
              ${selectField('actionAlign', 'Alignment', ['start', 'center', 'end'], controlValue('actionAlign'))}
              ${checkboxField('actionStacked', 'Stack actions vertically', controlChecked('actionStacked'))}
            </fieldset>
            <fieldset class="control-section">
              <legend>
                Media
              </legend>
              ${field('mediaSrc', 'Image / SVG URL', controlValue('mediaSrc'))}
              ${field('mediaAlt', 'Alt text', controlValue('mediaAlt'))}
              ${selectField('mediaFit', 'Object fit', ['cover', 'contain', 'fill', 'none'], controlValue('mediaFit'))}
              ${selectField('mediaRatio', 'Aspect ratio', ['1:1', '4:3', '16:9', '21:9'], controlValue('mediaRatio'))}
              ${field('mediaFallback', 'Fallback label', controlValue('mediaFallback'))}
            </fieldset>
            <fieldset class="control-section">
              <legend>
                Label / form field
              </legend>
              ${field('fieldLabel', 'Label text', controlValue('fieldLabel'))}
              ${field('fieldHelp', 'Help text', controlValue('fieldHelp'))}
              ${selectField('fieldHelpMode', 'Help mode', ['tooltip', 'inline'], controlValue('fieldHelpMode'))}
              ${field('fieldAccessibleText', 'Accessible text', controlValue('fieldAccessibleText'))}
              ${field('fieldPlaceholder', 'Native input placeholder', controlValue('fieldPlaceholder'))}
              ${field('fieldValue', 'Native input value', controlValue('fieldValue'))}
              ${checkboxField('fieldDisabled', 'Disable native input', controlChecked('fieldDisabled'))}
              ${checkboxField('fieldRequired', 'Require native input', controlChecked('fieldRequired'))}
            </fieldset>
            <fieldset class="control-section">
              <legend>
                Details
              </legend>
              ${textareaField('detailsJson', 'Detail rows JSON', json(catalogData.defaultDetails || []), 'spellcheck="false"')}
            </fieldset>
            <fieldset class="control-section">
              <legend>
                Menu
              </legend>
              ${field('menuBreakpoint', 'Responsive breakpoint', controlValue('menuBreakpoint'), 'number')}
            </fieldset>
          </div>
          <div id="catalogStatus" class="status-box">
            Change a control to update the components.
          </div>
          <details class="control-section" open>
            <summary>
              <strong>
                Generated markup
              </strong>
            </summary>
            <pre id="catalogMarkup" class="code-block">
            </pre>
          </details>
        </div>
      </aside>
      <section class="component-playground-stage">
        <section class="catalog-section card">
          <div class="card-content stack-block">
            <h2>
              Heading, eyebrow, actions, and media
            </h2>
            <uib-eyebrow id="catalogEyebrow" text="Reusable primitive">
            </uib-eyebrow>
            <uib-heading-block id="catalogHeadingBlock">
            </uib-heading-block>
            <uib-action-group id="catalogActionGroup">
            </uib-action-group>
            <uib-media id="catalogMedia">
            </uib-media>
          </div>
        </section>
        <section class="catalog-section card">
          <div class="card-content stack-block">
            <h2>
              Detail list and detail editor
            </h2>
            <p class="muted">
              Edit rows below to test add, update, move, remove, direct icon URL, text icon fallback, and clean event payloads.
            </p>
            <uib-detail-list id="catalogDetailList">
            </uib-detail-list>
            <uib-detail-list-editor id="catalogDetailEditor" label="Editable details" application-key="demo-app" api-base-url="http://localhost:4020" use-asset-picker>
            </uib-detail-list-editor>
          </div>
        </section>
        <section class="catalog-section card">
          <div class="card-content stack-block">
            <h2>
              Label, help, icons, and responsive menu
            </h2>
            <div class="native-field-row">
              <uib-label id="catalogLabel" for="nativeComponentValue">
              </uib-label>
              <input id="nativeComponentValue" class="native-input" type="text" />
            </div>
            <div class="help-examples">
              <span>
                Tooltip help
                <uib-help text="Tooltip help appears on hover or keyboard focus.">
                </uib-help>
              </span>
              <uib-help mode="inline" text="Inline help can be used when guidance should always be visible.">
              </uib-help>
            </div>
            <div class="icon-demo-row" aria-label="Icon examples">
              <span>
                <uib-icon name="help" label="Help">
                </uib-icon>
                help
              </span>
              <span>
                <uib-icon name="calendar" label="Calendar">
                </uib-icon>
                calendar
              </span>
              <span>
                <uib-icon name="warning" label="Warning">
                </uib-icon>
                warning
              </span>
              <span>
                <uib-icon src="/apps/demo/assets/icons/accessibility.svg" label="Accessibility">
                </uib-icon>
                URL icon
              </span>
            </div>
            <uib-menu id="catalogMenu" label="Catalog navigation" breakpoint="700">
              <uib-menuitem href="/components/" active>
                Overview
              </uib-menuitem>
              <uib-menuitem label="Examples">
                <uib-menuitem href="/hero/sample-site">
                  Hero sample
                </uib-menuitem>
                <uib-menuitem href="/calendar-demo/">
                  Calendar
                </uib-menuitem>
              </uib-menuitem>
              <uib-menuitem href="/assets-demo/picker">
                Asset picker
              </uib-menuitem>
            </uib-menu>
          </div>
        </section>
        <section class="catalog-section card">
          <div class="card-content stack-block">
            <h2>
              Form controls and validation events
            </h2>
            <p class="muted">
              Submit the form or change fields to see
              <code>
                change
              </code>
              and
              <code>
                uib-forms-form-submit
              </code>
              payloads.
            </p>
            <uib-forms-form name="exampleRequest" label="Example request" submit-label="Submit request">
              <uib-forms-input-group>
                <uib-forms-textbox name="visitorName" label="Name" required minlength="2" help="Required sample field.">
                </uib-forms-textbox>
                <uib-forms-email name="email" label="Email" placeholder="person@example.local">
                </uib-forms-email>
              </uib-forms-input-group>
              <uib-forms-input-group>
                <uib-forms-number name="groupSize" label="Group size" min="1" max="30" value="4">
                </uib-forms-number>
                <uib-forms-date name="requestedDate" label="Requested date">
                </uib-forms-date>
                <uib-forms-phone name="phone" label="Phone">
                </uib-forms-phone>
              </uib-forms-input-group>
              <uib-forms-select name="location" label="Location" options="Site A,Site B,Remote">
              </uib-forms-select>
              <uib-forms-textarea name="notes" label="Notes" help="Textarea uses the same validation and event model.">
              </uib-forms-textarea>
            </uib-forms-form>
          </div>
        </section>
        <section class="catalog-section card">
          <div class="card-content stack-block">
            <h2>
              Layout and overlay components
            </h2>
            <uib-grid min="12rem">
              <uib-card label="Card">
                <p>
                  Card body content.
                </p>
                <span slot="footer">
                  Footer slot.
                </span>
              </uib-card>
              <uib-panel label="Panel">
                <p>
                  Panel body content.
                </p>
                <span slot="footer">
                  Footer slot.
                </span>
              </uib-panel>
              <uib-accordion label="Accordion">
                <p>
                  Accordion content.
                </p>
              </uib-accordion>
            </uib-grid>
            <uib-stack class="catalog-stack" gap="1rem">
              <uib-row wrap>
                <button class="primary-button" type="button" data-open-dialog>
                  Open dialog
                </button>
                <uib-tabs label="Preview tab">
                  <p>
                    Experimental tab content.
                  </p>
                </uib-tabs>
              </uib-row>
              <uib-splitter>
                <div slot="start">
                  Start pane
                </div>
                <div slot="end">
                  End pane
                </div>
              </uib-splitter>
            </uib-stack>
            <uib-dialog id="catalogDialog" label="Dialog">
              <p>
                This dialog demonstrates the base overlay API. The parent opened it with
                <code>
                  show()
                </code>
                .
              </p>
              <span slot="footer">
                Footer slot
              </span>
            </uib-dialog>
          </div>
        </section>
        <section class="catalog-section card">
          <div class="card-content">
            <h2>
              Event callback log
            </h2>
            <p class="muted">
              Interact with actions, menus, forms, and the detail editor to see the latest event payload.
            </p>
            <pre id="catalogEventLog" class="code-block">
              {}
            </pre>
          </div>
        </section>
      </section>
    </section>
    ${usageBlock()}
  `;
  bindCatalog(main);
}
