export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

export function field(id, label, value = '', type = 'text', attrs = '') {
  const tag = type === 'textarea'
    ? `<textarea id="${escapeAttr(id)}" ${attrs}>${escapeHtml(value)}</textarea>`
    : `<input id="${escapeAttr(id)}" type="${escapeAttr(type)}" value="${escapeAttr(value)}" ${attrs} />`;
  return `<div class="field"><label for="${escapeAttr(id)}">${escapeHtml(label)}</label>${tag}</div>`;
}

export function numberField(id, label, value = '', attrs = '') {
  return field(id, label, value, 'number', attrs);
}

export function textareaField(id, label, value = '', attrs = '') {
  return field(id, label, value, 'textarea', attrs);
}

export function optionHtml(option, selectedValue) {
  const item = typeof option === 'string' ? { value: option, label: option } : option;
  const value = String(item.value ?? '');
  const selected = value === String(selectedValue ?? '') ? 'selected' : '';
  return `<option value="${escapeAttr(value)}" ${selected}>${escapeHtml(item.label ?? value)}</option>`;
}

export function selectField(id, label, options, value = '') {
  return `
    <div class="field">
      <label for="${escapeAttr(id)}">${escapeHtml(label)}</label>
      <select id="${escapeAttr(id)}">${options.map((option) => optionHtml(option, value)).join('')}</select>
    </div>
  `;
}

export function checkboxField(id, label, checked = false) {
  return `
    <label class="checkbox-row" for="${escapeAttr(id)}">
      <input id="${escapeAttr(id)}" type="checkbox" ${checked ? 'checked' : ''} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

export function setStatus(root, message, selector = '.status-box') {
  const target = root.querySelector(selector);
  if (target) target.textContent = message;
}

export function appendEventLog(output, eventName, detail = {}, extra = {}) {
  if (!output) return;
  const entry = {
    time: new Date().toLocaleTimeString(),
    event: eventName,
    ...extra,
    detail
  };
  output.textContent = JSON.stringify(entry, null, 2);
}

export function serializeElement(element) {
  if (!element) return 'No component mounted.';
  const tag = element.tagName.toLowerCase();
  const attrs = Array.from(element.attributes)
    .filter((attr) => attr.name !== 'id' && attr.name !== 'style')
    .map((attr) => (attr.value === '' ? `  ${attr.name}` : `  ${attr.name}="${attr.value}"`));
  if (!attrs.length) return `<${tag}></${tag}>`;
  return `<${tag}\n${attrs.join('\n')}\n></${tag}>`;
}

export function setOrRemoveAttribute(element, attr, value) {
  if (!element) return;
  const stringValue = String(value ?? '');
  if (stringValue === '') element.removeAttribute(attr);
  else element.setAttribute(attr, stringValue);
}

export function setBooleanAttribute(element, attr, value) {
  if (!element) return;
  if (value) element.setAttribute(attr, 'true');
  else element.removeAttribute(attr);
}

export function json(value) {
  return JSON.stringify(value, null, 2);
}
