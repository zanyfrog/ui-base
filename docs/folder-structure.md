# Folder Structure

```text
ui-base-app-manager/
  .gitignore
  README.md
  package.json
  tsconfig.json

  apps/
    manager/
      .env.example
      index.html
      package.json
      src/
        main.ts
        styles.css

  packages/
    app-manager-api-client/
      README.md
      package.json
      src/
        index.ts

    app-manager-design-tokens/
      package.json
      src/
        tokens.css

    app-manager-ui/
      README.md
      package.json
      src/
        index.ts
        record-fields.ts
        styles.css
        components/
          uib-application-manager.ts
          uib-application-list.ts
          uib-application-editor.ts
          uib-application-hero-list.ts
          uib-application-hero-editor.ts
          uib-application-hero-preview.ts
          record-form.ts
        utils/
          dom.ts

  packages/
    ui-base-core/
    ui-base-design-system/
    ui-base-theme/
    ui-base-icons/
    ui-base-ui/
    ui-base-forms/
    ui-base-calendar/
    ui-base-hero/
    ui-base-tour-ui/
    ui-base-assets/

  docs/
    api-contract.md
    component-architecture-plan.md
    folder-structure.md
    product-technical-spec.md
    wireframes.md
```

## Hero Details asset picker update

Edit Hero > Details now uses the UI Base `<uib-asset-picker>` from `@ui.base/assets` in simple single-select mode. Detail rows save only `iconAssetId`; the live preview resolves the asset through the ORM Asset API and enriches the preview copy with the current asset URL.

Relevant files:

```text
packages/app-manager-ui/src/components/uib-application-hero-editor.ts
packages/app-manager-ui/src/components/uib-application-hero-preview.ts
packages/ui-base-assets
```

