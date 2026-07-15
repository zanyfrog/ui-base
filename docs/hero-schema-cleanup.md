# Hero schema cleanup

The canonical App Manager model for Hero Action Components is now a single JSON array field:

```text
action-components
```

`action-components` stores an ordered array of Hero Action Component objects. The first object is the primary action, the second is the secondary action, and additional objects are rendered/handled by components that support more than two actions.

The legacy fixed CTA columns remain compatibility fields:

```text
primary_cta_label
primary_cta_href
primary_cta_type
primary_cta_action_token
show_primary_cta
primary_cta_disabled
...
```

## Canonical object shape

```json
{
  "id": "book-tour",
  "name": "primaryCta",
  "label": "Book a Tour",
  "type": "action",
  "value": "BOOK_TOUR",
  "show": true,
  "disabled": false,
  "variant": "primary",
  "help": "",
  "title": "Primary CTA",
  "ariaLabel": "Book a Tour",
  "target": "",
  "rel": ""
}
```

## Migration behavior

The App Manager editor reads fields in this order:

1. `action-components`
2. `action_components` compatibility alias
3. `hero_action_buttons` compatibility alias
4. `actions` compatibility alias
5. fixed legacy CTA columns

When saving, the editor writes:

1. `action-components`
2. `action_components` as an underscore compatibility alias
3. `hero_action_buttons` and `actions` as temporary compatibility aliases
4. derived fixed legacy CTA columns

If schema discovery is unavailable and the ORM rejects the newer fields, the editor retries once with the legacy-compatible payload.

## ORM boundary recommendation

`application-hero.resource.ts` should become the only ORM file that understands legacy fixed CTA columns. The recommended flow is:

```text
CSV/database row
  -> ORM resource adapter
  -> canonical Hero resource with action-components[]
  -> App Manager editor and public Hero renderer
```

On read, the resource should expose `action-components`. On write, it should accept `action-components` and derive legacy fields until the old columns can be removed.
