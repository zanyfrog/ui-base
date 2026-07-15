# Hero editor ORM save compatibility

The Hero editor normalizes App Manager fields before save so newer UI behavior can still work with older ORM schemas during migration.

## Visual compatibility

`visual_mode` is the canonical visual placement field. `visual_position` is derived as a compatibility field.

## CTA compatibility

The canonical CTA model is:

```text
application_hero.hero_action_buttons
```

`hero_action_buttons` is a JSON array of Hero action button objects. The editor also writes:

```text
actions
*_cta_label
*_cta_href
*_cta_type
*_cta_action_token
show_*_cta
*_cta_disabled
```

The `actions` field is a temporary compatibility alias. The fixed CTA columns are derived compatibility fields.

When saving, the editor attempts to read `GET /schemas/application_hero` and submits only fields supported by that schema. If the schema endpoint is unavailable or an older ORM rejects the newer fields, the editor retries once using a legacy-compatible payload.
