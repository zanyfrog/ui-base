# Product and Technical Specification

## Product goal

Create a UI Base application manager that lets a dev-friendly current user create, select, update, and remove applications, then manage all hero records for the active application.

The first working version is local-development focused and uses the attached CSV-backed ORM and I-AM architecture as the basis for identity and data management.

## Primary user

The first user is the original creator or application manager working in dev mode.

```text
X-Actor-Id: original-creator
Authorization: Bearer dev-token
```

I-AM is still the authority for permissions and application scopes. During original creation the dev actor is allowed to create the first records and is automatically bootstrapped as the app manager for the new application scope.

## Data resources

### application_info

The application list and editor perform CRUD over every field in `data/csv/application_info.csv`.

Important fields:

- `application_key`: application scope key and route key.
- `name`, `description`: human-facing application metadata.
- `is_active`, `publish_at`, `expire_at`: lifecycle metadata.
- `application_slug`, `public_base_url`, `primary_domain`: routing/public URL metadata.
- `default_theme`, `default_locale`, `default_hero_placement`, `allowed_hero_placements`: defaults for application surfaces.
- Audit fields are visible and editable in the UI, while ORM refreshes update metadata on save.

### application_hero

The hero list and editor perform CRUD over every field in `data/csv/application_hero.csv` for the selected application.

Important field groups:

- Identity: `id`, `application_key`, `hero_key`, `page_key`, `route_path`, `placement`.
- Audience: `audience_type`, `audience_key`, `audience_refs`, `audience_match`, `audience_rules`, `audience_expression`.
- Lifecycle: `sort_order`, `is_active`, `publish_at`, `expire_at`.
- Content: `eyebrow`, `headline`, `subheadline`, `trust_signal`.
- CTAs: canonical `action-components` JSON array. `action_components`, `hero_action_buttons`, `actions`, and legacy primary, secondary, third, and fourth CTA fields are compatibility fields derived from `action-components`.
- Visual: `visual_src`, `visual_alt`, `visual_mode`, `visual_position`, `layout_opacity`, `theme`, `size`.
- Navigation/details: `nav_items`, `details`.
- Rich slots: slot modes and slot HTML fields.
- System: created/updated fields.


### Hero actions schema cleanup

`application_hero.action-components` is the canonical CTA field. It stores an ordered JSON array of Action Component objects. The fixed legacy columns such as `primary_cta_label`, `primary_cta_href`, and `show_primary_cta` remain supported during migration but should not be treated as the source of truth by new code.

## UX behavior

### Application management

The app opens at `#/applications` and shows all `application_info` rows. The user can:

- Add a new application.
- Edit any application field.
- Select an application to make it active and navigate to its hero list.
- Remove an application. Removal is a soft delete by setting `is_active=false`.

### Hero management

The selected application has a hero list route:

```text
#/applications/:application_key/heroes
```

The user can:

- Add a new hero.
- View/edit an existing hero.
- Remove a hero. Removal is a soft delete by setting `is_active=false`.

The hero editor route is:

```text
#/applications/:application_key/heroes/:hero_key
#/applications/:application_key/heroes/new
```

The hero editor includes:

- All fields editable from the start.
- Immediate live preview using the same `uib-hero` design language from the demo.
- Dirty/saved/saving/error state display.
- 3-second autosave after inactivity.
- Manual Save button when the form is dirty.
- Raw JSON textareas for JSON fields.
- Friendly repeatable-row editors for `nav_items` and `details`.
- HTML textareas for custom slot fields.

## Validation

The UI and ORM enforce the first-pass rules:

- `application_key` is required and must use lowercase letters, numbers, and hyphens.
- `application_info.name` is required.
- `application_hero.application_key`, `hero_key`, `page_key`, `route_path`, `name`, and `headline` are required.
- `hero_key` must use lowercase letters, numbers, and hyphens.
- JSON fields must contain valid JSON when non-empty.
- URL fields must be empty, a safe absolute URL, a relative path, or a hash anchor.
- Date/time fields must parse as date/time strings when non-empty.
- Numeric fields must be numeric when non-empty.

## Permissions and identity

The first implementation uses the dev-friendly identity headers and does not block UI actions client-side. On application create/update, ORM calls I-AM bootstrap so the application scope and app manager role are created.

Bootstrap creates or ensures:

```text
scope: application:<application_key>
roles:
  <application_key>.public
  <application_key>.logged_in
  <application_key>.content_admin
  <application_key>.app_manager
creator assignment:
  original-creator -> <application_key>.app_manager @ application:<application_key>
```

Future production hardening should add server-side authorization checks per route/action using I-AM authorization decisions.

## Non-goals for first version

- No drag-and-drop visual page builder.
- No production database adapter.
- No advanced runtime hero selection preview. The editor preview always renders the current hero even if inactive, expired, or targeted to another audience.
- No full IAM administration UI beyond bootstrap integration.

## Detail icon uploads

The hero detail editor supports three icon inputs per detail row:

- `icon`: text badge/fallback, for compact values such as `time`, `cal`, or `$`.
- `iconUrl`: manual or uploaded image URL.
- `iconAlt`: optional accessible alt text for the image icon.

The upload control posts an image to the ORM service and writes the returned absolute URL into `details[].iconUrl`. Existing detail item aliases such as `iconurl`, `icon_url`, and `iconSrc` remain supported for compatibility.
