# Head Management

No.JS provides four reactive directives that update `<head>` elements from body
markup — useful for product pages, landing pages, and any route that is not
managed by the SPA router.

> **Routing use case:** If you are using `<template route>`, prefer the
> [`page-title`, `page-description`, `page-canonical`, and `page-jsonld`
> attributes on the template element](routing.md#route-head-attributes) —
> they are more declarative and do not require extra elements in the body.

---

## Placement

Place the directive on a `<div hidden>` element anywhere in the page body (not
inside `<head>`). The element is invisible and semantically neutral:

```html
<div hidden page-title="product.name + ' | My Store'"></div>
<div hidden page-description="product.description"></div>
<div hidden page-canonical="'/products/' + product.slug"></div>
<div hidden page-jsonld>{"@type":"Product","name":"{product.name}","price":"{product.price}"}</div>
```

All directives are reactive — they re-apply whenever the surrounding state
changes.

---

## `page-title`

Updates `document.title`.

```html
<!-- Static string -->
<div hidden page-title="'About Us | My Store'"></div>

<!-- Expression against local state -->
<div state='{"name":"Sneaker X"}'>
  <div hidden page-title="name + ' | Store'"></div>
</div>
```

The value is a No.JS expression. Any expression that evaluates to a non-null
value sets the title.

---

## `page-description`

Creates or updates `<meta name="description" content="...">` in `<head>`.

```html
<div hidden page-description="product.description"></div>

<!-- Static -->
<div hidden page-description="'The best sneakers online'"></div>
```

If a `<meta name="description">` already exists (e.g. set server-side), it is
updated in place — no duplicate is created.

---

## `page-canonical`

Creates or updates `<link rel="canonical" href="...">` in `<head>`.

```html
<div hidden page-canonical="'/products/' + product.slug"></div>

<!-- Static -->
<div hidden page-canonical="'https://mystore.com/about'"></div>
```

The value is a No.JS expression evaluated to a URL string. If a canonical link
already exists, it is updated in place.

---

## `page-jsonld`

Creates or updates `<script type="application/ld+json" data-nojs>` in `<head>`.

Unlike the other three directives, the JSON-LD template is written as the
**body of the element**, not as the attribute value. Use `{expression}`
placeholders for dynamic values:

```html
<div hidden page-jsonld>
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "{product.name}",
    "description": "{product.description}",
    "offers": {
      "@type": "Offer",
      "price": "{product.price}",
      "priceCurrency": "USD"
    }
  }
</div>
```

> **Note:** `<script>` elements are skipped by No.JS processing. Always use
> `<div hidden page-jsonld>` as the host element.

The `data-nojs` marker distinguishes the managed tag from any hand-written
JSON-LD blocks already in `<head>` — they coexist safely.

### Full product page example

```html
<div state='{"product": null}'>
  <div get="/api/products/{slug}" as="product"></div>

  <div hidden page-title="product.name + ' | My Store'"></div>
  <div hidden page-description="product.description"></div>
  <div hidden page-canonical="'/products/' + product.slug"></div>
  <div hidden page-jsonld>
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "{product.name}",
      "offers": {"@type":"Offer","price":"{product.price}","priceCurrency":"USD"}
    }
  </div>

  <h1 bind="product.name"></h1>
  <p bind="product.description"></p>
</div>
```

---

## Notes and edge cases

### Multiple directives competing for the same element

If two `<div hidden page-description>` elements exist on the same page, both
write to the same `<meta name="description">` tag — the last one processed
wins. Keep one directive per head element per page.

### Cleanup on unmount

Head elements (`<title>`, `<meta name="description">`, etc.) injected by
these directives are **not removed** if the host `<div hidden>` is later
removed from the DOM (e.g. via an `if=` directive). The head element remains
with its last value. This is by design for the common case (always-present
host element), but worth noting for conditional page-metadata patterns.

### `page-jsonld` template capture

The `page-jsonld` watcher captures the element's `innerHTML` as a static
template string once at directive init time. `{placeholder}` expressions
inside the JSON are re-evaluated on every reactive update, but structural
changes to the element's children after init are not picked up.

---

**Next:** [Data Fetching →](data-fetching.md)
