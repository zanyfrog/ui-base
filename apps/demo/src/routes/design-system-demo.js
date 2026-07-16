import { checkboxField, escapeHtml, field, selectField, setStatus } from './demo-utils.js';

const TOKEN_DEFAULTS = {
  primary: '#174a8b',
  accent: '#f4bd46',
  surface: '#ffffff',
  background: '#eef4fb',
  text: '#13294b',
  radius: '20px',
  density: 'comfortable'
};

function tokenControls() {
  return field('tokenPrimary', '--uib-color-primary', TOKEN_DEFAULTS.primary, 'color') +
    field('tokenAccent', '--uib-color-accent', TOKEN_DEFAULTS.accent, 'color') +
    field('tokenSurface', '--uib-color-surface', TOKEN_DEFAULTS.surface, 'color') +
    field('tokenBackground', '--uib-color-background', TOKEN_DEFAULTS.background, 'color') +
    field('tokenText', '--uib-color-ink', TOKEN_DEFAULTS.text, 'color') +
    selectField('tokenRadius', 'Corner radius', ['8px', '12px', '16px', '20px', '28px'], TOKEN_DEFAULTS.radius) +
    selectField('tokenDensity', 'Density', [
      { value: 'comfortable', label: 'comfortable' },
      { value: 'compact', label: 'compact' },
      { value: 'spacious', label: 'spacious' }
    ], TOKEN_DEFAULTS.density) +
    checkboxField('tokenDarkPreview', 'Preview dark surface', false);
}

function applyTokens(main) {
  const preview = main.querySelector('#tokenPreview');
  if (!preview) return;
  const density = main.querySelector('#tokenDensity')?.value || TOKEN_DEFAULTS.density;
  const gap = density === 'compact' ? '.6rem' : density === 'spacious' ? '1.4rem' : '1rem';
  const controlHeight = density === 'compact' ? '2.15rem' : density === 'spacious' ? '3.15rem' : '2.65rem';
  const surface = main.querySelector('#tokenSurface')?.value || TOKEN_DEFAULTS.surface;
  const background = main.querySelector('#tokenBackground')?.value || TOKEN_DEFAULTS.background;
  const text = main.querySelector('#tokenText')?.value || TOKEN_DEFAULTS.text;
  const isDark = main.querySelector('#tokenDarkPreview')?.checked;

  preview.style.setProperty('--uib-color-primary', main.querySelector('#tokenPrimary')?.value || TOKEN_DEFAULTS.primary);
  preview.style.setProperty('--uib-color-accent', main.querySelector('#tokenAccent')?.value || TOKEN_DEFAULTS.accent);
  preview.style.setProperty('--uib-color-surface', isDark ? '#0f1d33' : surface);
  preview.style.setProperty('--uib-color-background', isDark ? '#07111f' : background);
  preview.style.setProperty('--uib-color-ink', isDark ? '#f4f8ff' : text);
  preview.style.setProperty('--uib-color-muted', isDark ? '#b8c7dc' : '#53657f');
  preview.style.setProperty('--uib-color-border-strong', isDark ? '#40516f' : '#aab8cc');
  preview.style.setProperty('--uib-radius-md', main.querySelector('#tokenRadius')?.value || TOKEN_DEFAULTS.radius);
  preview.style.setProperty('--uib-radius-lg', main.querySelector('#tokenRadius')?.value || TOKEN_DEFAULTS.radius);
  preview.style.setProperty('--uib-size-control-height-md', controlHeight);
  preview.style.setProperty('--uib-forms-form-gap', gap);
  preview.style.background = `var(--uib-color-background)`;
  preview.style.color = `var(--uib-color-ink)`;

  const css = `:root {\n  --uib-color-primary: ${main.querySelector('#tokenPrimary')?.value};\n  --uib-color-accent: ${main.querySelector('#tokenAccent')?.value};\n  --uib-color-surface: ${isDark ? '#0f1d33' : surface};\n  --uib-color-background: ${isDark ? '#07111f' : background};\n  --uib-color-ink: ${isDark ? '#f4f8ff' : text};\n  --uib-radius-md: ${main.querySelector('#tokenRadius')?.value};\n  --uib-size-control-height-md: ${controlHeight};\n}`;
  const output = main.querySelector('#tokenCssOutput');
  if (output) output.textContent = css;
  setStatus(main, `Token preview updated using ${density} density.`, '#tokenStatus');
}

function bindDesignSystem(main) {
  ['tokenPrimary', 'tokenAccent', 'tokenSurface', 'tokenBackground', 'tokenText', 'tokenRadius', 'tokenDensity', 'tokenDarkPreview'].forEach((id) => {
    const input = main.querySelector(`#${id}`);
    const eventName = input?.type === 'checkbox' || input?.tagName === 'SELECT' ? 'change' : 'input';
    input?.addEventListener(eventName, () => applyTokens(main));
  });

  main.querySelector('[data-reset-tokens]')?.addEventListener('click', () => {
    main.querySelector('#tokenPrimary').value = TOKEN_DEFAULTS.primary;
    main.querySelector('#tokenAccent').value = TOKEN_DEFAULTS.accent;
    main.querySelector('#tokenSurface').value = TOKEN_DEFAULTS.surface;
    main.querySelector('#tokenBackground').value = TOKEN_DEFAULTS.background;
    main.querySelector('#tokenText').value = TOKEN_DEFAULTS.text;
    main.querySelector('#tokenRadius').value = TOKEN_DEFAULTS.radius;
    main.querySelector('#tokenDensity').value = TOKEN_DEFAULTS.density;
    main.querySelector('#tokenDarkPreview').checked = false;
    applyTokens(main);
  });

  main.querySelector('#tokenPreview')?.addEventListener('uib-action-button-click', (event) => {
    event.preventDefault();
    setStatus(main, `Action callback received: ${event.detail.label} / ${event.detail.actionToken || 'no token'}.`, '#tokenStatus');
  });

  applyTokens(main);
}

export function renderDesignSystemRoute(main) {
  main.innerHTML = `
    <section class="page-heading">
      <p class="eyebrow">
        UI Base Design System
      </p>
      <h1>
        Standards and live token testing for consistent applications.
      </h1>
      <p>
        The design system defines the shared language for every package: accessibility, tokens, component maturity, event names, slots, CSS parts, validation, localization, and documentation.
      </p>
    </section>
    <section class="demo-layout token-playground-layout">
      <aside class="card controls">
        <div class="card-content">
          <h2>
            Theme token controls
          </h2>
          <p class="helper-text">
            Change colors, radius, density, and surface mode. The preview updates by setting CSS custom properties on a parent container, which is the same pattern consuming apps should use.
          </p>
          <div class="form-grid">
            ${tokenControls()}
          </div>
          <div class="button-row" style="margin-top: 1rem;">
            <button class="secondary-button" type="button" data-reset-tokens>
              Reset tokens
            </button>
          </div>
          <div id="tokenStatus" class="status-box">
            Change a token to update the preview.
          </div>
          <pre id="tokenCssOutput" class="code-block">
          </pre>
        </div>
      </aside>
      <section id="tokenPreview" class="card token-preview-stage" aria-label="Live token preview">
        <div class="card-content token-preview-content">
          <uib-heading-block eyebrow="Token preview" headline="Reusable components inherit parent tokens" subheadline="This preview uses CSS variables only. No component source changes are needed." body="Use this route to test whether a proposed theme still works for headings, actions, media, details, and form controls." size="compact">
          </uib-heading-block>
          <uib-action-group actions='[{"label":"Run callback","variant":"primary","actionToken":"TOKEN_CALLBACK"},{"label":"Secondary link","variant":"secondary","href":"#token-preview"},{"label":"Text action","variant":"tertiary","actionToken":"TEXT_ACTION"}]'>
          </uib-action-group>
          <uib-grid min="14rem">
            <uib-card label="Card surface">
              <p>
                Card body text should remain readable against the selected surface.
              </p>
            </uib-card>
            <uib-panel label="Panel surface">
              <p>
                Panel content inherits the same token values.
              </p>
            </uib-panel>
            <uib-forms-form name="tokenSample" label="Token sample form" submit-label="Submit sample">
              <uib-forms-textbox name="sampleLabel" label="Editable label" value="Sample value">
              </uib-forms-textbox>
              <uib-forms-select name="sampleOption" label="Display option" options="Default,Compact,Expanded">
              </uib-forms-select>
            </uib-forms-form>
          </uib-grid>
        </div>
      </section>
    </section>
    <section class="docs-grid" style="margin-top: 1rem;">
      <article class="card doc-card">
        <div class="card-content">
          <h2>
            Principles
          </h2>
          <ul>
            <li>
              Accessible by default.
            </li>
            <li>
              Framework-neutral Web Components.
            </li>
            <li>
              Convention over configuration.
            </li>
            <li>
              Responsive by default.
            </li>
            <li>
              Themeable by CSS tokens.
            </li>
          </ul>
        </div>
      </article>
      <article class="card doc-card">
        <div class="card-content">
          <h2>
            Common attributes
          </h2>
          <p>
            Components use a shared base API where applicable.
          </p>
          <pre class="code-block">
            <code>
              ${escapeHtml('id, name, label, help, help-mode, title,\ndisabled, readonly, required, hidden,\ninvalid, error, class, style,\naria-label, aria-describedby')}
            </code>
          </pre>
        </div>
      </article>
      <article class="card doc-card">
        <div class="card-content">
          <h2>
            Component lifecycle
          </h2>
          <ol>
            <li>
              Experimental
            </li>
            <li>
              Preview
            </li>
            <li>
              Stable
            </li>
            <li>
              Deprecated
            </li>
            <li>
              Retired
            </li>
          </ol>
        </div>
      </article>
      <article class="card doc-card">
        <div class="card-content">
          <h2>
            Theme override model
          </h2>
          <p>
            A base stylesheet can define variables and a later stylesheet can override them.
          </p>
          <pre class="code-block">
            <code>
              ${escapeHtml('<link rel="stylesheet" href="@ui.base/theme/default.css">\n<link rel="stylesheet" href="/site/theme-overrides.css">')}
            </code>
          </pre>
          <p class="muted">
            The second file wins for variables it redefines.
          </p>
        </div>
      </article>
    </section>
    <section class="card package-roadmap-card">
      <div class="card-content">
        <h2>
          Package roadmap
        </h2>
        <div class="package-roadmap">
          <code>
            @ui.base/core
          </code>
          <code>
            @ui.base/design-system
          </code>
          <code>
            @ui.base/theme
          </code>
          <code>
            @ui.base/icons
          </code>
          <code>
            @ui.base/ui
          </code>
          <code>
            @ui.base/forms
          </code>
          <code>
            @ui.base/calendar
          </code>
          <code>
            @ui.base/hero
          </code>
          <code>
            @ui.base/assets
          </code>
        </div>
      </div>
    </section>
  `;

  bindDesignSystem(main);
}
