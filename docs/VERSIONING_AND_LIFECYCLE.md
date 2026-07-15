# Versioning and Lifecycle

UI Base packages use semantic versioning.

```text
PATCH: bug fixes
MINOR: backward-compatible features
MAJOR: breaking changes
```

## Component maturity

- **Experimental**: available for testing; API may change.
- **Preview**: API mostly shaped; still not guaranteed stable.
- **Stable**: production-ready API.
- **Deprecated**: still works, but there is a recommended replacement.
- **Retired**: removed from the active package.

## Deprecation policy

When possible, a deprecated API should remain available for at least one minor release after replacement guidance is documented. Removal should be reserved for a major version once packages reach stable releases.
