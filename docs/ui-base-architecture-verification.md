# Architecture audit verification and change evidence

Completed October 7, 2026. Runtime baseline unchanged. Node v24.19.0; Vitest v4.1.10; DOM suite uses happy-dom 20.14.5. Browser characterization uses installed Edge 154.0.4258.53 through bundled Playwright.

This preserves the audit-stage verification snapshot. Subsequent Card repairs and reference workspace results are documented in [Reference implementation verification](uib-card-reference-implementation.md#verification).

## Commands and exact outcomes

| Command | Result | Counts |
|---|---|---|
| `npm test` before new UI suite | Failed on an existing layout assertion | 18 tests: 17 passed, 1 failed; forms 6/6, layout 11/12 |
| `npm run typecheck` | Passed | Four workspace typecheck scripts: manager app, API client, manager UI, ui-layout; no behavioral-test count |
| `node scripts/audit-component-architecture.mjs --write` | Passed after test dependency setup | 15 packages examined; 97 registered components; five shared UI bases; zero duplicate source tags |
| `npm run test -w @ui-base/ui` | Passed | One file, 25 tests passed |
| `npm run check` | Passed | Workspace required-file/route/export checks and JavaScript syntax checks; not a behavioral suite |
| `node scripts/verify-card-browser.mjs` with environment below | Passed characterization assertions | Seven assertions; documents current defects, not repaired accessibility |
| `npm test` after additions | Same layout failure | 43 tests: 42 passed, 1 failed; forms 6/6, UI 25/25, layout 11/12; four test files passed, one failed |

The pre-existing failure is `packages/ui-layout/test/analyze-component.test.ts:22`, `detects Web Component metadata and dynamic nodes`: `section?.children.some(node => node.kind === 'dynamic')` was false rather than true. No layout analyzer, fixture or existing test was edited. This is a red baseline and should be resolved independently; the workspace cannot be reported fully green.

Typecheck was run once because component runtime/type source was not modified. Card was tested alone and subsequently through the final aggregate run. The evidence collector was regenerated as evidence fields improved; initial parser loading failed before dependencies were available, then the existing TypeScript 7 root export lacked the legacy API. A pinned development-only alias fixed the collector without changing the project's compiler.

Dependency setup commands executed:

```text
npm install --ignore-scripts --no-audit --no-fund
npm install --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=15000
npm install --save-dev audit-typescript@npm:typescript@5.9.3 happy-dom --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=15000
```

The first dependency attempt failed on local npm-cache permissions. The second succeeded with host permission; the final installed the audit parser and DOM test dependencies. The parser alias was made exact in package.json/lockfile. No runtime dependencies were added, and existing dependency ordering was restored to avoid unrelated formatting changes. happy-dom requires Node 20 or newer; these new development checks were verified on Node 24, not the package's advertised minimum Node 18. The existing latest tooling is also not a pinned minimum-version guarantee.

Browser reproduction in PowerShell on this host:

```powershell
$env:PLAYWRIGHT_MODULE_PATH='C:\Users\zanyf\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs'
$env:CARD_BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
node scripts/verify-card-browser.mjs
```

The optional script also supports an installed `playwright` package/default Chromium when the environment overrides are omitted. Playwright was available through the desktop runtime; it was not added as a project dependency. The probe uses a temporary loopback HTTP server and import map, closes server/browser in finally, and never calls application services or persists user records.

## Card coverage and limitations

The 25 DOM tests cover registration/base chain, passive default output, heading/label/ID/escaping, variant normalization, density fallback, href/anchor and section changes, explicit target/rel and absent generated rel, interactive-only behavior, selectable toggling and event order/shared detail, property reflection without user events, selected-only styling, disabled navigation/activation, presence booleans, independent action/token values, token-only behavior, action cancellation after selection, Enter/Space and nonactivation keys, native-link keyboard delegation, nested interactive activation exclusion, all slots/parts, optional-region visibility, cssClass registration wrapping, unique runtime IDs and inherited reflection/description merging.

The nested-interactive DOM test exercises the activation guard's composed-path input. Real browser clicks and nested Space cancellation are separately covered by the probe. DOM tests do not prove native navigation, browser form internals, tab order, CSS layout or assistive-technology output.

Browser characterization results:

```json
{
  "childClickIgnored": true,
  "nestedSpacePrevented": true,
  "focusedBefore": true,
  "selectedAfterEnter": true,
  "focusedAfterSelection": false,
  "lateFooterHidden": true,
  "ariaLabelForwarded": null
}
```

The final four issues are documented for follow-up: nested keyboard defaults, focus retention, dynamic slot visibility and accessible-name forwarding. The script deliberately characterizes the baseline and must be updated when those defects are fixed. It is not an accessible-browser acceptance suite or a snapshot to preserve defects indefinitely. No screen-reader, cross-browser, service-provider, native form submission or package archive installation tests were performed. Supporting demos are evidence, not passing automated tests.

## Changed files, rationale and compatibility

| Files | Rationale | Before / after | Compatibility risk |
|---|---|---|---|
| `docs/ui-base-component-architecture-baseline.md` | Package architecture, shared patterns, 97-row decision matrix and stage gate | No baseline report → reviewed baseline | Documentation only |
| `docs/uib-card-reference-platform-component.md` | Complete runtime contract and proposed future Definition | Partial catalogs → explicit reference proposal | Proposal is not a shipped schema |
| `docs/ui-base-component-inventory.md`, `.json` | Reproducible full source evidence and current metadata | Dispersed APIs → searchable package/class inventory | Static extraction has documented limits |
| `docs/ui-base-architecture-verification.md` | Exact evidence, counts and limits | No audit run summary → traceable run | Documentation only |
| `scripts/audit-component-architecture.mjs` | AST evidence collector; no runtime imports/rewrites | No tool → repeatable inventory | Requires development parser alias; metadata module loading stubs HTMLElement, not browser behavior |
| `scripts/verify-card-browser.mjs` | Optional real-browser characterization | No probe → seven documented assertions | Optional Playwright/browser setup; assertions intentionally describe current gaps |
| `packages/ui-base-ui/test/uib-card.test.js` | Lock existing public behavior before future changes | No Card automated suite → 25 contracts | No component behavior changes |
| `packages/ui-base-ui/package.json` | Wire the Card tests into workspace test execution | No UI test script → Vitest happy-dom test script | Development-only test behavior |
| Root `package.json`, `package-lock.json` | Parser alias and DOM environment | Existing runtime dependencies → same runtime dependencies plus two development tools | Node 20+ required for DOM tool; lock adds transitive development packages |

`packages/page-import-service/src/cli.js` was already shown as locally modified during inspection; this audit did not write it. Its change is excluded from the deliverables. No commit or publication was performed.

No inheritance/shared-runtime behavior was changed, so there is no before/after migration assertion to claim. The existing failure was established before additions; new tests pass against the same runtime. The proposed Definition exists only in documentation. The required audit stage gate has been reached.
