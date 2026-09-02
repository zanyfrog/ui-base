import type { FieldDefinition } from '../record-fields.js';
import { DATE_FIELD_NAMES, JSON_FIELD_NAMES, URL_FIELD_NAMES, groupFields } from '../record-fields.js';
import { attr, escapeHtml } from '../utils/dom.js';
import '@ui-base/forms';

export type FormRecord = Record<string, string>;

export interface RenderFieldOptions {
  booleanStyle?: 'select' | 'toggle';
}

function booleanValue(value: string): boolean {
  return String(value).toLowerCase() === 'true';
}

function fieldAttributes(field: FieldDefinition, value: string, extra: Record<string, string | boolean> = {}): string {
  const attributes = [
    `id="field-${attr(field.name)}"`,
    `name="${attr(field.name)}"`,
    `label="${attr(field.label)}"`,
    `value="${attr(value)}"`,
    field.required ? 'required' : '',
    field.help ? `help="${attr(field.help)}"` : '',
  ];

  for (const [name, optionValue] of Object.entries(extra)) {
    if (optionValue === false || optionValue === undefined || optionValue === null) continue;
    attributes.push(optionValue === true ? name : `${name}="${attr(String(optionValue))}"`);
  }

  return attributes.filter(Boolean).join(' ');
}

export function renderField(field: FieldDefinition, record: FormRecord, options: RenderFieldOptions = {}): string {
  const value = record[field.name] ?? '';
  const wide = field.kind === 'textarea' || field.kind === 'json' || field.kind === 'html' ? ' uibam-field--wide' : '';

  if (field.kind === 'boolean') {
    const checked = booleanValue(value);
    return `
      <div class="uibam-field${wide}${options.booleanStyle === 'toggle' ? ' uibam-field--toggle' : ''}">
        <uib-forms-checkbox ${fieldAttributes(field, 'true', { checked })}></uib-forms-checkbox>
      </div>`;
  }

  if (field.kind === 'select') {
    const options = field.options ?? [];
    const selectOptions = options.includes(value) || !value ? options : [value, ...options];
    return `
      <div class="uibam-field${wide}">
        <uib-forms-select ${fieldAttributes(field, value, { options: selectOptions.join(',') })}></uib-forms-select>
      </div>`;
  }

  if (field.kind === 'textarea' || field.kind === 'json' || field.kind === 'html') {
    return `
      <div class="uibam-field${wide}">
        <uib-forms-textarea ${fieldAttributes(field, value)}></uib-forms-textarea>
      </div>`;
  }

  const tagName = field.kind === 'number' ? 'uib-forms-number' : 'uib-forms-textbox';
  const placeholder = field.kind === 'datetime' ? '2026-06-24T00:00:00.000Z' : '';
  return `
    <div class="uibam-field${wide}">
      <${tagName} ${fieldAttributes(field, value, {
        placeholder,
        step: field.kind === 'number' ? 'any' : '',
      })}></${tagName}>
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
    const control = form.querySelector<HTMLElement & { value?: string; checked?: boolean }>(`[name="${field.name}"]`);
    if (field.kind === 'boolean') {
      record[field.name] = control?.checked ? 'true' : 'false';
      continue;
    }
    const controlValue = control?.value;
    if (controlValue !== undefined) {
      record[field.name] = String(controlValue);
      continue;
    }
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
