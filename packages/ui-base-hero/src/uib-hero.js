import '@ui.base/ui/heading-block';
import '@ui.base/ui/action-group';
import '@ui.base/ui/detail-list';
import '@ui.base/assets/components/uib-asset-image';
import { registerHeroElement } from './hero-data.js';
/**
 * UibHero
 *
 * A framework-neutral Web Component for page hero sections. Use this component
 * at the top of landing pages, tour pages, product pages, and other important
 * entry pages where the page must communicate value and guide a user to an
 * action.
 *
 * Attributes / properties:
 * - eyebrow: Small label displayed above the headline.
 * - headline: Primary message. Keep short and benefit-oriented.
 * - subheadline: Supporting copy that clarifies the value proposition.
 * - action-components: JSON array string for Hero Action Components. This is the
 *   preferred action model for new pages and App Management records.
 * - primary-cta-label / primary-cta-href / primary-cta-action: Legacy fixed CTA
 *   fields still accepted for older pages.
 * - third-cta-label / third-cta-href / third-cta-action: Text, fallback link,
 *   and parent callback action for an optional third action.
 * - show-third-cta: Boolean attribute. Set to "false" to hide the third CTA.
 * - third-cta-disabled: Boolean attribute. Set to "true" to disable the third CTA.
 * - fourth-cta-label / fourth-cta-href / fourth-cta-action: Text, fallback link,
 *   and parent callback action for an optional fourth action.
 * - show-fourth-cta: Boolean attribute. Set to "false" to hide the fourth CTA.
 * - fourth-cta-disabled: Boolean attribute. Set to "true" to disable the fourth CTA.
 * - visual-source: "url", "asset", or "none". Source only, not presentation.
 * - visual-role: "image", "icon", "background", or "svg". Presentation role only.
 * - visual-src: Optional image URL, remote URL, relative URL, or data URI. A non-empty visual-src wins over visual-asset-id.
 * - visual-asset-id: Optional asset id used by uib-asset-image when visual-src is empty.
 * - asset-map: Optional JSON map of asset IDs to URLs/metadata for raw asset ID rendering.
 * - visual-alt: Alt text for the visual image.
 * - visual-mode: "panel-right", "panel-left", or "background". Defaults to "panel-right".
 *   Use panel modes when the image is a subset of the Hero. Use background when
 *   the image/media should sit behind the whole Hero surface, including navigation
 *   and detail bullets.
 * - visual-position: Compatibility alias for visual-mode. Supports "right",
 *   "left", or "background". Defaults to "right" when visual-mode is not set.
 *   Use "right" or "left" for a visual panel; use "background" to place
 *   the visual behind the main hero body with an overlay for readability.
 * - layout-opacity: Number from 0 to 1 applied to the .uib-hero__layout opacity.
 *   Defaults to 0.8. Invalid values fall back to 0.8; out-of-range values are clamped.
 * - trust-signal: Short trust-building text displayed under the main content.
 * - nav-items: JSON array string for navigation items. Example:
 *   [{"label":"Visit","href":"/visit"},{"label":"Contact","href":"/contact"}]
 * - details: JSON array string for bullet/detail points. Example:
 *   [{"label":"Tour Length","value":"45 minutes","icon":"clock"}]
 *   Detail icons support two modes:
 *   - Text badge: {"icon":"clock"} renders a compact text badge such as "CL".
 *   - Image icon: {"iconUrl":"/icons/clock.svg","iconAlt":"Clock"} renders an image.
 *     You may also use iconSrc, or pass a URL/data URI directly in icon.
 * - theme: "light", "dark", or "organization". Defaults to "light".
 * - size: "compact", "default", or "large". Defaults to "default".
 * - hero-data: JSON object string saved by the App Management UI / ORM. The
 *   component also exposes the heroData JavaScript property and loadHeroData(data)
 *   method so parent applications can load JSON objects directly after an API call.
 *   Supported wrappers include { hero: {...} }, { data: {...} }, { config: {...} },
 *   and direct Hero data. CTA data may be provided as primaryCta/secondaryCta/etc.,
 *   an action-components/actions/callToActions/buttons array, or flat
 *   primaryCtaLabel/primaryCtaHref style fields. App-management Type/Value CTA
 *   objects are normalized so Link values become hrefs and Action values become
 *   parent callback actions.
 *
 * Rich slots:
 * - slot="navigation": Custom navigation markup. Replaces nav-items output.
 * - slot="visual": Custom visual, illustration, product screenshot, or media.
 * - slot="trust": Custom trust signal content. Replaces trust-signal text.
 * - slot="after-content": Optional content displayed below trust signal.
 *
 * Events:
 * - uib-hero-cta: Preferred cancelable event for all Hero CTA clicks. The event
 *   detail includes cta, action, href, label, disabled, and ctaType.
 * - uib-hero-primary-cta: Backward-compatible event for the primary CTA.
 * - uib-hero-secondary-cta: Backward-compatible event for the secondary CTA.
 * - uib-hero-third-cta: Backward-compatible event for the third CTA.
 * - uib-hero-fourth-cta: Backward-compatible event for the fourth CTA.
 *
 * The component does not own application state. Parent pages can set attributes,
 * update properties, listen for events, route the user, or disable CTAs.
 */

const BOOLEAN_FALSE_VALUES = new Set(['false', '0', 'no', 'off']);

const styles = `
  :host {
    --uib-hero-background: #f8fbff;
    --uib-hero-surface: rgba(255, 255, 255, 0.88);
    --uib-hero-text-color: #13294b;
    --uib-hero-muted-color: #40516f;
    --uib-hero-border-color: rgba(19, 41, 75, 0.14);
    --uib-hero-accent-color: #174a8b;
    --uib-hero-accent-contrast: #ffffff;
    --uib-hero-secondary-background: rgba(255, 255, 255, 0.72);
    --uib-hero-secondary-color: #13294b;
    --uib-hero-action-panel-background: rgba(255, 255, 255, 0.72);
    --uib-hero-action-panel-border-color: rgba(19, 41, 75, 0.16);
    --uib-hero-detail-background: rgba(255, 255, 255, 0.72);
    --uib-hero-shadow: 0 22px 60px rgba(10, 31, 68, 0.12);
    --uib-hero-radius: 28px;
    --uib-hero-max-width: 1180px;
    --uib-hero-gap: 2rem;
    --uib-hero-layout-opacity: 0.8;
    display: block;
    color: var(--uib-hero-text-color);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    user-select: text;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .uib-hero {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    background: var(--uib-hero-background);
    border: 1px solid var(--uib-hero-border-color);
    border-radius: var(--uib-hero-radius);
    box-shadow: var(--uib-hero-shadow);
  }

  .uib-hero--dark {
    --uib-hero-background: linear-gradient(135deg, #082b27 0%, #103b34 46%, #0d1f1e 100%);
    --uib-hero-surface: rgba(8, 31, 34, 0.78);
    --uib-hero-text-color: #ffffff;
    --uib-hero-muted-color: #d7e6df;
    --uib-hero-border-color: rgba(255, 255, 255, 0.16);
    --uib-hero-accent-color: #f4bd46;
    --uib-hero-accent-contrast: #0d1f1e;
    --uib-hero-secondary-background: rgba(255, 255, 255, 0.08);
    --uib-hero-secondary-color: #ffffff;
    --uib-hero-action-panel-background: rgba(8, 31, 34, 0.62);
    --uib-hero-action-panel-border-color: rgba(255, 255, 255, 0.18);
    --uib-hero-detail-background: rgba(255, 255, 255, 0.08);
  }

  .uib-hero--organization {
    --uib-hero-background: linear-gradient(135deg, #ffffff 0%, #eef5ff 52%, #dfeafa 100%);
    --uib-hero-accent-color: #0b3b75;
    --uib-hero-accent-contrast: #ffffff;
  }

  .uib-hero__nav {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.05rem clamp(1rem, 3vw, 2rem);
    border-bottom: 1px solid var(--uib-hero-border-color);
  }

  .uib-hero__brand {
    min-width: max-content;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .uib-hero__brand-mark {
    width: 2.15rem;
    height: 2.15rem;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    color: var(--uib-hero-accent-contrast);
    background: var(--uib-hero-accent-color);
    font-size: 0.85rem;
    font-weight: 900;
  }

  .uib-hero__nav-links {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.35rem 1rem;
  }

  .uib-hero__nav-links a,
  ::slotted([slot="navigation"] a) {
    color: inherit;
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 700;
    opacity: 0.88;
  }

  .uib-hero__nav-links a:hover,
  ::slotted([slot="navigation"] a:hover) {
    opacity: 1;
    text-decoration: underline;
    text-underline-offset: 0.25rem;
  }

  .uib-hero__layout {
    position: relative;
    z-index: 2;
    max-width: var(--uib-hero-max-width);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 0.95fr);
    gap: var(--uib-hero-gap);
    align-items: center;
    padding: clamp(2rem, 5vw, 4.5rem) clamp(1.25rem, 4vw, 3rem);
    opacity: var(--uib-hero-layout-opacity, 0.8);
  }

  .uib-hero--left .uib-hero__layout {
    grid-template-columns: minmax(300px, 0.95fr) minmax(0, 1fr);
  }

  .uib-hero--left .uib-hero__content {
    order: 2;
  }

  .uib-hero--left .uib-hero__visual {
    order: 1;
  }

  .uib-hero--background .uib-hero__layout {
    grid-template-columns: minmax(0, 0.72fr);
    min-height: 540px;
  }

  .uib-hero--background .uib-hero__nav {
    background: var(--uib-hero-surface);
    backdrop-filter: blur(10px);
  }

  .uib-hero--background .uib-hero__details {
    background: var(--uib-hero-surface);
    backdrop-filter: blur(10px);
  }

  .uib-hero--background .uib-hero__content {
    padding: clamp(1.25rem, 3vw, 2rem);
    border: 1px solid var(--uib-hero-border-color);
    border-radius: 24px;
    background: var(--uib-hero-surface);
    backdrop-filter: blur(12px);
  }

  .uib-hero--background .uib-hero__visual {
    position: absolute;
    inset: 0;
    z-index: 0;
    min-height: 100%;
    border-radius: inherit;
    opacity: 0.88;
  }

  .uib-hero--background .uib-hero__visual::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(6, 20, 40, 0.72), rgba(6, 20, 40, 0.18));
  }

  .uib-hero__content {
    min-width: 0;
  }

  .uib-hero__eyebrow {
    margin: 0 0 0.7rem;
    color: var(--uib-hero-accent-color);
    font-size: 0.85rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .uib-hero__headline {
    margin: 0;
    max-width: 12ch;
    font-size: clamp(2.15rem, 6vw, 5.2rem);
    line-height: 0.95;
    letter-spacing: -0.06em;
    color: var(--uib-hero-text-color);
  }

  .uib-hero--compact .uib-hero__headline {
    font-size: clamp(1.9rem, 4vw, 3.2rem);
  }

  .uib-hero--large .uib-hero__headline {
    font-size: clamp(2.6rem, 8vw, 6.1rem);
  }

  .uib-hero__subheadline {
    margin: 1rem 0 0;
    max-width: 60ch;
    color: var(--uib-hero-muted-color);
    font-size: clamp(1rem, 1.7vw, 1.18rem);
    line-height: 1.65;
  }

  .uib-hero__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: fit-content;
    max-width: 100%;
    margin-top: 1.55rem;
    padding: 0.8rem;
    border: 1px solid var(--uib-hero-action-panel-border-color, var(--uib-hero-border-color));
    border-radius: 1.1rem;
    background: var(--uib-hero-action-panel-background, rgba(255, 255, 255, 0.72));
    backdrop-filter: blur(10px);
  }

  .uib-hero__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 3rem;
    padding: 0.85rem 1.15rem;
    border-radius: 0.65rem;
    border: 1px solid transparent;
    font: inherit;
    font-size: 0.95rem;
    font-weight: 850;
    text-decoration: none;
    cursor: pointer;
    transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
  }

  .uib-hero__button:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(10, 31, 68, 0.16);
  }

  .uib-hero__button--primary {
    color: var(--uib-hero-accent-contrast);
    background: var(--uib-hero-accent-color);
  }

  .uib-hero__button--secondary,
  .uib-hero__button--tertiary,
  .uib-hero__button--third {
    color: var(--uib-hero-secondary-color);
    background: var(--uib-hero-secondary-background);
    border-color: var(--uib-hero-border-color);
  }

  .uib-hero__button--tertiary,
  .uib-hero__button--third {
    background: color-mix(in srgb, var(--uib-hero-accent-color) 10%, var(--uib-hero-secondary-background));
  }

  .uib-hero__button--destructive {
    color: var(--uib-hero-destructive-color, #ffffff);
    background: var(--uib-hero-destructive-background, #b42318);
    border-color: var(--uib-hero-destructive-border-color, #b42318);
  }

  .uib-hero__button--fourth {
    color: var(--uib-hero-text-color);
    background: transparent;
    border-color: var(--uib-hero-border-color);
  }

  .uib-hero__button[aria-disabled="true"],
  .uib-hero__button:disabled {
    opacity: 0.48;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .uib-hero__trust {
    margin-top: 1rem;
    color: var(--uib-hero-muted-color);
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .uib-hero__details {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0;
    border-top: 1px solid var(--uib-hero-border-color);
    background: var(--uib-hero-detail-background);
  }

  .uib-hero__detail {
    min-width: 0;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.8rem;
    align-items: center;
    padding: 1rem clamp(1rem, 3vw, 1.4rem);
    border-right: 1px solid var(--uib-hero-border-color);
  }

  .uib-hero__detail:last-child {
    border-right: 0;
  }

  .uib-hero__detail-icon {
    width: 2.2rem;
    height: 2.2rem;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 999px;
    color: var(--uib-hero-accent-color);
    border: 1px solid currentColor;
    font-size: 0.9rem;
    font-weight: 900;
    text-transform: uppercase;
    overflow: hidden;
  }

  .uib-hero__detail-icon--image {
    padding: 0.28rem;
    background: rgba(255, 255, 255, 0.7);
  }

  .uib-hero__detail-icon-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .uib-hero__detail-label {
    margin: 0;
    color: var(--uib-hero-text-color);
    font-size: 0.77rem;
    font-weight: 900;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .uib-hero__detail-value {
    margin: 0.18rem 0 0;
    color: var(--uib-hero-muted-color);
    font-size: 0.92rem;
    line-height: 1.35;
  }

  .uib-hero__visual {
    position: relative;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
  }

  .uib-hero__visual img {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 300px;
    object-fit: cover;
  }

  ::slotted([slot="visual"]) {
    display: block;
    width: 100%;
    height: 100%;
    min-height: inherit;
  }

  .uib-hero--background ::slotted([slot="visual"]) {
    min-height: 100%;
    border-radius: inherit;
  }

  .uib-hero__visual-placeholder {
    min-height: 360px;
    height: 100%;
    border: 1px solid var(--uib-hero-border-color);
    border-radius: 24px;
    background:
      radial-gradient(circle at 72% 25%, rgba(255,255,255,0.72), transparent 20%),
      linear-gradient(135deg, rgba(23,74,139,0.18), rgba(23,74,139,0.04));
    display: grid;
    place-items: center;
    padding: 1.5rem;
  }

  .uib-hero__visual-card {
    width: min(360px, 92%);
    min-height: 220px;
    border-radius: 22px;
    padding: 1.25rem;
    color: var(--uib-hero-text-color);
    background: var(--uib-hero-surface);
    border: 1px solid var(--uib-hero-border-color);
    box-shadow: 0 24px 54px rgba(10, 31, 68, 0.16);
  }

  .uib-hero__visual-line {
    height: 0.75rem;
    margin-top: 0.8rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--uib-hero-accent-color) 24%, transparent);
  }

  .uib-hero__visual-line:nth-child(2) { width: 82%; }
  .uib-hero__visual-line:nth-child(3) { width: 58%; }
  .uib-hero__visual-line:nth-child(4) { width: 72%; }

  @media (max-width: 820px) {
    .uib-hero__nav {
      align-items: flex-start;
      flex-direction: column;
    }

    .uib-hero__layout,
    .uib-hero--left .uib-hero__layout {
      grid-template-columns: 1fr;
    }

    .uib-hero--left .uib-hero__content,
    .uib-hero--left .uib-hero__visual {
      order: initial;
    }

    .uib-hero--background .uib-hero__layout {
      min-height: 0;
      grid-template-columns: 1fr;
    }

    .uib-hero--background .uib-hero__visual {
      position: absolute;
      min-height: 100%;
    }

    .uib-hero__headline {
      max-width: 14ch;
    }
  }

  @media (max-width: 560px) {
    .uib-hero__actions {
      align-items: stretch;
      flex-direction: column;
      width: 100%;
    }

    .uib-hero__button {
      width: 100%;
    }

    .uib-hero__details {
      grid-template-columns: 1fr;
    }

    .uib-hero__detail {
      border-right: 0;
      border-bottom: 1px solid var(--uib-hero-border-color);
    }

    .uib-hero__detail:last-child {
      border-bottom: 0;
    }
  }
`;

function boolFromAttribute(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (value === '') return true;
  return !BOOLEAN_FALSE_VALUES.has(String(value).trim().toLowerCase());
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parseJsonArray(value, fallback = []) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn('[uib-hero] Could not parse JSON array attribute.', error);
    return fallback;
  }
}

function safeHref(value) {
  const href = String(value ?? '').trim();
  if (!href) return '#';
  if (/^javascript:/i.test(href)) return '#';
  return href;
}

function iconText(icon, index) {
  const normalized = String(icon ?? '').trim();
  if (!normalized) return String(index + 1);
  return normalized.slice(0, 2).toUpperCase();
}

function safeImageSrc(value) {
  const src = String(value ?? '').trim();
  if (!src) return '';
  if (/^javascript:/i.test(src)) return '';
  if (/^data:/i.test(src) && !/^data:image\//i.test(src)) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (/^data:image\//i.test(src)) return src;
  if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) return src;
  if (/^[a-z0-9_.~%+-]+\.(svg|png|jpe?g|gif|webp|avif)([?#].*)?$/i.test(src)) return src;
  return '';
}

function detailIconSource(item) {
  const explicitSource = safeImageSrc(item?.iconUrl || item?.iconSrc || item?.iconHref || item?.iconImage);
  if (explicitSource) return explicitSource;
  return safeImageSrc(item?.icon);
}

function renderDetailIcon(item, index) {
  const source = detailIconSource(item);

  if (source) {
    const alt = String(item?.iconAlt ?? '').trim();
    const hiddenAttribute = alt ? '' : ' aria-hidden="true"';
    return (
  `<dt class="uib-hero__detail-icon uib-hero__detail-icon--image"` +
  (hiddenAttribute) +
  `><img class="uib-hero__detail-icon-image" src="` +
  (escapeHtml(source)) +
  `" alt="` +
  (escapeHtml(alt)) +
  `" loading="lazy" decoding="async" />` +
  `</dt>`
);
  }

  return (
  `<dt class="uib-hero__detail-icon uib-hero__detail-icon--text" aria-hidden="true">` +
  (escapeHtml(iconText(item?.icon, index))) +
  `</dt>`
);
}

function normalizeLayoutOpacity(value, fallback = 0.8) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(1, Math.max(0, parsed));
}

function normalizeVisualPosition(modeValue, positionValue, roleValue = '') {
  const rawRole = String(roleValue ?? '').trim().toLowerCase();
  const rawMode = String(modeValue ?? '').trim().toLowerCase();
  const rawPosition = String(positionValue ?? '').trim().toLowerCase();
  const raw = rawPosition || rawMode || rawRole || 'right';

  if (['background', 'background-full', 'full-background', 'hero-background'].includes(raw)) {
    return 'background';
  }

  if (['panel-left', 'left', 'image-left', 'visual-left'].includes(raw)) {
    return 'left';
  }

  return 'right';
}

function normalizeVisualSource(value, visualSrc = '', visualAssetId = '') {
  if (String(visualSrc || '').trim()) return 'url';
  const raw = String(value ?? '').trim().toLowerCase();
  if (['url', 'asset', 'none'].includes(raw)) return raw;
  if (String(visualAssetId || '').trim()) return 'asset';
  return 'none';
}

function normalizeVisualRole(value, placementValue = '') {
  const raw = String(value ?? '').trim().toLowerCase().replaceAll('_', '-');
  if (['image', 'icon', 'background', 'svg'].includes(raw)) return raw;
  const placement = String(placementValue ?? '').trim().toLowerCase();
  if (['background', 'background-full', 'full-background', 'hero-background'].includes(placement)) return 'background';
  return 'image';
}

function resolveVisualSourceValue(source, visualSrc, visualAssetId) {
  const src = String(visualSrc || '').trim();
  if (src) return { source: 'url', src, assetId: String(visualAssetId || '').trim() };
  const assetId = String(visualAssetId || '').trim();
  if (assetId && source !== 'none') return { source: 'asset', src: '', assetId };
  return { source: 'none', src: '', assetId: '' };
}


const CTA_KINDS = ['primary', 'secondary', 'third', 'fourth'];
const CTA_VARIANTS = ['primary', 'secondary', 'tertiary', 'destructive', 'third', 'fourth'];
const HERO_DATA_ATTRIBUTES = new Set(['hero-data', 'hero-json']);
const HERO_ACTION_BUTTON_ATTRIBUTES = new Set(['action-components', 'hero-action-buttons', 'actions', 'action-buttons']);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeLookupKey(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function valueFrom(source, keys) {
  if (!isPlainObject(source)) return undefined;
  const wantedKeys = Array.isArray(keys) ? keys : [keys];

  for (const key of wantedKeys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) return source[key];
  }

  const normalized = new Map(Object.keys(source).map((key) => [normalizeLookupKey(key), key]));
  for (const key of wantedKeys) {
    const actualKey = normalized.get(normalizeLookupKey(key));
    if (actualKey !== undefined) return source[actualKey];
  }

  return undefined;
}

function hasValue(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

function firstValue(...values) {
  for (const value of values) {
    if (hasValue(value)) return value;
  }
  return undefined;
}

function parseJsonObject(value, fallback = {}) {
  if (isPlainObject(value)) return value;
  if (!hasValue(value)) return fallback;

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return isPlainObject(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn('[uib-hero] Could not parse Hero JSON data.', error);
    return fallback;
  }
}

function parseMaybeJson(value) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function looksLikeHeroPayload(value) {
  if (!isPlainObject(value)) return false;
  return [
    'headline', 'subheadline', 'eyebrow', 'trustSignal', 'trust-signal',
    'primaryCta', 'primaryCTA', 'primaryAction', 'primaryButton',
    'secondaryCta', 'thirdCta', 'fourthCta',
    'actionComponents', 'action-components', 'action_components',
    'actions', 'callToActions', 'ctas', 'buttons', 'actionButtons',
    'visual', 'image', 'media', 'navItems', 'navigation', 'details', 'tourDetails',
    'brandLabel', 'brand-label', 'brand'
  ].some((key) => valueFrom(value, key) !== undefined);
}

function unwrapHeroData(value) {
  let current = parseMaybeJson(value);

  for (let index = 0; index < 6; index += 1) {
    if (!isPlainObject(current)) return {};
    if (looksLikeHeroPayload(current)) return current;

    const next = valueFrom(current, [
      'hero', 'heroData', 'heroConfig', 'heroConfiguration', 'configuration',
      'config', 'settings', 'properties', 'attributes', 'data', 'json', 'payload', 'value'
    ]);

    if (!hasValue(next) || next === current) return current;
    current = parseMaybeJson(next);
  }

  return isPlainObject(current) ? current : {};
}

function asArray(value) {
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) return parsed;
  if (isPlainObject(parsed)) {
    const items = valueFrom(parsed, ['items', 'values', 'links', 'details', 'actions']);
    const parsedItems = parseMaybeJson(items);
    if (Array.isArray(parsedItems)) return parsedItems;
  }
  return undefined;
}

function boolFromValue(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const normalized = String(value).trim().toLowerCase();
  if (BOOLEAN_FALSE_VALUES.has(normalized)) return false;
  if (['true', '1', 'yes', 'on', 'show', 'visible', 'enabled'].includes(normalized)) return true;
  return fallback;
}

function titleCaseKind(kind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function actionObjectKeys(kind) {
  const title = titleCaseKind(kind);
  return [
    `${kind}Cta`, `${kind}CTA`, `${kind}Action`, `${kind}Button`, `${kind}CallToAction`,
    `${kind}-cta`, `${kind}-action`, `${kind}-button`, `cta${title}`, `action${title}`
  ];
}

function flatActionKeys(kind, field) {
  const title = titleCaseKind(kind);
  const fieldTitle = titleCaseKind(field);
  return [
    `${kind}Cta${fieldTitle}`,
    `${kind}CTA${fieldTitle}`,
    `${kind}${fieldTitle}`,
    `${kind}-cta-${field}`,
    `${kind}-${field}`,
    `${field}${title}Cta`
  ];
}

function normalizeActionKind(value, fallback) {
  const normalized = normalizeLookupKey(value);
  if (!normalized) return fallback;
  if (['primary', 'primarycta', 'primaryaction', 'first', '1'].includes(normalized)) return 'primary';
  if (['secondary', 'secondarycta', 'secondaryaction', 'second', '2'].includes(normalized)) return 'secondary';
  if (['third', 'thirdcta', 'thirdaction', 'tertiary', 'tertiarycta', '3'].includes(normalized)) return 'third';
  if (['fourth', 'fourthcta', 'fourthaction', 'quaternary', '4'].includes(normalized)) return 'fourth';
  return fallback;
}

function normalizeActionVariant(value, fallback = 'secondary') {
  const normalized = normalizeLookupKey(value);
  if (!normalized) return fallback;
  if (['primary', 'primarycta', 'primaryaction'].includes(normalized)) return 'primary';
  if (['secondary', 'secondarycta', 'secondaryaction'].includes(normalized)) return 'secondary';
  if (['tertiary', 'third', 'thirdcta', 'thirdaction'].includes(normalized)) return 'tertiary';
  if (['destructive', 'danger', 'delete', 'remove', 'cancel'].includes(normalized)) return 'destructive';
  if (['fourth', 'fourthcta', 'fourthaction', 'quaternary'].includes(normalized)) return 'fourth';
  return CTA_VARIANTS.includes(normalized) ? normalized : fallback;
}

function classifyCtaType(value) {
  const normalized = normalizeLookupKey(value);
  if (!normalized) return '';
  if (['link', 'url', 'href', 'route', 'navigation', 'navigate'].includes(normalized)) return 'Link';
  if (['action', 'callback', 'event', 'command', 'function'].includes(normalized)) return 'Action';
  return String(value);
}

function looksLikeHref(value) {
  const text = String(value ?? '').trim();
  return Boolean(text && (text.startsWith('#') || text.startsWith('/') || text.startsWith('./') || text.startsWith('../') || /^https?:\/\//i.test(text)));
}

function normalizeCtaAction(rawAction, source, kind) {
  const actionObject = isPlainObject(rawAction) ? rawAction : {};
  const flatLabel = valueFrom(source, flatActionKeys(kind, 'label'));
  const flatHref = valueFrom(source, flatActionKeys(kind, 'href'));
  const flatAction = valueFrom(source, flatActionKeys(kind, 'action'));
  const flatType = valueFrom(source, flatActionKeys(kind, 'type'));
  const flatValue = valueFrom(source, flatActionKeys(kind, 'value'));
  const title = titleCaseKind(kind);

  const label = firstValue(
    valueFrom(actionObject, ['label', 'Label', 'text', 'title', 'name', 'buttonLabel', 'ctaLabel']),
    flatLabel
  );
  const ctaType = classifyCtaType(firstValue(
    valueFrom(actionObject, ['type', 'Type', 'ctaType', 'buttonType', 'linkType', 'actionType']),
    flatType
  ));
  const rawValue = firstValue(
    valueFrom(actionObject, ['value', 'Value', 'ctaValue', 'buttonValue']),
    flatValue
  );
  const explicitHref = firstValue(
    valueFrom(actionObject, ['href', 'Href', 'url', 'URL', 'link', 'route', 'to', 'target', 'targetUrl']),
    flatHref
  );
  const explicitAction = firstValue(
    valueFrom(actionObject, ['action', 'Action', 'actionToken', 'action_token', 'token', 'callback', 'command', 'event', 'eventName', 'actionName']),
    flatAction
  );

  let href = explicitHref;
  let action = explicitAction;

  if (ctaType === 'Link') {
    href = firstValue(href, rawValue);
  } else if (ctaType === 'Action') {
    action = firstValue(action, rawValue);
  } else if (hasValue(rawValue)) {
    if (!hasValue(href) && looksLikeHref(rawValue)) href = rawValue;
    else if (!hasValue(action)) action = rawValue;
  }

  const showValue = firstValue(
    valueFrom(actionObject, ['show', 'Show', 'shown', 'visible', 'isVisible', 'display', 'enabled']),
    valueFrom(source, [`show${title}Cta`, `${kind}Shown`, `show-${kind}-cta`, `${kind}Show`])
  );
  const disabledValue = firstValue(
    valueFrom(actionObject, ['disabled', 'Disabled', 'isDisabled', 'disable']),
    valueFrom(source, [`${kind}CtaDisabled`, `${kind}Disabled`, `${kind}-cta-disabled`, `disable${title}Cta`])
  );

  const variant = normalizeActionVariant(
    firstValue(
      valueFrom(actionObject, ['variant', 'Variant', 'style', 'tone', 'appearance', 'buttonVariant']),
      valueFrom(source, flatActionKeys(kind, 'variant'))
    ),
    kind === 'primary' ? 'primary' : kind === 'third' ? 'tertiary' : kind === 'fourth' ? 'fourth' : 'secondary'
  );

  return {
    label,
    href,
    action,
    ctaType,
    variant,
    shown: boolFromValue(showValue, true),
    disabled: boolFromValue(disabledValue, false)
  };
}

function normalizeActions(source) {
  const output = {};
  const actionsCollection = asArray(firstValue(
    valueFrom(source, ['actionComponents', 'action-components', 'action_components', 'actions', 'callToActions', 'call-to-actions', 'ctas', 'ctaButtons', 'buttons', 'actionButtons', 'heroActions', 'heroActionButtons', 'hero_action_buttons'])
  ));

  if (actionsCollection) {
    actionsCollection.forEach((item, index) => {
      const kind = normalizeActionKind(valueFrom(item, ['kind', 'slot', 'key', 'cta', 'ctaKey', 'buttonKey', 'position', 'placement', 'id']), CTA_KINDS[index]);
      if (kind && CTA_KINDS.includes(kind)) output[kind] = normalizeCtaAction(item, source, kind);
    });

    CTA_KINDS.forEach((kind) => {
      if (!output[kind]) {
        output[kind] = { label: '', href: '', action: '', ctaType: '', shown: false, disabled: false };
      }
    });
    return output;
  }

  CTA_KINDS.forEach((kind) => {
    const actionObject = valueFrom(source, actionObjectKeys(kind));
    const normalized = normalizeCtaAction(actionObject, source, kind);
    if (hasValue(normalized.label) || hasValue(normalized.href) || hasValue(normalized.action) || hasValue(actionObject)) {
      output[kind] = normalized;
    }
  });

  return output;
}

function actionComponentsForSource(source) {
  const actionsCollection = asArray(firstValue(
    valueFrom(source, ['actionComponents', 'action-components', 'action_components', 'actions', 'callToActions', 'call-to-actions', 'ctas', 'ctaButtons', 'buttons', 'actionButtons', 'heroActions', 'heroActionButtons', 'hero_action_buttons'])
  ));

  if (actionsCollection) {
    return actionsCollection.map((item, index) => {
      const action = isPlainObject(item) ? item : {};
      const kind = normalizeActionKind(
        valueFrom(action, ['kind', 'slot', 'key', 'cta', 'ctaKey', 'buttonKey', 'position', 'placement', 'id', 'name']),
        CTA_KINDS[index] || `action-${index + 1}`
      );
      return {
        kind,
        id: valueFrom(action, ['id', 'actionId', 'buttonId']) || valueFrom(action, ['name', 'key']) || `${kind}-${index + 1}`,
        ...normalizeCtaAction(action, {}, kind)
      };
    }).filter((action) => action.shown && Boolean(action.label));
  }

  const normalizedActions = normalizeActions(source);
  return CTA_KINDS
    .map((kind) => normalizedActions[kind] ? { kind, id: `${kind}-${CTA_KINDS.indexOf(kind) + 1}`, ...normalizedActions[kind] } : undefined)
    .filter((action) => action && action.shown && Boolean(action.label));
}

function normalizeHeroData(value) {
  const source = unwrapHeroData(value);
  const brand = valueFrom(source, ['brand', 'brandInfo', 'navigationBrand']) || {};
  const visual = valueFrom(source, ['visual', 'image', 'media', 'heroImage', 'background', 'backgroundImage']) || {};
  const navigation = asArray(firstValue(
    valueFrom(source, ['navItems', 'navigation', 'navigationItems', 'nav', 'links'])
  ));
  const details = asArray(firstValue(
    valueFrom(source, ['details', 'detailItems', 'tourDetails', 'bullets', 'bulletPoints', 'facts', 'keyDetails'])
  ));
  const actions = normalizeActions(source);
  const actionComponents = actionComponentsForSource(source);

  const attrs = {};
  const attrMap = [
    ['eyebrow', firstValue(valueFrom(source, ['eyebrow', 'overline', 'kicker']))],
    ['headline', firstValue(valueFrom(source, ['headline', 'title', 'heading']))],
    ['subheadline', firstValue(valueFrom(source, ['subheadline', 'subHeadline', 'description', 'summary', 'body', 'copy']))],
    ['trust-signal', firstValue(valueFrom(source, ['trustSignal', 'trust-signal', 'trust', 'confidenceText']))],
    ['theme', firstValue(valueFrom(source, ['theme', 'variant']))],
    ['size', firstValue(valueFrom(source, ['size', 'density']))],
    ['brand-label', firstValue(valueFrom(brand, ['label', 'name', 'title']), valueFrom(source, ['brandLabel', 'brand-label']))],
    ['brand-mark', firstValue(valueFrom(brand, ['mark', 'iconText', 'initials']), valueFrom(source, ['brandMark', 'brand-mark']))],
    ['visual-source', firstValue(valueFrom(visual, ['source', 'visualSource', 'sourceType']), valueFrom(source, ['visualSource', 'visual_source']))],
    ['visual-role', firstValue(valueFrom(visual, ['role', 'visualRole', 'type', 'presentation']), valueFrom(source, ['visualRole', 'visual_role']))],
    ['visual-src', firstValue(valueFrom(visual, ['src', 'url', 'href', 'imageUrl', 'imageSrc', 'backgroundImageUrl', 'value']), valueFrom(source, ['visualSrc', 'visual_src', 'visualUrl', 'imageUrl', 'imageSrc', 'backgroundImageUrl', 'backgroundImageSrc', 'backgroundImage']))],
    ['visual-asset-id', firstValue(valueFrom(visual, ['assetId', 'asset_id', 'visualAssetId', 'visual_asset_id']), valueFrom(source, ['visualAssetId', 'visual_asset_id', 'assetId', 'asset_id']))],
    ['visual-alt', firstValue(valueFrom(visual, ['alt', 'altText', 'description']), valueFrom(source, ['visualAlt', 'visual_alt', 'imageAlt', 'altText']))],
    ['visual-mode', firstValue(valueFrom(visual, ['mode', 'visualMode', 'position', 'layout']), valueFrom(source, ['visualMode', 'visualPosition', 'imagePosition']))],
    ['visual-position', firstValue(valueFrom(visual, ['position', 'visualPosition']), valueFrom(source, ['visualPosition']))],
    ['layout-opacity', firstValue(valueFrom(source, ['layoutOpacity', 'layout-opacity', 'opacity', 'layoutAlpha']))]
  ];

  attrMap.forEach(([attribute, attrValue]) => {
    if (hasValue(attrValue)) attrs[attribute] = String(attrValue);
  });

  if (actionComponents.length) {
    attrs['action-components'] = JSON.stringify(actionComponents);
  }

  Object.entries(actions).forEach(([kind, action]) => {
    if (hasValue(action.label)) attrs[`${kind}-cta-label`] = String(action.label);
    else if (action.shown === false) attrs[`${kind}-cta-label`] = '';

    if (hasValue(action.href)) attrs[`${kind}-cta-href`] = String(action.href);
    else if (action.shown === false) attrs[`${kind}-cta-href`] = '';

    if (hasValue(action.action)) attrs[`${kind}-cta-action`] = String(action.action);
    else if (action.shown === false) attrs[`${kind}-cta-action`] = '';

    if (hasValue(action.ctaType)) attrs[`${kind}-cta-type`] = String(action.ctaType);
    else if (action.shown === false) attrs[`${kind}-cta-type`] = '';

    attrs[`show-${kind}-cta`] = action.shown ? 'true' : 'false';
    attrs[`${kind}-cta-disabled`] = action.disabled ? 'true' : 'false';
  });

  return { attrs, details, navItems: navigation };
}

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibHero extends BaseHTMLElement {
  static get observedAttributes() {
    return [
      'eyebrow',
      'headline',
      'subheadline',
      'primary-cta-label',
      'primary-cta-href',
      'primary-cta-action',
      'primary-cta-action-token',
      'primary-cta-type',
      'show-primary-cta',
      'primary-cta-disabled',
      'secondary-cta-label',
      'secondary-cta-href',
      'secondary-cta-action',
      'secondary-cta-action-token',
      'secondary-cta-type',
      'show-secondary-cta',
      'secondary-cta-disabled',
      'third-cta-label',
      'third-cta-href',
      'third-cta-action',
      'third-cta-action-token',
      'third-cta-type',
      'show-third-cta',
      'third-cta-disabled',
      'fourth-cta-label',
      'fourth-cta-href',
      'fourth-cta-action',
      'fourth-cta-action-token',
      'fourth-cta-type',
      'show-fourth-cta',
      'fourth-cta-disabled',
      'visual-source',
      'visual-role',
      'visual-src',
      'visual-asset-id',
      'visual-alt',
      'visual-mode',
      'visual-position',
      'layout-opacity',
      'trust-signal',
      'nav-items',
      'details',
      'asset-map',
      'theme',
      'size',
      'brand-label',
      'brand-mark',
      'hero-data',
      'hero-json',
      'action-components',
      'hero-action-buttons',
      'actions',
      'action-buttons'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._details = undefined;
    this._navItems = undefined;
    this._heroData = undefined;
    this._isApplyingHeroData = false;
  }

  connectedCallback() {
    const serializedHeroData = this.getAttribute('hero-data') || this.getAttribute('hero-json');
    if (serializedHeroData) {
      this.loadHeroData(serializedHeroData);
      return;
    }
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (HERO_DATA_ATTRIBUTES.has(name)) {
      this.loadHeroData(newValue);
      return;
    }
    if (this.isConnected && !this._isApplyingHeroData) this.render();
  }

  get details() {
    if (this.hasAttribute('details')) return parseJsonArray(this.getAttribute('details'));
    return Array.isArray(this._details) ? this._details : [];
  }

  set details(value) {
    this._details = Array.isArray(value) ? value : [];
    if (this.isConnected && !this._isApplyingHeroData) this.render();
  }

  get navItems() {
    if (this.hasAttribute('nav-items')) return parseJsonArray(this.getAttribute('nav-items'));
    return Array.isArray(this._navItems) ? this._navItems : [];
  }

  set navItems(value) {
    this._navItems = Array.isArray(value) ? value : [];
    if (this.isConnected && !this._isApplyingHeroData) this.render();
  }

  get heroData() {
    return this._heroData;
  }

  set heroData(value) {
    this.loadHeroData(value);
  }

  /**
   * Loads Hero configuration from App Management UI / ORM JSON.
   *
   * The loader accepts a direct Hero object, a JSON string, or a wrapped ORM
   * response such as { data: { ... } }, { hero: { ... } }, or
   * { config: "{...}" }. It normalizes common app-management CTA objects
   * with label, Type, value, Show, and Disabled fields into the Hero's
   * attribute model.
   *
   * @param {object|string} value Hero configuration object or JSON string.
   * @returns {UibHero} The current element for chaining.
   */
  loadHeroData(value) {
    this._heroData = parseMaybeJson(value);
    const normalized = normalizeHeroData(value);

    this._isApplyingHeroData = true;
    try {
      Object.entries(normalized.attrs).forEach(([name, attrValue]) => {
        if (hasValue(attrValue)) this.setAttribute(name, String(attrValue));
        else this.removeAttribute(name);
      });

      if (Array.isArray(normalized.details)) this._details = normalized.details;
      if (Array.isArray(normalized.navItems)) this._navItems = normalized.navItems;
    } finally {
      this._isApplyingHeroData = false;
    }

    if (this.isConnected) this.render();
    return this;
  }

  get showPrimaryCta() {
    return boolFromAttribute(this.getAttribute('show-primary-cta'), true);
  }

  set showPrimaryCta(value) {
    this.setAttribute('show-primary-cta', value ? 'true' : 'false');
  }

  get showSecondaryCta() {
    return boolFromAttribute(this.getAttribute('show-secondary-cta'), true);
  }

  set showSecondaryCta(value) {
    this.setAttribute('show-secondary-cta', value ? 'true' : 'false');
  }

  get showThirdCta() {
    return boolFromAttribute(this.getAttribute('show-third-cta'), true);
  }

  set showThirdCta(value) {
    this.setAttribute('show-third-cta', value ? 'true' : 'false');
  }

  get showFourthCta() {
    return boolFromAttribute(this.getAttribute('show-fourth-cta'), true);
  }

  set showFourthCta(value) {
    this.setAttribute('show-fourth-cta', value ? 'true' : 'false');
  }

  get primaryCtaDisabled() {
    return boolFromAttribute(this.getAttribute('primary-cta-disabled'), false);
  }

  set primaryCtaDisabled(value) {
    this.setAttribute('primary-cta-disabled', value ? 'true' : 'false');
  }

  get secondaryCtaDisabled() {
    return boolFromAttribute(this.getAttribute('secondary-cta-disabled'), false);
  }

  set secondaryCtaDisabled(value) {
    this.setAttribute('secondary-cta-disabled', value ? 'true' : 'false');
  }

  get thirdCtaDisabled() {
    return boolFromAttribute(this.getAttribute('third-cta-disabled'), false);
  }

  set thirdCtaDisabled(value) {
    this.setAttribute('third-cta-disabled', value ? 'true' : 'false');
  }

  get fourthCtaDisabled() {
    return boolFromAttribute(this.getAttribute('fourth-cta-disabled'), false);
  }

  set fourthCtaDisabled(value) {
    this.setAttribute('fourth-cta-disabled', value ? 'true' : 'false');
  }

  get layoutOpacity() {
    return normalizeLayoutOpacity(this.getAttribute('layout-opacity'), 0.8);
  }

  set layoutOpacity(value) {
    this.setAttribute('layout-opacity', String(normalizeLayoutOpacity(value, 0.8)));
  }

  render() {
    const headline = this.getAttribute('headline') || 'Page headline';
    const subheadline = this.getAttribute('subheadline') || '';
    const eyebrow = this.getAttribute('eyebrow') || '';
    const theme = this.getAttribute('theme') || 'light';
    const size = this.getAttribute('size') || 'default';
    const visualSrc = this.getAttribute('visual-src') || '';
    const visualAssetId = this.getAttribute('visual-asset-id') || '';
    const visualSource = normalizeVisualSource(this.getAttribute('visual-source'), visualSrc, visualAssetId);
    const visualRole = normalizeVisualRole(this.getAttribute('visual-role'), this.getAttribute('visual-mode') || this.getAttribute('visual-position'));
    const visualPosition = normalizeVisualPosition(this.getAttribute('visual-mode'), this.getAttribute('visual-position'), visualRole);
    const layoutOpacity = this.layoutOpacity;
    const visualAlt = this.getAttribute('visual-alt') || '';
    const trustSignal = this.getAttribute('trust-signal') || '';
    const brandLabel = this.getAttribute('brand-label') || '';
    const brandMark = this.getAttribute('brand-mark') || 'UIB';
    const assetMap = this.getAttribute('asset-map') || '';
    const navMarkup = this.renderNavigation(brandLabel, brandMark, this.navItems);
    const detailsMarkup = this.renderDetails(this.details, assetMap);
    const actionsMarkup = this.renderActions();
    const resolvedVisual = resolveVisualSourceValue(visualSource, visualSrc, visualAssetId);
    const visualMarkup = resolvedVisual.source !== 'none'
      ? (
  `<uib-asset-image src="` +
  (escapeHtml(safeHref(resolvedVisual.src))) +
  `" asset-id="` +
  (escapeHtml(resolvedVisual.assetId)) +
  `" asset-map='` +
  (escapeHtml(assetMap)) +
  `' alt="` +
  (escapeHtml(visualAlt)) +
  `" role="` +
  (escapeHtml(visualRole)) +
  `" fit="` +
  (visualRole === 'icon' || visualRole === 'svg' ? 'contain' : 'cover') +
  `" fallback-label="` +
  (escapeHtml(headline)) +
  `">` +
  `</uib-asset-image>`
)
      : (
  `<div class="uib-hero__visual-placeholder" aria-hidden="true">` +
  `<div class="uib-hero__visual-card">` +
  `<strong>` +
  (escapeHtml(headline)) +
  `</strong>` +
  `<div class="uib-hero__visual-line">` +
  `</div>` +
  `<div class="uib-hero__visual-line">` +
  `</div>` +
  `<div class="uib-hero__visual-line">` +
  `</div>` +
  `</div>` +
  `</div>`
);

    const visualContainerMarkup = (
  `<div class="uib-hero__visual" part="visual" data-visual-role="` +
  (escapeHtml(visualRole)) +
  `" data-visual-source="` +
  (escapeHtml(resolvedVisual.source)) +
  `">` +
  `<slot name="visual">` +
  (visualMarkup) +
  `</slot>` +
  `</div>`
);
    const usesBackgroundVisual = visualPosition === 'background';

    this.shadowRoot.innerHTML = (
  `<style>` +
  (styles) +
  `</style>` +
  `<section class="uib-hero uib-hero--` +
  (escapeHtml(theme)) +
  ` uib-hero--` +
  (escapeHtml(size)) +
  ` uib-hero--` +
  (escapeHtml(visualPosition)) +
  `" part="hero" aria-label="` +
  (escapeHtml(headline)) +
  `" style="--uib-hero-layout-opacity: ` +
  (layoutOpacity) +
  `;"> ` +
  (usesBackgroundVisual ? visualContainerMarkup : '') +
  ` ` +
  (navMarkup) +
  ` ` +
  `<div class="uib-hero__layout" part="layout">` +
  `<div class="uib-hero__content" part="content">` +
  `<uib-heading-block eyebrow="` +
  (escapeHtml(eyebrow)) +
  `" headline="` +
  (escapeHtml(headline)) +
  `" subheadline="` +
  (escapeHtml(subheadline)) +
  `" size="` +
  (escapeHtml(size)) +
  `">` +
  `</uib-heading-block>` +
  ` ` +
  (actionsMarkup) +
  ` ` +
  `<div class="uib-hero__trust" part="trust">` +
  `<slot name="trust">` +
  (trustSignal ? escapeHtml(trustSignal) : '') +
  `</slot>` +
  `</div>` +
  `<slot name="after-content">` +
  `</slot>` +
  `</div>` +
  ` ` +
  (usesBackgroundVisual ? '' : visualContainerMarkup) +
  ` ` +
  `</div>` +
  ` ` +
  (detailsMarkup) +
  ` ` +
  `</section>`
);

    this.bindActionHandlers();
  }

  renderNavigation(brandLabel, brandMark, items) {
    const hasNav = brandLabel || items.length;
    return (
  `<header class="uib-hero__nav" part="nav" ` +
  (hasNav ? '' : 'hidden') +
  `><div class="uib-hero__brand" part="brand" ` +
  (brandLabel ? '' : 'hidden') +
  `>` +
  `<span class="uib-hero__brand-mark" part="brand-mark" aria-hidden="true">` +
  (escapeHtml(brandMark)) +
  `</span>` +
  `<span>` +
  (escapeHtml(brandLabel)) +
  `</span>` +
  `</div>` +
  `<div class="uib-hero__nav-links" part="nav-links">` +
  `<slot name="navigation">` +
  (items.map((item) => {
            const label = escapeHtml(item.label || 'Link');
            const href = escapeHtml(safeHref(item.href));
            return `<a href="${href}">${label}</a>`;
          }).join('')) +
  `</slot>` +
  `</div>` +
  `</header>`
);
  }

  explicitActionButtons() {
    const serialized = this.getAttribute('action-components') || this.getAttribute('hero-action-buttons') || this.getAttribute('actions') || this.getAttribute('action-buttons') || '';
    const collection = asArray(serialized);
    if (!collection) return undefined;

    return collection.map((item, index) => {
      const action = isPlainObject(item) ? item : {};
      const kind = normalizeActionKind(
        valueFrom(action, ['kind', 'slot', 'key', 'cta', 'ctaKey', 'buttonKey', 'position', 'placement']),
        CTA_KINDS[index] || 'secondary'
      );
      return {
        kind,
        index,
        id: valueFrom(action, ['id', 'name', 'actionId', 'key']) || `${kind}-${index + 1}`,
        ...normalizeCtaAction(action, {}, kind)
      };
    }).filter((action) => action.shown && Boolean(action.label));
  }

  renderActions() {
    const explicitActions = this.explicitActionButtons();
    const actions = explicitActions || [
      {
        kind: 'primary',
        label: this.getAttribute('primary-cta-label') || '',
        href: this.getAttribute('primary-cta-href') || '',
        action: this.getAttribute('primary-cta-action') || this.getAttribute('primary-cta-action-token') || '',
        ctaType: this.getAttribute('primary-cta-type') || '',
        shown: this.showPrimaryCta,
        disabled: this.primaryCtaDisabled
      },
      {
        kind: 'secondary',
        label: this.getAttribute('secondary-cta-label') || '',
        href: this.getAttribute('secondary-cta-href') || '',
        action: this.getAttribute('secondary-cta-action') || this.getAttribute('secondary-cta-action-token') || '',
        ctaType: this.getAttribute('secondary-cta-type') || '',
        shown: this.showSecondaryCta,
        disabled: this.secondaryCtaDisabled
      },
      {
        kind: 'third',
        label: this.getAttribute('third-cta-label') || '',
        href: this.getAttribute('third-cta-href') || '',
        action: this.getAttribute('third-cta-action') || this.getAttribute('third-cta-action-token') || '',
        ctaType: this.getAttribute('third-cta-type') || '',
        shown: this.showThirdCta,
        disabled: this.thirdCtaDisabled
      },
      {
        kind: 'fourth',
        label: this.getAttribute('fourth-cta-label') || '',
        href: this.getAttribute('fourth-cta-href') || '',
        action: this.getAttribute('fourth-cta-action') || this.getAttribute('fourth-cta-action-token') || '',
        ctaType: this.getAttribute('fourth-cta-type') || '',
        shown: this.showFourthCta,
        disabled: this.fourthCtaDisabled
      }
    ].filter((action) => action.shown && Boolean(action.label));

    if (!actions.length) return '';

    return (
  `<div class="uib-hero__actions" aria-label="Hero actions">` +
  `<uib-action-group actions='` +
  (escapeHtml(JSON.stringify(actions))) +
  `'>` +
  `</uib-action-group>` +
  `</div>`
);
  }

  renderAction(action) {
    const safeLabel = escapeHtml(action.label);
    const safeLink = safeHref(action.href);
    const variant = normalizeActionVariant(action.variant, action.kind || 'secondary');
    const actionName = variant;
    const actionKey = action.kind || action.id || actionName;
    const className = `uib-hero__button uib-hero__button--${variant}`;
    const disabledAttrs = action.disabled ? ' aria-disabled="true" tabindex="-1"' : ' aria-disabled="false"';
    const dataAttrs = [
      `data-uib-hero-action="${escapeHtml(actionName)}"`,
      `data-uib-hero-action-key="${escapeHtml(actionKey)}"`,
      `data-uib-hero-cta-variant="${escapeHtml(variant)}"`,
      `data-uib-hero-cta-action="${escapeHtml(action.action || '')}"`,
      `data-uib-hero-cta-action-token="${escapeHtml(action.action || '')}"`,
      `data-uib-hero-cta-type="${escapeHtml(action.ctaType || '')}"`
    ].join(' ');

    if (safeLink && safeLink !== '#') {
      return (
  `<a class="` +
  (className) +
  `" href="` +
  (escapeHtml(safeLink)) +
  `" ` +
  (dataAttrs) +
  (disabledAttrs) +
  `> ` +
  (safeLabel) +
  ` ` +
  `</a>`
);
    }

    return (
  `<button class="` +
  (className) +
  `" type="button" ` +
  (dataAttrs) +
  ` aria-disabled="` +
  (action.disabled ? 'true' : 'false') +
  `">` +
  (safeLabel) +
  `</button>`
);
  }

  renderDetails(items, assetMap = '') {
    if (!items.length) return '';
    return (
  `<div class="uib-hero__details" part="details">` +
  `<uib-detail-list details='` +
  (escapeHtml(JSON.stringify(items))) +
  `' asset-map='` +
  (escapeHtml(assetMap)) +
  `'>` +
  `</uib-detail-list>` +
  `</div>`
);
  }

  bindActionHandlers() {
    this.shadowRoot.querySelectorAll('uib-action-button').forEach((element) => {
      element.addEventListener('uib-action-button-click', (event) => {
        const sourceDetail = event.detail || {};
        const kind = sourceDetail.kind || sourceDetail.action || 'action';
        const variant = sourceDetail.variant || kind || '';
        const ctaAction = sourceDetail.action || '';
        const actionToken = sourceDetail.actionToken || ctaAction;
        const href = sourceDetail.href || '';
        const label = sourceDetail.label || '';
        const disabled = Boolean(sourceDetail.disabled);
        const detail = { cta: kind, variant, action: ctaAction || kind, ctaAction, actionToken, ctaType: href ? 'link' : actionToken ? 'action' : '', href, label, disabled, hasHref: Boolean(href && href !== '#'), originalEvent: event };
        const unifiedEvent = new CustomEvent('uib-hero-cta', { bubbles: true, composed: true, cancelable: true, detail });
        const legacyEvent = new CustomEvent(`uib-hero-${kind}-cta`, { bubbles: true, composed: true, cancelable: true, detail });
        const unifiedAllowed = this.dispatchEvent(unifiedEvent);
        const legacyAllowed = this.dispatchEvent(legacyEvent);
        if (disabled || !unifiedAllowed || !legacyAllowed) event.preventDefault();
      });
    });
  }
}

registerHeroElement('uib-hero', UibHero);
