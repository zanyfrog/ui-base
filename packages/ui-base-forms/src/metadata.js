import { createComponentMetadata, MATURITY_LEVELS } from '@ui-base/core';

const sharedFieldAttributes = [
  { name: 'name', type: 'string', description: 'Form field name used in form serialization and event detail payloads.' },
  { name: 'label', type: 'string', description: 'Visible label text. A named label slot can override the rendered label content.' },
  { name: 'help', type: 'string', description: 'Optional helper text rendered below the control.' },
  { name: 'required', type: 'boolean', description: 'Marks the control as required during validation.' },
  { name: 'disabled', type: 'boolean', description: 'Disables the control and removes it from normal interaction.' },
  { name: 'readonly', type: 'boolean', description: 'Prevents user edits while keeping the value visible and form-associated.' },
  { name: 'invalid', type: 'boolean', description: 'Forces invalid visual styling on the control.' },
  { name: 'error', type: 'string', description: 'Custom validation message shown when the control is invalid.' },
  { name: 'value', type: 'string', description: 'Current string value reflected into the inner form control.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text shown when the control value is empty.' },
  { name: 'minlength', type: 'number', description: 'Minimum number of characters required for text validation.' },
  { name: 'maxlength', type: 'number', description: 'Maximum number of characters allowed for text validation.' },
  { name: 'pattern', type: 'string', description: 'Regular expression pattern the value must match.' },
  { name: 'autocomplete', type: 'string', description: 'Browser autocomplete hint passed to the native control.' }
];

const sharedFieldProperties = [
  { name: 'value', type: 'string', description: 'Gets or sets the current value and updates the associated form value.' },
  { name: 'name', type: 'string', description: 'Reflects the name attribute.' },
  { name: 'label', type: 'string', description: 'Reflects the label attribute.' },
  { name: 'disabled', type: 'boolean', description: 'Reflects the disabled state.' },
  { name: 'readonly', type: 'boolean', description: 'Reflects the readonly state.' },
  { name: 'required', type: 'boolean', description: 'Reflects the required state.' },
  { name: 'invalid', type: 'boolean', description: 'Reflects the invalid state.' }
];

const commonControlEvents = [
  { name: 'input', description: 'Bubbling event fired as the current value changes.' },
  { name: 'change', description: 'Bubbling event fired when the committed value changes.' },
  { name: 'focus', description: 'Bubbling host-level focus notification from the internal control.' },
  { name: 'blur', description: 'Bubbling host-level blur notification from the internal control.' },
  { name: 'focusin', description: 'Bubbling host-level focusin notification from the internal control.' },
  { name: 'focusout', description: 'Bubbling host-level focusout notification from the internal control.' },
  { name: 'keydown', description: 'KeyboardEvent re-dispatched from the host when the internal control receives keydown.' },
  { name: 'keyup', description: 'KeyboardEvent re-dispatched from the host when the internal control receives keyup.' },
  { name: 'invalid', description: 'Bubbling event fired when native or component validation fails.' }
];

const sharedFieldEvents = (tagName) => [
  ...commonControlEvents,
  { name: `${tagName}-change`, description: 'Custom event fired when the committed value changes. Detail includes name, oldValue, and newValue.' }
];

const sharedFieldSlots = [
  { name: 'label', description: 'Optional custom label content.' }
];

const sharedFieldParts = [
  { name: 'field', description: 'Outer field wrapper.' },
  { name: 'label', description: 'Label element.' },
  { name: 'required', description: 'Required marker.' },
  { name: 'control', description: 'Native input, textarea, or select control.' },
  { name: 'control-invalid', description: 'Applied to the control when invalid.' },
  { name: 'control-disabled', description: 'Applied to the control when disabled or readonly.' },
  { name: 'help', description: 'Helper text.' },
  { name: 'error', description: 'Validation error text.' }
];

const sharedFieldCssVariables = [
  { name: '--uib-forms-field-gap', description: 'Gap between label, control, help, and error text.' },
  { name: '--uib-size-control-height-md', description: 'Minimum control height.' },
  { name: '--uib-forms-control-padding', description: 'Padding applied to native controls.' },
  { name: '--uib-color-border-strong', description: 'Default control border color.' },
  { name: '--uib-color-primary', description: 'Focus and primary accent color.' },
  { name: '--uib-focus-ring', description: 'Focus ring shadow used on keyboard focus.' }
];

function fieldApi(tagName, overrides = {}) {
  return {
    tagName,
    package: '@ui-base/forms',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    attributes: sharedFieldAttributes,
    properties: sharedFieldProperties,
    events: sharedFieldEvents(tagName),
    slots: sharedFieldSlots,
    cssParts: sharedFieldParts,
    cssVariables: sharedFieldCssVariables,
    examples: [`<${tagName} name="fieldName" label="Field label"></${tagName}>`],
    ...overrides
  };
}

export const FORM_COMPONENT_API = {
  'uib-forms-form': {
    tagName: 'uib-forms-form',
    package: '@ui-base/forms',
    maturity: MATURITY_LEVELS.PREVIEW,
    attributes: [
      { name: 'name', type: 'string', description: 'Form name included in submit event detail.' },
      { name: 'label', type: 'string', description: 'Accessible label for the internal form element.' },
      { name: 'submit-label', type: 'string', description: 'Text for the default submit button.' },
      { name: 'novalidate', type: 'boolean', description: 'Skips child component validation before submit event emission.' },
      { name: 'disabled', type: 'boolean', description: 'Common disabled state for styling and host-level integration.' }
    ],
    properties: [
      { name: 'name', type: 'string', description: 'Reflects the name attribute.' },
      { name: 'label', type: 'string', description: 'Reflects the label attribute.' }
    ],
    events: [
      { name: 'uib-forms-form-submit', description: 'Custom submit event. Detail includes name, values, oldValue, newValue, and valid.' }
    ],
    slots: [
      { name: 'default', description: 'Form controls or other form content.' },
      { name: 'actions', description: 'Optional custom action area replacing the default submit button.' }
    ],
    cssParts: [
      { name: 'form', description: 'Internal form element.' },
      { name: 'actions', description: 'Action row wrapper.' },
      { name: 'submit', description: 'Default submit button.' }
    ],
    cssVariables: [
      { name: '--uib-forms-form-gap', description: 'Gap between form children.' },
      { name: '--uib-forms-button-padding', description: 'Padding for the default submit button.' },
      { name: '--uib-color-primary', description: 'Default submit button background and border color.' }
    ],
    examples: ['<uib-forms-form name="contact" submit-label="Send"><uib-forms-textbox name="fullName" label="Full name" required></uib-forms-textbox></uib-forms-form>']
  },
  'uib-forms-textbox': fieldApi('uib-forms-textbox', {
    examples: ['<uib-forms-textbox name="visitorName" label="Name" placeholder="Enter a name"></uib-forms-textbox>']
  }),
  'uib-forms-number': fieldApi('uib-forms-number', {
    attributes: [
      ...sharedFieldAttributes.filter((item) => !['minlength', 'maxlength', 'pattern'].includes(item.name)),
      { name: 'min', type: 'number', description: 'Minimum numeric value.' },
      { name: 'max', type: 'number', description: 'Maximum numeric value.' },
      { name: 'step', type: 'number', description: 'Allowed numeric increment for the native number input.' }
    ],
    examples: ['<uib-forms-number name="groupSize" label="Group size" min="1" max="30" step="1"></uib-forms-number>']
  }),
  'uib-forms-date': fieldApi('uib-forms-date', {
    attributes: [
      ...sharedFieldAttributes.filter((item) => !['minlength', 'maxlength', 'pattern', 'placeholder'].includes(item.name)),
      { name: 'min', type: 'date', description: 'Earliest selectable date in YYYY-MM-DD format.' },
      { name: 'max', type: 'date', description: 'Latest selectable date in YYYY-MM-DD format.' },
      { name: 'step', type: 'number', description: 'Allowed day increment for the native date input.' }
    ],
    examples: ['<uib-forms-date name="visitDate" label="Visit date" min="2026-01-01"></uib-forms-date>']
  }),
  'uib-forms-email': fieldApi('uib-forms-email', {
    attributes: sharedFieldAttributes.filter((item) => item.name !== 'pattern'),
    examples: ['<uib-forms-email name="email" label="Email" autocomplete="email"></uib-forms-email>']
  }),
  'uib-forms-password': fieldApi('uib-forms-password', {
    attributes: sharedFieldAttributes.filter((item) => !['pattern'].includes(item.name)),
    cssParts: [
      ...sharedFieldParts,
      { name: 'control-wrap', description: 'Password input and visibility toggle wrapper.' },
      { name: 'toggle', description: 'Show or hide password button.' }
    ],
    cssVariables: [
      ...sharedFieldCssVariables,
      { name: '--uib-forms-password-control-padding-end', description: 'Inline-end input padding reserved for the visibility toggle.' }
    ],
    examples: ['<uib-forms-password name="accessCode" label="Access code" autocomplete="current-password"></uib-forms-password>']
  }),
  'uib-forms-phone': fieldApi('uib-forms-phone', {
    attributes: sharedFieldAttributes.filter((item) => !['minlength', 'maxlength', 'pattern'].includes(item.name)),
    examples: ['<uib-forms-phone name="phone" label="Phone" autocomplete="tel"></uib-forms-phone>']
  }),
  'uib-forms-textarea': fieldApi('uib-forms-textarea', {
    attributes: sharedFieldAttributes.filter((item) => !['autocomplete'].includes(item.name)),
    examples: ['<uib-forms-textarea name="notes" label="Notes" placeholder="Add notes"></uib-forms-textarea>']
  }),
  'uib-forms-select': fieldApi('uib-forms-select', {
    attributes: sharedFieldAttributes.filter((item) => !['placeholder', 'minlength', 'maxlength', 'pattern', 'autocomplete'].includes(item.name)).concat([
      { name: 'options', type: 'string', description: 'Comma-separated option values rendered as native option elements.' }
    ]),
    slots: [
      { name: 'default', description: 'Optional native option elements. Used after generated comma-separated options.' },
      ...sharedFieldSlots
    ],
    examples: ['<uib-forms-select name="location" label="Location" options="Main Hall,Annex,Remote"></uib-forms-select>']
  }),
  'uib-forms-checkbox': {
    tagName: 'uib-forms-checkbox',
    package: '@ui-base/forms',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    attributes: [
      { name: 'name', type: 'string', description: 'Form field name used in form serialization and event detail payloads.' },
      { name: 'label', type: 'string', description: 'Visible label text. Default slot content can also provide label text.' },
      { name: 'help', type: 'string', description: 'Optional helper text rendered below the checkbox label.' },
      { name: 'checked', type: 'boolean', description: 'Boolean checked state.' },
      { name: 'value', type: 'string', description: 'Submitted value when checked. Defaults to "on".' },
      { name: 'required', type: 'boolean', description: 'Requires the checkbox to be checked during validation.' },
      { name: 'disabled', type: 'boolean', description: 'Disables the checkbox.' },
      { name: 'readonly', type: 'boolean', description: 'Prevents edits by disabling the internal checkbox while keeping host state visible.' },
      { name: 'invalid', type: 'boolean', description: 'Forces invalid visual styling.' },
      { name: 'error', type: 'string', description: 'Custom validation message shown when invalid.' }
    ],
    properties: [
      { name: 'checked', type: 'boolean', description: 'Gets or sets the checked state.' },
      { name: 'value', type: 'string', description: 'Gets or sets the submitted value when checked.' },
      { name: 'name', type: 'string', description: 'Reflects the name attribute.' },
      { name: 'disabled', type: 'boolean', description: 'Reflects the disabled state.' },
      { name: 'readonly', type: 'boolean', description: 'Reflects the readonly state.' },
      { name: 'required', type: 'boolean', description: 'Reflects the required state.' },
      { name: 'invalid', type: 'boolean', description: 'Reflects the invalid state.' }
    ],
    events: [
      ...commonControlEvents,
      { name: 'uib-forms-checkbox-change', description: 'Custom event fired when checked state changes. Detail includes name, checked, oldValue, newValue, and value.' }
    ],
    slots: [
      { name: 'default', description: 'Optional custom label content.' }
    ],
    cssParts: [
      { name: 'field', description: 'Outer label wrapper.' },
      { name: 'input', description: 'Native checkbox input.' },
      { name: 'content', description: 'Label, help, and error content wrapper.' },
      { name: 'label', description: 'Visible label text.' },
      { name: 'required', description: 'Required marker.' },
      { name: 'help', description: 'Helper text.' },
      { name: 'error', description: 'Validation error text.' }
    ],
    cssVariables: [
      { name: '--uib-color-primary', description: 'Checkbox accent color.' },
      { name: '--uib-color-border-strong', description: 'Default checkbox border color.' },
      { name: '--uib-focus-ring', description: 'Focus ring shadow used on keyboard focus.' }
    ],
    examples: ['<uib-forms-checkbox name="confirmed" label="Confirmed" value="yes"></uib-forms-checkbox>']
  },
  'uib-forms-field': {
    tagName: 'uib-forms-field',
    package: '@ui-base/forms',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    attributes: [
      { name: 'label', type: 'string', description: 'Fallback label text when the label slot is not provided.' },
      { name: 'help', type: 'string', description: 'Optional helper text rendered after the slotted control.' }
    ],
    properties: [
      { name: 'label', type: 'string', description: 'Reflects the label attribute.' },
      { name: 'help', type: 'string', description: 'Reflects the help attribute.' }
    ],
    events: [],
    slots: [
      { name: 'default', description: 'Native or custom control to wrap.' },
      { name: 'label', description: 'Custom label content.' }
    ],
    cssParts: [
      { name: 'field', description: 'Outer field wrapper.' },
      { name: 'label', description: 'Label wrapper.' },
      { name: 'help', description: 'Helper text.' }
    ],
    cssVariables: [
      { name: '--uib-forms-field-gap', description: 'Gap between label, control, and helper text.' }
    ],
    examples: ['<uib-forms-field label="Wrapped field"><input value="Native input"></uib-forms-field>']
  },
  'uib-forms-input-group': {
    tagName: 'uib-forms-input-group',
    package: '@ui-base/forms',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    attributes: [],
    properties: [],
    events: [],
    slots: [
      { name: 'default', description: 'Related controls to lay out as a responsive group.' }
    ],
    cssParts: [
      { name: 'group', description: 'Flex group wrapper.' }
    ],
    cssVariables: [
      { name: '--uib-space-2', description: 'Gap between grouped controls.' },
      { name: '--uib-forms-input-group-item-width', description: 'Preferred flex-basis for each slotted control.' }
    ],
    examples: ['<uib-forms-input-group><uib-forms-textbox name="first" label="First"></uib-forms-textbox><uib-forms-textbox name="second" label="Second"></uib-forms-textbox></uib-forms-input-group>']
  },
  'uib-forms-wizard': {
    tagName: 'uib-forms-wizard',
    package: '@ui-base/forms',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    attributes: [
      { name: 'label', type: 'string', description: 'Wizard title text when the title slot is not provided.' }
    ],
    properties: [
      { name: 'label', type: 'string', description: 'Reflects the label attribute.' }
    ],
    events: [],
    slots: [
      { name: 'default', description: 'Wizard step content owned by the parent page.' },
      { name: 'title', description: 'Custom wizard title content.' }
    ],
    cssParts: [
      { name: 'wizard', description: 'Outer wizard shell.' },
      { name: 'title', description: 'Wizard title wrapper.' },
      { name: 'note', description: 'Experimental status note.' }
    ],
    cssVariables: [
      { name: '--uib-space-4', description: 'Gap and padding used by the wizard shell.' }
    ],
    examples: ['<uib-forms-wizard label="Reservation steps"><p>Step content</p></uib-forms-wizard>']
  }
};

export const UI_BASE_FORM_COMPONENTS = Object.values(FORM_COMPONENT_API)
  .map((api) => createComponentMetadata({
    ...api,
    attributes: api.attributes.map((item) => item.name),
    properties: api.properties.map((item) => item.name),
    events: api.events.map((item) => item.name),
    slots: api.slots.map((item) => item.name),
    cssParts: api.cssParts.map((item) => item.name),
    cssVariables: api.cssVariables.map((item) => item.name)
  }))
  .sort((a, b) => a.tagName.localeCompare(b.tagName));
