# MyTreasury `mt-input` Field Types

## Purpose

This document defines a recommended generic input component for MyTreasury UI forms.

The goal is to allow a form builder, admin screen, demo page, or application UI to render many different field types through one consistent component API:

```html
<mt-input
  name="heroBackground"
  label="Hero background image"
  instructions="Choose an existing image or upload a new one. Recommended ratio: 16:9."
  type="string"
  variant="asset-picker"
  value="asset:denver-mint-hero">
</mt-input>
```

The component should be framework-neutral and implemented as a Web Component.

---

## Core Recommendation

Use one generic component:

```html
<mt-input></mt-input>
```

Use two separate concepts:

| Property | Purpose | Example |
|---|---|---|
| `type` | The data behavior and stored value type | `string`, `number`, `boolean`, `date`, `array`, `object`, `file`, `reference` |
| `variant` | The UI rendering style | `text`, `textarea`, `select`, `asset-picker`, `lookup`, `rich-text` |

This keeps the data model stable while still allowing the UI to change.

Example:

```html
<mt-input
  name="summary"
  label="Summary"
  type="string"
  variant="textarea"
  value="Short description">
</mt-input>
```

The stored value is still a `string`, but the user interface is a multi-line textarea.

---

## Recommended Base API

### Common Properties

| Property | Type | Description |
|---|---:|---|
| `name` | `string` | Field name used in forms, events, and schema mapping. |
| `label` | `string` | User-facing field label. |
| `instructions` | `string` | Help text displayed near the field. |
| `placeholder` | `string` | Placeholder text for text-like controls. |
| `type` | `string` | Data type for the stored value. |
| `variant` | `string` | UI rendering style. |
| `value` | `any` | Current value. |
| `defaultValue` | `any` | Default value before user changes. |
| `required` | `boolean` | Whether a value is required. |
| `disabled` | `boolean` | Disables user interaction. |
| `readonly` | `boolean` | Displays value but prevents editing. |
| `hidden` | `boolean` | Hides the field from the user. |
| `autocomplete` | `string` | Browser autocomplete value where applicable. |
| `error` | `string` | Error text to display. |
| `warning` | `string` | Warning text to display. |
| `success` | `string` | Success text to display. |
| `description` | `string` | Longer descriptive text, if needed. |

### Validation Properties

| Property | Type | Description |
|---|---:|---|
| `min` | `number | string` | Minimum value for number/date-like fields. |
| `max` | `number | string` | Maximum value for number/date-like fields. |
| `step` | `number` | Numeric increment. |
| `minlength` | `number` | Minimum text length. |
| `maxlength` | `number` | Maximum text length. |
| `pattern` | `string` | Regular expression pattern for text validation. |
| `validationMessage` | `string` | Custom validation message. |
| `validateOn` | `string` | Example values: `input`, `change`, `blur`, `submit`. |

### Choice-Based Properties

| Property | Type | Description |
|---|---:|---|
| `options` | `array` | List of available options. |
| `optionLabel` | `string` | Property name used for option label. |
| `optionValue` | `string` | Property name used for option value. |
| `multiple` | `boolean` | Allows multiple selected values. |
| `allowCustomValue` | `boolean` | Allows user-entered values outside the option list. |

Example options:

```js
[
  { "label": "Background", "value": "background" },
  { "label": "Panel Right", "value": "panel_right" },
  { "label": "Panel Left", "value": "panel_left" }
]
```

### File and Asset Properties

| Property | Type | Description |
|---|---:|---|
| `accept` | `string` | File MIME filter, such as `image/*` or `.pdf`. |
| `multiple` | `boolean` | Allows multiple files or assets. |
| `maxFileSize` | `number` | Maximum file size in bytes. |
| `assetSource` | `string` | Example values: `orm`, `local`, `remote`. |
| `assetType` | `string` | Example values: `image`, `document`, `video`, `audio`. |
| `assetContext` | `string` | Optional context, such as `hero`, `detail`, `icon`. |
| `uploadEnabled` | `boolean` | Whether upload is allowed. |
| `browseEnabled` | `boolean` | Whether selecting existing assets is allowed. |

### Lookup Properties

| Property | Type | Description |
|---|---:|---|
| `resource` | `string` | Resource to query, such as `applications`, `assets`, `users`. |
| `lookupUrl` | `string` | Optional endpoint for lookup searches. |
| `searchParam` | `string` | Query parameter name for searching. |
| `displayField` | `string` | Field to show as the display label. |
| `valueField` | `string` | Field to store as the selected value. |
| `minSearchLength` | `number` | Minimum characters before search. |

---

## Recommended Data Types

These describe the value that should be stored, not necessarily the visual control.

| `type` | Stored Value | Typical Variants |
|---|---|---|
| `string` | Text value | `text`, `textarea`, `email`, `url`, `tel`, `password`, `select`, `rich-text`, `asset-picker` |
| `number` | Numeric value | `number`, `currency`, `percent`, `range` |
| `integer` | Whole number | `number`, `select`, `range` |
| `boolean` | `true` or `false` | `checkbox`, `switch`, `radio` |
| `date` | Date value | `date`, `date-picker` |
| `time` | Time value | `time`, `time-picker` |
| `datetime` | Date and time value | `datetime-local`, `datetime-picker` |
| `array` | List of values | `multi-select`, `checkbox-group`, `tag-list`, `repeater` |
| `object` | Structured object | `address`, `name`, `json`, `group` |
| `file` | File object or file reference | `file`, `image-upload` |
| `reference` | ID or reference to another resource | `lookup`, `asset-picker`, `user-picker` |
| `json` | JSON value | `json-editor`, `code` |
| `action` | No stored data, emits action | `button`, `submit`, `reset` |
| `display` | Read-only display value | `readonly`, `calculated`, `output` |

---

## Common `variant` Values

### Text and String Variants

| `variant` | Native HTML Backing | Recommended `type` | Use Case |
|---|---|---|---|
| `text` | `<input type="text">` | `string` | Short text. |
| `textarea` | `<textarea>` | `string` | Long text, descriptions, notes. |
| `email` | `<input type="email">` | `string` | Email address. |
| `password` | `<input type="password">` | `string` | Password or secret. |
| `search` | `<input type="search">` | `string` | Search field. |
| `tel` | `<input type="tel">` | `string` | Phone number. |
| `url` | `<input type="url">` | `string` | Website URL. |
| `slug` | `<input type="text">` | `string` | URL-safe identifier. |
| `code` | `<textarea>` or custom editor | `string` or `json` | Code, config, JSON, CSS. |
| `rich-text` | Custom editor | `string` | Formatted content. |

Example:

```html
<mt-input
  name="title"
  label="Title"
  instructions="Enter a short title."
  type="string"
  variant="text"
  maxlength="80"
  required>
</mt-input>
```

---

### Number Variants

| `variant` | Native HTML Backing | Recommended `type` | Use Case |
|---|---|---|---|
| `number` | `<input type="number">` | `number` | General numeric value. |
| `integer` | `<input type="number">` | `integer` | Whole number only. |
| `currency` | `<input type="number">` plus formatting | `number` | Money amount. |
| `percent` | `<input type="number">` plus suffix | `number` | Percent value. |
| `range` | `<input type="range">` | `number` | Slider. |
| `rating` | Custom control | `number` | Star or score rating. |

Example:

```html
<mt-input
  name="price"
  label="Price"
  type="number"
  variant="currency"
  min="0"
  step="0.01">
</mt-input>
```

---

### Date and Time Variants

| `variant` | Native HTML Backing | Recommended `type` | Use Case |
|---|---|---|---|
| `date` | `<input type="date">` | `date` | Calendar date. |
| `time` | `<input type="time">` | `time` | Time of day. |
| `datetime-local` | `<input type="datetime-local">` | `datetime` | Date and local time. |
| `month` | `<input type="month">` | `string` | Month and year. |
| `week` | `<input type="week">` | `string` | Week of year. |
| `date-range` | Custom component | `object` | Start and end date. |
| `time-range` | Custom component | `object` | Start and end time. |

Example:

```html
<mt-input
  name="publishDate"
  label="Publish date"
  type="date"
  variant="date"
  required>
</mt-input>
```

---

### Boolean Variants

| `variant` | Native HTML Backing | Recommended `type` | Use Case |
|---|---|---|---|
| `checkbox` | `<input type="checkbox">` | `boolean` | True or false. |
| `switch` | Checkbox styled as switch | `boolean` | On/off setting. |
| `radio-boolean` | Radio group | `boolean` | Explicit yes/no choice. |
| `tri-state` | Custom control | `boolean | null` | Yes/no/not set. |

Example:

```html
<mt-input
  name="showPrimaryCta"
  label="Show primary CTA"
  type="boolean"
  variant="switch"
  value="true">
</mt-input>
```

---

### Choice Variants

| `variant` | Native HTML Backing | Recommended `type` | Use Case |
|---|---|---|---|
| `select` | `<select>` | `string`, `number`, `reference` | Dropdown. |
| `multi-select` | `<select multiple>` or custom | `array` | Multiple selected values. |
| `radio` | `<input type="radio">` group | `string`, `number`, `boolean` | One of several options. |
| `checkbox-group` | Checkbox group | `array` | Many options. |
| `combobox` | Custom or `<input>` with `<datalist>` | `string` or `reference` | Select or type. |
| `tag-list` | Custom component | `array` | Free-form list of tags. |
| `segmented-control` | Buttons or radio group | `string` | Compact option selector. |

Example:

```html
<mt-input
  name="visualMode"
  label="Visual mode"
  instructions="Choose how the hero content should be displayed."
  type="string"
  variant="select"
  value="background">
</mt-input>
```

Options can be supplied by property:

```js
input.options = [
  { label: 'Background', value: 'background' },
  { label: 'Panel right', value: 'panel_right' },
  { label: 'Panel left', value: 'panel_left' }
];
```

---

### File, Image, and Asset Variants

| `variant` | Native HTML Backing | Recommended `type` | Use Case |
|---|---|---|---|
| `file` | `<input type="file">` | `file` | Upload a file. |
| `image-upload` | `<input type="file">` plus preview | `file` or `reference` | Upload image. |
| `asset-picker` | Custom component | `reference` or `string` | Select asset from ORM or upload. |
| `image-url` | `<input type="url">` plus preview | `string` | Image by URL. |
| `icon-picker` | Custom component | `string` or `reference` | Select icon, image, or asset. |
| `media-picker` | Custom component | `reference` | Select image, video, audio, or document. |

Recommended asset picker example:

```html
<mt-input
  name="heroImage"
  label="Hero image"
  instructions="Choose an existing asset or upload a new image. Recommended size: 1600x900."
  type="reference"
  variant="asset-picker"
  asset-source="orm"
  asset-type="image"
  accept="image/*"
  upload-enabled>
</mt-input>
```

Recommended asset value shapes:

Option 1: Store a simple string reference.

```json
"asset:denver-mint-hero"
```

Option 2: Store a structured object.

```json
{
  "assetId": "denver-mint-hero",
  "url": "/assets/denver-mint-hero.jpg",
  "alt": "Denver Mint building exterior"
}
```

Recommended behavior:

- The parent should decide whether a selected value is an asset ID, URL, or full object.
- The picker should display `label`, `instructions`, `required`, `disabled`, `readonly`, and `error` consistently.
- Upload and selection should emit separate events.
- The component should not silently overwrite existing assets.
- Conflict handling should be explicit.

---

### Lookup and Reference Variants

| `variant` | Native HTML Backing | Recommended `type` | Use Case |
|---|---|---|---|
| `lookup` | Custom search/select | `reference` | Search records from an API. |
| `autocomplete` | `<input>` with `<datalist>` or custom | `string` or `reference` | Search suggestions. |
| `user-picker` | Custom lookup | `reference` | Select a person. |
| `resource-picker` | Custom lookup | `reference` | Select app, page, content, asset, etc. |

Example:

```html
<mt-input
  name="applicationId"
  label="Application"
  instructions="Search for the application this hero belongs to."
  type="reference"
  variant="lookup"
  resource="applications"
  display-field="title"
  value-field="id">
</mt-input>
```

---

### Structured Object Variants

| `variant` | Native HTML Backing | Recommended `type` | Use Case |
|---|---|---|---|
| `address` | Group of inputs | `object` | Street, city, state, ZIP, country. |
| `name` | Group of inputs | `object` | First, middle, last. |
| `date-range` | Group of date inputs | `object` | Start and end date. |
| `time-range` | Group of time inputs | `object` | Start and end time. |
| `key-value-list` | Repeating rows | `array` | Metadata pairs. |
| `repeater` | Repeating field group | `array` | List of objects. |
| `group` | `<fieldset>` | `object` | Nested fields. |
| `json-editor` | Textarea or code editor | `json` or `object` | Advanced structured data. |

Example address value:

```json
{
  "street1": "801 9th Street NW",
  "street2": "",
  "city": "Washington",
  "state": "DC",
  "postalCode": "20220",
  "country": "US"
}
```

Example:

```html
<mt-input
  name="officeAddress"
  label="Office address"
  type="object"
  variant="address">
</mt-input>
```

---

### Display, Hidden, and Calculated Variants

| `variant` | Native HTML Backing | Recommended `type` | Use Case |
|---|---|---|---|
| `hidden` | `<input type="hidden">` | Any | Stored value not shown to user. |
| `readonly` | Read-only input or text | `display` | Display a locked value. |
| `output` | `<output>` | `display` | Calculated result. |
| `calculated` | Custom output | `display` | Derived value. |
| `divider` | `<hr>` or custom | `display` | Visual separation. |
| `message` | Static text | `display` | Instructions, warnings, context. |

Example:

```html
<mt-input
  name="lastUpdatedBy"
  label="Last updated by"
  type="display"
  variant="readonly"
  value="Kelly Harris">
</mt-input>
```

---

### Action Variants

Most actions should use a button component, but a form builder may still represent them as fields.

| `variant` | Native HTML Backing | Recommended `type` | Use Case |
|---|---|---|---|
| `button` | `<button type="button">` | `action` | Custom action. |
| `submit` | `<button type="submit">` | `action` | Submit form. |
| `reset` | `<button type="reset">` | `action` | Reset form. |
| `link-button` | `<a>` or `<button>` | `action` | Navigate or emit action. |

Recommended CTA behavior:

- If `href` is provided, the component should navigate by default.
- If no `href` is provided, the component should emit an action event.
- If both `href` and an action handler are provided, prefer navigation unless `preventDefault` is explicitly used by the parent.

Example:

```html
<mt-input
  name="primaryCta"
  label="Primary CTA"
  type="action"
  variant="button"
  value="Start tour">
</mt-input>
```

---

## Native HTML Components to Support

A strong form system should cover these common native HTML elements.

| Native Element | Used By |
|---|---|
| `<form>` | Form container and submission. |
| `<label>` | Accessible field label. |
| `<input>` | Most single-value controls. |
| `<textarea>` | Multi-line text. |
| `<select>` | Dropdown and multi-select. |
| `<option>` | Select options. |
| `<optgroup>` | Grouped select options. |
| `<button>` | Actions, submit, reset. |
| `<fieldset>` | Group related fields. |
| `<legend>` | Field group label. |
| `<datalist>` | Native autocomplete suggestions. |
| `<output>` | Display calculated results. |
| `<progress>` | Progress indicator. |
| `<meter>` | Scalar measurement display. |

---

## Native HTML Input Types

The `mt-input` component does not need to expose every native input type directly, but it should be able to map to them.

| Native Input Type | Recommended `variant` | Notes |
|---|---|---|
| `text` | `text` | Default short text. |
| `email` | `email` | Browser email validation. |
| `password` | `password` | Obscured input. |
| `search` | `search` | Search UI behavior. |
| `tel` | `tel` | Phone keypad on mobile. |
| `url` | `url` | Browser URL validation. |
| `number` | `number`, `currency`, `percent` | Numeric input. |
| `range` | `range` | Slider. |
| `date` | `date` | Date picker. |
| `time` | `time` | Time picker. |
| `datetime-local` | `datetime-local` | Local date/time. |
| `month` | `month` | Month/year. |
| `week` | `week` | Week/year. |
| `checkbox` | `checkbox`, `switch` | Boolean or multi-select. |
| `radio` | `radio`, `radio-boolean` | Single choice. |
| `color` | `color` | Color picker. |
| `file` | `file`, `image-upload` | File upload. |
| `hidden` | `hidden` | Hidden value. |
| `button` | `button` | Custom action. |
| `submit` | `submit` | Submit action. |
| `reset` | `reset` | Reset action. |
| `image` | Usually avoid | Prefer button with image/icon content. |

---

## Recommended Event Model

The component should emit normal browser events where possible and custom events for structured data.

### Generic Events

| Event | When It Fires | Detail Payload |
|---|---|---|
| `input` | Value changes while editing. | Native-style event. |
| `change` | Value is committed. | Native-style event. |
| `mt-input` | Value changes with structured payload. | `{ name, value, type, variant, valid }` |
| `mt-change` | Value is committed with structured payload. | `{ name, value, type, variant, valid }` |
| `mt-focus` | Field receives focus. | `{ name }` |
| `mt-blur` | Field loses focus. | `{ name, value, valid }` |
| `mt-validate` | Validation state changes. | `{ name, valid, errors }` |
| `mt-action` | Action variant is triggered. | `{ name, action, value }` |

Recommended `mt-change` payload:

```js
{
  name: 'heroImage',
  value: 'asset:denver-mint-hero',
  type: 'reference',
  variant: 'asset-picker',
  valid: true,
  rawValue: 'asset:denver-mint-hero',
  displayValue: 'Denver Mint Hero',
  meta: {
    assetId: 'denver-mint-hero',
    source: 'orm'
  }
}
```

### Asset Events

| Event | When It Fires | Detail Payload |
|---|---|---|
| `mt-asset-select` | Existing asset selected. | `{ name, asset, value }` |
| `mt-asset-upload-request` | User requests upload. | `{ name, file, context }` |
| `mt-asset-upload-success` | Upload succeeds. | `{ name, asset, value }` |
| `mt-asset-upload-error` | Upload fails. | `{ name, error, file }` |
| `mt-asset-conflict` | Asset already exists. | `{ name, file, existingAsset }` |

Recommendation:

- Selection and upload should be separate events.
- The parent application should decide whether to upload immediately, show confirmation, rename, overwrite, or cancel.

---

## Recommended Form Schema Shape

A form builder can define fields with a JSON schema-like shape.

```json
{
  "name": "heroImage",
  "label": "Hero image",
  "instructions": "Choose an image from ORM assets or upload a new one.",
  "type": "reference",
  "variant": "asset-picker",
  "required": true,
  "assetSource": "orm",
  "assetType": "image",
  "accept": "image/*"
}
```

Example form schema:

```json
{
  "id": "applicationHeroForm",
  "title": "Application Hero",
  "fields": [
    {
      "name": "title",
      "label": "Title",
      "type": "string",
      "variant": "text",
      "required": true,
      "maxlength": 80
    },
    {
      "name": "description",
      "label": "Description",
      "type": "string",
      "variant": "textarea",
      "maxlength": 240
    },
    {
      "name": "visualMode",
      "label": "Visual mode",
      "type": "string",
      "variant": "select",
      "value": "background",
      "options": [
        { "label": "Background", "value": "background" },
        { "label": "Panel right", "value": "panel_right" },
        { "label": "Panel left", "value": "panel_left" }
      ]
    },
    {
      "name": "heroImage",
      "label": "Hero image",
      "instructions": "Choose an existing asset or upload a new image.",
      "type": "reference",
      "variant": "asset-picker",
      "assetSource": "orm",
      "assetType": "image",
      "accept": "image/*"
    },
    {
      "name": "showPrimaryCta",
      "label": "Show primary CTA",
      "type": "boolean",
      "variant": "switch",
      "value": true
    },
    {
      "name": "primaryCtaLabel",
      "label": "Primary CTA label",
      "type": "string",
      "variant": "text"
    },
    {
      "name": "primaryCtaHref",
      "label": "Primary CTA link",
      "type": "string",
      "variant": "url"
    }
  ]
}
```

---

## Recommended Web Component Examples

### Text Input

```html
<mt-input
  name="pageTitle"
  label="Page title"
  instructions="This appears at the top of the page."
  type="string"
  variant="text"
  required>
</mt-input>
```

### Textarea

```html
<mt-input
  name="introText"
  label="Intro text"
  type="string"
  variant="textarea"
  maxlength="500">
</mt-input>
```

### Select

```html
<mt-input
  name="layout"
  label="Layout"
  type="string"
  variant="select"
  value="standard">
</mt-input>
```

### Switch

```html
<mt-input
  name="isPublished"
  label="Published"
  type="boolean"
  variant="switch">
</mt-input>
```

### Asset Picker

```html
<mt-input
  name="backgroundAsset"
  label="Background asset"
  instructions="Select an image asset from ORM or upload a new one."
  type="reference"
  variant="asset-picker"
  asset-source="orm"
  asset-type="image"
  accept="image/*">
</mt-input>
```

### Lookup

```html
<mt-input
  name="relatedApplication"
  label="Related application"
  type="reference"
  variant="lookup"
  resource="applications"
  display-field="name"
  value-field="id">
</mt-input>
```

### JSON Editor

```html
<mt-input
  name="tourBullets"
  label="Tour detail bullets JSON"
  instructions="Provide an array of bullet objects."
  type="json"
  variant="json-editor">
</mt-input>
```

---

## Recommended TypeScript Interfaces

```ts
export type MtInputType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'date'
  | 'time'
  | 'datetime'
  | 'array'
  | 'object'
  | 'file'
  | 'reference'
  | 'json'
  | 'action'
  | 'display';

export type MtInputVariant =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'search'
  | 'tel'
  | 'url'
  | 'slug'
  | 'number'
  | 'integer'
  | 'currency'
  | 'percent'
  | 'range'
  | 'rating'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'date-range'
  | 'time-range'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'radio-boolean'
  | 'tri-state'
  | 'select'
  | 'multi-select'
  | 'checkbox-group'
  | 'combobox'
  | 'tag-list'
  | 'segmented-control'
  | 'file'
  | 'image-upload'
  | 'asset-picker'
  | 'image-url'
  | 'icon-picker'
  | 'media-picker'
  | 'lookup'
  | 'autocomplete'
  | 'user-picker'
  | 'resource-picker'
  | 'address'
  | 'name'
  | 'key-value-list'
  | 'repeater'
  | 'group'
  | 'json-editor'
  | 'code'
  | 'hidden'
  | 'readonly'
  | 'output'
  | 'calculated'
  | 'divider'
  | 'message'
  | 'button'
  | 'submit'
  | 'reset'
  | 'link-button';

export interface MtInputOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  description?: string;
  icon?: string;
}

export interface MtInputChangeDetail<TValue = unknown> {
  name: string;
  value: TValue;
  type: MtInputType;
  variant: MtInputVariant;
  valid: boolean;
  rawValue?: unknown;
  displayValue?: string;
  errors?: string[];
  meta?: Record<string, unknown>;
}

export interface MtInputFieldConfig<TValue = unknown> {
  name: string;
  label?: string;
  instructions?: string;
  description?: string;
  placeholder?: string;
  type: MtInputType;
  variant: MtInputVariant;
  value?: TValue;
  defaultValue?: TValue;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  autocomplete?: string;
  min?: number | string;
  max?: number | string;
  step?: number;
  minlength?: number;
  maxlength?: number;
  pattern?: string;
  validationMessage?: string;
  validateOn?: 'input' | 'change' | 'blur' | 'submit';
  options?: MtInputOption[];
  multiple?: boolean;
  allowCustomValue?: boolean;
  accept?: string;
  maxFileSize?: number;
  assetSource?: 'orm' | 'local' | 'remote';
  assetType?: 'image' | 'document' | 'video' | 'audio' | 'any';
  assetContext?: string;
  uploadEnabled?: boolean;
  browseEnabled?: boolean;
  resource?: string;
  lookupUrl?: string;
  searchParam?: string;
  displayField?: string;
  valueField?: string;
  minSearchLength?: number;
  error?: string;
  warning?: string;
  success?: string;
}
```

---

## Accessibility Requirements

Each `mt-input` should:

- Render a real accessible label.
- Associate `instructions` with the control using `aria-describedby`.
- Associate errors with the control using `aria-describedby`.
- Set `aria-invalid="true"` when invalid.
- Preserve keyboard navigation.
- Support focus states.
- Support required and disabled states.
- Avoid using placeholder text as the only label.
- Ensure custom controls like asset picker, lookup, and rich text are keyboard accessible.

Recommended DOM structure:

```html
<div class="mt-field" data-variant="text">
  <label class="mt-field__label" for="field-title">Title</label>
  <div class="mt-field__instructions" id="field-title-instructions">
    Enter a short title.
  </div>
  <input
    id="field-title"
    name="title"
    type="text"
    aria-describedby="field-title-instructions">
</div>
```

---

## Styling Recommendations

Use consistent field wrapper parts and CSS custom properties.

Recommended parts:

| Part | Purpose |
|---|---|
| `field` | Field wrapper. |
| `label` | Label element. |
| `instructions` | Help text. |
| `control` | Main control area. |
| `input` | Native input, select, or textarea. |
| `error` | Error message. |
| `warning` | Warning message. |
| `success` | Success message. |
| `actions` | Inline field actions. |

Example parts:

```html
<mt-input part="field control input label instructions error"></mt-input>
```

Recommended CSS custom properties:

```css
--mt-input-label-color
--mt-input-text-color
--mt-input-background
--mt-input-border-color
--mt-input-border-radius
--mt-input-focus-color
--mt-input-error-color
--mt-input-instructions-color
--mt-input-disabled-opacity
```

---

## Implementation Guidance

### Use native controls first

Prefer native HTML controls where they work well:

- Text
- Email
- URL
- Number
- Date
- Time
- Checkbox
- Radio
- Select
- File

Use custom controls when the interaction needs more structure:

- Asset picker
- Lookup
- Rich text
- JSON editor
- Address
- Repeater
- Multi-select with search
- Tag list

### Keep value handling predictable

Every variant should follow the same pattern:

```js
field.value = newValue;
field.dispatchEvent(new CustomEvent('mt-change', {
  bubbles: true,
  composed: true,
  detail: {
    name: field.name,
    value: newValue,
    type: field.type,
    variant: field.variant,
    valid: field.checkValidity()
  }
}));
```

### Allow parent-controlled behavior

The parent should be able to control:

- Whether a field is shown.
- Whether a field is enabled.
- Whether a value is valid.
- What happens after an asset is selected.
- What happens after a file upload is requested.
- What happens when an action button is clicked.
- Whether a CTA navigates or emits a callback.

---

## Recommended Minimum Field Set for Initial Implementation

For the first stable version, implement these variants first:

| Priority | Variant | Reason |
|---:|---|---|
| 1 | `text` | Most common field. |
| 2 | `textarea` | Common for descriptions. |
| 3 | `select` | Needed for enums and modes. |
| 4 | `checkbox` | Basic boolean. |
| 5 | `switch` | Better boolean UI for settings. |
| 6 | `number` | Common config value. |
| 7 | `date` | Common enterprise field. |
| 8 | `url` | Links and media URLs. |
| 9 | `file` | Upload support. |
| 10 | `asset-picker` | Important for ORM asset integration. |
| 11 | `lookup` | Enterprise reference fields. |
| 12 | `json-editor` | Advanced configuration fields. |

---

## Summary

The recommended pattern is:

```html
<mt-input
  name="fieldName"
  label="Field label"
  instructions="Helpful guidance for the user."
  type="string"
  variant="text"
  value="Current value">
</mt-input>
```

Use `type` to describe the value and `variant` to describe the UI.

This makes `mt-input` flexible enough for native HTML fields, custom enterprise controls, ORM-backed asset selection, lookup fields, and future form-builder scenarios.
