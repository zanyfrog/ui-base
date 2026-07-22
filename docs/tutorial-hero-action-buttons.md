# Tutorial: configure Hero Action Components

This tutorial shows the new Hero Action Components flow used by App Management.

## 1. Edit a Hero

Open:

```text
#/applications/:application_key/heroes/:hero_key
```

Expand **Action Components**. The section is powered by `<uib-hero-action-buttons>` and edits the `application_hero.action-components` JSON array.

## 2. Add, edit, or reorder an action

Use the Add icon to create an action. Drag action cards up or down to change the saved order. Use the delete icon in the top-right corner of an action card to remove it.

Each action has:

```text
Label
Type: Link | Action
Href or Action Token
Show
Disabled
Variant
Advanced metadata such as id, name, help, title, aria label, target, and rel
```

Use **Link** for navigation:

```json
{
  "label": "Plan Your Visit",
  "type": "link",
  "value": "#visit",
  "show": true,
  "disabled": false,
  "variant": "secondary"
}
```

Use **Action** when the page should handle the button click without navigating:

```json
{
  "label": "Book a Tour",
  "type": "action",
  "value": "BOOK_TOUR",
  "show": true,
  "disabled": false,
  "variant": "primary"
}
```

## 3. Save behavior

The editor marks the Hero as dirty as soon as the action array changes. Autosave still runs after 3 seconds of inactivity, and the Save button remains available for manual saves.

## 4. ORM synchronization

App Management saves:

```text
action-components
```

The editor also derives `action_components`, `hero_action_buttons`, and `actions` compatibility aliases. The ORM then synchronizes the first four items to:

```text
primary_cta_*
secondary_cta_*
third_cta_*
fourth_cta_*
```

This lets newer sites consume the action array while older sites continue to work with the legacy columns.

## 5. Public site usage

A public page can render the configured actions with:

```html
<uib-hero
  headline="Tour the Sample Visitor Center"
  action-components='[
    {"label":"Book a Tour","type":"action","value":"BOOK_TOUR","variant":"primary"},
    {"label":"Plan Your Visit","type":"link","value":"#visit","variant":"secondary"}
  ]'>
</uib-hero>
```

Listen for actions:

```js
document.querySelector('uib-hero')?.addEventListener('uib-hero-cta', (event) => {
  const { ctaType, actionToken, href, label } = event.detail;
  if (ctaType === 'action' && actionToken === 'BOOK_TOUR') {
    // open the reservation flow
  }
});
```

## Preview variant rendering

The App Manager preview passes the ordered `action-components` array into `<uib-hero action-components="...">`. The public `@ui-base/hero` renderer must use each action item's `variant` for the rendered button class and action marker, for example:

```html
<button class="uib-hero__button uib-hero__button--destructive" data-uib-hero-action="destructive">Cancel reservation</button>
```

The action item's slot/key is preserved separately for event compatibility, but visual styling comes from `variant`, not from array position.
