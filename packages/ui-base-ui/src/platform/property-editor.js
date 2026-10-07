import { changeSetting, copySerializable, defaultSettings, isSettingVisible } from './definition.js';

function controlFor(ownerDocument, name, setting, value, onChange) {
  const label = ownerDocument.createElement('label'); label.className = 'reference-field';
  const title = ownerDocument.createElement('span'); title.textContent = setting.label; label.append(title);
  const control = ownerDocument.createElement(setting.enum ? 'select' : setting.editor === 'textarea' ? 'textarea' : 'input');
  control.dataset.setting = name;
  if (setting.enum) for (const value of setting.enum) {
    const option = ownerDocument.createElement('option'); option.value = value; option.textContent = value || 'Default'; control.append(option);
  }
  if (setting.type === 'boolean') { control.type = 'checkbox'; control.checked = value; }
  else { if (control.localName === 'input') control.type = setting.type === 'number' ? 'number' : 'text'; control.value = value; }
  if (setting.required) control.required = true;
  control.addEventListener('change', () => onChange(setting.type === 'boolean' ? control.checked : setting.type === 'number' ? Number(control.value) : control.value));
  label.append(control);
  return label;
}

export function createDefinitionEditor(definition, { document: ownerDocument = document, onChange = () => {} } = {}) {
  const fields = ownerDocument.createElement('fieldset'); const legend = ownerDocument.createElement('legend'); legend.textContent = 'Component metadata'; fields.append(legend);
  for (const [name, setting] of Object.entries(definition.builder.definitionSettings || {})) {
    const [section, property] = setting.binding.path.split('.');
    fields.append(controlFor(ownerDocument, name, setting, definition[section][property], value => onChange(setting.binding.path, value)));
  }
  return fields;
}

export function createPropertyEditor(definition, settings, { document: ownerDocument = document, onChange = () => {} } = {}) {
  let values = { ...defaultSettings(definition), ...copySerializable(settings) };
  const form = ownerDocument.createElement('form'); form.className = 'reference-property-editor';
  form.addEventListener('submit', event => event.preventDefault());
  for (const group of definition.builder.groups) {
    const fieldset = ownerDocument.createElement('fieldset'); const legend = ownerDocument.createElement('legend'); legend.textContent = group.label; fieldset.append(legend);
    for (const [name, setting] of Object.entries(definition.builder.settings)) if (setting.group === group.id && isSettingVisible(setting, values)) {
      fieldset.append(controlFor(ownerDocument, name, setting, values[name], value => {
        values = changeSetting(definition, values, name, value);
        onChange(copySerializable(values), name);
      }));
    }
    if (fieldset.children.length > 1) form.append(fieldset);
  }
  return form;
}
