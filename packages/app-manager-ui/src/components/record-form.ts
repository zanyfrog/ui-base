import type { FieldDefinition } from '../record-fields.js';
import { DATE_FIELD_NAMES, JSON_FIELD_NAMES, URL_FIELD_NAMES, groupFields } from '../record-fields.js';
import { attr, escapeHtml } from '../utils/dom.js';

export type FormRecord = Record<string, string>;

export interface RenderFieldOptions {
  booleanStyle?: 'select' | 'toggle';
}

function booleanValue(value: string): boolean {
  return String(value).toLowerCase() === 'true';
}

export function renderField(field: FieldDefinition, record: FormRecord, options: RenderFieldOptions = {}): string {
  const value = record[field.name] ?? '';
  const required = field.required ? ' required' : '';
  const help = field.help ? `<small>${escapeHtml(field.help)}</small>` : '';
  const wide = field.kind === 'textarea' || field.kind === 'json' || field.kind === 'html' ? ' uibam-field--wide' : '';
  const label = `${escapeHtml(field.label)}${field.required ? ' *' : ''}`;

  if (field.kind === 'boolean') {
    const checked = booleanValue(value);
    if (options.booleanStyle === 'toggle') {
      return `
        <div class="uibam-field uibam-field--toggle${wide}">
          <span class="uibam-field-label" id="field-${attr(field.name)}-label">${label}</span>
          <input type="hidden" name="${attr(field.name)}" value="false" />
          <label class="uibam-toggle-control" for="field-${attr(field.name)}">
            <input id="field-${attr(field.name)}" name="${attr(field.name)}" type="checkbox" value="true" ${checked ? 'checked' : ''}${required} aria-labelledby="field-${attr(field.name)}-label" />
            <span class="uibam-toggle-switch" aria-hidden="true"><span></span></span>
            <span class="uibam-toggle-state" aria-hidden="true">
              <span class="uibam-toggle-state-on">true</span>
              <span class="uibam-toggle-state-off">false</span>
            </span>
          </label>
          ${help}
        </div>`;
    }
    return `
      <div class="uibam-field${wide}">
        <label for="field-${attr(field.name)}">${label}</label>
        <select id="field-${attr(field.name)}" name="${attr(field.name)}"${required}>
          <option value="true" ${checked ? 'selected' : ''}>true</option>
          <option value="false" ${!checked ? 'selected' : ''}>false</option>
        </select>
        ${help}
      </div>`;
  }

  if (field.kind === 'select') {
    const options = field.options ?? [];
    const knownValue = options.includes(value);
    return `
      <div class="uibam-field${wide}">
        <label for="field-${attr(field.name)}">${label}</label>
        <select id="field-${attr(field.name)}" name="${attr(field.name)}"${required}>
          ${knownValue ? '' : `<option value="${attr(value)}" selected>${escapeHtml(value || 'custom/empty')}</option>`}
          ${options.map((option) => `<option value="${attr(option)}" ${option === value ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
        </select>
        ${help}
      </div>`;
  }

  if (field.kind === 'textarea' || field.kind === 'json' || field.kind === 'html') {
    const rows = field.kind === 'html' ? 8 : field.kind === 'json' ? 8 : 4;
    return `
      <div class="uibam-field${wide}">
        <label for="field-${attr(field.name)}">${label}</label>
        <textarea id="field-${attr(field.name)}" name="${attr(field.name)}" rows="${rows}" spellcheck="false"${required}>${escapeHtml(value)}</textarea>
        ${help}
      </div>`;
  }

  const inputType = field.kind === 'number' ? 'number' : 'text';
  const step = field.kind === 'number' ? ' step="any"' : '';
  const placeholder = field.kind === 'datetime' ? '2026-06-24T00:00:00.000Z' : '';
  return `
    <div class="uibam-field${wide}">
      <label for="field-${attr(field.name)}">${label}</label>
      <input id="field-${attr(field.name)}" name="${attr(field.name)}" type="${inputType}" value="${attr(value)}" placeholder="${attr(placeholder)}"${step}${required} />
      ${help}
    </div>`;
}

export function renderFieldGroups(fields: FieldDefinition[], record: FormRecord, initiallyOpen = ['Identity', 'Content'], options: RenderFieldOptions = {}): string {
  const groups = groupFields(fields);
  return [...groups.entries()].map(([section, sectionFields]) => `
    <details class="uibam-section" ${initiallyOpen.includes(section) ? 'open' : ''}>
      <summary>${escapeHtml(section)}</summary>
      <div class="uibam-section-body">
        ${sectionFields.map((field) => renderField(field, record, options)).join('')}
      </div>
    </details>
  `).join('');
}

export function formToRecord(form: HTMLFormElement, fields: FieldDefinition[]): FormRecord {
  const data = new FormData(form);
  const record: FormRecord = {};
  for (const field of fields) {
    const values = data.getAll(field.name);
    record[field.name] = String(values.length ? values[values.length - 1] : '');
  }
  return record;
}

export function validateRecord(fields: FieldDefinition[], record: FormRecord): string[] {
  const errors: string[] = [];
  for (const field of fields) {
    const value = record[field.name] ?? '';
    if (field.required && !value.trim()) {
      errors.push(`${field.label} is required.`);
    }
    if (JSON_FIELD_NAMES.has(field.name) && value.trim()) {
      try {
        JSON.parse(value);
      } catch {
        errors.push(`${field.label} must contain valid JSON.`);
      }
    }
    if (URL_FIELD_NAMES.has(field.name) && value.trim() && !isSafeUrl(value)) {
      errors.push(`${field.label} must be a URL, relative path, hash anchor, or empty.`);
    }
    if (DATE_FIELD_NAMES.has(field.name) && value.trim() && Number.isNaN(Date.parse(value))) {
      errors.push(`${field.label} must be a valid date/time string.`);
    }
    if (field.name === 'application_key' && value.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      errors.push('Application Key must use lowercase letters, numbers, and hyphens.');
    }
    if (field.name === 'hero_key' && value.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      errors.push('Hero Key must use lowercase letters, numbers, and hyphens.');
    }
    if (field.name === 'asset_key' && value.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      errors.push('Asset Key must use lowercase letters, numbers, and hyphens.');
    }
  }
  return errors;
}

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('./') || trimmed.startsWith('../')) return true;
  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
