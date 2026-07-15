# Accessibility Standard

UI Base components should be accessible by default.

## Requirements

- Interactive components must have an accessible name.
- Help and error text should be associated with the control using `aria-describedby` where applicable.
- Keyboard users must be able to operate every control.
- Focus indicators must be visible.
- Disabled, readonly, required, and invalid states must be exposed programmatically.
- Components must support small screens without requiring horizontal page scrolling.
- Site navigation should use a disclosure navigation pattern instead of an application menubar pattern.

## Menu guidance

`uib-menu` is the navigation container. `uib-menuitem` is a link or a submenu trigger. A submenu is created by placing child `uib-menuitem` elements inside a parent `uib-menuitem`.

```html
<uib-menu label="Primary">
  <uib-menuitem href="/">Home</uib-menuitem>
  <uib-menuitem label="Tours">
    <uib-menuitem href="/sample">Sample</uib-menuitem>
    <uib-menuitem href="/philadelphia">Philadelphia</uib-menuitem>
  </uib-menuitem>
</uib-menu>
```
