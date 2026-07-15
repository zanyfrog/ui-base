import { appendEventLog, escapeHtml, field, serializeElement } from './demo-utils.js';

let CALENDAR_ROUTES = [
  { path: '/calendar-demo/day', label: 'Day View', description: 'Single date display.' },
  { path: '/calendar-demo/week', label: 'Week View', description: 'Seven consecutive days.' },
  { path: '/calendar-demo/month', label: 'Month View', description: 'Month grid.' },
  { path: '/calendar-demo/year', label: 'Year View', description: 'Month selection for a year.' },
  { path: '/calendar-demo/date-window', label: 'DateWindowView', description: 'N consecutive dates.' },
  { path: '/calendar-demo/day-of-week', label: 'DayOfWeekView', description: 'Only one weekday across weeks.' },
  { path: '/calendar-demo/day-of-week-paging', label: 'DayOfWeek Paging', description: 'Parent-controlled previous and next paging.' }
];

function routeList(currentPath) {
  return `
    <nav class="route-list" aria-label="Calendar examples">
      <a class="route-button" href="/calendar-demo/" data-link ${currentPath === '/calendar-demo' ? 'aria-current="page"' : ''}>Overview</a>
      ${CALENDAR_ROUTES.map((route) => `<a class="route-button" href="${route.path}" data-link ${currentPath === route.path ? 'aria-current="page"' : ''}>${route.label}</a>`).join('')}
    </nav>
  `;
}

function renderOverview(main, path) {
  main.innerHTML = `
    <section class="page-heading">
      <h1>Calendar Component Demo</h1>
      <p>Each calendar view is a child route under <code>/calendar-demo/</code>. Parent-state values are exposed as editable fields so users can test inputs, selection callbacks, paging callbacks, and generated markup.</p>
    </section>
    ${routeList(path)}
    <section class="route-grid" aria-label="Calendar child routes">
      ${CALENDAR_ROUTES.map((route) => `
        <a class="card home-card" href="${route.path}" data-link>
          <span>
            <h2>${route.label}</h2>
            <p>${route.description}</p>
          </span>
          <strong class="secondary-button">Open</strong>
        </a>
      `).join('')}
    </section>
  `;
}

function layout(main, path, title, description, controlsHtml, componentHtml) {
  main.innerHTML = `
    <section class="page-heading">
      <h1>${title}</h1>
      <p>${description}</p>
    </section>
    ${routeList(path)}
    <section class="demo-layout calendar-demo-layout">
      <aside class="card controls">
        <div class="card-content">
          <h2>Parent state controls</h2>
          <p class="helper-text">Change values to update attributes. Click dates/months to verify callback events. Parent code decides whether selected values update the component.</p>
          <div class="form-grid">${controlsHtml}</div>
          <div id="calendarStatus" class="status-box">Select a date or change a value to test parent-controlled state.</div>
          <details class="control-section" open>
            <summary><strong>Current markup</strong></summary>
            <pre id="calendarMarkup" class="code-block"></pre>
          </details>
          <details class="control-section" open>
            <summary><strong>Latest event</strong></summary>
            <pre id="calendarEventLog" class="code-block">{}</pre>
          </details>
        </div>
      </aside>
      <section class="card calendar-stage">
        <div class="card-content stack-block">
          ${componentHtml}
          <section class="usage-note">
            <h2>Usage</h2>
            <pre class="code-block"><code>${escapeHtml('<uib-calendar-month-view year="2026" month="7" selected-date="2026-07-07"></uib-calendar-month-view>\n\n<script>\n  calendar.addEventListener(\'uib-calendar-date-select\', (event) => {\n    calendar.setAttribute(\'selected-date\', event.detail.date);\n  });\n</script>')}</code></pre>
          </section>
        </div>
      </section>
    </section>
  `;
}

function status(main, text) {
  const target = main.querySelector('#calendarStatus');
  if (target) target.textContent = text;
}

function updateMarkup(main, element) {
  const output = main.querySelector('#calendarMarkup');
  if (output) output.textContent = serializeElement(element);
}

function bindTextControl(main, id, element, attrName, message) {
  const input = main.querySelector(`#${id}`);
  input?.addEventListener('input', () => {
    element.setAttribute(attrName, input.value);
    updateMarkup(main, element);
    status(main, message || `${attrName} changed to ${input.value || 'not set'}.`);
  });
  return input;
}

function bindCalendarEvents(main, element, selectedInput, selectedAttr = 'selected-date') {
  const eventLog = main.querySelector('#calendarEventLog');
  element.addEventListener('uib-calendar-date-select', (event) => {
    if (selectedInput) selectedInput.value = event.detail.date;
    if (selectedAttr) element.setAttribute(selectedAttr, event.detail.date);
    updateMarkup(main, element);
    status(main, `Selected date: ${event.detail.date}`);
    appendEventLog(eventLog, 'uib-calendar-date-select', event.detail);
  });
  element.addEventListener('uib-calendar-month-select', (event) => {
    status(main, `Selected month: ${event.detail.month}, year: ${event.detail.year}`);
    appendEventLog(eventLog, 'uib-calendar-month-select', event.detail);
  });
  element.addEventListener('uib-calendar-page-request', (event) => {
    appendEventLog(eventLog, 'uib-calendar-page-request', event.detail);
  });
  updateMarkup(main, element);
}

function renderDay(main, path) {
  layout(
    main,
    path,
    'Day View',
    'A single date component. The parent owns the date value and decides what happens when the date is selected.',
    field('date', 'date', '2026-07-07', 'date'),
    '<uib-calendar-day-view id="calendarExample" date="2026-07-07"></uib-calendar-day-view>'
  );
  const element = main.querySelector('#calendarExample');
  const dateInput = bindTextControl(main, 'date', element, 'date');
  bindCalendarEvents(main, element, dateInput, 'date');
}

function renderWeek(main, path) {
  layout(
    main,
    path,
    'Week View',
    'Shows seven consecutive days. The selected date is parent-controlled and updates after a date selection event.',
    field('startDate', 'start-date', '2026-07-05', 'date') + field('selectedDate', 'selected-date', '2026-07-07', 'date'),
    '<uib-calendar-week-view id="calendarExample" start-date="2026-07-05" selected-date="2026-07-07"></uib-calendar-week-view>'
  );
  const element = main.querySelector('#calendarExample');
  const selectedInput = bindTextControl(main, 'selectedDate', element, 'selected-date');
  bindTextControl(main, 'startDate', element, 'start-date');
  bindCalendarEvents(main, element, selectedInput);
}

function renderMonth(main, path) {
  layout(
    main,
    path,
    'Month View',
    'Shows a month grid. The parent controls year, month, and selected date.',
    field('year', 'year', '2026', 'number') + field('month', 'month', '7', 'number') + field('selectedDate', 'selected-date', '2026-07-07', 'date'),
    '<uib-calendar-month-view id="calendarExample" year="2026" month="7" selected-date="2026-07-07"></uib-calendar-month-view>'
  );
  const element = main.querySelector('#calendarExample');
  const selectedInput = bindTextControl(main, 'selectedDate', element, 'selected-date');
  bindTextControl(main, 'year', element, 'year');
  bindTextControl(main, 'month', element, 'month');
  bindCalendarEvents(main, element, selectedInput);
}

function renderYear(main, path) {
  layout(
    main,
    path,
    'Year View',
    'Shows all months in a year. The parent decides whether month selection routes to a month view or updates state.',
    field('year', 'year', '2026', 'number') + field('selectedMonth', 'selected-month', '7', 'number'),
    '<uib-calendar-year-view id="calendarExample" year="2026" selected-month="7"></uib-calendar-year-view>'
  );
  const element = main.querySelector('#calendarExample');
  const selectedInput = bindTextControl(main, 'selectedMonth', element, 'selected-month');
  bindTextControl(main, 'year', element, 'year');
  element.addEventListener('uib-calendar-month-select', (event) => {
    selectedInput.value = event.detail.month;
    element.setAttribute('selected-month', event.detail.month);
    updateMarkup(main, element);
    status(main, `Selected month: ${event.detail.month}, year: ${event.detail.year}`);
    appendEventLog(main.querySelector('#calendarEventLog'), 'uib-calendar-month-select', event.detail);
  });
  updateMarkup(main, element);
}

function renderDateWindow(main, path) {
  layout(
    main,
    path,
    'DateWindowView',
    'Shows a contiguous window of dates. This is not the same as DayOfWeekView because it includes every consecutive day.',
    field('startDate', 'start-date', '2026-07-01', 'date') + field('days', 'days', '10', 'number') + field('selectedDate', 'selected-date', '2026-07-07', 'date'),
    '<uib-date-window-view id="calendarExample" start-date="2026-07-01" days="10" selected-date="2026-07-07"></uib-date-window-view>'
  );
  const element = main.querySelector('#calendarExample');
  const selectedInput = bindTextControl(main, 'selectedDate', element, 'selected-date');
  bindTextControl(main, 'startDate', element, 'start-date');
  bindTextControl(main, 'days', element, 'days');
  bindCalendarEvents(main, element, selectedInput);
}

function renderDayOfWeek(main, path, withPaging = false) {
  const title = withPaging ? 'DayOfWeekView With Previous/Next Paging' : 'DayOfWeekView';
  const description = withPaging
    ? 'Shows only one weekday and emits paging requests. The parent decides whether to update start-date. Buttons are disabled before the earliest week and after the latest week.'
    : 'Shows only one day of the week across multiple weeks. This is not the same as DateWindowView because non-matching weekdays are excluded.';
  const controls =
    field('dayOfWeek', 'day-of-week (0 Sun, 2 Tue)', '2', 'number') +
    field('startDate', 'start-date', withPaging ? '2026-07-07' : '2026-07-01', 'date') +
    field('count', 'count', withPaging ? '4' : '8', 'number') +
    field('selectedDate', 'selected-date', '2026-07-07', 'date') +
    (withPaging ? field('minDate', 'min-date', '2026-06-16', 'date') + field('maxDate', 'max-date', '2026-08-25', 'date') : '');
  const attrs = withPaging
    ? 'day-of-week="2" start-date="2026-07-07" count="4" selected-date="2026-07-07" min-date="2026-06-16" max-date="2026-08-25" show-paging="true"'
    : 'day-of-week="2" start-date="2026-07-01" count="8" selected-date="2026-07-07"';

  layout(main, path, title, description, controls, `<uib-day-of-week-view id="calendarExample" ${attrs}></uib-day-of-week-view>`);
  const element = main.querySelector('#calendarExample');
  const selectedInput = bindTextControl(main, 'selectedDate', element, 'selected-date');
  const startInput = bindTextControl(main, 'startDate', element, 'start-date');
  bindTextControl(main, 'dayOfWeek', element, 'day-of-week');
  bindTextControl(main, 'count', element, 'count');

  if (withPaging) {
    bindTextControl(main, 'minDate', element, 'min-date');
    bindTextControl(main, 'maxDate', element, 'max-date');
  }

  bindCalendarEvents(main, element, selectedInput);

  element.addEventListener('uib-calendar-page-request', (event) => {
    startInput.value = event.detail.nextStartDate;
    element.setAttribute('start-date', event.detail.nextStartDate);
    updateMarkup(main, element);
    status(main, `Parent accepted ${event.detail.direction} page request. New start-date: ${event.detail.nextStartDate}`);
    appendEventLog(main.querySelector('#calendarEventLog'), 'uib-calendar-page-request', event.detail);
  });
}

export function renderCalendarRoute(main, path, routes = CALENDAR_ROUTES) {
  CALENDAR_ROUTES = routes;
  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  if (normalized === '/calendar-demo') return renderOverview(main, normalized);
  if (normalized === '/calendar-demo/day') return renderDay(main, normalized);
  if (normalized === '/calendar-demo/week') return renderWeek(main, normalized);
  if (normalized === '/calendar-demo/month') return renderMonth(main, normalized);
  if (normalized === '/calendar-demo/year') return renderYear(main, normalized);
  if (normalized === '/calendar-demo/date-window') return renderDateWindow(main, normalized);
  if (normalized === '/calendar-demo/day-of-week') return renderDayOfWeek(main, normalized, false);
  if (normalized === '/calendar-demo/day-of-week-paging') return renderDayOfWeek(main, normalized, true);
  return renderOverview(main, '/calendar-demo');
}
