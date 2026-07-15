# Accessibility Standard

UI Base components must be accessible by default.

## Baseline requirements

- Every interactive control must have a programmatic name.
- Help and error text must be associated through `aria-describedby` where applicable.
- Keyboard users must be able to reach and operate every interactive element.
- Focus indicators must be visible.
- Disabled and readonly states must be exposed programmatically.
- Responsive layouts must not require horizontal scrolling for normal usage.
- Components must avoid interaction patterns that trap focus unless the component is an intentional modal overlay.

## Menu guidance

Site navigation should use the disclosure-navigation pattern rather than an application-style ARIA menubar. `uib-menu` is the navigation container. `uib-menuitem` is the clickable link or submenu trigger. Nested menu items are placed inside a parent `uib-menuitem`.

## Component testing

The roadmap includes automated accessibility checks using axe-core, keyboard tests, focus order tests, and color contrast checks.
