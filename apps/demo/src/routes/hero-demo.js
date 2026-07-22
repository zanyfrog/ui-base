import { appendEventLog, serializeElement } from './demo-utils.js';

const HERO_ROUTES = [
  { path: '/hero/organization', label: 'Sample Department' },
  { path: '/hero/sample-site', label: 'Sample Visitor Center' },
  { path: '/hero/asset-backed-details', label: 'Asset-backed Details' }
];

const HERO_ACTIONS = [
  {
    key: 'primary',
    title: 'Primary Action',
    eventName: 'uib-hero-primary-cta',
    tourAction: 'new-reservation',
    componentKey: 'newReservation',
    trigger: 'hero-primary-cta',
    panelTitle: 'New reservation opened',
    disabledMessage: 'Primary Action clicked, but it is disabled by parent state.',
    panelHelp: 'The parent page received the Hero Book a Tour click and opened the Tour UI new-reservation component.'
  },
  {
    key: 'secondary',
    title: 'Secondary Action',
    eventName: 'uib-hero-secondary-cta',
    tourAction: 'find-reservation',
    componentKey: 'findReservation',
    trigger: 'hero-secondary-cta',
    panelTitle: 'Find reservation opened',
    disabledMessage: 'Secondary Action clicked, but it is disabled by parent state.',
    panelHelp: 'The parent page received the Hero Plan Your Visit click and called the Tour UI find-reservation component.'
  },
  {
    key: 'third',
    title: 'Third Action',
    eventName: 'uib-hero-third-cta',
    tourAction: 'cancel-reservation',
    componentKey: 'cancelReservation',
    trigger: 'hero-third-cta',
    panelTitle: 'Cancel reservation opened',
    disabledMessage: 'Third Action clicked, but it is disabled by parent state.',
    panelHelp: 'The parent page received the Hero third CTA click and called the Tour UI cancel-reservation component.'
  },
  {
    key: 'fourth',
    title: 'Fourth Action',
    eventName: 'uib-hero-fourth-cta',
    tourAction: 'book-group-reservation',
    componentKey: 'bookGroupReservation',
    trigger: 'hero-fourth-cta',
    panelTitle: 'Group reservation opened',
    disabledMessage: 'Fourth Action clicked, but it is disabled by parent state.',
    panelHelp: 'The parent page received the Hero fourth CTA click and called the Tour UI book-group-reservation component.'
  }
];

const HERO_DEFAULTS = {
  organization: {
    pageTitle: 'Sample Department Main Building Hero',
    eyebrow: 'Featured public experience',
    headline: 'Tour the Sample Department Main Building',
    subheadline: 'Explore a sample public destination and learn how reusable page sections support visitor-facing applications.',
    primaryLabel: 'Book a Tour',
    primaryHref: '#booking',
    primaryShown: true,
    primaryDisabled: false,
    secondaryLabel: 'Plan Your Visit',
    secondaryHref: '#booking',
    secondaryShown: true,
    secondaryDisabled: false,
    thirdLabel: 'Cancel Reservation',
    thirdHref: '#booking',
    thirdShown: true,
    thirdDisabled: false,
    fourthLabel: 'Book Group Tour',
    fourthHref: '#booking',
    fourthShown: true,
    fourthDisabled: false,
    trustSignal: 'All tours are free and led by Organization guides. Advance reservations are required.',
    theme: 'organization',
    size: 'large',
    brandLabel: 'Sample Organization',
    brandMark: 'T',
    visualKind: 'organization',
    visualMode: 'background',
    layoutOpacity: 0.8,
    visualSource: 'url',
    visualSrc: 'https://media.gettyimages.com/id/496862293/photo/united-states-organization.jpg?s=612x612&w=gi&k=20&c=k5LJsm12qTkfl2wcbL4rlBG23Y6Pxfbr4kGJg-6VfN0=',
    visualAlt: 'Sample organization building exterior',
    details: [
      { label: 'Tour Length', value: '60 minutes', iconUrl: '/apps/demo/assets/icons/tour-length.svg', iconAlt: 'Tour length' },
      { label: 'Tour Size', value: 'Up to 20 people', iconUrl: '/apps/demo/assets/icons/tour-size.svg', iconAlt: 'Tour size' },
      { label: 'Availability', value: 'Mon - Fri, 10:00 AM - 2:00 PM', iconUrl: '/apps/demo/assets/icons/availability.svg', iconAlt: 'Availability' },
      { label: 'Cost', value: 'Free', iconUrl: '/apps/demo/assets/icons/cost.svg', iconAlt: 'Cost' },
      { label: 'Accessible', value: 'Yes', iconUrl: '/apps/demo/assets/icons/accessibility.svg', iconAlt: 'Accessible' }
    ],
    navItems: [
      { label: 'About Organization', href: '#about' },
      { label: 'Policy Issues', href: '#policy' },
      { label: 'Data & Reports', href: '#reports' },
      { label: 'News', href: '#news' },
      { label: 'Contact', href: '#contact' }
    ]
  },
  sampleSite: {
    pageTitle: 'Sample Visitor Center Hero',
    eyebrow: 'Visit the Sample Visitor Center',
    headline: 'Tour the Sample Visitor Center',
    subheadline: 'Go behind the scenes and see how the visitor experience is delivered. Guided tours offer a look at the site operations and history.',
    primaryLabel: 'Book a Tour',
    primaryHref: '#booking',
    primaryShown: true,
    primaryDisabled: false,
    secondaryLabel: 'Plan Your Visit',
    secondaryHref: '#booking',
    secondaryShown: true,
    secondaryDisabled: false,
    thirdLabel: 'Cancel Reservation',
    thirdHref: '#booking',
    thirdShown: true,
    thirdDisabled: false,
    fourthLabel: 'Book Group Tour',
    fourthHref: '#booking',
    fourthShown: true,
    fourthDisabled: false,
    trustSignal: 'Advance reservations are required. Closed federal holidays.',
    theme: 'dark',
    size: 'large',
    brandLabel: 'Sample Organization',
    brandMark: 'M',
    visualKind: 'sampleSite',
    visualMode: 'background',
    layoutOpacity: 0.8,
    visualSource: 'url',
    visualSrc: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/29/93/74/caption.jpg?w=1100&h=1100&s=1',
    visualAlt: 'Sample Visitor Center building exterior',
    details: [
      { label: 'Tour Length', value: '45 minutes', iconUrl: '/apps/demo/assets/icons/tour-length.svg', iconAlt: 'Tour length' },
      { label: 'Tour Size', value: 'Up to 25 people', iconUrl: '/apps/demo/assets/icons/tour-size.svg', iconAlt: 'Tour size' },
      { label: 'Availability', value: 'Tue - Fri, 9:00 AM - 3:00 PM', iconUrl: '/apps/demo/assets/icons/availability.svg', iconAlt: 'Availability' },
      { label: 'Cost', value: 'Free', iconUrl: '/apps/demo/assets/icons/cost.svg', iconAlt: 'Cost' },
      { label: 'Ages', value: '8+ recommended', iconUrl: '/apps/demo/assets/icons/ages.svg', iconAlt: 'Ages' }
    ],
    navItems: [
      { label: 'Shop', href: '#shop' },
      { label: 'Learn', href: '#learn' },
      { label: 'Visit', href: '#visit' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' }
    ]
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function heroRouteList(currentPath, includeOverview = true) {
  const overviewLink = includeOverview
    ? `
      <a class="route-button" href="/hero/" data-link ${currentPath === '/hero' ? 'aria-current="page"' : ''}>
        Hero Overview
      </a>
    `
    : '';

  return `
    <nav class="route-list" aria-label="Hero examples">
      ${overviewLink}
      ${HERO_ROUTES.map((route) => `<a class="route-button" href="${route.path}" data-link ${currentPath === route.path ? 'aria-current="page"' : ''}>${route.label}</a>`).join('')}
    </nav>
  `;
}

function renderHeroIndex(main, path) {
  main.innerHTML = `
    <section class="page-heading">
      <h1>
        Hero Component Demo
      </h1>
      <p>
        The Hero component is a reusable page-opening component for designers and developers. Choose one of the two tour examples below.
      </p>
    </section>
    ${heroRouteList(path, false)}
    <section class="home-grid" aria-label="Hero examples">
      <a class="card home-card" href="/hero/organization" data-link>
        <span>
          <h2>
            Sample Department Main Building
          </h2>
          <p>
            A background-image hero treatment with navigation, tour details, four parent-controlled CTA buttons, and a historic-building visual.
          </p>
        </span>
        <strong class="primary-button">
          Display Sample Department Example
        </strong>
      </a>
      <a class="card home-card" href="/hero/sample-site" data-link>
        <span>
          <h2>
            Tour the Sample Visitor Center
          </h2>
          <p>
            A dark background-image hero treatment with gold CTA, location visual, trust signal, and four action buttons.
          </p>
        </span>
        <strong class="primary-button">
          Display Sample Visitor Center Example
        </strong>
      </a>
      <a class="card home-card" href="/hero/asset-backed-details" data-link>
        <span>
          <h2>
            Asset-backed Hero Details
          </h2>
          <p>
            Tests
            <code>
              uib-visual-source-control
            </code>
            ,
            <code>
              uib-detail-list-editor
            </code>
            ,
            <code>
              uib-asset-image
            </code>
            , and
            <code>
              uib-hero
            </code>
            together.
          </p>
        </span>
        <strong class="primary-button">
          Test Asset-backed Details
        </strong>
      </a>
    </section>
    <section class="card" style="margin-top: 1rem;">
      <div class="card-content">
        <h2>
          Basic usage
        </h2>
        <pre class="code-block">
          <code>
            &lt;script type="module"&gt; import '@ui-base/hero'; import '@ui-base/ui'; const hero = document.querySelector('uib-hero'); hero.details = [ { label: 'Tour Length', value: '45 minutes', iconUrl: '/apps/demo/assets/icons/tour-length.svg', iconAlt: 'Tour length' }, { label: 'Cost', value: 'Free', iconUrl: '/apps/demo/assets/icons/cost.svg', iconAlt: 'Cost' } ]; &lt;/script&gt; &lt;uib-hero headline="Tour the Sample Visitor Center" subheadline="Go behind the scenes and see how the visitor experience is delivered." action-components='[ { "id": "book-tour", "name": "primaryCta", "kind": "primary", "label": "Book a Tour", "type": "link", "value": "/book", "show": true, "disabled": false, "variant": "primary" }, { "id": "plan-visit", "name": "secondaryCta", "kind": "secondary", "label": "Plan Your Visit", "type": "link", "value": "/visit", "show": true, "disabled": false, "variant": "secondary" }, { "id": "cancel-reservation", "name": "thirdCta", "kind": "third", "label": "Cancel Reservation", "type": "link", "value": "/cancel", "show": true, "disabled": false, "variant": "destructive" }, { "id": "book-group-tour", "name": "fourthCta", "kind": "fourth", "label": "Book Group Tour", "type": "link", "value": "/group", "show": true, "disabled": false, "variant": "secondary" } ]' trust-signal="Advance reservations are required." visual-source="url" visual-role="background" visual-mode="background" layout-opacity="0.8" &gt;&lt;/uib-hero&gt;
          </code>
        </pre>
      </div>
    </section>
  `;
}

function visualMarkup(kind) {
  if (kind === 'sampleSite') {
    return `
      <div slot="visual" class="sample-visual" role="img" aria-label="Stylized Sample Visitor Center building with a coin in front">
        <span class="sample-building" aria-hidden="true"></span>
        <span class="sample-marker" aria-hidden="true"></span>
        <span class="sample-ground" aria-hidden="true"></span>
      </div>
    `;
  }

  return `
    <div slot="visual" class="sample-building" role="img" aria-label="Stylized sample department main building">
      <span class="tour-flag" aria-hidden="true"><span></span></span>
      <span class="tour-steps" aria-hidden="true"></span>
    </div>
  `;
}


function genericVisualDataUri(label = 'UI Base Hero') {
  const safeLabel = String(label || 'UI Base Hero').replace(/[<>&]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" rx="42" fill="#eef4fb"/><circle cx="760" cy="132" r="96" fill="#f4bd46" opacity=".72"/><rect x="92" y="102" width="420" height="64" rx="32" fill="#174a8b" opacity=".94"/><rect x="92" y="210" width="680" height="32" rx="16" fill="#13294b" opacity=".22"/><rect x="92" y="270" width="560" height="32" rx="16" fill="#13294b" opacity=".16"/><text x="92" y="472" fill="#13294b" font-family="Arial,sans-serif" font-size="38" font-weight="700">${safeLabel}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function detailIconDataUri(label, accent = '#174a8b') {
  const safeLabel = String(label || 'I').slice(0, 2).toUpperCase().replace(/[<>&]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="24" fill="#eef4fb"/><circle cx="48" cy="48" r="31" fill="${accent}"/><text x="48" y="58" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="24" font-weight="800">${safeLabel}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function assetMapEntryFromAsset(asset) {
  if (!asset || typeof asset !== 'object') return null;
  const record = asset.storageRecord || asset.record || asset.asset || asset;
  const id = record.id || record.assetId || record.asset_id;
  const url = record.url || record.publicUrl || record.public_url || record.thumbnailUrl || record.thumbnail_url || record.downloadUrl || record.download_url;
  if (!id || !url) return null;
  return {
    id,
    url,
    src: url,
    publicUrl: url,
    alt: record.altText || record.alt_text || record.name || record.label || record.assetKey || record.asset_key || id,
    name: record.name || record.label || record.assetKey || record.asset_key || id
  };
}

const HERO_ASSET_MAP = {
  'asset-hero-main': { url: genericVisualDataUri('Asset-backed Visual'), alt: 'Generated hero visual from asset map' },
  'asset-duration': { url: detailIconDataUri('60'), alt: 'Duration' },
  'asset-size': { url: detailIconDataUri('20'), alt: 'Group size' },
  'asset-cost': { url: detailIconDataUri('$'), alt: 'Cost' }
};

const HERO_ASSET_DETAILS = [
  { label: 'Duration', value: '60 minutes', iconAssetId: 'asset-duration', iconAlt: 'Duration' },
  { label: 'Capacity', value: 'Up to 20 people', iconAssetId: 'asset-size', iconAlt: 'Group size' },
  { label: 'Availability', value: 'Weekdays', iconUrl: '/apps/demo/assets/icons/availability.svg', iconAlt: 'Availability' },
  { label: 'Cost', value: 'No fee', iconAssetId: 'asset-cost', iconAlt: 'Cost' }
];

function renderAssetBackedDetailsDemo(main, path) {
  const assetMapJson = JSON.stringify(HERO_ASSET_MAP);
  const detailJson = JSON.stringify(HERO_ASSET_DETAILS);
  main.innerHTML = `
    <section class="page-heading">
      <h1>
        Hero with asset-backed detail icons
      </h1>
      <p>
        This test page wires the reusable base components together: the Hero visual uses
        <code>
          visualSource
        </code>
        /
        <code>
          visualRole
        </code>
        , detail icons can be direct URLs or asset IDs, and the detail editor emits separate add/update/remove events plus a full change event.
      </p>
    </section>
    ${heroRouteList(path)}
    <section class="demo-layout hero-demo-layout">
      <aside class="card controls" aria-label="Asset-backed Hero controls">
        <div class="card-content">
          <h2>
            Reusable asset and detail controls
          </h2>
          <p class="helper-text">
            A value in
            <code>
              visualSrc
            </code>
            wins over
            <code>
              visualAssetId
            </code>
            . Clear the URL to let the asset ID resolve from the asset map.
          </p>
          <uib-visual-source-control id="assetHeroVisualControl" label="Main Hero visual" visual-source="asset" visual-role="background" asset-id="asset-hero-main" alt="Asset-backed Hero visual" application-key="demo-app" api-base-url="http://localhost:4020" use-asset-picker>
          </uib-visual-source-control>
          <uib-detail-list-editor id="assetHeroDetailsEditor" label="Hero detail icon editor" details='${detailJson.replaceAll("'", '&#039;')}' asset-map='${assetMapJson.replaceAll("'", '&#039;')}' application-key="demo-app" api-base-url="http://localhost:4020" use-asset-picker>
          </uib-detail-list-editor>
          <div id="assetHeroStatus" class="status-box">
            Change the visual or detail rows to update the Hero preview.
          </div>
          <details class="control-section" open>
            <summary>
              <strong>
                Detail editor and Hero preview event log
              </strong>
            </summary>
            <pre id="assetHeroEventLog" class="code-block controls-event-log">
              []
            </pre>
          </details>
          <details class="control-section">
            <summary>
              <strong>
                Hero markup
              </strong>
            </summary>
            <pre id="assetHeroMarkup" class="code-block">
            </pre>
          </details>
        </div>
      </aside>
      <section class="hero-preview" aria-label="Asset-backed Hero preview">
        <uib-hero id="assetBackedHero" eyebrow="Reusable primitives" headline="Hero composed from UI Base components" subheadline="The Hero delegates media rendering, action buttons, headings, and detail icons to reusable base components." action-components='[{"id":"start-workflow","name":"primaryCta","kind":"primary","label":"Start workflow","type":"action","value":"START_WORKFLOW","show":true,"disabled":false,"variant":"primary"},{"id":"learn-more","name":"secondaryCta","kind":"secondary","label":"Learn more","type":"link","value":"#learn-more","show":true,"disabled":false,"variant":"secondary"}]' trust-signal="Demo data is resolved from clean source fields and an asset map." brand-label="UI Base" brand-mark="UIB" theme="organization" size="large" visual-source="asset" visual-role="background" visual-asset-id="asset-hero-main" visual-alt="Asset-backed Hero visual" visual-mode="background" visual-position="background" asset-map='${assetMapJson.replaceAll("'", '&#039;')}' details='${detailJson.replaceAll("'", '&#039;')}' nav-items='[{"label":"Overview","href":"#overview"},{"label":"Components","href":"#components"},{"label":"Assets","href":"#assets"}]'>
        </uib-hero>
        <section id="learn-more" class="card" style="margin-top: 1rem;">
          <div class="card-content">
            <h2>
              What this validates
            </h2>
            <ul>
              <li>
                <code>
                  uib-hero
                </code>
                accepts raw asset IDs and resolved URLs.
              </li>
              <li>
                <code>
                  uib-asset-image
                </code>
                resolves IDs through
                <code>
                  asset-map
                </code>
                .
              </li>
              <li>
                <code>
                  uib-detail-list-editor
                </code>
                emits add, update, remove, and change events.
              </li>
              <li>
                <code>
                  visualSrc
                </code>
                overrides
                <code>
                  visualAssetId
                </code>
                when both are populated.
              </li>
            </ul>
          </div>
        </section>
      </section>
    </section>
  `;

  const hero = main.querySelector('#assetBackedHero');
  const visualControl = main.querySelector('#assetHeroVisualControl');
  const detailEditor = main.querySelector('#assetHeroDetailsEditor');
  const status = main.querySelector('#assetHeroStatus');
  const eventLog = main.querySelector('#assetHeroEventLog');
  const markupOutput = main.querySelector('#assetHeroMarkup');
  let heroAssetMap = { ...HERO_ASSET_MAP };

  const setStatus = (message) => { if (status) status.textContent = message; };
  const updateMarkup = () => { if (markupOutput) markupOutput.textContent = serializeElement(hero); };
  const eventEntries = [];
  const logEvent = (source, eventName, detail = {}, extra = {}) => {
    if (!eventLog) return;
    eventEntries.unshift({
      time: new Date().toLocaleTimeString(),
      source,
      event: eventName,
      ...extra,
      detail
    });
    eventLog.textContent = JSON.stringify(eventEntries.slice(0, 80), null, 2);
  };
  const applyAssetMap = () => {
    const serialized = JSON.stringify(heroAssetMap);
    hero.setAttribute('asset-map', serialized);
    detailEditor.setAttribute('asset-map', serialized);
    logEvent('hero-preview', 'hero-preview-asset-map-applied', {
      assetIds: Object.keys(heroAssetMap)
    });
  };
  const fetchAssetForMap = async (assetId) => {
    if (!assetId || heroAssetMap[assetId]) return null;
    try {
      const response = await fetch(`http://localhost:4020/applications/demo-app/assets/${encodeURIComponent(assetId)}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  };
  const addAssetToMap = (asset) => {
    const entry = assetMapEntryFromAsset(asset);
    if (!entry) return false;
    heroAssetMap = { ...heroAssetMap, [entry.id]: entry };
    applyAssetMap();
    return true;
  };
  const ensureAssetInMap = async (assetId, asset) => {
    if (addAssetToMap(asset)) return true;
    const fetched = await fetchAssetForMap(assetId);
    return addAssetToMap(fetched);
  };
  const applyDetails = (details) => {
    const next = Array.isArray(details) ? details : [];
    hero.details = next;
    hero.setAttribute('details', JSON.stringify(next));
    updateMarkup();
    logEvent('hero-preview', 'hero-preview-details-applied', {
      count: next.length,
      details: next
    });
  };

  const applyVisual = (detail) => {
    const visual = detail || {};
    const source = visual.visualSrc ? 'url' : (visual.visualSource || 'none');
    hero.setAttribute('visual-source', source);
    hero.setAttribute('visual-role', visual.visualRole || 'image');
    hero.setAttribute('visual-src', visual.visualSrc || '');
    hero.setAttribute('visual-asset-id', visual.visualAssetId || '');
    hero.setAttribute('visual-alt', visual.visualAlt || '');
    const mode = (visual.visualRole || '') === 'background' ? 'background' : 'panel-right';
    hero.setAttribute('visual-mode', mode);
    hero.setAttribute('visual-position', mode === 'background' ? 'background' : 'right');
    updateMarkup();
    logEvent('hero-preview', 'hero-preview-visual-applied', {
      visualSource: source,
      visualRole: visual.visualRole || 'image',
      visualAssetId: visual.visualAssetId || '',
      visualSrc: visual.visualSrc || '',
      visualAlt: visual.visualAlt || ''
    });
  };

  visualControl.addEventListener('uib-visual-source-change', (event) => {
    logEvent('detail-editor', 'uib-visual-source-change', event.detail);
    applyVisual(event.detail);
    setStatus(`Visual changed: ${event.detail.visualSource}/${event.detail.visualRole}. URL wins when present.`);
  });

  detailEditor.addEventListener('change', (event) => {
    logEvent('detail-editor', 'change', event.detail, {
      target: event.target?.localName || event.target?.tagName || 'unknown'
    });
  });
  detailEditor.addEventListener('uib-detail-add', (event) => {
    setStatus(`Detail added at row ${event.detail.index + 1}.`);
    logEvent('detail-editor', 'uib-detail-add', event.detail);
  });
  detailEditor.addEventListener('uib-detail-update', (event) => {
    setStatus(`Detail updated at row ${event.detail.index + 1}.`);
    logEvent('detail-editor', 'uib-detail-update', event.detail);
  });
  detailEditor.addEventListener('uib-detail-asset-change', async (event) => {
    logEvent('detail-editor', 'uib-detail-asset-change', event.detail, {
      selectedAssetId: event.detail.assetId || event.detail.detail?.iconAssetId || ''
    });
    await ensureAssetInMap(event.detail.assetId, event.detail.asset);
    applyDetails(event.detail.details || []);
    setStatus(`Detail asset changed at row ${event.detail.index + 1}.`);
  });
  detailEditor.addEventListener('uib-detail-remove', (event) => {
    setStatus(`Detail removed from row ${event.detail.index + 1}.`);
    logEvent('detail-editor', 'uib-detail-remove', event.detail);
  });
  detailEditor.addEventListener('uib-detail-list-editor-change', (event) => {
    logEvent('detail-editor', 'uib-detail-list-editor-change', event.detail);
    applyDetails(event.detail.details || []);
  });

  hero.addEventListener('uib-hero-cta', (event) => {
    event.preventDefault();
    setStatus(`Hero CTA event received by parent: ${event.detail.label}.`);
    logEvent('hero-preview', 'uib-hero-cta-managed', event.detail);
  });
  hero.addEventListener('uib-asset-image-resolution-error', (event) => {
    logEvent('hero-preview', 'uib-asset-image-resolution-error', event.detail);
  });
  logEvent('hero-preview', 'hero-preview-initialized', {
    details: HERO_ASSET_DETAILS,
    assetIds: Object.keys(heroAssetMap)
  });
  updateMarkup();
}

function renderActionControlCard(action) {
  const labelId = `${action.key}Label`;
  const shownId = `${action.key}Shown`;
  const disabledId = `${action.key}Disabled`;

  return `
    <article class="action-control-card">
      <h3>${action.title}</h3>
      <div class="field">
        <label for="${labelId}">Label:</label>
        <input id="${labelId}" />
      </div>
      <div class="action-control-checks" aria-label="${action.title} visibility and state">
        <label class="checkbox-row"><input id="${shownId}" type="checkbox" /> Show</label>
        <label class="checkbox-row"><input id="${disabledId}" type="checkbox" /> Disable</label>
      </div>
    </article>
  `;
}

function renderExampleShell(main, path, kind, state) {
  main.innerHTML = `
    <section class="page-heading">
      <h1>
        ${state.pageTitle}
      </h1>
      <p>
        This page demonstrates the reusable &lt;uib-hero&gt; component with parent-controlled text values, four CTA buttons, CTA visibility, CTA disabled state, navigation items, visual mode, trust signal, and tour detail bullets.
      </p>
    </section>
    ${heroRouteList(path)}
    <section class="demo-layout hero-demo-layout" id="heroDemoLayout">
      <aside class="card controls" id="heroControlsPanel" aria-label="Hero parent state controls">
        <div class="card-content">
          <div class="controls-header">
            <h2>
              Parent state controls
            </h2>
            <button id="toggleControlsPanel" class="secondary-button compact-control-button" type="button" aria-controls="heroControlsPanel" aria-expanded="true">
              Collapse controls
            </button>
          </div>
          <div class="form-grid">
            <div class="field">
              <label for="eyebrow">
                Eyebrow
              </label>
              <input id="eyebrow" />
            </div>
            <div class="field">
              <label for="headline">
                Headline
              </label>
              <textarea id="headline">
              </textarea>
            </div>
            <div class="field">
              <label for="subheadline">
                Subheadline
              </label>
              <textarea id="subheadline">
              </textarea>
            </div>
            <fieldset class="control-section cta-control-section">
              <legend>
                Hero action buttons
              </legend>
              <p class="helper-text">
                Each action card controls the button label, whether it is shown, and whether it is disabled. The Hero renders visible CTA buttons as a wrapping CSS flow on a distinct action panel.
              </p>
              <div class="cta-control-grid">
                ${HERO_ACTIONS.map(renderActionControlCard).join('')}
              </div>
            </fieldset>
            <div class="field">
              <label for="trustSignal">
                Trust signal
              </label>
              <textarea id="trustSignal">
              </textarea>
            </div>
            <fieldset class="control-section">
              <legend>
                Visual mode
              </legend>
              <div class="field">
                <label for="visualMode">
                  Hero visual mode
                </label>
                <select id="visualMode">
                  <option value="panel-right">
                    Panel visual on right
                  </option>
                  <option value="panel-left">
                    Panel visual on left
                  </option>
                  <option value="background">
                    Background behind whole Hero
                  </option>
                </select>
              </div>
              <div class="field">
                <label for="layoutOpacity">
                  Layout opacity
                </label>
                <input id="layoutOpacity" type="number" min="0" max="1" step="0.05" />
                <p class="helper-text">
                  Controls the opacity of the Hero
                  <code>
                    .uib-hero__layout
                  </code>
                  area. Default is 0.8.
                </p>
              </div>
              <div class="field">
                <label for="visualSource">
                  Visual source
                </label>
                <select id="visualSource">
                  <option value="slot">
                    Custom slotted demo visual
                  </option>
                  <option value="url">
                    Image URL or data URI
                  </option>
                </select>
              </div>
              <div class="field">
                <label for="visualSrc">
                  Image URL or data URI
                </label>
                <input id="visualSrc" placeholder="/images/tour-photo.jpg or data:image/svg+xml,..." />
              </div>
              <div class="field">
                <label for="visualAlt">
                  Image alt text
                </label>
                <input id="visualAlt" />
              </div>
              <button id="refreshHeroPreview" class="secondary-button control-button" type="button">
                Refresh Hero Preview
              </button>
              <p class="helper-text">
                Panel modes keep the visual as a subset of the Hero. Background mode places the visual behind the whole Hero surface, including navigation and detail bullets. The preview updates immediately; use refresh only after pasting a large image data URI or changing several visual fields at once.
              </p>
            </fieldset>
            <div class="field">
              <label for="detailsJson">
                Tour detail bullets JSON
              </label>
              <textarea id="detailsJson" spellcheck="false">
              </textarea>
              <p class="helper-text">
                Use
                <code>
                  icon
                </code>
                for a short text badge. Use
                <code>
                  iconUrl
                </code>
                or
                <code>
                  iconSrc
                </code>
                for an image URL, relative URL, or
                <code>
                  data:image/...
                </code>
                URI. A URL placed directly in
                <code>
                  icon
                </code>
                will also render as an image.
              </p>
            </div>
            <div class="field">
              <label for="navJson">
                Navigation JSON
              </label>
              <textarea id="navJson" spellcheck="false">
              </textarea>
            </div>
          </div>
          <div id="heroStatus" class="status-box">
            Change a value to see the Hero update. CTA clicks are reported here.
          </div>
          <details class="control-section" open>
            <summary>
              <strong>
                Latest Hero event
              </strong>
            </summary>
            <pre id="heroEventLog" class="code-block">
              {}
            </pre>
          </details>
          <details class="control-section">
            <summary>
              <strong>
                Current Hero markup
              </strong>
            </summary>
            <pre id="heroMarkup" class="code-block">
            </pre>
          </details>
        </div>
      </aside>
      <section class="hero-preview" aria-label="Hero preview">
        <div class="preview-toolbar card">
          <div>
            <strong>
              Hero preview
            </strong>
            <span id="previewToolbarText">
              Collapse controls to display the Hero at full width.
            </span>
          </div>
          <button id="toggleControlsPreview" class="primary-button compact-control-button" type="button" aria-controls="heroControlsPanel" aria-expanded="true">
            Hide controls
          </button>
        </div>
        <uib-hero id="tourHero">
        </uib-hero>
        <section id="booking" class="card hero-tour-action-panel" hidden tabindex="-1" aria-live="polite" aria-labelledby="heroTourActionTitle">
          <div class="card-content">
            <div class="hero-tour-action-header">
              <div>
                <p class="hero-tour-action-eyebrow">
                  Tour UI opened by parent state
                </p>
                <h2 id="heroTourActionTitle">
                  Tour reservation action
                </h2>
                <p id="heroTourActionHelp" class="muted">
                  Hero CTA events are handled by this parent page. The parent decides which Tour UI component to open and call.
                </p>
              </div>
              <button id="closeHeroTourAction" class="secondary-button compact-control-button" type="button">
                Close
              </button>
            </div>
            <div class="hero-tour-action-grid" aria-label="Tour UI components called by the Hero parent">
              <uib-new-reservation id="heroNewReservation" heading="Create a new tour reservation" description="The parent page opened this component after receiving the Hero primary CTA event. Continue into the booking flow from here." action-label="Start New Reservation" toast-message="New reservation opened from the Hero Book a Tour CTA.">
              </uib-new-reservation>
              <uib-find-reservation id="heroFindReservation" heading="Find or plan a reservation" description="The parent page opened this component after receiving the Hero secondary CTA event. Look up an existing reservation or review visit details from here." action-label="Find Reservation" toast-message="Find reservation opened from the Hero Plan Your Visit CTA." hidden>
              </uib-find-reservation>
              <uib-cancel-reservation id="heroCancelReservation" heading="Cancel a reservation" description="The parent page opened this component after receiving the Hero third CTA event. Use it to begin a cancellation flow." action-label="Cancel Reservation" toast-message="Cancel reservation opened from the Hero third CTA." hidden>
              </uib-cancel-reservation>
              <uib-book-group-reservation id="heroBookGroupReservation" heading="Book a group tour" description="The parent page opened this component after receiving the Hero fourth CTA event. Use it for group reservation requests." action-label="Start Group Reservation" toast-message="Group reservation opened from the Hero fourth CTA." hidden>
              </uib-book-group-reservation>
            </div>
            <p class="helper-text">
              Implementation note: the Hero component emits CTA events only. The parent owns the decision to reveal and call a reservation component from
              <code>
                @ui-base/ui
              </code>
              .
            </p>
          </div>
        </section>
      </section>
    </section>
  `;

  const hero = main.querySelector('#tourHero');
  bindHeroExample(main, hero, state);
}

function legacyVisualPositionFromMode(visualMode) {
  if (visualMode === 'panel-left') return 'left';
  if (visualMode === 'background') return 'background';
  return 'right';
}

function normalizeLayoutOpacity(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0.8;
  return Math.min(1, Math.max(0, parsed));
}

function applyHeroVisual(hero, state) {
  const usesUrlVisual = state.visualSource === 'url';

  if (usesUrlVisual) {
    hero.innerHTML = '';
    if (state.visualSrc && state.visualSrc.trim()) {
      hero.setAttribute('visual-src', state.visualSrc.trim());
    } else {
      hero.removeAttribute('visual-src');
    }
    hero.setAttribute('visual-alt', state.visualAlt || '');
    return;
  }

  hero.removeAttribute('visual-src');
  hero.removeAttribute('visual-alt');
  hero.innerHTML = visualMarkup(state.visualKind);
}

function applyHeroActionState(hero, state) {
  hero.setAttribute('action-components', JSON.stringify(actionComponentsFromState(state)));
  HERO_ACTIONS.forEach((action) => {
    hero.removeAttribute(`${action.key}-cta-label`);
    hero.removeAttribute(`${action.key}-cta-href`);
    hero.removeAttribute(`${action.key}-cta-action`);
    hero.removeAttribute(`${action.key}-cta-action-token`);
    hero.removeAttribute(`${action.key}-cta-type`);
    hero.removeAttribute(`show-${action.key}-cta`);
    hero.removeAttribute(`${action.key}-cta-disabled`);
  });
}

function actionComponentsFromState(state) {
  return HERO_ACTIONS.map((action, index) => ({
    id: `${action.key}HeroAction`,
    name: `${action.key}Cta`,
    kind: action.key,
    label: state[`${action.key}Label`] || '',
    type: 'link',
    value: state[`${action.key}Href`] || '#',
    show: Boolean(state[`${action.key}Shown`]),
    disabled: Boolean(state[`${action.key}Disabled`]),
    variant: index === 0 ? 'primary' : index === 2 ? 'destructive' : 'secondary'
  }));
}

function applyHeroState(hero, state) {
  hero.setAttribute('eyebrow', state.eyebrow);
  hero.setAttribute('headline', state.headline);
  hero.setAttribute('subheadline', state.subheadline);
  hero.setAttribute('trust-signal', state.trustSignal);
  hero.setAttribute('theme', state.theme);
  hero.setAttribute('size', state.size);
  hero.setAttribute('brand-label', state.brandLabel);
  hero.setAttribute('brand-mark', state.brandMark);
  hero.setAttribute('visual-mode', state.visualMode || 'panel-right');
  hero.setAttribute('visual-position', legacyVisualPositionFromMode(state.visualMode));
  hero.setAttribute('layout-opacity', String(normalizeLayoutOpacity(state.layoutOpacity)));
  applyHeroVisual(hero, state);
  applyHeroActionState(hero, state);
  hero.details = state.details;
  hero.navItems = state.navItems;
}

function bindHeroExample(main, hero, state) {
  const status = main.querySelector('#heroStatus');
  const eventLog = main.querySelector('#heroEventLog');
  const markupOutput = main.querySelector('#heroMarkup');
  const updateMarkup = () => { if (markupOutput) markupOutput.textContent = serializeElement(hero); };
  const controls = {
    layout: main.querySelector('#heroDemoLayout'),
    panel: main.querySelector('#heroControlsPanel'),
    togglePanel: main.querySelector('#toggleControlsPanel'),
    togglePreview: main.querySelector('#toggleControlsPreview'),
    previewToolbarText: main.querySelector('#previewToolbarText'),
    eyebrow: main.querySelector('#eyebrow'),
    headline: main.querySelector('#headline'),
    subheadline: main.querySelector('#subheadline'),
    trustSignal: main.querySelector('#trustSignal'),
    visualMode: main.querySelector('#visualMode'),
    layoutOpacity: main.querySelector('#layoutOpacity'),
    visualSource: main.querySelector('#visualSource'),
    visualSrc: main.querySelector('#visualSrc'),
    visualAlt: main.querySelector('#visualAlt'),
    refreshHeroPreview: main.querySelector('#refreshHeroPreview'),
    detailsJson: main.querySelector('#detailsJson'),
    navJson: main.querySelector('#navJson'),
    tourActionPanel: main.querySelector('#booking'),
    tourActionTitle: main.querySelector('#heroTourActionTitle'),
    tourActionHelp: main.querySelector('#heroTourActionHelp'),
    closeHeroTourAction: main.querySelector('#closeHeroTourAction'),
    newReservation: main.querySelector('#heroNewReservation'),
    findReservation: main.querySelector('#heroFindReservation'),
    cancelReservation: main.querySelector('#heroCancelReservation'),
    bookGroupReservation: main.querySelector('#heroBookGroupReservation')
  };

  HERO_ACTIONS.forEach((action) => {
    controls[`${action.key}Label`] = main.querySelector(`#${action.key}Label`);
    controls[`${action.key}Shown`] = main.querySelector(`#${action.key}Shown`);
    controls[`${action.key}Disabled`] = main.querySelector(`#${action.key}Disabled`);
  });

  controls.eyebrow.value = state.eyebrow;
  controls.headline.value = state.headline;
  controls.subheadline.value = state.subheadline;
  controls.trustSignal.value = state.trustSignal;
  controls.visualMode.value = state.visualMode || 'panel-right';
  controls.layoutOpacity.value = normalizeLayoutOpacity(state.layoutOpacity);
  controls.visualSource.value = state.visualSource || 'slot';
  controls.visualSrc.value = state.visualSrc || '';
  controls.visualAlt.value = state.visualAlt || '';
  controls.detailsJson.value = JSON.stringify(state.details, null, 2);
  controls.navJson.value = JSON.stringify(state.navItems, null, 2);
  HERO_ACTIONS.forEach((action) => {
    controls[`${action.key}Label`].value = state[`${action.key}Label`] || '';
    controls[`${action.key}Shown`].checked = Boolean(state[`${action.key}Shown`]);
    controls[`${action.key}Disabled`].checked = Boolean(state[`${action.key}Disabled`]);
  });

  applyHeroState(hero, state);
  updateMarkup();

  const setControlsCollapsed = (collapsed) => {
    controls.layout.classList.toggle('controls-collapsed', collapsed);
    controls.panel.hidden = collapsed;
    [controls.togglePanel, controls.togglePreview].forEach((button) => {
      button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
    controls.togglePanel.textContent = collapsed ? 'Expand controls' : 'Collapse controls';
    controls.togglePreview.textContent = collapsed ? 'Show controls' : 'Hide controls';
    controls.previewToolbarText.textContent = collapsed
      ? 'Controls are hidden. The Hero preview is using the full available width.'
      : 'Collapse controls to display the Hero at full width.';
    status.textContent = collapsed
      ? 'Parent state controls collapsed. The Hero preview is now full width.'
      : 'Parent state controls expanded.';
  };

  [controls.togglePanel, controls.togglePreview].forEach((button) => {
    button.addEventListener('click', () => {
      const collapsed = !controls.layout.classList.contains('controls-collapsed');
      setControlsCollapsed(collapsed);
    });
  });

  ['eyebrow', 'headline', 'subheadline', 'trustSignal'].forEach((key) => {
    controls[key].addEventListener('input', () => {
      state[key] = controls[key].value;
      applyHeroState(hero, state);
      updateMarkup();
      status.textContent = 'Hero text updated by parent state.';
    });
  });

  HERO_ACTIONS.forEach((action) => {
    controls[`${action.key}Label`].addEventListener('input', () => {
      state[`${action.key}Label`] = controls[`${action.key}Label`].value;
      applyHeroState(hero, state);
      updateMarkup();
      status.textContent = `${action.title} label updated by parent state.`;
    });

    [`${action.key}Shown`, `${action.key}Disabled`].forEach((stateKey) => {
      controls[stateKey].addEventListener('change', () => {
        state[stateKey] = controls[stateKey].checked;
        applyHeroState(hero, state);
        status.textContent = `${action.title} state updated by parent state.`;
      });
    });
  });

  controls.visualMode.addEventListener('change', () => {
    state.visualMode = controls.visualMode.value;
    applyHeroState(hero, state);
    updateMarkup();
    status.textContent = `Visual mode changed to ${controls.visualMode.options[controls.visualMode.selectedIndex].text}.`;
  });

  controls.layoutOpacity.addEventListener('input', () => {
    state.layoutOpacity = normalizeLayoutOpacity(controls.layoutOpacity.value);
    controls.layoutOpacity.value = state.layoutOpacity;
    applyHeroState(hero, state);
    updateMarkup();
    status.textContent = `Hero layout opacity updated to ${state.layoutOpacity}.`;
  });

  controls.visualSource.addEventListener('change', () => {
    state.visualSource = controls.visualSource.value;
    applyHeroState(hero, state);
    updateMarkup();
    status.textContent = state.visualSource === 'url'
      ? 'Visual source changed to image URL/data URI. Add a URL to visual-src to replace the slotted visual.'
      : 'Visual source changed to the custom slotted demo visual.';
  });

  ['visualSrc', 'visualAlt'].forEach((key) => {
    controls[key].addEventListener('input', () => {
      state[key] = controls[key].value;
      applyHeroState(hero, state);
      updateMarkup();
      status.textContent = 'Hero visual image data updated by parent state.';
    });
  });

  controls.refreshHeroPreview.addEventListener('click', () => {
    applyHeroState(hero, state);
    updateMarkup();
    status.textContent = 'Hero preview refreshed from the current parent state values.';
  });

  controls.detailsJson.addEventListener('input', () => {
    try {
      const parsed = JSON.parse(controls.detailsJson.value);
      if (!Array.isArray(parsed)) throw new Error('Details must be an array.');
      state.details = parsed;
      applyHeroState(hero, state);
      updateMarkup();
      updateMarkup();
      status.textContent = 'Tour detail bullets updated.';
      appendEventLog(eventLog, 'hero-details-json-change', { details: parsed });
    } catch (error) {
      status.textContent = `Details JSON is invalid: ${error.message}`;
    }
  });

  controls.navJson.addEventListener('input', () => {
    try {
      const parsed = JSON.parse(controls.navJson.value);
      if (!Array.isArray(parsed)) throw new Error('Navigation must be an array.');
      state.navItems = parsed;
      applyHeroState(hero, state);
      updateMarkup();
      updateMarkup();
      status.textContent = 'Navigation updated.';
      appendEventLog(eventLog, 'hero-nav-json-change', { navItems: parsed });
    } catch (error) {
      status.textContent = `Navigation JSON is invalid: ${error.message}`;
    }
  });

  const hideTourActionComponents = () => {
    HERO_ACTIONS.forEach((action) => {
      const component = controls[action.componentKey];
      if (component) component.hidden = true;
    });
  };

  const showTourActionComponent = (action, sourceEvent) => {
    const component = controls[action.componentKey];

    if (!component || typeof component.call !== 'function') {
      status.textContent = `Parent received ${sourceEvent.detail.label}, but the ${action.tourAction} Tour UI component was not available.`;
      return;
    }

    controls.tourActionPanel.hidden = false;
    controls.tourActionPanel.dataset.activeAction = action.tourAction;
    controls.tourActionTitle.textContent = action.panelTitle;
    controls.tourActionHelp.textContent = action.panelHelp;
    hideTourActionComponents();
    component.hidden = false;

    status.textContent = `${sourceEvent.detail.label} clicked. Parent notified by Hero event; opening ${action.tourAction} from @ui-base/ui.`;
    component.call({
      trigger: action.trigger,
      heroHeadline: state.headline,
      heroBrandLabel: state.brandLabel,
      heroAction: sourceEvent.detail.action,
      heroCtaLabel: sourceEvent.detail.label,
      heroCtaHref: sourceEvent.detail.href
    });
    controls.tourActionPanel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    controls.tourActionPanel.focus({ preventScroll: true });
  };

  controls.closeHeroTourAction.addEventListener('click', () => {
    controls.tourActionPanel.hidden = true;
    hideTourActionComponents();
    status.textContent = 'Tour UI action panel closed by the parent page.';
  });

  controls.tourActionPanel.addEventListener('uib-tour-reservation-action', (event) => {
    status.textContent = `Tour UI component called: ${event.detail.action}. Trigger: ${event.detail.trigger}. Hero source: ${event.detail.heroCtaLabel}.`;
    appendEventLog(eventLog, 'uib-tour-reservation-action', event.detail);
  });

  HERO_ACTIONS.forEach((action) => {
    hero.addEventListener(action.eventName, (event) => {
      event.preventDefault();
      appendEventLog(eventLog, action.eventName, event.detail);
      if (event.detail.disabled) {
        status.textContent = `${action.disabledMessage} Label: ${event.detail.label}.`;
        return;
      }
      showTourActionComponent(action, event);
    });
  });
}

export function renderHeroRoute(main, path) {
  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

  if (normalized === '/hero') {
    renderHeroIndex(main, normalized);
    return;
  }

  if (normalized === '/hero/organization') {
    renderExampleShell(main, normalized, 'organization', clone(HERO_DEFAULTS.organization));
    return;
  }

  if (normalized === '/hero/sample-site') {
    renderExampleShell(main, normalized, 'sampleSite', clone(HERO_DEFAULTS.sampleSite));
    return;
  }

  if (normalized === '/hero/asset-backed-details') {
    renderAssetBackedDetailsDemo(main, normalized);
    return;
  }

  main.innerHTML = `
    <section class="page-heading">
      <h1>
        Hero route not found
      </h1>
      <p>
        The requested Hero route was not found. Use one of the supported example routes below.
      </p>
    </section>
    <div class="route-list hero-example-buttons">
      <a class="route-button hero-choice-button" href="/hero/organization" data-link>
        Sample Department Main Building
      </a>
      <a class="route-button hero-choice-button" href="/hero/sample-site" data-link>
        Tour the Sample Visitor Center
      </a>
      <a class="route-button hero-choice-button" href="/hero/asset-backed-details" data-link>
        Asset-backed Details
      </a>
    </div>
  `;
}
