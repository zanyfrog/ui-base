# @ui-base/forms

Form, validation, and input components for UI Base applications.

The first version includes a functional `uib-forms-form` and experimental input components:

- `uib-forms-textbox`
- `uib-forms-number`
- `uib-forms-date`
- `uib-forms-email`
- `uib-forms-password`
- `uib-forms-phone`
- `uib-forms-textarea`
- `uib-forms-select`
- `uib-forms-display-field`
- `uib-forms-field`
- `uib-forms-input-group`
- `uib-forms-wizard`
- `uib-recent-values-manager`

`uib-toggle` and `uib-checkbox` remain in `@ui-base/ui` because they are general UI controls and already existed there.

## Example

```html
<uib-forms-form name="tourSearch" label="Tour search">
  <uib-forms-textbox name="visitorName" label="Visitor name" required></uib-forms-textbox>
  <uib-forms-email name="email" label="Email" help="Used for reservation confirmation."></uib-forms-email>
  <uib-forms-select name="location" label="Location" options="Sample Site,Site A,Site B"></uib-forms-select>
</uib-forms-form>

<uib-forms-display-field label="Email" display-value="ada@example.com"></uib-forms-display-field>
<uib-forms-display-field label="Access code" value="demo-password" type="password"></uib-forms-display-field>
```

## Recent Values

Single-line text-like controls can opt into browser-local recent values with `recent-values`.
Values are stored in `localStorage` as a simple string array under `uib:recent:${recent-values-key || name}`.
The default limit is `5`; `0` or negative limits disable the feature.

Recent values are saved when a native form submit happens or when `uib-forms-form` submits.
Values are trimmed, repeated whitespace is collapsed, case-insensitive duplicates are moved to the top, and values over 100 characters are ignored.
Password, textarea, select, number, and date controls do not use this feature.

```html
<uib-forms-form name="tourSearch" label="Tour search">
  <uib-forms-textbox
    name="visitorName"
    label="Visitor name"
    recent-values
    recent-values-limit="8">
  </uib-forms-textbox>
</uib-forms-form>

<uib-recent-values-manager></uib-recent-values-manager>
```
