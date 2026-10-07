# UI-Base component architecture baseline

Audit date: October 7, 2026. Scope: every reusable UI package in this workspace, its shared classes, and supporting consumers. Stage: architecture baseline only.

Accepted baseline snapshot. The user subsequently approved its architectural decisions and the [Card reference implementation](uib-card-reference-implementation.md) is now implemented. Defect descriptions and change counts below describe the audit stage before those repairs.

## Executive summary

**Recommendation: C. ARCHITECTURAL DECISION REQUIRED BEFORE PROCEEDING.** A package-wide inheritance cleanup is not a prerequisite. Before implementing the reference Definition/Registry, approve a common identity/version envelope with specialized capability contracts, define compatibility-alias ownership, and decide how the Builder handles mixed link/action/selection modes and non-serializable dependencies. These are decisions about the next implementation, not reasons to change today's APIs.

The inventory contains **97 registered custom elements across nine reusable UI packages**, plus **five shared bases**. Of the elements, 36 descend from `UibBaseElement`, 57 extend `HTMLElement` directly or through the `BaseHTMLElement` fallback alias, and four descend from the independent `UibTourReservationBase`. No duplicate source registrations were found. Compatibility re-exports and generated browser copies are not additional components.

The runtime is usable as the starting point for a reference component, but inheritance alone does not provide a consistent contract. Registration helpers inject `cssClass`, observe `css-class`, and wrap render methods. Boolean semantics, payloads, form association, metadata completeness, responsive behavior, and dependency declarations vary by package. Forcing everything onto the current core base would preserve some duplication while introducing extra properties and potentially changing semantics.

`uib-card` already has an appropriate chain: `UibCard → UibSurfaceBase → UibLayoutBase → UibBaseElement → HTMLElement`. Its runtime requires no inheritance migration. Twenty-five new DOM contract tests pass. Seven browser characterization assertions confirm its current behavior, including focus loss on selection, late slot visibility remaining stale, missing forwarding of `aria-label`, and cancellation of nested Space key defaults. These defects are documented, not silently changed.

Changes in this work package are limited to audit documents, evidence tooling, test tooling, and card contract tests. No component runtime, public event, export, manifest, inheritance, lifecycle, or Builder CRUD implementation was changed.

## Evidence and inventory method

The full package/component source inventory is an integral appendix: [readable inventory](ui-base-component-inventory.md), [machine-readable inventory](ui-base-component-inventory.json). It records source/line, class chain, registration, package exports, imports, observed declarations, explicit attribute reads/writes, accessors and writability, constructor and local default expressions, events/details/options, slots, parts, CSS variables, accessibility/state/keyboard evidence, metadata, manifests, and documentation/demo/test references.

Generate it with `node scripts/audit-component-architecture.mjs --write`. The collector parses source with a separately pinned TypeScript 5.9.3 alias; the workspace's existing `typescript: latest` currently resolves to 7.0.2, whose root export no longer supplies the legacy parser API. The alias avoids changing the project's compiler choice.

The audit scans source under `packages/*/src`, excluding test-fixture components and generated `ui-layout/browser` duplicates. `apps/demo` and `apps/manager` are supporting evidence. `app-manager-ui` is included because its package description, barrel exports, and architecture documentation explicitly identify it as a reusable library. Demo-only `package-browser` is excluded. API-client and extraction-service classes are not UI components. Theme/token packages are architectural dependencies, not zero-API components.

Static evidence is not accessibility certification. Metadata intentionally documents selected API surfaces; omitted attributes are not automatically defects. A metadata entry is not proof that a property is writable or that a state has runtime semantics. File-level CSS variables are conservative supersets for classes sharing a module. Dynamic slots/parts and helper-mediated payloads must be interpreted with their owning source/helper. Reference counts indicate mentions, not automated tests. The only new DOM suite covers card; the browser probe covers seven specific card assertions.

## Package-level architecture and metadata matrix

| Package | Elements | Runtime base pattern | Current metadata entries | ui.component.json entries | Main contract |
|---|---:|---|---:|---:|---|
| `@ui-base/core` | 0 | `UibBaseElement` | Shared factory | 0 | Reflection, IDs, events, validation/localization utilities |
| `@ui-base/ui` | 30 | Core/layout/surface plus direct HTMLElement | 30 | 6 | Generic primitives, content, actions, navigation |
| `@ui-base/forms` | 16 | Core; nine control subclasses of form base | 16 | 0 | Form value, native control constraints, editing |
| `@ui-base/calendar` | 6 | HTMLElement fallback alias | 6 | 0 | Parent-controlled civil dates and paging requests |
| `@ui-base/hero` | 3 | Direct/fallback HTMLElement | 0 | 1 | Structured Hero records, CTA compatibility, preview/editor |
| `@ui-base/icons` | 1 | Core | 0 | 0 | Registry/URL presentation and decorative semantics |
| `@ui-base/tour-ui` | 4 | Tour reservation base → HTMLElement | 0 | 0 | Domain actions and timed toast feedback |
| `@ui-base/assets` | 18 | Direct/fallback HTMLElement | 18 | 0 | Provider-backed assets, selection, permissions, upload |
| `@ui-base/ui-layout` | 8 | HTMLElement fallback alias | 0 | 0 | Source analysis/editor tooling |
| `@ui-base/app-manager-ui` | 11 | HTMLElement fallback alias | 0 | 0 | Reusable ORM resource editors and action configuration |
| `@ui-base/design-system` | 0 | CSS/documentation | N/A | 0 | Tokens, accessibility guidance, component spec |
| `@ui-base/theme` | 0 | CSS themes | N/A | 0 | Default/dark/sample-tour theme layers |
| `@ui-base/app-manager-design-tokens` | 0 | CSS | N/A | 0 | Manager-specific tokens |
| `@ui-base/app-manager-api-client` | 0 | Service library | N/A | 0 | Typed ORM/I-AM client dependency |
| `@ui-base/page-import-service` | 0 | Service/CLI | N/A | 0 | Extraction service supporting page importer |

### Core and layout/surface foundations

`UibBaseElement` does not register a tag, attach a shadow root, install global styles, implement connected rendering, or declare `observedAttributes`. It provides an instance ID; common reflection; `describedBy` ID merging; `emitMtEvent`; `emitValueChange`; and a callback that re-renders connected elements. Common properties include control-oriented states even for non-controls. Inheritance supplies state accessors, not interaction enforcement or accessible propagation.

`UibLayoutBase` and `UibSurfaceBase` are private to `ui-base-ui/src/layout/index.js`. Layout adds connected rendering only. Surface adds heading/label fallback, variant/density normalization, direct-child slot detection, region markup, classes, and styling. Card and Panel appropriately share this foundation. Exporting these private classes would be a public-API decision. They are not a general provider/form/domain base.

Core utility registration supplies a second behavior layer: `installCssClassProperty` installs a property on the registered prototype, augments observations, and wraps rendering to apply tokens to the first non-style element or an explicitly marked root. This works even when the class does not inherit core. A class name/inheritance matrix alone therefore understates shared behavior.

### Generic UI package

Layout primitives have thin re-export files; importing `@ui-base/ui/card` loads the shared layout module and registers all 12 layout tags and its icon dependency. It is a supported import path but not an isolated card implementation. The UI root additionally re-exports Hero and Tour from their owning packages. Preserve these compatibility routes and count identity at the implementation owner.

Content/action/detail components often extend HTMLElement and share lifecycle/registration rather than the base. This is not intrinsically wrong. `uib-action-button` decodes false-like disabled strings; Card uses presence booleans. Action Button aliases its action token in the payload, while Card preserves separate action/actionToken values. Metadata frequently lists fewer accessors than runtime provides. Heading Block advertises `base` and an eyebrow slot/part, but renders `part="block"`, conditionally renders supporting slots, and forwards `heading: headline` from its child. These are concrete representation gaps.

Navigation uses disclosure navigation rather than an application menubar. Menu uses media queries, resize handling, and Escape focus restoration; MenuItem supports nested links/submenus. Tabs coordinate child pairing, roles, focus, disabled skipping, and arrow/Home/End navigation. Splitter is a responsive two-pane grid, not a draggable separator. Dialog declares modal ARIA but has no focus trap, Escape handling, or focus restoration in its current implementation; it must not be described as a complete accessible modal contract.

### Forms

`UibFormControlBase` handles native inputs/select/textarea, reflected/internal values, ElementInternals form values, constraint validation, help/error markup, host event forwarding, and optional recent-value storage. Its nine descendants are Textbox, Number, Date, Email, Password, Phone, Textarea, Select, and Rich Text. Keep form association and native constraints specialized.

`uib-forms-checkbox` independently extends the core base, composes `uib-checkbox`, handles ElementInternals and reset, and duplicates portions of common event/keyboard forwarding. It is a potential existing-form-base candidate only after checking string-versus-checkbox value semantics, checked state, reset, and native event behavior. It is not an automatic migration.

Field, InputGroup, Wizard, and RecentValuesManager inherit core but do not declare common observations; registration adds only `css-class`. For example, changing Field's label after connection does not trigger core rendering. Wizard is explicitly an experimental stub, not a implemented step/validation coordinator. Form's validity collection covers selected custom controls, not a uniform native form contract. Its value collection checks `'value' in control` before the native-checkbox branch, so a native checkbox contributes its value string rather than the intended boolean branch. Repeated names overwrite earlier values; disabled filtering is not modeled. These are future contract issues, not reasons to unify value shapes now.

### Calendar

All six elements use a fallback HTMLElement alias and a local registration/CSS wrapper. They are parent-controlled views, not form-associated date inputs. Date selection emits `{date: 'YYYY-MM-DD'}`, month selection emits `{year, month}`, and paging emits `{direction, nextStartDate}`. A generic value-change event should not replace these request contracts.

Utilities implement local civil-date conversion, arithmetic, formatting, and boolean parsing. `toDate` permits JavaScript overflow normalization rather than strict calendar validation. Shared calendar styles lack a dedicated focus-visible rule. Native buttons provide keyboard activation; no uniform calendar-grid roving-focus contract was found. The fallback aids module import without a DOM but does not render server-side. Adding the current core base would remove that import tolerance unless separately handled.

### Hero

Hero's runtime composes HeadingBlock, ActionGroup, DetailList and AssetImage. Preview renders the actual `uib-hero`, which satisfies the direction that preview and production share an implementation. Both the Hero package and manager package have preview adapters; compare their record normalization rather than creating a third renderer.

`HERO_FIELD_DEFINITIONS`, structured/flattened records, CTA helpers, defaults, legacy aliases, and the small `ui.component.json` are parallel representations. The manifest's `visual_mode` is a record field; the element observes `visual-mode`. These require an explicit binding map, not a field rename. Runtime defaults (light/default) differ from editor-record defaults (organization/large); a Definition must separate them. Editor save events are parent persistence requests, not immutable Component publication. Preview's custom rich-slot markup inserts stored HTML directly; its trust/validation policy is separate from RichText sanitization.

### Icons

The sole `uib-icon` descends from core, but `name` means a registry key rather than an event/form field name. It provides src/url aliases, size, label/title/ARIA fallback and automatic decoration when no explicit name text is supplied. Keep image semantics specialized. Registry helpers retain `Mt` naming. Icon API data currently lives in demo documentation rather than a package metadata entry.

### Tour UI

Four reservation elements inherit `UibTourReservationBase`. Each supplies domain defaults, action/event names, and labels. The base duplicates escaping, CSS-class handling, reflection, and connected rendering; it additionally owns toast timing/cleanup. `disabled="false"` is false here. `call()` emits two cancelable action events but does not use their dispatch return values to suppress its subsequent toast. Disabled calls still return detail and show feedback. Payload `source` is a DOM element and cannot be persisted as a JSON binding. Keep domain feedback out of core.

### Assets

Assets has 18 elements, comprehensive but uneven metadata, and no component manifest. Registration injects CSS-class behavior through a local implementation. Provider, auth/header callbacks, upload policy, asset maps, selection sets, permissions, pinned/latest asset versions, and insertion payloads are runtime dependencies that cannot all be serialized as editable properties.

Browser and Picker duplicate substantial upload/filter/selection/copy logic. This suggests a provider/selection controller or capability contract before a new inheritance hierarchy. Their public payloads and side effects differ, so copying one implementation into a base is not behavior-preserving by default. AssetPicker emits native `Event('input'/'change')` without detail; other asset events use noncancelable CustomEvents and multiple compatibility aliases. AssetImage additionally has async resolver/token behavior; replacing its attribute callback with core's renderer would omit resolution.

Permission-aware display and upload policy validation belong to the asset capability, not all components. Asset scope (`application/shared/global`) and asset-version statuses are distinct from the proposed Platform/Application Component identity and immutable Component lifecycle. Do not reuse their names without mapping.

### Source-layout tools

The eight reusable editor elements handle analysis trees, operations, diffs, selected nodes, source files, page imports, dirty state, undo/redo and filesystem adapters. They are code-backed UI components but are authoring tools, not simple content primitives. Their `ui-layout-*` and `uib-layout-*` event aliases are compatibility contracts. The package has eight side-effect registrations via its root but root constructor exports are not symmetrical with its specialized subpaths.

The source package exports TypeScript; browser-generated copies are separate consumption artifacts. Its package `files` list omits the generated browser directory and exported stylesheet. Packaging/export verification must distinguish source tooling from browser runtime distribution. The existing dynamic-node analyzer test fails before this work's additions and is not caused by card tests.

### Reusable manager UI and support packages

The 11 exported manager components are reusable ORM resource/configuration components, not the `apps/manager` shell. Their API-client defaults, authorization callbacks, autosave/persistence, routing, and record models need an authoring/provider capability and explicit preview adapters. The two Hero action editors already expose typed configuration models; they should not be forced onto native string-value form semantics. Save in these resource editors currently writes resource records; it does not implement the proposed Component workspace/publication model.

Design-system/theme/manager-token packages provide shared styling and documented standards. API-client and page-import-service provide service dependencies. None should become Component Definitions solely because they are packages.

## Cross-package dependencies and conventions

| Pattern | Evidence | Architectural implication |
|---|---|---|
| Core use | UI, forms, icons; calendar/assets metadata imports | Utilities are cross-package, not solely inherited |
| Undeclared direct dependencies | UI imports `@ui-base/icons/icon`; calendar/assets metadata import core | Workspace hoisting can conceal standalone package defects |
| Cycles | UI ↔ Hero; UI → Hero → Assets → UI | Preserve aliases; decide registration ownership and runtime module closure before registry design |
| Forms integration | Forms → UI label/help/checkbox/action; RichText imports UI sanitization | Form inheritance is not the full dependency graph |
| Hero integration | Hero → UI content/actions/details and Assets image/control | Definition dependency closure must include nested code-backed elements |
| Manager | Manager UI → API client, Hero, Assets, Forms, UI | Injectable services and authoring permissions need explicit metadata |
| Layout | Source editor → local DOM helpers, browser copies and import service | File/source editing is a specialized tool contract |
| Registration | Core, Assets, Calendar, Hero, Tour, manager, layout helpers | Duplicate CSS injection/lifecycle conventions; guards silently keep the first registered constructor |
| Styling | Shadow roots, parts/exportparts, `--uib-*` tokens, standalone styles/theme sheets | Model public hooks, root selection and exported child parts separately |
| Metadata | Rich `*_COMPONENT_API`, flattened `UI_BASE_*_COMPONENTS`, demo-only APIs, manifests, Hero record fields | One future canonical manifest needs projections/adapters, not another unrelated catalog |
| Events | `change`, `uib-*`, `asset-*`, `ui-layout-*`; native and custom events; duplicate aliases | Preserve type, ordering, cancelability and payload per event |
| Naming | `emitMtEvent`, registry `Mt` names, `mt-layout`; record snake_case and DOM kebab-case | Internal legacy names can be documented; public names must not be renamed for consistency |

`createComponentMetadata` adds css-class/cssClass to flattened metadata. Rich API entries do not uniformly include these additions. The machine-readable inventory records the rich API entry and flattened catalog entry separately; the source remains authoritative. No metadata format currently represents complete types, reflection, read-only accessors, defaults, state enforcement, payload schemas, required child relationships, or publication identities.

## Proposed shared responsibilities and migration policy

| Layer | Responsibilities to retain/consider | Responsibilities to exclude |
|---|---|---|
| Minimal shared utility layer | IDs, escaping, ID merging, CSS tokens, event construction; explicit registration capability | Publication, provider/auth, domain models |
| `UibBaseElement` | Common reflection and event envelope; document observation opt-in and re-render behavior | Automatically enforce every reflected state or replace all DOM on every state update |
| Layout base | Connected rendering for structural components; optional slot-observation capability after tests | Form association, provider persistence |
| Surface base | Heading fallback, density/variant, region markup and public parts | Card activation/selection; Panel disclosure; publication |
| Form base | Native controls, typed value/constraint contract, internals, reset/state restore as applicable | All content/asset/action records as string form values |
| Tour base | Domain action defaults, toast lifecycle | Global package/component identity |
| Candidate asset capability | Resolver/provider lifecycle, selection/upload controller, permissions adapter | Universal component inheritance requirement |
| Candidate calendar capability | Civil dates, parent-controlled requests, keyboard model | Generic form value assignment |
| Candidate authoring capability | Dirty/save requests, typed records, dependency injection, preview adapter | V1 editing arbitrary JavaScript for all Components |

Consolidation candidates are duplicate CSS installers, escaping/list/JSON/boolean helpers, native control event forwarding, and Asset Browser/Picker controllers. They differ in return values, escaping representations, boolean sets, import tolerance, wrapper markers, and async rendering. Establish tests of each existing contract before sharing implementations.

Migration classifications used in the matrix below: **A** should eventually adopt core when reflection/IDs/events are meaningfully needed; **B** should adopt an existing specialized base after semantic proof; **C** may benefit from a new specialized base/capability; **D** should remain directly on HTMLElement because current registration/native composition supplies the needed behavior without extra core control semantics; **E** needs an architectural decision. These are recommendations, not migrations performed. Existing base descendants are marked **Keep**.

For pure content/display components, D means retain the present minimal implementation, not prohibit shared utilities. Calendar/asset/authoring C recommendations favor capabilities/controllers over immediately creating classes. E includes components with conflicting booleans, async callbacks or service-driven state. The tour base itself is E for core adoption because core's disabled getter would differ unless explicitly preserved.

## Risks, unresolved decisions, and proposed next work package

Approve the following before implementing the reference Definition:

1. Use a common identity/package/scope/version envelope plus capability sections. Installed code-backed components remain `code`, even when their JavaScript internally composes other custom elements. Reserve `composite` for developer-authored declarative component graphs.
2. Allocate permanent Component IDs independently of tag/module/runtime-instance IDs. Resolve UI compatibility re-exports to the owning identity. Platform and Application components both use the envelope; promotion creates a new Platform identity with provenance.
3. Represent runtime attributes/properties separately from Builder settings and event bindings. Preserve read-only getters, presence versus decoded booleans, method side effects and per-event payloads.
4. Choose V1 handling of mixed Card href/action/selectable combinations: preserve runtime compatibility, then either support them explicitly in the Builder or constrain only new authoring configurations with validation.
5. Specify dependency injection/serialization and preview policy for provider/auth/source-editing capabilities. Persist identifiers/configuration, not DOM elements, callbacks, sourceEvent objects or credentials.
6. Keep package semver, schema version, Component revision and instance state separate. Save targets workspace; publish/check-in creates immutable content. Rollback derives a new revision; no existing resource editor is evidence that this lifecycle exists.

After review, the proposed next package is **Reference Platform Component — uib-card**, limited to an approved Definition projection from `ui.component.json`, owner-aware registry discovery, generated property groups, the existing runtime renderer, validated preview, and separately specified workspace/publication behavior. Repair the verified focus/slot/keyboard/ARIA defects under focused compatibility tests before claiming accessible reference acceptance. The broader component registry migration, promotion, and package-wide lifecycle remain later work.

Before broad rollout, add standalone dependency/export checks and package-specific contracts; resolve the existing analyzer failure in its own work package. No import path, payload, disabled semantics or registration topology should be changed merely to make the matrix uniform.

## Foundational changes and verification

See [verification and changed files](ui-base-architecture-verification.md) for exact commands/counts, browser evidence, tool-install setup, and limitations. Before and after these changes the component runtime is the same. The new tests and reports expose its contracts; they do not introduce a new public API. The stage gate is reached: no Definition implementation, Registry, CRUD, promotion, workspace/publication lifecycle or inheritance migration has begun.

## Component inheritance and reviewed inconsistencies matrix

The following package-grouped matrix supplements the full API evidence appendix. It is a reviewed assessment; the source inventory is generated independently.


### @ui-base/app-manager-ui

| Component / source | Inheritance | Metadata / manifest | Reviewed finding / classification |
|---|---|---|---|
| `uib-application-asset-editor`<br>[UibApplicationAssetEditor](../packages/app-manager-ui/src/components/uib-application-asset-editor.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: reusable ORM record/service authoring capability; callback/auth/autosave/routing assumptions remain outside core. |
| `uib-application-asset-list`<br>[UibApplicationAssetList](../packages/app-manager-ui/src/components/uib-application-asset-list.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: reusable ORM record/service authoring capability; callback/auth/autosave/routing assumptions remain outside core. |
| `uib-application-editor`<br>[UibApplicationEditor](../packages/app-manager-ui/src/components/uib-application-editor.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: reusable ORM record/service authoring capability; callback/auth/autosave/routing assumptions remain outside core. |
| `uib-application-hero-editor`<br>[UibApplicationHeroEditor](../packages/app-manager-ui/src/components/uib-application-hero-editor.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: reusable ORM record/service authoring capability; callback/auth/autosave/routing assumptions remain outside core. |
| `uib-application-hero-list`<br>[UibApplicationHeroList](../packages/app-manager-ui/src/components/uib-application-hero-list.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: reusable ORM record/service authoring capability; callback/auth/autosave/routing assumptions remain outside core. |
| `uib-application-hero-preview`<br>[UibApplicationHeroPreview](../packages/app-manager-ui/src/components/uib-application-hero-preview.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: reusable ORM record/service authoring capability; callback/auth/autosave/routing assumptions remain outside core. |
| `uib-application-list`<br>[UibApplicationList](../packages/app-manager-ui/src/components/uib-application-list.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: reusable ORM record/service authoring capability; callback/auth/autosave/routing assumptions remain outside core. |
| `uib-application-manager`<br>[UibApplicationManager](../packages/app-manager-ui/src/components/uib-application-manager.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: reusable ORM record/service authoring capability; callback/auth/autosave/routing assumptions remain outside core. |
| `uib-app-manager-asset-picker`<br>[UibAppManagerAssetPicker](../packages/app-manager-ui/src/components/uib-asset-picker.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: reusable ORM record/service authoring capability; callback/auth/autosave/routing assumptions remain outside core. |
| `uib-hero-action-button`<br>[UibHeroActionButton](../packages/app-manager-ui/src/components/uib-hero-action-button.ts) | HTMLElement (SSR fallback alias) | No package API / None | E: typed action record and decoded state; form/base value and boolean contract decision needed. |
| `uib-hero-action-buttons`<br>[UibHeroActionButtons](../packages/app-manager-ui/src/components/uib-hero-action-buttons.ts) | HTMLElement (SSR fallback alias) | No package API / None | E: ordered typed actions plus add/remove and preview; avoid core coercion without tests. |

### @ui-base/assets

| Component / source | Inheritance | Metadata / manifest | Reviewed finding / classification |
|---|---|---|---|
| `uib-asset-browser`<br>[UibAssetBrowser](../packages/ui-base-assets/src/components/uib-asset-browser.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: provider/selection/upload controller; duplicates Picker flow but has different events and behavior. |
| `uib-asset-details`<br>[UibAssetDetails](../packages/ui-base-assets/src/components/uib-asset-details.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: provider asset/versions/usage/permissions composition; interaction requests are domain-specific. |
| `uib-asset-filter-bar`<br>[UibAssetFilterBar](../packages/ui-base-assets/src/components/uib-asset-filter-bar.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: typed filters/categories; avoid adding form/control reflection to a model-driven filter container. |
| `uib-asset-grid`<br>[UibAssetGrid](../packages/ui-base-assets/src/components/uib-asset-grid.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: typed assets and selection/open requests; native buttons, selection capability required. |
| `uib-asset-image`<br>[UibAssetImage](../packages/ui-base-assets/src/components/uib-asset-image.js) | HTMLElement | API/catalog / None | E: async resolver/token lifecycle must survive any base adoption; callback dependency is not serializable. |
| `uib-asset-list`<br>[UibAssetList](../packages/ui-base-assets/src/components/uib-asset-list.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: typed assets and selection/open requests; list/grid payload contract should stay equivalent. |
| `uib-asset-metadata-editor`<br>[UibAssetMetadataEditor](../packages/ui-base-assets/src/components/uib-asset-metadata-editor.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: asset patch/permission record capability; no need for a universal inheritance chain. |
| `uib-asset-permission-panel`<br>[UibAssetPermissionPanel](../packages/ui-base-assets/src/components/uib-asset-permission-panel.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: domain permission display/requests; permission flags cannot become generic component state. |
| `uib-asset-permission-set-picker`<br>[UibAssetPermissionSetPicker](../packages/ui-base-assets/src/components/uib-asset-permission-set-picker.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: permission selection capability; disabled attribute must retain local parsing. |
| `uib-asset-picker-dialog`<br>[UibAssetPickerDialog](../packages/ui-base-assets/src/components/uib-asset-picker-dialog.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: dialog plus provider selection contract; needs modality/focus verification and typed selection. |
| `uib-asset-picker`<br>[UibAssetPicker](../packages/ui-base-assets/src/components/uib-asset-picker.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: provider/form-selection capability; native Event input/change has no detail; no automatic core migration. |
| `uib-asset-preview`<br>[UibAssetPreview](../packages/ui-base-assets/src/components/uib-asset-preview.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: permission/type-aware asset presentation; no generic input value. |
| `uib-asset-search`<br>[UibAssetSearch](../packages/ui-base-assets/src/components/uib-asset-search.js) | HTMLElement (SSR fallback alias) | API/catalog / None | A: name/value/event helpers may help after testing debounced query behavior and payload preservation. |
| `uib-asset-thumbnail`<br>[UibAssetThumbnail](../packages/ui-base-assets/src/components/uib-asset-thumbnail.js) | HTMLElement (SSR fallback alias) | API/catalog / None | D: native media/file preview composition, source and label aliases; control states add no value. |
| `uib-asset-uploader`<br>[UibAssetUploader](../packages/ui-base-assets/src/components/uib-asset-uploader.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: upload policy/file/request capability; native file input and validation are not generic text control semantics. |
| `uib-asset-usage`<br>[UibAssetUsage](../packages/ui-base-assets/src/components/uib-asset-usage.js) | HTMLElement (SSR fallback alias) | API/catalog / None | D: read-only usage records, shared utility/style layer sufficient. |
| `uib-asset-version-history`<br>[UibAssetVersionHistory](../packages/ui-base-assets/src/components/uib-asset-version-history.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: asset version workflow/request capability, distinct from Component published revisions. |
| `uib-visual-source-control`<br>[UibVisualSourceControl](../packages/ui-base-assets/src/components/uib-visual-source-control.js) | HTMLElement | API/catalog / None | E: visual mode/value change object differs from string/form values; provider integration needs binding policy. |

### @ui-base/calendar

| Component / source | Inheritance | Metadata / manifest | Reviewed finding / classification |
|---|---|---|---|
| `uib-calendar-day-view`<br>[UibCalendarDayView](../packages/ui-base-calendar/src/components/uib-calendar-day-view.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: civil-date view/request capability; HTMLElement fallback import tolerance, local date helpers and native buttons; no form value contract. |
| `uib-calendar-month-view`<br>[UibCalendarMonthView](../packages/ui-base-calendar/src/components/uib-calendar-month-view.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: civil-date view/request capability; HTMLElement fallback import tolerance, local date helpers and native buttons; no form value contract. |
| `uib-calendar-week-view`<br>[UibCalendarWeekView](../packages/ui-base-calendar/src/components/uib-calendar-week-view.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: civil-date view/request capability; HTMLElement fallback import tolerance, local date helpers and native buttons; no form value contract. |
| `uib-calendar-year-view`<br>[UibCalendarYearView](../packages/ui-base-calendar/src/components/uib-calendar-year-view.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: civil-date view/request capability; HTMLElement fallback import tolerance, local date helpers and native buttons; no form value contract. |
| `uib-date-window-view`<br>[UibDateWindowView](../packages/ui-base-calendar/src/components/uib-date-window-view.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: civil-date view/request capability; HTMLElement fallback import tolerance, local date helpers and native buttons; no form value contract. |
| `uib-day-of-week-view`<br>[UibDayOfWeekView](../packages/ui-base-calendar/src/components/uib-day-of-week-view.js) | HTMLElement (SSR fallback alias) | API/catalog / None | C: civil-date view/request capability; HTMLElement fallback import tolerance, local date helpers and native buttons; no form value contract. |

### @ui-base/forms

| Component / source | Inheritance | Metadata / manifest | Reviewed finding / classification |
|---|---|---|---|
| `uib-forms-checkbox`<br>[UibFormsCheckbox](../packages/ui-base-forms/src/controls/uib-forms-checkbox.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep pending B candidate: existing form base only after checked/string value, reset and composed-checkbox semantics are proven. |
| `uib-forms-date`<br>[UibFormsDate](../packages/ui-base-forms/src/controls/uib-forms-date.js) | UibFormControlBase → UibBaseElement → HTMLElement | API/catalog / None | Keep form base; native static inputType = 'date';; inherits constraint/event/label/recent-value contracts where applicable. |
| `uib-forms-email`<br>[UibFormsEmail](../packages/ui-base-forms/src/controls/uib-forms-email.js) | UibFormControlBase → UibBaseElement → HTMLElement | API/catalog / None | Keep form base; native static inputType = 'email';; inherits constraint/event/label/recent-value contracts where applicable. |
| `uib-forms-number`<br>[UibFormsNumber](../packages/ui-base-forms/src/controls/uib-forms-number.js) | UibFormControlBase → UibBaseElement → HTMLElement | API/catalog / None | Keep form base; native static inputType = 'number';; inherits constraint/event/label/recent-value contracts where applicable. |
| `uib-forms-password`<br>[UibFormsPassword](../packages/ui-base-forms/src/controls/uib-forms-password.js) | UibFormControlBase → UibBaseElement → HTMLElement | API/catalog / None | Keep form base; internal visibility control; do not expose password as recent-value storage. |
| `uib-forms-phone`<br>[UibFormsPhone](../packages/ui-base-forms/src/controls/uib-forms-phone.js) | UibFormControlBase → UibBaseElement → HTMLElement | API/catalog / None | Keep form base; native static inputType = 'tel';; inherits constraint/event/label/recent-value contracts where applicable. |
| `uib-forms-rich-text`<br>[UibFormsRichText](../packages/ui-base-forms/src/controls/uib-forms-rich-text.js) | UibFormControlBase → UibBaseElement → HTMLElement | API/catalog / None | Keep form base; HTML sanitization and mode/value override; needs rich-text editor capability. |
| `uib-forms-select`<br>[UibFormsSelect](../packages/ui-base-forms/src/controls/uib-forms-select.js) | UibFormControlBase → UibBaseElement → HTMLElement | API/catalog / None | Keep form base; native static inputType = 'select';; inherits constraint/event/label/recent-value contracts where applicable. |
| `uib-forms-textarea`<br>[UibFormsTextarea](../packages/ui-base-forms/src/controls/uib-forms-textarea.js) | UibFormControlBase → UibBaseElement → HTMLElement | API/catalog / None | Keep form base; native static inputType = 'text';; inherits constraint/event/label/recent-value contracts where applicable. |
| `uib-forms-textbox`<br>[UibFormsTextbox](../packages/ui-base-forms/src/controls/uib-forms-textbox.js) | UibFormControlBase → UibBaseElement → HTMLElement | API/catalog / None | Keep form base; native static inputType = 'text';; inherits constraint/event/label/recent-value contracts where applicable. |
| `uib-forms-display-field`<br>[UibFormsDisplayField](../packages/ui-base-forms/src/display/uib-forms-display-field.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; display-value formatting differs from form-control value semantics. |
| `uib-forms-field`<br>[UibFormsField](../packages/ui-base-forms/src/layout/uib-forms-field.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; common label/help used but not observed after connection; only injected css-class observation. |
| `uib-forms-input-group`<br>[UibFormsInputGroup](../packages/ui-base-forms/src/layout/uib-forms-input-group.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; structural container, no field value/validation semantics. |
| `uib-forms-wizard`<br>[UibFormsWizard](../packages/ui-base-forms/src/layout/uib-forms-wizard.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; experimental stub explicitly lacks step coordination/validation/navigation; label not observed. |
| `uib-forms-form`<br>[UibFormsForm](../packages/ui-base-forms/src/uib-forms-form.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; repeated names overwrite, native-checkbox boolean branch unreachable, validity covers selected custom controls only. |
| `uib-recent-values-manager`<br>[UibRecentValuesManager](../packages/ui-base-forms/src/uib-recent-values-manager.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; storage/document listeners cleaned up; confirmation/storage semantics specialized; label not observed. |

### @ui-base/hero

| Component / source | Inheritance | Metadata / manifest | Reviewed finding / classification |
|---|---|---|---|
| `uib-hero-editor`<br>[UibHeroEditor](../packages/ui-base-hero/src/uib-hero-editor.js) | HTMLElement | No package API / None | C: authoring/record capability; save/reset events are resource requests, not Component publication. |
| `uib-hero-preview`<br>[UibHeroPreview](../packages/ui-base-hero/src/uib-hero-preview.js) | HTMLElement | No package API / None | D: record adapter renders actual Hero; direct HTML rich slots need a trust/validation contract. |
| `uib-hero`<br>[UibHero](../packages/ui-base-hero/src/uib-hero.js) | HTMLElement (SSR fallback alias) | No package API / Yes | E: legacy CTA/record aliases, false-string booleans and metadata binding choices precede core adoption. |

### @ui-base/icons

| Component / source | Inheritance | Metadata / manifest | Reviewed finding / classification |
|---|---|---|---|
| `uib-icon`<br>[UibIcon](../packages/ui-base-icons/src/uib-icon.js) | UibBaseElement → HTMLElement | No package API / None | Keep core; name means registry key, decorative/image ARIA specialization; no package metadata entry. |

### @ui-base/tour-ui

| Component / source | Inheritance | Metadata / manifest | Reviewed finding / classification |
|---|---|---|---|
| `uib-book-group-reservation`<br>[UibBookGroupReservation](../packages/ui-base-tour-ui/src/reservations/uib-book-group-reservation.js) | UibTourReservationBase → HTMLElement | No package API / None | Keep tour base; base adoption is E because false-string disabled, domain action/defaults and toast feedback must be preserved. |
| `uib-cancel-reservation`<br>[UibCancelReservation](../packages/ui-base-tour-ui/src/reservations/uib-cancel-reservation.js) | UibTourReservationBase → HTMLElement | No package API / None | Keep tour base; base adoption is E because false-string disabled, domain action/defaults and toast feedback must be preserved. |
| `uib-find-reservation`<br>[UibFindReservation](../packages/ui-base-tour-ui/src/reservations/uib-find-reservation.js) | UibTourReservationBase → HTMLElement | No package API / None | Keep tour base; base adoption is E because false-string disabled, domain action/defaults and toast feedback must be preserved. |
| `uib-new-reservation`<br>[UibNewReservation](../packages/ui-base-tour-ui/src/reservations/uib-new-reservation.js) | UibTourReservationBase → HTMLElement | No package API / None | Keep tour base; base adoption is E because false-string disabled, domain action/defaults and toast feedback must be preserved. |

### @ui-base/ui

| Component / source | Inheritance | Metadata / manifest | Reviewed finding / classification |
|---|---|---|---|
| `uib-action-button`<br>[UibActionButton](../packages/ui-base-ui/src/actions/uib-action-button.js) | HTMLElement | API/catalog / None | E: decoded disabled strings conflict with core presence booleans; actionToken aliases action in payload. |
| `uib-action-group`<br>[UibActionGroup](../packages/ui-base-ui/src/actions/uib-action-group.js) | HTMLElement | API/catalog / Yes | D: simple array/slotted composition; inherits child action events rather than emitting its own. |
| `uib-eyebrow`<br>[UibEyebrow](../packages/ui-base-ui/src/content/uib-eyebrow.js) | HTMLElement | API/catalog / None | D: passive text/slot renderer; no common control semantics needed. |
| `uib-heading-block`<br>[UibHeadingBlock](../packages/ui-base-ui/src/content/uib-heading-block.js) | HTMLElement | API/catalog / Yes | D: composed heading content. Metadata base/eyebrow slot differs from block markup; subtitle alias is read but not observed. |
| `uib-heading`<br>[UibHeading](../packages/ui-base-ui/src/content/uib-heading.js) | HTMLElement | API/catalog / Yes | D: heading-level renderer with native heading semantics; shared utilities are sufficient. |
| `uib-instruction`<br>[UibInstruction](../packages/ui-base-ui/src/content/uib-instruction.js) | UibBaseElement → HTMLElement | API/catalog / Yes | Keep core; richer slot/mutation and progress handling than Card; no reason to move domain steps into surface base. |
| `uib-rich-text`<br>[UibRichText](../packages/ui-base-ui/src/content/uib-rich-text.js) | HTMLElement | API/catalog / None | D: sanitizes light-DOM HTML, slot changes and external-link defaults; not a value control. |
| `uib-detail-item-edit`<br>[UibDetailItemEdit](../packages/ui-base-ui/src/details/uib-detail-item-edit.js) | HTMLElement | API/catalog / None | A: common event/ID/reflection helpers useful after tests; actual asset event is uib-detail-item-asset-change, metadata lists list-level name. |
| `uib-detail-item`<br>[UibDetailItem](../packages/ui-base-ui/src/details/uib-detail-item.js) | HTMLElement | API/catalog / None | D: typed detail/media presentation; attribute aliases and index missing from selected metadata. |
| `uib-detail-list-editor`<br>[UibDetailListEditor](../packages/ui-base-ui/src/details/uib-detail-list-editor.js) | HTMLElement | API/catalog / None | A: common event/reflection helpers useful after tests; generic change is emitted but absent from rich events; payload shape differs from core. |
| `uib-detail-list`<br>[UibDetailList](../packages/ui-base-ui/src/details/uib-detail-list.js) | HTMLElement | API/catalog / None | D: array/map presentation; nested detail parts are not automatically exported. |
| `uib-checkbox`<br>[UibCheckbox](../packages/ui-base-ui/src/forms/uib-checkbox.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; UI boolean value differs from FormsCheckbox string submission value; no native form association. |
| `uib-toggle`<br>[UibToggle](../packages/ui-base-ui/src/forms/uib-toggle.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; nullable boolean and labels; avoid treating as generic string-valued form control. |
| `uib-help`<br>[UibHelp](../packages/ui-base-ui/src/help/uib-help.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; tooltip/inline/open behavior; additional text/mode accessors not inventoried. |
| `uib-label`<br>[UibLabel](../packages/ui-base-ui/src/label/uib-label.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; explicit htmlFor/text/accessibleText accessors missing from rich property inventory. |
| `uib-stack`<br>[UibStack](../packages/ui-base-ui/src/layout/index.js) | UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / None | Keep layout chain; gap/direction/align/justify are attributes, not dedicated writable properties; fixed mobile rule. |
| `uib-grid`<br>[UibGrid](../packages/ui-base-ui/src/layout/index.js) | UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / None | Keep layout chain; fixed columns or auto-fit min; breakpoint behavior is hard-coded, not manifest settings. |
| `uib-row`<br>[UibRow](../packages/ui-base-ui/src/layout/index.js) | UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / None | Keep layout chain; presence wrap plus mobile wrapping; no general disabled layout behavior. |
| `uib-column`<br>[UibColumn](../packages/ui-base-ui/src/layout/index.js) | UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / None | Keep layout chain; structural flex column, common control states inherited without enforcement. |
| `uib-panel`<br>[UibPanel](../packages/ui-base-ui/src/layout/index.js) | UibSurfaceBase → UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / Yes | Keep surface chain; heading/variant/density inherited; toggle button has no explicit accessible label. |
| `uib-card`<br>[UibCard](../packages/ui-base-ui/src/layout/index.js) | UibSurfaceBase → UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / Yes | Keep surface chain; 25 contracts pass; focus, late slots, nested Space and accessible-name forwarding gaps verified. |
| `uib-dialog`<br>[UibDialog](../packages/ui-base-ui/src/layout/index.js) | UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / None | Keep layout chain; modal ARIA without focus trap, Escape or return-focus implementation. |
| `uib-accordion`<br>[UibAccordion](../packages/ui-base-ui/src/layout/index.js) | UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / None | Keep layout chain; native details toggle reflects open and emits component event, unlike paired generic change conventions. |
| `uib-tab`<br>[UibTab](../packages/ui-base-ui/src/layout/index.js) | UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / None | Keep layout chain; parent supplies roles/pairing; aria-disabled also influences disabled. |
| `uib-tab-panel`<br>[UibTabPanel](../packages/ui-base-ui/src/layout/index.js) | UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / None | Keep layout chain; parent supplies tabpanel relationships and hidden state. |
| `uib-tabs`<br>[UibTabs](../packages/ui-base-ui/src/layout/index.js) | UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / None | Keep layout chain; pairing/roving navigation; selected/orientation properties missing from rich property list. |
| `uib-splitter`<br>[UibSplitter](../packages/ui-base-ui/src/layout/index.js) | UibLayoutBase → UibBaseElement → HTMLElement | API/catalog / None | Keep layout chain; static grid, not draggable/keyboard-adjustable separator. |
| `uib-media`<br>[UibMedia](../packages/ui-base-ui/src/media/uib-media.js) | HTMLElement | API/catalog / None | D: image/fallback presenter; safe source utility, native image alt; no control states needed. |
| `uib-menu`<br>[UibMenu](../packages/ui-base-ui/src/navigation/uib-menu.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; media-query/resize lifecycle, Escape focus handling; breakpoint accessor omitted from metadata. |
| `uib-menuitem`<br>[UibMenuItem](../packages/ui-base-ui/src/navigation/uib-menuitem.js) | UibBaseElement → HTMLElement | API/catalog / None | Keep core; nested disclosure/navigation; mobile internal attribute and multiple own accessors omitted from metadata. |

### @ui-base/ui-layout

| Component / source | Inheritance | Metadata / manifest | Reviewed finding / classification |
|---|---|---|---|
| `uib-layout-diff`<br>[UibLayoutDiff](../packages/ui-layout/src/ui/uib-layout-diff.ts) | HTMLElement (SSR fallback alias) | No package API / None | D: text/warning display; core state reflection adds no meaningful behavior. |
| `uib-layout-editor`<br>[UibLayoutEditor](../packages/ui-layout/src/ui/uib-layout-editor.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: file adapters/autosave/source authoring; not the eventual metadata-only V1 Builder contract. |
| `uib-layout-manager`<br>[UibLayoutManager](../packages/ui-layout/src/ui/uib-layout-manager.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: analysis/operations/dirty/save-request contract; preserves uib-layout and ui-layout aliases. |
| `uib-layout-preview`<br>[UibLayoutPreview](../packages/ui-layout/src/ui/uib-layout-preview.ts) | HTMLElement (SSR fallback alias) | No package API / None | D: source-analysis node preview, not a production Component runtime renderer. |
| `uib-layout-properties`<br>[UibLayoutProperties](../packages/ui-layout/src/ui/uib-layout-properties.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: source operation editor; should not be reused as unrestricted V1 Definition source editing. |
| `uib-layout-toolbar`<br>[UibLayoutToolbar](../packages/ui-layout/src/ui/uib-layout-toolbar.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: source-tool request capability; file-name/dirty/readonly state has specialized semantics. |
| `uib-layout-tree`<br>[UibLayoutTree](../packages/ui-layout/src/ui/uib-layout-tree.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: selected-node and move/keyboard-move requests; tree interaction contract requires separate tests. |
| `uib-page-importer`<br>[UibPageImporter](../packages/ui-layout/src/ui/uib-page-importer.ts) | HTMLElement (SSR fallback alias) | No package API / None | C: extraction-service and artifact capability with recent URLs; unrelated to publication lifecycle. |
