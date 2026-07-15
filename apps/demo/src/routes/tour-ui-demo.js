import { appendEventLog, checkboxField, escapeAttr, escapeHtml, field, numberField, selectField, serializeElement, setBooleanAttribute, setOrRemoveAttribute, textareaField } from './demo-utils.js';

const TOUR_COMPONENTS = [
  { key: 'new-reservation', path: '/tour-ui/new-reservation', tag: 'uib-new-reservation', title: 'New Reservation', heading: 'Create a new reservation', eyebrow: 'Start', description: 'Choose a location, date, time, and visitor details for a public workflow.', actionLabel: 'Start New Reservation', toastMessage: 'New reservation component called. Start the booking flow.', variant: 'new' },
  { key: 'cancel-reservation', path: '/tour-ui/cancel-reservation', tag: 'uib-cancel-reservation', title: 'Cancel Reservation', heading: 'Cancel a reservation', eyebrow: 'Cancel', description: 'Cancel a scheduled visit or workflow using a confirmation number and contact information.', actionLabel: 'Cancel Reservation', toastMessage: 'Cancel reservation component called. Open the cancellation flow.', variant: 'cancel' },
  { key: 'find-reservation', path: '/tour-ui/find-reservation', tag: 'uib-find-reservation', title: 'Find Reservation', heading: 'Find an existing reservation', eyebrow: 'Lookup', description: 'Look up a scheduled reservation by confirmation number, email, or visitor details.', actionLabel: 'Find Reservation', toastMessage: 'Find reservation component called. Open the lookup flow.', variant: 'find' },
  { key: 'book-group-reservation', path: '/tour-ui/book-group-reservation', tag: 'uib-book-group-reservation', title: 'Book Group Reservation', heading: 'Book a group reservation', eyebrow: 'Group', description: 'Request a guided workflow for a school, agency, organization, or larger visitor group.', actionLabel: 'Book Group Reservation', toastMessage: 'Book group reservation component called. Open the group booking flow.', variant: 'group' }
];

function routeList(currentPath) {
  const normalized = currentPath.endsWith('/') && currentPath.length > 1 ? currentPath.slice(0, -1) : currentPath;
  return `
    <nav class="route-list" aria-label="Action component examples">
      <a class="route-button" href="/tour-ui/" data-link ${normalized === '/tour-ui' ? 'aria-current="page"' : ''}>All Actions</a>
      ${TOUR_COMPONENTS.map((item) => `<a class="route-button" href="${item.path}" data-link ${normalized === item.path ? 'aria-current="page"' : ''}>${item.title}</a>`).join('')}
    </nav>
  `;
}

function componentMarkup(item, id = item.key) {
  return `<${item.tag} id="${escapeAttr(id)}" heading="${escapeAttr(item.heading)}" eyebrow="${escapeAttr(item.eyebrow)}" description="${escapeAttr(item.description)}" action-label="${escapeAttr(item.actionLabel)}" toast-message="${escapeAttr(item.toastMessage)}" variant="${escapeAttr(item.variant)}"></${item.tag}>`;
}

function usageBlock() {
  return `
    <section class="card tour-usage-card">
      <div class="card-content">
        <h2>Package usage</h2>
        <pre class="code-block"><code>${escapeHtml(`<script type="module">
  import '@ui.base/tour-ui';
</script>

<uib-new-reservation
  heading="Create a new reservation"
  action-label="Start"
  toast-message="Workflow opened">
</uib-new-reservation>

<script>
  const action = document.querySelector('uib-new-reservation');
  action.addEventListener('uib-tour-reservation-action', (event) => {
    console.log(event.detail.action, event.detail.label);
  });
  action.call({ trigger: 'parent-button' });
</script>`)}</code></pre>
      </div>
    </section>
  `;
}

function controlsHtml(item) {
  return `
    <fieldset class="control-section">
      <legend>Text and display</legend>
      ${field('tourHeading', 'heading', item.heading)}
      ${field('tourEyebrow', 'eyebrow', item.eyebrow)}
      ${textareaField('tourDescription', 'description', item.description)}
      ${field('tourActionLabel', 'action-label', item.actionLabel)}
      ${field('tourToastMessage', 'toast-message', item.toastMessage)}
      ${numberField('tourToastDuration', 'toast-duration milliseconds', '4200')}
      ${selectField('tourVariant', 'variant', ['new', 'cancel', 'find', 'group'], item.variant)}
      ${checkboxField('tourDisabled', 'disabled', false)}
    </fieldset>
  `;
}

function applyTourOptions(main) {
  const targets = [...main.querySelectorAll('[data-tour-demo-component]')];
  targets.forEach((component) => {
    setOrRemoveAttribute(component, 'heading', main.querySelector('#tourHeading')?.value);
    setOrRemoveAttribute(component, 'eyebrow', main.querySelector('#tourEyebrow')?.value);
    setOrRemoveAttribute(component, 'description', main.querySelector('#tourDescription')?.value);
    setOrRemoveAttribute(component, 'action-label', main.querySelector('#tourActionLabel')?.value);
    setOrRemoveAttribute(component, 'toast-message', main.querySelector('#tourToastMessage')?.value);
    setOrRemoveAttribute(component, 'toast-duration', main.querySelector('#tourToastDuration')?.value);
    setOrRemoveAttribute(component, 'variant', main.querySelector('#tourVariant')?.value);
    setBooleanAttribute(component, 'disabled', main.querySelector('#tourDisabled')?.checked);
  });
  const output = main.querySelector('#tourUiMarkup');
  if (output) output.textContent = targets.map((target) => serializeElement(target)).join('\n\n');
}

function bindTourDemo(main) {
  const status = main.querySelector('#tourUiStatus');
  const log = main.querySelector('#tourUiEventLog');

  ['tourHeading', 'tourEyebrow', 'tourDescription', 'tourActionLabel', 'tourToastMessage', 'tourToastDuration', 'tourVariant', 'tourDisabled'].forEach((id) => {
    const input = main.querySelector(`#${id}`);
    const eventName = input?.type === 'checkbox' || input?.tagName === 'SELECT' ? 'change' : 'input';
    input?.addEventListener(eventName, () => {
      applyTourOptions(main);
      if (status) status.textContent = `Applied ${id} to the mounted component.`;
    });
  });

  main.addEventListener('uib-tour-reservation-action', (event) => {
    const { action, label, disabled } = event.detail;
    if (status) status.textContent = `Event received: ${action}. Label: ${label}. Disabled: ${disabled}. The parent page can route, open a modal, or call an API from here.`;
    appendEventLog(log, 'uib-tour-reservation-action', event.detail);
  });

  main.addEventListener('uib-tour-toast-show', (event) => appendEventLog(log, 'uib-tour-toast-show', event.detail));

  main.querySelectorAll('[data-call-tour-component]').forEach((button) => {
    button.addEventListener('click', () => {
      const selector = button.getAttribute('data-call-tour-component');
      const component = main.querySelector(selector);
      if (!component || typeof component.call !== 'function') {
        if (status) status.textContent = `Could not find ${selector} or it does not expose call().`;
        return;
      }
      const detail = component.call({ trigger: 'parent-button', sourceRoute: window.location.pathname });
      appendEventLog(log, 'parent-call-return', detail);
    });
  });

  main.querySelectorAll('[data-show-toast]').forEach((button) => {
    button.addEventListener('click', () => {
      const selector = button.getAttribute('data-show-toast');
      const component = main.querySelector(selector);
      component?.showToast?.(`Toast manually shown by parent at ${new Date().toLocaleTimeString()}`, 2500);
    });
  });

  applyTourOptions(main);
}

function renderIndex(main, path) {
  const first = TOUR_COMPONENTS[0];
  main.innerHTML = `
    <section class="page-heading">
      <h1>Action Components</h1>
      <p>The <code>@ui.base/tour-ui</code> package contains reusable workflow action components. Each component displays a toast-style alert when clicked or when called programmatically by parent state. Use the controls to test labels, descriptions, variants, disabled state, toast duration, and callbacks.</p>
    </section>
    ${routeList(path)}
    <section class="demo-layout tour-demo-layout">
      <aside class="card controls">
        <div class="card-content">
          <h2>Shared action controls</h2>
          <p class="helper-text">These options apply to all mounted action components on this route.</p>
          <div class="form-grid">${controlsHtml(first)}</div>
          <details class="control-section" open>
            <summary><strong>Generated markup</strong></summary>
            <pre id="tourUiMarkup" class="code-block"></pre>
          </details>
        </div>
      </aside>
      <section class="tour-stage">
        <section class="tour-component-grid" aria-label="Action components">
          ${TOUR_COMPONENTS.map((item) => componentMarkup(item).replace(' id=', ' data-tour-demo-component id=')).join('')}
        </section>
        <section class="card tour-call-card">
          <div class="card-content">
            <h2>Call components from the parent page</h2>
            <p class="muted">These buttons demonstrate parent-controlled calls to each Web Component's <code>call()</code> and <code>showToast()</code> methods. The component emits events either way.</p>
            <div class="button-row">
              ${TOUR_COMPONENTS.map((item) => `<button class="secondary-button" type="button" data-call-tour-component="#${item.key}">Call ${item.title}</button>`).join('')}
              ${TOUR_COMPONENTS.map((item) => `<button class="secondary-button" type="button" data-show-toast="#${item.key}">Show ${item.title} toast</button>`).join('')}
            </div>
            <div id="tourUiStatus" class="status-box">Call or click a component to see event feedback here.</div>
            <pre id="tourUiEventLog" class="code-block controls-event-log">{}</pre>
          </div>
        </section>
      </section>
    </section>
    ${usageBlock()}
  `;
  bindTourDemo(main);
}

function renderSingle(main, path, item) {
  const id = item.key;
  main.innerHTML = `
    <section class="page-heading">
      <h1>${item.title}</h1>
      <p>This route isolates the <code>&lt;${item.tag}&gt;</code> component. Change the controls, click the component button, call it from parent code, and inspect the callback payload.</p>
    </section>
    ${routeList(path)}
    <section class="demo-layout tour-demo-layout">
      <aside class="card controls">
        <div class="card-content">
          <h2>${item.title} options</h2>
          <div class="form-grid">${controlsHtml(item)}</div>
          <details class="control-section" open>
            <summary><strong>Generated markup</strong></summary>
            <pre id="tourUiMarkup" class="code-block"></pre>
          </details>
        </div>
      </aside>
      <section class="tour-stage">
        <section class="single-tour-component-layout">
          ${componentMarkup(item, id).replace(' id=', ' data-tour-demo-component id=')}
          <section class="card tour-call-card">
            <div class="card-content">
              <h2>Parent state call</h2>
              <p class="muted">The parent page can call the component directly with <code>element.call()</code>, show a toast with <code>element.showToast()</code>, then listen for the reservation event.</p>
              <div class="button-row">
                <button class="primary-button" type="button" data-call-tour-component="#${id}">Call ${item.title}</button>
                <button class="secondary-button" type="button" data-show-toast="#${id}">Show toast only</button>
                <a class="secondary-button" href="/tour-ui/" data-link>Back to all Actions</a>
              </div>
              <div id="tourUiStatus" class="status-box">Call or click the component to see event feedback here.</div>
              <pre id="tourUiEventLog" class="code-block controls-event-log">{}</pre>
            </div>
          </section>
        </section>
      </section>
    </section>
    ${usageBlock()}
  `;
  bindTourDemo(main);
}

export function renderTourUiRoute(main, path) {
  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

  if (normalized === '/tour-ui') {
    renderIndex(main, normalized);
    return;
  }

  const item = TOUR_COMPONENTS.find((component) => component.path === normalized);
  if (item) {
    renderSingle(main, normalized, item);
    return;
  }

  main.innerHTML = `
    <section class="page-heading">
      <h1>Action route not found</h1>
      <p>The requested action route was not found. Use one of the supported routes below.</p>
    </section>
    ${routeList('/tour-ui')}
  `;
}
