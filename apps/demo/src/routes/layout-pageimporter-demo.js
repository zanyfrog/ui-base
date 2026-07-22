import '/packages/ui-layout/browser/index.js';

export function renderLayoutPageImporterRoute(main) {
  main.innerHTML = `
    <section class="page-heading">
      <p class="eyebrow">
        @ui-base/ui-layout
      </p>
      <h1>
        PageImporter
      </h1>
      <p>
        Phase 1 imports front-end source, separates rendered page pieces into editable lists, and stores a local draft artifact.
      </p>
    </section>
    <uib-page-importer></uib-page-importer>
  `;
}
