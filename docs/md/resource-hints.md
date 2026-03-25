# Resource Hints

No.JS automatically injects `<link>` resource hints into `<head>` to help
browsers start network requests before they are needed. This reduces Time to
First Byte (TTFB) and Largest Contentful Paint (LCP) with no configuration.

---

## What is injected automatically

### `preload` — static `get=` URLs

When a `get=` directive has a static URL (no `{interpolation}`), a
`<link rel="preload" as="fetch">` is injected at directive init time:

```html
<!-- This get= URL is static → preload is injected automatically -->
<div get="/api/products" as="products">...</div>

<!-- Dynamic URL → no preload (value not known until state resolves) -->
<div get="/api/products/{id}" as="product">...</div>
```

Injected hint:
```html
<link rel="preload" href="/api/products" as="fetch" crossorigin="anonymous">
```

### `preconnect` — cross-origin endpoints

When the `get=` URL's origin differs from `location.origin`, a
`<link rel="preconnect">` is also injected for that origin:

```html
<div get="https://api.mystore.com/products" as="products">...</div>
```

Injected hints:
```html
<link rel="preload"    href="https://api.mystore.com/products" as="fetch" crossorigin="anonymous">
<link rel="preconnect" href="https://api.mystore.com" crossorigin="anonymous">
```

### `prefetch` — remote route templates

When the router initialises, a `<link rel="prefetch" as="fetch">` is injected
for every `<template route src="...">`:

```html
<template route="/about"   src="./pages/about.tpl"></template>
<template route="/contact" src="./pages/contact.tpl"></template>
```

Injected hints:
```html
<link rel="prefetch" href="./pages/about.tpl"   as="fetch" crossorigin="anonymous">
<link rel="prefetch" href="./pages/contact.tpl" as="fetch" crossorigin="anonymous">
```

All hints are **deduplicated** — if the same URL already has a hint in `<head>`
(e.g. injected at build time), no duplicate is added.

---

## Build-time injection (recommended for LCP)

Runtime hints fire after JavaScript executes — too late to help the very first
page load. For maximum impact on LCP, inject the same hints into the initial
HTML at build time using the provided post-build script:

```sh
node scripts/inject-resource-hints.js
# or with a custom glob:
node scripts/inject-resource-hints.js "dist/**/*.html"
```

Add to `package.json`:

```json
{
  "scripts": {
    "build": "your-bundler && node scripts/inject-resource-hints.js"
  }
}
```

The script scans every `.html` file in `dist/`, parses it with jsdom (already a
devDependency for tests), and injects the same three hint types listed above.
Existing hints are never duplicated.

---

## `crossorigin` and credentialed APIs

All hints use `crossorigin="anonymous"`. This is correct for:

- Same-origin APIs
- Public cross-origin APIs that do not require credentials

If a cross-origin API requires **credentials** (cookies or an `Authorization`
header), the `preload` hint must use `crossorigin="use-credentials"` or the
browser will discard the prefetched response (CORS mismatch). In that case,
write the hint manually in `<head>` rather than relying on automatic injection:

```html
<head>
  <!-- Manual hint for a credentialed cross-origin API -->
  <link rel="preload" href="https://api.mystore.com/me"
        as="fetch" crossorigin="use-credentials">
</head>
```

---

## Summary

| Hint | Trigger | Benefit |
|---|---|---|
| `preload` | Static `get=` URL | Starts the API request before JS renders the component |
| `preconnect` | Cross-origin `get=` URL | Eliminates DNS + TLS round-trip for external APIs |
| `prefetch` | `<template route src>` | Loads route templates in the background after first paint |

---

**Next:** [Configuration →](configuration.md)
