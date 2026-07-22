# Asset Picker Package Export Fix

The Hero Details editor uses the shared `<uib-asset-picker>` component from `@ui-base/assets`.

A previous patch imported the picker through this package subpath:

```ts
import '@ui-base/assets/components/uib-asset-picker';
```

That can fail in Vite when the installed `@ui-base/assets` package does not expose the subpath under the active browser/development import conditions.

The App Manager now imports the package root instead:

```ts
import '@ui-base/assets';
```

The root module exports and registers `<uib-asset-picker>`, so the Hero Details editor no longer depends on direct component subpath resolution. The local `@ui-base/assets` source package includes condition-safe component exports for future direct imports.
