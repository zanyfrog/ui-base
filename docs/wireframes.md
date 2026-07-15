# Wireframes

## 1. Application list

```text
+--------------------------------------------------------------------------------+
| UI Base Application Manager                                      dev mode    |
| Applications                                             Actor: original-creator|
| Manage application_info records, select an app, and edit heroes.                |
+--------------------------------------------------------------------------------+
| [Applications] [Heroes]                                                        |
+--------------------------------------------------------------------------------+
| Applications                                             [Add application]      |
|                                                                                |
| +-------------+-------------+--------+----------+-------------+---------------+ |
| | Application | Key         | Status | Theme    | Updated     | Actions       | |
| +-------------+-------------+--------+----------+-------------+---------------+ |
| | Sample Tour   | sample-tour   | active | organization | ...         | Select Edit   | |
| | TTB         | ttb         | active | light    | ...         | Select Edit   | |
| +-------------+-------------+--------+----------+-------------+---------------+ |
+--------------------------------------------------------------------------------+
```

## 2. Application editor

```text
+--------------------------------------------------------------------------------+
| Edit Sample Tour                                                                 |
| Every application_info CSV field is editable.                                   |
|                                                                                |
| v Identity                                                                     |
|   id                    application_key                                        |
|   name                  description                                            |
|                                                                                |
| v Lifecycle                                                                    |
|   is_active             publish_at              expire_at                      |
|                                                                                |
| v Routing                                                                      |
|   application_slug      primary_domain          public_base_url                |
|                                                                                |
| v Defaults                                                                     |
|   default_theme         default_locale           allowed_hero_placements JSON   |
|                                                                                |
| [dirty] Autosaves after 3 seconds of inactivity.              [Save changes]   |
+--------------------------------------------------------------------------------+
```

## 3. Hero list

```text
+--------------------------------------------------------------------------------+
| Application heroes for sample-tour                                   [Add hero]  |
|                                                                                |
| +-------------+-------+-------------------+-----------+----------+-----------+ |
| | Hero        | Key   | Route             | Placement | Status   | Actions   | |
| +-------------+-------+-------------------+-----------+----------+-----------+ |
| | Home Hero   | home  | /sample-tour        | primary   | active   | Edit      | |
| | Visit Hero  | visit | /sample-tour/visit  | primary   | active   | Edit      | |
| +-------------+-------+-------------------+-----------+----------+-----------+ |
+--------------------------------------------------------------------------------+
```

## 4. Hero editor with live preview

```text
+---------------------------------------------+----------------------------------+
| Edit Home Hero                              | Live preview                     |
| Every application_hero field is editable.   |                                  |
|                                             | +------------------------------+ |
| v Identity                                  | | uib-hero Organization design       | |
|   id, app key, hero key, route, placement   | | Eyebrow                       | |
|                                             | | Headline                      | |
| v Audience                                  | | Subheadline                   | |
|   type, key, refs JSON, rules JSON          | | [CTA] [CTA] [CTA] [CTA]       | |
|                                             | | Details grid                  | |
| v Content                                   | +------------------------------+ |
|   eyebrow, headline, subheadline, trust     |                                  |
|                                             | This preview always renders the |
| v CTAs                                      | edited hero, ignoring targeting |
|   labels, hrefs, show/disabled flags        | and schedule rules.             |
|                                             |                                  |
| v Visual                                    |                                  |
|   image URL, mode, opacity, theme, size     |                                  |
|                                             |                                  |
| v Navigation and Details                    |                                  |
|   raw JSON + friendly row editors           |                                  |
|                                             |                                  |
| v Rich Slots                                |                                  |
|   mode selects + HTML textareas             |                                  |
|                                             |                                  |
| [dirty] Autosaves after 3 seconds. [Save]   |                                  |
+---------------------------------------------+----------------------------------+
```

## Hero detail row icon upload

```text
Details row
+ drag handle
+ Label
+ Value
+ Icon text
+ Icon URL
+ Icon Alt
+ Upload icon file
+ move/remove actions
```
