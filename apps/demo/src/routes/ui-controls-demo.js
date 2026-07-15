import { appendEventLog, checkboxField, escapeHtml, field, selectField, setBooleanAttribute, setOrRemoveAttribute } from './demo-utils.js';

function usageBlock() {
  return `
    <section class="card controls-usage-card">
      <div class="card-content">
        <h2>Package usage</h2>
        <pre class="code-block"><code>${escapeHtml(`<script type="module">
  import '@ui.base/ui';
</script>

<uib-toggle
  name="hasParking"
  label="Parking available"
  help="Use N/A when parking information has not been verified.">
</uib-toggle>

<uib-checkbox
  name="photoConsent"
  label="Photo consent received"
  help="Checkbox values are always true or false.">
</uib-checkbox>

<script>
  document.addEventListener('change', (event) => {
    if (!event.target.matches('uib-toggle, uib-checkbox')) return;
    console.log(event.detail.name, event.detail.oldValue, event.detail.newValue);
  });
</script>`)}</code></pre>
      </div>
    </section>
  `;
}

function applyControlOptions(main) {
  const toggle = main.querySelector('#playgroundToggle');
  const checkbox = main.querySelector('#playgroundCheckbox');
  setOrRemoveAttribute(toggle, 'name', main.querySelector('#controlName')?.value);
  setOrRemoveAttribute(toggle, 'label', main.querySelector('#controlLabel')?.value);
  setOrRemoveAttribute(toggle, 'help', main.querySelector('#controlHelp')?.value);
  setOrRemoveAttribute(toggle, 'help-mode', main.querySelector('#controlHelpMode')?.value);
  setOrRemoveAttribute(toggle, 'labels', main.querySelector('#toggleLabels')?.value);
  setBooleanAttribute(toggle, 'required', main.querySelector('#controlRequired')?.checked);
  setBooleanAttribute(toggle, 'disabled', main.querySelector('#controlDisabled')?.checked);
  setBooleanAttribute(toggle, 'readonly', main.querySelector('#controlReadonly')?.checked);
  setBooleanAttribute(toggle, 'invalid', main.querySelector('#controlInvalid')?.checked);
  setOrRemoveAttribute(toggle, 'error', main.querySelector('#controlError')?.value);

  setOrRemoveAttribute(checkbox, 'name', main.querySelector('#checkboxName')?.value);
  setOrRemoveAttribute(checkbox, 'label', main.querySelector('#checkboxLabel')?.value);
  setOrRemoveAttribute(checkbox, 'help', main.querySelector('#checkboxHelp')?.value);
  setOrRemoveAttribute(checkbox, 'help-mode', main.querySelector('#controlHelpMode')?.value);
  setBooleanAttribute(checkbox, 'disabled', main.querySelector('#controlDisabled')?.checked);
  setBooleanAttribute(checkbox, 'readonly', main.querySelector('#controlReadonly')?.checked);
  setBooleanAttribute(checkbox, 'invalid', main.querySelector('#controlInvalid')?.checked);
  setOrRemoveAttribute(checkbox, 'error', main.querySelector('#controlError')?.value);

  const markup = main.querySelector('#uiControlsMarkup');
  if (markup) {
    markup.textContent = `<uib-toggle\n  name="${toggle.getAttribute('name') || ''}"\n  label="${toggle.getAttribute('label') || ''}"\n  help="${toggle.getAttribute('help') || ''}"\n  labels="${toggle.getAttribute('labels') || ''}"${toggle.hasAttribute('required') ? '\n  required' : ''}${toggle.hasAttribute('disabled') ? '\n  disabled' : ''}${toggle.hasAttribute('readonly') ? '\n  readonly' : ''}\n></uib-toggle>\n\n<uib-checkbox\n  name="${checkbox.getAttribute('name') || ''}"\n  label="${checkbox.getAttribute('label') || ''}"\n></uib-checkbox>`;
  }
}

function bindUiControlsDemo(main) {
  const status = main.querySelector('#uiControlsStatus');
  const eventLog = main.querySelector('#uiControlsEventLog');

  [
    'controlName', 'controlLabel', 'controlHelp', 'controlHelpMode', 'toggleLabels', 'controlRequired', 'controlDisabled', 'controlReadonly', 'controlInvalid', 'controlError',
    'checkboxName', 'checkboxLabel', 'checkboxHelp'
  ].forEach((id) => {
    const input = main.querySelector(`#${id}`);
    const eventName = input?.type === 'checkbox' || input?.tagName === 'SELECT' ? 'change' : 'input';
    input?.addEventListener(eventName, () => {
      applyControlOptions(main);
      status.textContent = `Applied option: ${id}.`;
    });
  });

  main.addEventListener('change', (event) => {
    if (!event.target.matches?.('uib-toggle, uib-checkbox')) return;
    const detail = event.detail || {};
    const tag = event.target.tagName.toLowerCase();
    status.textContent = `Event received from ${tag}: ${JSON.stringify(detail)}`;
    appendEventLog(eventLog, 'change', detail, { tag });
  });

  main.querySelector('[data-set-sample-values]')?.addEventListener('click', () => {
    main.querySelector('#tourPublishedToggle').value = true;
    main.querySelector('#requiresEscortToggle').value = false;
    main.querySelector('#customLabelToggle').value = false;
    main.querySelector('#photoConsentCheckbox').value = true;
    main.querySelector('#accessibleSeatingCheckbox').value = false;
    main.querySelector('#playgroundToggle').value = true;
    main.querySelector('#playgroundCheckbox').value = true;
    status.textContent = 'Parent set sample values programmatically. Programmatic property updates do not emit change events.';
    appendEventLog(eventLog, 'parent-set-values', { note: 'sample values set programmatically' });
  });

  main.querySelector('[data-reset-sample-values]')?.addEventListener('click', () => {
    main.querySelector('#tourPublishedToggle').value = null;
    main.querySelector('#requiresEscortToggle').value = false;
    main.querySelector('#customLabelToggle').value = null;
    main.querySelector('#photoConsentCheckbox').value = false;
    main.querySelector('#accessibleSeatingCheckbox').value = false;
    main.querySelector('#playgroundToggle').value = null;
    main.querySelector('#playgroundCheckbox').value = false;
    status.textContent = 'Parent reset the controls to their default values.';
    appendEventLog(eventLog, 'parent-reset-values', { note: 'controls reset' });
  });

  main.querySelector('[data-reset-control-options]')?.addEventListener('click', () => {
    main.querySelector('#controlName').value = 'workflowApproved';
    main.querySelector('#controlLabel').value = 'Workflow approved';
    main.querySelector('#controlHelp').value = 'Use N/A when approval has not been reviewed.';
    main.querySelector('#controlHelpMode').value = 'tooltip';
    main.querySelector('#toggleLabels').value = 'N/A,Yes,No';
    main.querySelector('#controlRequired').checked = false;
    main.querySelector('#controlDisabled').checked = false;
    main.querySelector('#controlReadonly').checked = false;
    main.querySelector('#controlInvalid').checked = false;
    main.querySelector('#controlError').value = '';
    main.querySelector('#checkboxName').value = 'documentationComplete';
    main.querySelector('#checkboxLabel').value = 'Documentation complete';
    main.querySelector('#checkboxHelp').value = 'Checkbox values are true or false.';
    applyControlOptions(main);
    status.textContent = 'Control options reset.';
  });

  applyControlOptions(main);
}

export function renderUiControlsRoute(main) {
  main.innerHTML = `
    <section class="page-heading">
      <p class="eyebrow">@ui.base/ui</p>
      <h1>Accessible controls with live option testing.</h1>
      <p>Use this route to test labels, help text, required behavior, disabled/readonly/invalid states, custom toggle labels, parent-set values, and callback events.</p>
    </section>

    <section class="demo-layout controls-playground-layout">
      <aside class="card controls">
        <div class="card-content">
          <div class="controls-header">
            <h2>Control options</h2>
            <button class="secondary-button compact-control-button" type="button" data-reset-control-options>Reset</button>
          </div>
          <div class="form-grid">
            <fieldset class="control-section">
              <legend>Toggle options</legend>
              ${field('controlName', 'name', 'workflowApproved')}
              ${field('controlLabel', 'label', 'Workflow approved')}
              ${field('controlHelp', 'help', 'Use N/A when approval has not been reviewed.')}
              ${selectField('controlHelpMode', 'help-mode', ['tooltip', 'inline'], 'tooltip')}
              ${field('toggleLabels', 'labels', 'N/A,Yes,No')}
              ${checkboxField('controlRequired', 'required - remove N/A option', false)}
              ${checkboxField('controlDisabled', 'disabled', false)}
              ${checkboxField('controlReadonly', 'readonly', false)}
              ${checkboxField('controlInvalid', 'invalid', false)}
              ${field('controlError', 'error text', '')}
            </fieldset>
            <fieldset class="control-section">
              <legend>Checkbox options</legend>
              ${field('checkboxName', 'checkbox name', 'documentationComplete')}
              ${field('checkboxLabel', 'checkbox label', 'Documentation complete')}
              ${field('checkboxHelp', 'checkbox help', 'Checkbox values are true or false.')}
            </fieldset>
          </div>
          <details class="control-section" open>
            <summary><strong>Generated markup</strong></summary>
            <pre id="uiControlsMarkup" class="code-block"></pre>
          </details>
        </div>
      </aside>

      <section class="controls-playground-stage">
        <section class="controls-demo-layout">
          <article class="card controls-demo-card">
            <div class="card-content controls-demo-card__content">
              <div>
                <h2>Playground toggle</h2>
                <p class="muted">This instance is driven by the parent controls on the left.</p>
              </div>
              <uib-toggle id="playgroundToggle" name="workflowApproved" label="Workflow approved" help="Use N/A when approval has not been reviewed." labels="N/A,Yes,No"></uib-toggle>
            </div>
          </article>

          <article class="card controls-demo-card">
            <div class="card-content controls-demo-card__content">
              <div>
                <h2>Playground checkbox</h2>
                <p class="muted">The same disabled/readonly/invalid settings are applied here.</p>
              </div>
              <uib-checkbox id="playgroundCheckbox" name="documentationComplete" label="Documentation complete" help="Checkbox values are true or false."></uib-checkbox>
            </div>
          </article>

          <article class="card controls-demo-card">
            <div class="card-content controls-demo-card__content">
              <div>
                <h2>Three-way toggle</h2>
                <p class="muted">Default non-required value is <code>null</code>. Choices are <code>null</code>, <code>true</code>, and <code>false</code>.</p>
              </div>
              <uib-toggle id="tourPublishedToggle" name="published" label="Published" help="Use N/A when publication status has not been decided."></uib-toggle>
            </div>
          </article>

          <article class="card controls-demo-card">
            <div class="card-content controls-demo-card__content">
              <div>
                <h2>Required two-way toggle</h2>
                <p class="muted">When <code>required</code> is present, the toggle only allows <code>true</code> or <code>false</code> and defaults to <code>false</code>.</p>
              </div>
              <uib-toggle id="requiresEscortToggle" name="requiresEscort" label="Escort required" help="Required toggles have no N/A choice." required></uib-toggle>
            </div>
          </article>

          <article class="card controls-demo-card">
            <div class="card-content controls-demo-card__content">
              <div>
                <h2>Custom labels</h2>
                <p class="muted">Labels can be overridden with a comma-delimited list.</p>
              </div>
              <uib-toggle id="customLabelToggle" name="accessibilityAvailable" label="Accessibility available" labels="Not set,Yes,No" help-mode="inline" help="Inline help is also supported."></uib-toggle>
            </div>
          </article>

          <article class="card controls-demo-card">
            <div class="card-content controls-demo-card__content">
              <div>
                <h2>Checkbox examples</h2>
                <p class="muted">The checkbox value is always boolean. Default value is <code>false</code>.</p>
              </div>
              <div class="controls-checkbox-stack">
                <uib-checkbox id="photoConsentCheckbox" name="photoConsent" label="Photo consent received" help="Value is true only when checked."></uib-checkbox>
                <uib-checkbox id="accessibleSeatingCheckbox" name="accessibleSeating" help="Slotted text can be used as the visible label.">Accessible seating needed</uib-checkbox>
              </div>
            </div>
          </article>
        </section>

        <section class="card controls-event-card">
          <div class="card-content">
            <h2>Parent event handling</h2>
            <p class="muted">User changes emit a bubbling <code>change</code> event and a component-specific event. The event detail contains <code>name</code>, <code>oldValue</code>, and <code>newValue</code>.</p>
            <div class="button-row">
              <button class="primary-button" type="button" data-set-sample-values>Parent set sample values</button>
              <button class="secondary-button" type="button" data-reset-sample-values>Reset values</button>
            </div>
            <div id="uiControlsStatus" class="status-box">Change a toggle or checkbox to see event feedback here.</div>
            <pre id="uiControlsEventLog" class="code-block controls-event-log">{}</pre>
          </div>
        </section>
      </section>
    </section>

    ${usageBlock()}
  `;

  bindUiControlsDemo(main);
}
