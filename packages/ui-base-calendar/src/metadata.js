import { createComponentMetadata, MATURITY_LEVELS } from '@ui-base/core';

const attributeDescriptions = {
  count: 'Number of matching weekday dates to show.',
  'css-class': 'Optional host CSS class applied inside the component shadow root.',
  date: 'ISO date in YYYY-MM-DD format.',
  day: 'Legacy day-of-week alias used by older demos.',
  'day-of-week': 'Number from 0 to 6. 0 is Sunday.',
  days: 'Number of consecutive dates to show.',
  max: 'Legacy max-date alias used by older demos.',
  'max-date': 'Latest allowed ISO date for paging.',
  min: 'Legacy min-date alias used by older demos.',
  'min-date': 'Earliest allowed ISO date for paging.',
  month: 'Month number from 1 to 12.',
  'selected-date': 'ISO date to highlight.',
  'selected-month': 'Month number from 1 to 12 to highlight.',
  'show-paging': 'Shows previous and next page request buttons.',
  'start-date': 'First or anchor ISO date for the visible range.',
  weeks: 'Legacy count alias used by older demos.',
  year: 'Four digit year.'
};

const eventDescriptions = {
  'uib-calendar-date-select': 'Fires when a date is selected.',
  'uib-calendar-month-select': 'Fires when a month is selected.',
  'uib-calendar-page-request': 'Fires when previous or next page is requested.'
};

const partDescriptions = {
  action: 'Day-view select button.',
  body: 'Main body wrapper.',
  card: 'Outer calendar surface.',
  'date-button': 'Selectable date button.',
  'day-date': 'Large day number in day view.',
  'day-label': 'Weekday label.',
  'day-name': 'Long date label in day view.',
  'day-number': 'Date number label.',
  grid: 'Calendar date or month grid.',
  header: 'Calendar header.',
  'month-button': 'Selectable month button.',
  'page-button': 'Paging control button.',
  pager: 'Paging control wrapper.',
  'selected-date': 'Selected date state part token.',
  'selected-month': 'Selected month state part token.',
  subtitle: 'Calendar subtitle.',
  title: 'Calendar title.'
};

function item(name, source, type = '') {
  return { name, type, description: source[name] || `${name} API surface.` };
}

function items(names = [], source = {}, type = '') {
  return names.map((name) => item(name, source, type));
}

function api({
  tagName,
  purpose,
  attributes = [],
  events = [],
  cssParts = [],
  examples = []
}) {
  return {
    tagName,
    package: '@ui-base/calendar',
    maturity: MATURITY_LEVELS.PREVIEW,
    purpose,
    attributes: items(attributes, attributeDescriptions),
    properties: [],
    events: items(events, eventDescriptions),
    slots: [],
    cssParts: items(cssParts, partDescriptions),
    cssVariables: [],
    examples
  };
}

export const CALENDAR_COMPONENT_API = {
  'uib-calendar-day-view': api({
    tagName: 'uib-calendar-day-view',
    purpose: 'Shows one parent-controlled date with a select action.',
    attributes: ['date', 'css-class'],
    events: ['uib-calendar-date-select'],
    cssParts: ['card', 'header', 'title', 'subtitle', 'body', 'day-date', 'day-name', 'action'],
    examples: ['<uib-calendar-day-view date="2026-08-20"></uib-calendar-day-view>']
  }),
  'uib-calendar-week-view': api({
    tagName: 'uib-calendar-week-view',
    purpose: 'Shows seven consecutive days beginning with start-date.',
    attributes: ['start-date', 'selected-date', 'css-class'],
    events: ['uib-calendar-date-select'],
    cssParts: ['card', 'header', 'title', 'subtitle', 'grid', 'date-button', 'selected-date', 'day-label', 'day-number'],
    examples: ['<uib-calendar-week-view start-date="2026-08-20" selected-date="2026-08-20"></uib-calendar-week-view>']
  }),
  'uib-calendar-month-view': api({
    tagName: 'uib-calendar-month-view',
    purpose: 'Shows a selectable month grid controlled by year, month, and selected date.',
    attributes: ['year', 'month', 'selected-date', 'css-class'],
    events: ['uib-calendar-date-select'],
    cssParts: ['card', 'header', 'title', 'subtitle', 'grid', 'date-button', 'selected-date', 'day-label'],
    examples: ['<uib-calendar-month-view year="2026" month="8" selected-date="2026-08-20"></uib-calendar-month-view>']
  }),
  'uib-calendar-year-view': api({
    tagName: 'uib-calendar-year-view',
    purpose: 'Shows twelve selectable months for a parent-controlled year.',
    attributes: ['year', 'selected-month', 'css-class'],
    events: ['uib-calendar-month-select'],
    cssParts: ['card', 'header', 'title', 'subtitle', 'grid', 'month-button', 'selected-month'],
    examples: ['<uib-calendar-year-view year="2026" selected-month="8"></uib-calendar-year-view>']
  }),
  'uib-date-window-view': api({
    tagName: 'uib-date-window-view',
    purpose: 'Shows a contiguous window of selectable dates.',
    attributes: ['start-date', 'days', 'selected-date', 'css-class'],
    events: ['uib-calendar-date-select'],
    cssParts: ['card', 'header', 'title', 'subtitle', 'grid', 'date-button', 'selected-date', 'day-label', 'day-number'],
    examples: ['<uib-date-window-view start-date="2026-08-20" days="10" selected-date="2026-08-20"></uib-date-window-view>']
  }),
  'uib-day-of-week-view': api({
    tagName: 'uib-day-of-week-view',
    purpose: 'Shows repeated instances of one weekday and optional paging requests.',
    attributes: ['day-of-week', 'start-date', 'count', 'selected-date', 'min-date', 'max-date', 'show-paging', 'css-class'],
    events: ['uib-calendar-date-select', 'uib-calendar-page-request'],
    cssParts: ['card', 'header', 'title', 'subtitle', 'pager', 'page-button', 'grid', 'date-button', 'selected-date', 'day-label', 'day-number'],
    examples: ['<uib-day-of-week-view day-of-week="4" start-date="2026-08-20" count="8" selected-date="2026-08-20" show-paging></uib-day-of-week-view>']
  })
};

export const UI_BASE_CALENDAR_COMPONENTS = Object.values(CALENDAR_COMPONENT_API).map((componentApi) => createComponentMetadata({
  ...componentApi,
  attributes: componentApi.attributes.map((entry) => entry.name),
  properties: componentApi.properties.map((entry) => entry.name),
  events: componentApi.events.map((entry) => entry.name),
  slots: componentApi.slots.map((entry) => entry.name),
  cssParts: componentApi.cssParts.map((entry) => entry.name),
  cssVariables: componentApi.cssVariables.map((entry) => entry.name)
}));
