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
- `uib-forms-field`
- `uib-forms-input-group`
- `uib-forms-wizard`

`uib-toggle` and `uib-checkbox` remain in `@ui-base/ui` because they are general UI controls and already existed there.

## Example

```html
<uib-forms-form name="tourSearch" label="Tour search">
  <uib-forms-textbox name="visitorName" label="Visitor name" required></uib-forms-textbox>
  <uib-forms-email name="email" label="Email" help="Used for reservation confirmation."></uib-forms-email>
  <uib-forms-select name="location" label="Location" options="Sample Site,Site A,Site B"></uib-forms-select>
</uib-forms-form>
```
