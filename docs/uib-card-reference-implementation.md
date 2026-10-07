# Reference Platform Component — uib-card

Implemented October 7, 2026, after acceptance of the [workspace architecture baseline](ui-base-component-architecture-baseline.md). This is the reference workspace stage. Publication is the next gate.

## Accepted architectural decisions

Platform and Application Components share a Definition envelope and use specialized capabilities. JavaScript inheritance remains an implementation choice. Component identity is permanent and separate from tags, modules and runtime instance IDs. Scope follows the owning package; promotion creates a new identity with provenance.

`code` denotes executable implementations, including implementations that compose other elements internally. `composite` denotes Builder-managed declarative graphs. Composite graph validation/rendering remains future work; this reference registers and renders the Card code definition only.

Runtime attributes, writable/read-only properties, slots and events are separate from Builder settings. Explicit bindings join them. Service and handler references are serializable; the actual objects and functions live in memory. Package version, Definition schema version, published revision, runtime compatibility and instance identity are distinct fields.

Workspace Save is separate from Check In/Publish. Published revisions are immutable. Rollback must create a new published revision. Publication, rollback and promotion are recorded policies, without operational APIs at this stage.

## Canonical definition and compatibility

The existing Card entry in `packages/ui-base-ui/ui.component.json` is authoritative. Its schema version is `1.0.0`; its permanent identity is `cmp_platform_5d42b928-83bf-4b18-a4c0-48b06c2efa1`. The runtime element's inherited `componentId` still identifies an individual element; it is not this permanent Component ID.

The entry describes ownership/provenance, code binding, package/runtime versions, all 26 observed attributes, accessor writability, event detail/options/order/cancellation, four slots, children, presentation parts/tokens, Builder groups/settings/bindings, accessibility, capabilities, dependencies and lifecycle policies. Existing tag/module/relative import fields and legacy presentation settings remain compatible projections. Validation checks their consistency. Other manifest entries remain legacy.

The rich Card documentation metadata is generated from this entry into `src/platform/card-metadata.generated.js`; `src/metadata/index.js` imports it. There is no second hand-maintained Card API definition. Regenerate with `node scripts/generate-card-metadata.mjs`; `npm run check` verifies the projection is current. The package now declares the existing icon runtime dependency explicitly.

The registry resolves identity, tag, name, owner-qualified tag and import/export aliases to the owning definition. `@ui-base/ui/card`, `@ui-base/ui/layout#UibCard` and `@ui-base/ui#UibCard` resolve to the same identity. Unqualified routes shared by multiple packages require owner/scope disambiguation. Registration validates the whole manifest before changing registry state; installed definitions are frozen. Registration does not import implementations or migrate other components.

New opt-in exports are `@ui-base/ui/component-reference`, `/component-registry`, `/component-workspace` and `/ui.component.json`. Existing runtime exports are preserved. The combined reference export imports the Card runtime and is browser-oriented; registry/workspace modules can be used separately without importing it.

## Generated editor and real runtime preview

Start the demo with `npm run dev`, then open `/reference/card` or use the **Card workspace** navigation link. Create a workspace, edit Component display name/description and example settings, validate, save and reload. Controls and mode visibility come from the definition rather than a second Card-specific editor schema.

Builder V1 modes are None, Link, Action and Selectable. Changing modes resets incompatible settings. Imported/saved mixed settings are rejected. Links require a destination; actions require an action or token; interactive cards require an accessible name. Unsafe authoring URL schemes are rejected. Existing runtime mixed modes continue to work.

The renderer creates the real registered `uib-card` and binds settings through attributes, writable properties, text/image slots, CSS hooks and events. Getter-only values are set through their attributes. Presence booleans use attribute presence. Text content uses DOM text rather than HTML interpolation. Preview cancels navigation and action defaults, logs serializable event payloads and skips registered action handlers. Runtime uses the same renderer and invokes registered handlers; returning `false` synchronously cancels cancelable actions. Asynchronous cancellation is not supported.

Preview selection changes the preview element and emits its normal events. It does not silently overwrite example settings. Preview rerenders when authoring settings change. Arbitrary nested component graphs, production page integration and responsive authoring are outside this reference.

## Workspace persistence and stage gate

Workspace CRUD uses browser `localStorage`, under `ui-base:component-workspaces:v1`. It is local to the browser profile and site origin. There is no shared backend, authentication or collaboration service. Save persists an editable definition snapshot plus an example instance; it does not rewrite package source or publish anything.

A workspace has its own ID, revision counter and timestamp. An instance has a separate ID and references the permanent Component identity. Duplicate copies the saved workspace into new workspace/instance IDs while retaining the owning Component identity. Definition edits are deliberately limited to display name and description; implementation, ownership, bindings and permanent identity cannot change through Save. Creating a new Component identity or promoting one is future work.

Revision checks reject stale Save/Delete attempts. These checks are sufficient for the single-user reference, but are not transactional coordination across concurrent browser tabs. Persistence errors and unreadable storage are surfaced without replacing existing data. JSON-only persistence rejects functions, DOM objects, dates, accessors and cycles. Instances allow only defined settings and declared service reference IDs; providers and credentials have no authoring field.

Check In/Publish is disabled and there is no publication API. The package revision is installed source, not a newly published Component revision. `version.revisionId` and `basedOnRevisionId` are null until a publication system supplies them. The workspace revision counter is not a published Component revision.

## Card runtime repairs

Selection updates the existing surface's state instead of replacing it, preserving focus and activation target. Direct child slot insertions, removals and slot reassignment update wrapper visibility through a lifecycle-managed observer. An explicit `aria-label` overrides the heading-derived name on the actionable surface, with fallback restored when removed; `aria-describedby` is also forwarded. Nested interactive controls return before the Card cancels Space defaults. Existing runtime interaction combinations, action cancellation and event ordering remain covered by compatibility tests.

## Verification

| Check | Result |
|---|---|
| UI package suite | 50 tests pass in two files: 29 Card runtime/regression tests and 21 reference contract tests |
| Full workspace test run | 67 pass, one existing failure: `packages/ui-layout/test/analyze-component.test.ts:22`, dynamic-node detection |
| Workspace type checks | All four scripts pass |
| Workspace check | Passes syntax, required-file/export checks and generated Card metadata consistency |
| Static demo build | Passes, includes direct `/reference/card` route |
| Real browser Card probe | Nine assertions pass in Edge 154.0.4258.53, including native child Space activation |
| Real browser reference flow | Source and static build checked: CRUD, persisted reload, generated modes, keyboard selection/focus, action events, suppressed link navigation, mobile layout, disabled publication, no page errors |

Optional browser checks require Playwright and a browser executable. In PowerShell, set `PLAYWRIGHT_MODULE_PATH` to a Playwright `index.mjs` if it is not installed normally, and `CARD_BROWSER_EXECUTABLE` to the browser executable. Run `node scripts/verify-card-browser.mjs` and `node scripts/verify-card-reference-browser.mjs`. After `npm run build:static-demo`, set `CARD_REFERENCE_STATIC=1` to run the reference flow against the built site. Both scripts use temporary loopback servers and isolated browser contexts. These checks do not constitute screen-reader certification.

The audit documents/inventory retain the accepted pre-implementation snapshot; they are not presented as current runtime defect reports. No other reusable component was migrated. The pre-existing page-import-service working-tree change was left untouched.
