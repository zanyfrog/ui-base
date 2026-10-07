# uib-card reference Platform Code Component

Reference date: October 7, 2026. Owner: `@ui-base/ui` 0.5.1. Status: proposal and existing-runtime analysis; no Component Definition implementation.

Historical baseline analysis, accepted before implementation. See the [completed reference workspace implementation](uib-card-reference-implementation.md) for current behavior, repaired defects and validation results.

## Runtime architecture

The implementation is `packages/ui-base-ui/src/layout/index.js`, starting at `UibCard` line 260. `src/layout/uib-card.js` is a re-export shim. Supported class imports are `@ui-base/ui/card`, `@ui-base/ui/layout`, and `@ui-base/ui`. Importing card registers the entire layout module plus the icon dependency. Preserve all existing routes.

| Layer | Current responsibilities |
|---|---|
| `HTMLElement` | Native attributes, children, DOM events and lifecycle |
| `UibBaseElement` | Runtime instance ID, common reflected properties, ID merging, value-change event envelope, connected attribute re-render |
| `UibLayoutBase` | `connectedCallback` calls render |
| `UibSurfaceBase` | Heading/label fallback, variant/density, direct-child slot detection, region markup/styles/classes |
| `UibCard` | Anchor/section choice, focusability/role, selection, action events, nested-interactive guard, keyboard activation, media |
| `defineUiBaseElement` | Registration guard plus cssClass installation/observation and render wrapping |

The private layout/surface classes are not package exports. `componentId` identifies a runtime instance, not a permanent Platform Component. Extending core neither registers a Platform identity nor provides Builder CRUD/publication semantics.

## Full attributes, properties, defaults and observations

Card observes all 14 core common attributes, three Surface attributes and nine Card attributes (26 unique attributes). Inherited attributes are observable even when Card does not consume their semantics.

| Attribute | JavaScript accessor | Default/normalization | Write mechanism |
|---|---|---|---|
| `heading` | heading | heading, then label, then empty | Attribute only; getter is read-only |
| `variant` | variant | elevated; lowercase; elevated/outlined/flat; unknown → elevated | Attribute only |
| `density` | density | exact compact; otherwise comfortable | Attribute only |
| `href` | href | empty; raw string escaped in markup | Attribute only |
| `target` | target | empty; forwarded only on anchors | Attribute only |
| `rel` | rel | empty; no synthesized `_blank` rel | Attribute only |
| `action` | action | empty; separate from token | Attribute only |
| `action-token` | actionToken | empty; separate from action | Attribute only |
| `interactive` | interactive | attribute present OR href/action/token/selectable | Attribute only; getter is effective mode |
| `selectable` | selectable | false; presence boolean | Attribute only |
| `selected` | selected | false; presence boolean | Attribute and reflected setter |
| `name` | name | empty | Inherited reflected getter/setter |
| `label` | label | empty; heading fallback | Inherited reflected getter/setter |
| `help` | help | empty; Card does not render help | Inherited reflected getter/setter |
| `help-mode` | helpMode | inline only after lowercasing; otherwise tooltip | Inherited reflected getter/setter |
| `title` | titleText | empty; host/native title; no explicit inner forwarding | Inherited reflected getter/setter |
| `disabled` | disabled | false; presence boolean; blocks activation | Inherited reflected getter/setter |
| `readonly` | readonly | false; Card selection does not check it | Inherited reflected getter/setter |
| `required` | required | false; no Card validation behavior | Inherited reflected getter/setter |
| `hidden` | native hidden | native host boolean; observed | Native DOM behavior; host CSS needs separate verification |
| `invalid` | invalid | false; no Card validation/visual contract | Inherited reflected getter/setter |
| `error` | error | empty; Card does not render error | Inherited reflected getter/setter |
| `css-class` | cssClass | empty; tokens applied to inner surface by registration | Reflected setter |
| `aria-label` | ariaLabel | empty | Inherited getter only; use attribute; not forwarded to inner surface |
| `aria-describedby` | ariaDescribedBy | empty | Inherited getter only; not forwarded to inner surface |

`componentId` is read-only, using host id or a generated unique ID. Changing `id` alone is not observed; heading IDs update on the next render. Public instance fields `surfaceName='card'` and `defaultVariant='elevated'` are implementation hooks, not recommended Builder settings. Native HTMLElement properties remain available. The table distinguishes explicit library getters from native platform accessors; do not assume `ariaLabel` has a setter on the library prototype.

Inherited methods: `describedBy(...ids)`, `emitMtEvent(type, detail, options)`, `emitValueChange(componentEventName, oldValue, newValue, extra)`, attribute callback, connected callback, and Surface's `hasNamedSlot`, `surfaceStyles`, `headerMarkup`, `bodyMarkup`, `footerMarkup`, `surfaceClasses`. Card's methods are `activate(event)`, `handleKeydown(event)`, `shouldIgnoreActivation(event, surface)` and `render()`. These methods are callable but the Definition should not expose rendering helpers as editable properties. Property setting `selected` does not emit selection events; user activation does.

Presence booleans mean `disabled="false"`, `selectable="false"`, and `selected="false"` are true. `variant="OUTLINED"` normalizes, but `density="COMPACT"` does not. A generated editor must remove presence attributes for false and use exact allowed values.

## Slots, styling and accessibility

| Slot | Part | Behavior |
|---|---|---|
| media | media | Wrapper hidden unless a direct element child has slot=media |
| header | header | Visible with heading/label or direct header child; text fallback is escaped |
| default | body | Primary content; always present; there is no named body slot |
| footer | footer | Wrapper hidden unless a direct footer child exists |
| N/A | base | Anchor or section surface |

There are five public parts: base, media, header, body, footer. Classes include `uib-surface`, `uib-card`, `uib-surface--{variant}`, `uib-surface--{density}`, and conditional disabled/interactive/selected classes. Use parts/tokens as the preferred stable styling hooks; classes describe current output. `css-class` adds tokens to the inner surface.

Shared styles use `--uib-color-ink`, `--uib-font-family-sans`, `--uib-color-border`, `--uib-radius-lg`, `--uib-color-surface`, `--uib-color-surface-soft`, `--uib-shadow-sm`, `--uib-space-3`, `--uib-space-4`, `--uib-focus-ring`, and Card selection uses `--uib-color-primary`. The shared base style also references `--uib-color-border-strong`, `--uib-radius-md`, `--uib-color-muted`, and `--uib-font-size-sm` in placeholder rules. These are shared token dependencies, not unique Card parameters. Card has no authored responsive-property object; its media rule sizes slotted images/video/uib-media and its width is 100%.

Passive cards render a section. href renders a native anchor. Interactive non-link cards render a section with role=button and tabindex=0. Disabled interactive cards use tabindex=-1, aria-disabled=true and prevent click default. Selectable cards have aria-pressed. Heading fallback gives the header an ID and the surface aria-labelledby. The header is a div, not a generated h1–h6. Slotted headings may provide their own semantics.

Enter and Space invoke activation for non-link interactive cards; link keyboard behavior is left to the browser. Nested anchors/buttons/inputs/selects/textareas/summary, role button/link, and contenteditable=true are excluded by the composed-path click guard. Readonly/required/invalid are inherited values without Card-specific enforcement. A href+selectable card puts aria-pressed on an anchor; its accessible interpretation needs a reviewed mixed-mode policy.

## Events and runtime versus Builder bindings

| Event | Payload | Options/order |
|---|---|---|
| change | `{name, oldValue, newValue, selected}` | Bubbles/composed; not cancelable; first on selection |
| uib-card-select | Same detail object as change | Bubbles/composed; not cancelable; second |
| uib-card-action | `{name, action, actionToken, selected}` | Bubbles/composed/cancelable; after selection |

Click toggles selection first when selectable. If action or token exists, it emits the action afterward. Canceling action prevents the original click's default (including anchor navigation), but does not undo selection. Disabled activation emits none of these events. Interactive-only cards have affordance but no dedicated action event. Passive cards still have listeners; their activation has no observable selection/action effect. Card itself does not execute an application action token.

`action` and `action-token` are runtime metadata and remain supported. Builder event bindings are separate declarative instance configuration that listens to the runtime event and invokes a registered handler/action. The Definition describes the event schema and eligible bindings; it should not replace the runtime API or overload actionToken as a Component ID. Listen to one selection event intentionally: binding both change and uib-card-select can run a handler twice. An async handler cannot retroactively cancel synchronous anchor navigation without an explicit binding policy. Preserve event ordering and cancellation.

## Current metadata and representation gaps

`src/metadata/index.js` has a rich `UI_COMPONENT_API['uib-card']` and a flattened `UI_BASE_UI_COMPONENTS` entry. Current maturity is experimental. The rich entry lists 13 attributes (label, heading, variant, density, href, target, rel, action, action-token, interactive, selectable, selected, disabled), two properties (selected, disabled), all three events, all four slots, and all five parts. CSS variables are omitted. The metadata factory adds css-class and cssClass to the flattened representation.

`ui.component.json` currently records only tagName, module `./src/layout/uib-card.js`, importPath `./card`, and inheritable select editors for variant and density. This is a good evolution point but not a registered canonical Component Definition. The module shim leads to the shared implementation module. `inheritable:true` is a presentation/editor convention, not proof that the runtime reads a parent setting.

Missing are stable identity/scope, package/schema/component revision distinctions, type/default/writability/reflection metadata, inherited-versus-effective behaviors, event payload/options/order/cancellation, interaction constraints, dynamic slot policy, parts/tokens, renderer/preview/dependency bindings, validation/clone rules and provenance. Getter-only href and heading must be written via attributes. Do not use metadata property names as unrestricted JavaScript assignments.

## Verified reference gaps

Seven assertions in real Edge 154.0.4258.53 characterized current behavior. They are evidence of defects, not seven accessibility passes:

1. Child button clicks are excluded from Card activation.
2. Space on a child button is still preventDefault'ed by Card before activation ignores the target; this can suppress native child button activation.
3. The surface can receive focus.
4. Enter toggles selection.
5. Selection synchronously replaces shadow markup and loses surface focus.
6. Appending a footer after render leaves the wrapper hidden; Card has no slotchange/child observation to recalculate visibility.
7. Setting host aria-label does not forward it to the inner surface.

Also source-confirmed: aria-describedby is not forwarded; id alone does not update header linkage; href has escaping but no URL-scheme policy; target=_blank does not synthesize rel; named-slot-only headers lack the same explicit heading-ID association; nested interactive elements in a whole-card anchor need authoring validation. These were not all browser-certified and must not be presented as repaired. `readonly` does not block selection. The contract suite intentionally preserves current booleans, property/event distinctions and selection-before-action cancellation.

## Proposed Component Definition envelope

This is an illustrative documentation shape. It is not a shipped schema or a new metadata file. Evolve `ui.component.json` after approval and generate compatible catalog/editor projections.

```json
{
  "schemaVersion": "PROPOSED",
  "componentId": "ALLOCATE-PERMANENT-ID",
  "tagName": "uib-card",
  "displayName": "Card",
  "description": "Repeatable content surface with optional link, action and selection behavior.",
  "category": "content-surfaces",
  "scope": { "kind": "platform", "ownerId": "RESOLVE-OWNER" },
  "source": { "type": "installed-package", "packageId": "@ui-base/ui", "packageVersion": "0.5.1" },
  "implementation": {
    "type": "code",
    "module": "./src/layout/uib-card.js",
    "importPath": "@ui-base/ui/card",
    "exportName": "UibCard",
    "renderer": { "kind": "custom-element", "tagName": "uib-card" }
  },
  "maturity": "experimental",
  "publication": { "state": "workspace", "revisionId": "ALLOCATE-SEPARATELY", "basedOnRevisionId": null },
  "capabilities": ["surface", "activation", "selection", "slots"],
  "api": {
    "properties": {
      "heading": { "type": "string", "writable": false, "attribute": "heading", "default": "", "fallback": "label" },
      "variant": { "type": "string", "writable": false, "attribute": "variant", "default": "elevated", "enum": ["elevated", "outlined", "flat"] },
      "density": { "type": "string", "writable": false, "attribute": "density", "default": "comfortable", "enum": ["comfortable", "compact"] },
      "interactive": { "type": "boolean", "writable": false, "attribute": "interactive", "computedFrom": ["href", "action", "action-token", "selectable"] },
      "selected": { "type": "boolean", "writable": true, "attribute": "selected", "default": false, "reflection": "presence", "programmaticSetEmits": false }
    },
    "attributes": { "selected": { "type": "boolean", "serialization": "presence" } },
    "events": {
      "uib-card-action": { "detail": { "name": "string", "action": "string", "actionToken": "string", "selected": "boolean" }, "bubbles": true, "composed": true, "cancelable": true },
      "uib-card-select": { "detail": { "name": "string", "oldValue": "boolean", "newValue": "boolean", "selected": "boolean" }, "bubbles": true, "composed": true, "cancelable": false },
      "change": { "aliasOfSelection": "uib-card-select", "emittedFirst": true }
    },
    "slots": [ { "name": "default" }, { "name": "media" }, { "name": "header" }, { "name": "footer" } ]
  },
  "builder": {
    "groups": ["content", "appearance", "interaction", "state", "accessibility", "events"],
    "settings": { "variant": { "writeTo": { "attribute": "variant" }, "editor": "select", "group": "appearance" } },
    "eventBindings": { "uib-card-action": { "handlerReference": true, "cancellationPolicy": "DECIDE" } },
    "responsive": { "supported": false, "extension": "RESERVED" }
  },
  "styling": { "parts": ["base", "media", "header", "body", "footer"], "tokens": "ENUMERATE-SHARED-TOKENS" },
  "accessibility": { "modes": ["region", "link", "button", "toggle-button"], "knownGaps": "SEE-REFERENCE-REPORT" },
  "preview": { "renderer": "same-as-runtime", "navigationPolicy": "DECIDE-PREVIEW-ADAPTER" },
  "validation": { "required": [], "rules": "APPROVE-MIXED-MODE-AND-CHILD-RULES" },
  "clone": { "instance": "new-instance-id; copy configuration; remap child IDs", "definition": "new-component-id; retain provenance" },
  "dependencies": { "runtime": ["@ui-base/core", "@ui-base/icons"], "registrationSideEffects": "all-layout-tags" },
  "compatibility": { "packageRange": "DECIDE", "runtimeContractVersion": "DECIDE" },
  "deprecation": { "status": "none", "replacementComponentId": null },
  "provenance": { "origin": "installed-package", "promotedFromComponentId": null, "promotedFromRevisionId": null },
  "extensions": {}
}
```

The excerpt shows representative properties; the full definition must cover every table entry above with its actual binding and semantics. Placeholders explicitly identify unresolved policy rather than invent stable IDs, owners or revision numbers. Publication state describes the proposed Definition, not the current npm package. A package scope and Component scope are independent. Internal code composition does not make Card a declarative composite. Future composite definitions need a graph, allowed-child rules, dependency cycles and their own renderer binding.

| Field family | Required proposal content |
|---|---|
| Identity/source | Permanent ID; Platform/Application owner; tag/display/category; package identity/version; installed/developer source; code/composite; module/export |
| Lifecycle | Workspace identity; immutable revision/publication state; based-on/version lineage; maturity independent of publication |
| API | Attributes and properties separately; writable/read-only; defaults and fallback; allowed values; required values; conversion/reflection; events/details/options/order |
| Children | Slot identity/default alias; cardinality and allowed child capabilities; nested interactive restrictions; composite graph references where relevant |
| Builder | Editable settings, grouping, editor type/help, attribute/property binding, validation; responsive support declaration |
| Appearance/accessibility | Public parts/exported child parts, shared tokens/CSS hooks; actual role/name/state and keyboard requirements |
| Runtime/preview | Registered renderer, implementation closure, preview adapter using same renderer; navigation/event policy |
| Validation/clone | Schema and instance validation; required settings; new identity rules; child ID remapping; state versus authored configuration |
| Dependency/compatibility | Package closure and versions; child definitions; schema/runtime compatibility; service injection where relevant |
| Evolution | Deprecation/replacement; provenance; promotion creates a new identity; namespaced extension points |

## Proposed Builder groups

| Group | Settings/editors | Notes |
|---|---|---|
| Content | heading/label text; media/header/body/footer slot content | Default body slot is unnamed; keep label fallback explicit |
| Appearance | variant/density selects; css-class token editor; allowed styling hooks | Preserve manifest's current options; resolve inheritable mapping |
| Interaction | href URL; target/rel; action/action-token strings; explicit interactive/selectable switches | Show computed interaction; do not assign getter-only properties |
| State | disabled and selected | Distinguish authored initial selected from runtime user selection |
| Accessibility | accessible-name/description bindings; heading/child semantics | Do not advertise forwarding before defects are fixed |
| Events | selection or action binding to registered handler | Warn/validate duplicate selection aliases; preserve synchronous cancellation |

Hide inherited help/required/invalid/error/readonly from ordinary Card authoring until an actual Card capability makes them meaningful. Keep their existing runtime accessors for compatibility. Required content and child restrictions are proposed authoring validation, not new runtime behavior.

## Acceptance criteria for the next approved reference phase

1. Approve the envelope, ownership/identity allocation, capability boundaries, mixed-mode and binding cancellation policies; choose schema and compatibility versioning.
2. Define Card as `code`, with the existing import/export/tag preserved and exact module registration side effects documented.
3. Produce one canonical manifest projection with complete types/defaults/reflection/writability, slots/events/parts/dependencies; resolve drift through tests without removing runtime APIs.
4. Generated property controls write getter-only settings through attributes; false booleans remove attributes; selection programmatic writes remain event-silent.
5. Preview and production instantiate the same component; an adapter intercepts preview navigation/bindings according to policy rather than forking rendering code.
6. Repair and regression-test focus retention, nested keyboard defaults, dynamic slots and accessible naming/description before claiming accessible acceptance. Include real browser keyboard navigation, links, dynamic children, named headers and screen-reader review as appropriate.
7. Validate supported mode combinations/children and safe authoring URL policies without redefining existing runtime payloads or aliases.
8. Define dependency and clone behavior, schema validation and failure reporting. Distinguish package versions, Definition revisions and runtime instance IDs.
9. Implement workspace save/immutable publish/rollback only within the explicitly approved next work package; no historical published version becomes mutable. Promotion remains separately authorized and creates new identity/provenance.
10. Existing tests pass or have an explicitly recorded independent baseline failure; verify the 25 Card contracts plus focused new browser regressions. Do not migrate the rest of the packages as a side effect.

The present work stops at this report, inventory, contract tests and verification. See [architecture baseline](ui-base-component-architecture-baseline.md) and [verification](ui-base-architecture-verification.md).
