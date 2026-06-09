# Documento de Requisitos do Produto (PRD)

**Feature:** `get` Directive Pagination & Trigger Extension
**EPIC:** NOJS-98
**Task:** NOJS-99
**Date:** 2026-06-05
**Status:** Draft
**Repos affected:** NoJS Core, NoJS-LSP, NoJS-Skill

---

## 1. Visao Geral

The `get` directive is the primary declarative data-fetching primitive in NoJS Core. Today it handles single-shot fetches, polling (`refresh`), reactive URL refetching, caching, and template-driven loading/error/empty states. However, it has no built-in concept of pagination -- the most common data-loading pattern on the web.

Developers who need paginated data (infinite scroll feeds, "load more" lists, lazy-loaded sections) must currently drop down to imperative JavaScript, which contradicts the NoJS zero-JS philosophy.

This PRD specifies five new attributes that extend `get` with declarative pagination and flexible fetch triggers:

| Attribute | Purpose |
|-----------|---------|
| `get-insert` | Controls how paginated responses are inserted into the DOM (append or prepend) |
| `get-trigger` | Controls what event initiates the next fetch (scroll, button, visible, hover, none) |
| `get-page` | Tracks the current page number for offset-based pagination |
| `get-cursor` | Enables cursor-based pagination with automatic cursor extraction |
| `get-threshold` | Configures the IntersectionObserver rootMargin for scroll/visible triggers |

These five attributes compose orthogonally: `get-insert` controls *where* new content goes, `get-trigger` controls *when* the next fetch fires, and `get-page`/`get-cursor` control *how* the URL is parameterized. A developer can mix any trigger with any insertion mode and any pagination strategy.

**Why now:** Pagination is the #1 missing primitive in NoJS Core. Every real-world application that lists data needs it. Without it, developers are forced to write JavaScript -- the exact outcome NoJS exists to prevent.

---

## 2. Objetivos

### Objetivos de Negocio
- **Eliminate the #1 reason developers eject from NoJS** -- paginated data loading is currently impossible without JavaScript.
- **Expand Core's applicability** to content-heavy use cases (feeds, catalogs, search results, dashboards) that today require a JavaScript framework.
- **Keep the feature in Core** rather than Elements, so pagination does not require a plugin dependency.

### Objetivos do Usuario
- **Declare paginated data fetching** with the same simplicity as a single `get` fetch -- zero JavaScript.
- **Choose the right trigger** for the use case (scroll for feeds, button for explicit control, visible for lazy sections, hover for prefetch, none for programmatic).
- **Support both offset-based and cursor-based APIs** without changing the HTML structure.
- **Compose with existing `get` features** (`loading`/`error`/`empty` templates, `skeleton`, `as`, `success`, `then`, `cached`, `retry`) without conflicts.

---

## 3. Publico-Alvo

### Primary Persona: NoJS Developer
A frontend developer building content-heavy pages (feeds, product catalogs, search results, admin dashboards) who has adopted the NoJS declarative model and wants to add paginated data loading without writing JavaScript.

### Secondary Persona: Backend Developer
A full-stack or backend developer who uses NoJS precisely because they do not want to write frontend JavaScript. They need a pagination solution that maps cleanly to their API's page/cursor parameters.

---

## 4. Historias de Usuarios e Criterios de Aceite

### HU-1: Infinite Scroll Feed

**Como** developer building a social feed, **eu quero** that new items load automatically as the user scrolls down **para que** the feed feels seamless without a manual "load more" step.

```html
<div get="/api/posts?page={page}"
     get-insert="append"
     get-trigger="scroll"
     get-page="1">

  <template get-loading>
    <div class="spinner">Loading...</div>
  </template>

  <template get-empty>
    <p>You have reached the end.</p>
  </template>

  <template get-error>
    <p>Failed to load. <button get-retry>Retry</button></p>
  </template>
</div>
```

**Criterios de Aceite:**

* **Cenario 1: Initial load**
  * Dado que the element has `get-page="1"` and `get-trigger="scroll"`;
  * Quando the element connects to the DOM;
  * Entao it fetches `/api/posts?page=1` and renders the response as the initial content.

* **Cenario 2: Scroll triggers next page**
  * Dado that page 1 has been rendered and a sentinel element exists at the bottom;
  * Quando the sentinel enters the viewport (IntersectionObserver fires);
  * Entao `page` increments to 2 in the context (not as a DOM attribute mutation), the URL resolves to `/api/posts?page=2`, a new fetch fires, and the response HTML is appended after the existing content (before the sentinel).

* **Cenario 3: End of data**
  * Dado that the server returns an empty response body (or `[]` for JSON, or the `X-NoJS-Last-Page: true` header);
  * Quando the response is processed;
  * Entao the `get-empty` template renders, the IntersectionObserver disconnects, and no further fetches fire.

* **Cenario 4: Scroll position preserved**
  * Dado that the user is mid-scroll and page 2 loads;
  * Quando the new content is appended;
  * Entao the user's scroll position does not jump -- they remain at the same visual position they were at before the append.

---

### HU-2: Load More Button

**Como** developer building a product catalog, **eu quero** a "Load More" button that fetches the next page on click **para que** the user has explicit control over when more items appear.

```html
<div get="/api/products?page={page}"
     get-insert="append"
     get-trigger="button"
     get-page="1">

  <template get-loading>
    <p>Loading products...</p>
  </template>

  <template get-empty>
    <p>All products loaded.</p>
  </template>
</div>
```

**Criterios de Aceite:**

* **Cenario 1: Button rendered**
  * Dado that `get-trigger="button"` is set;
  * Quando the first page has been fetched and rendered;
  * Entao NoJS renders a `<button>` element (with a configurable label via `get-trigger-label`, defaulting to "Load More") after the content, before the sentinel.

* **Cenario 2: Click loads next page**
  * Dado that the "Load More" button is visible;
  * Quando the user clicks it;
  * Entao `page` increments, the next page fetches, the button is temporarily replaced by the `get-loading` template, and the response content is appended.

* **Cenario 3: Button disappears at end of data**
  * Dado that the server signals end-of-data;
  * Quando the response is processed;
  * Entao the "Load More" button is removed and the `get-empty` template renders (if provided).

---

### HU-3: Lazy-Loaded Section

**Como** developer building a dashboard, **eu quero** a section that only fetches its data when it scrolls into view **para que** off-screen panels do not consume bandwidth on page load.

```html
<section get="/api/dashboard/stats"
         get-trigger="visible">

  <template get-loading>
    <div class="skeleton-stats"></div>
  </template>
</section>
```

**Criterios de Aceite:**

* **Cenario 1: No fetch on init**
  * Dado that `get-trigger="visible"` is set;
  * Quando the element connects to the DOM but is not in the viewport;
  * Entao no fetch fires.

* **Cenario 2: Fetch on visibility**
  * Dado that the element is off-screen;
  * Quando it scrolls into the viewport (IntersectionObserver fires);
  * Entao the fetch fires exactly once, the observer disconnects, and the response renders normally.

* **Cenario 3: Already visible on load**
  * Dado that the element is already in the viewport when it connects;
  * Quando the IntersectionObserver callback fires immediately;
  * Entao the fetch fires once.

---

### HU-4: Hover Prefetch

**Como** developer building a navigation menu, **eu quero** to prefetch content when the user hovers over a link **para que** the target page feels instant when they click.

```html
<div get="/api/preview/{slug}"
     get-trigger="hover"
     as="preview">
  <p text="preview.title"></p>
</div>
```

**Criterios de Aceite:**

* **Cenario 1: No fetch on init**
  * Dado that `get-trigger="hover"` is set;
  * Quando the element connects to the DOM;
  * Entao no fetch fires.

* **Cenario 2: Fetch on mouseenter**
  * Dado that the element has not been fetched yet;
  * Quando the user hovers over it (`mouseenter`);
  * Entao the fetch fires exactly once and the response is stored in context under the `as` key.

* **Cenario 3: No duplicate fetch**
  * Dado that the data has already been fetched via hover;
  * Quando the user hovers again;
  * Entao no new fetch fires (the data is already in context).

---

### HU-5: Programmatic Fetch (None Trigger)

**Como** developer building a search interface, **eu quero** a `get` element that only fetches when I call `el.refresh()` **para que** I can tie the fetch to a form submission or other custom event.

```html
<div id="results"
     get="/api/search?q={query}"
     get-trigger="none"
     as="results">
  <ul>
    <li each="item in results">
      <span text="item.name"></span>
    </li>
  </ul>
</div>
```

**Criterios de Aceite:**

* **Cenario 1: No fetch on init**
  * Dado that `get-trigger="none"` is set;
  * Quando the element connects to the DOM;
  * Entao no fetch fires.

* **Cenario 2: Programmatic refresh**
  * Dado that `get-trigger="none"` is set;
  * Quando `document.getElementById('results').refresh()` is called;
  * Entao the fetch fires with the current context values interpolated into the URL.

* **Cenario 3: Reactive URL still works**
  * Dado that `get-trigger="none"` is set and the URL contains `{query}`;
  * Quando the `query` context variable changes;
  * Entao no automatic fetch fires (reactive URL watching is suppressed when trigger is `none`).

---

### HU-6: Cursor-Based Pagination

**Como** developer consuming a cursor-paginated API, **eu quero** NoJS to automatically extract the cursor from each response and use it in the next request **para que** I do not miss or duplicate items across pages.

```html
<div get="/api/messages?cursor={cursor}"
     get-insert="append"
     get-trigger="scroll"
     get-cursor>

  <template get-loading>
    <p>Loading messages...</p>
  </template>
</div>
```

**Criterios de Aceite:**

* **Cenario 1: Cursor extraction from header**
  * Dado that the server responds with an `X-NoJS-Cursor` header;
  * Quando the response is processed;
  * Entao the `cursor` context variable is set to that header value and the next fetch will use it.

* **Cenario 2: Cursor extraction from JSON body**
  * Dado that no `X-NoJS-Cursor` header is present but the JSON body contains a `cursor`, `next_cursor`, `nextCursor`, or `next` field;
  * Quando the response is processed;
  * Entao the `cursor` context variable is set to the first matching field value.

* **Cenario 3: Custom cursor field**
  * Dado that `get-cursor-field="pagination.nextToken"` is set;
  * Quando the response is processed;
  * Entao the cursor is extracted from `response.pagination.nextToken` instead of the default fields.

* **Cenario 4: Null cursor signals end of data**
  * Dado that the cursor value is `null`, `undefined`, or an empty string;
  * Quando the extraction runs;
  * Entao the pagination is considered complete (end-of-data), equivalent to an empty response.

* **Cenario 5: Cursor and page are mutually exclusive**
  * Dado that both `get-cursor` and `get-page` are present on the same element;
  * Quando the directive initializes;
  * Entao a console warning is emitted and `get-cursor` takes precedence.

---

### HU-7: Prepend Feed (Newest First)

**Como** developer building a real-time chat or notification feed, **eu quero** to prepend new items to the top of the list **para que** the newest messages appear first.

```html
<div get="/api/notifications?before={cursor}"
     get-insert="prepend"
     get-trigger="scroll"
     get-cursor
     get-threshold="100px">

  <template get-loading>
    <p>Loading newer notifications...</p>
  </template>
</div>
```

**Criterios de Aceite:**

* **Cenario 1: Content prepended**
  * Dado that `get-insert="prepend"` is set;
  * Quando a paginated response is received;
  * Entao the new content is inserted before the existing content (as the first children of the container).

* **Cenario 2: Scroll position adjusted**
  * Dado that content is prepended;
  * Quando the DOM updates;
  * Entao the scroll position is adjusted so the user does not see a visual jump -- the items they were looking at remain in the same viewport position.

---

## 5. Requisitos Funcionais

### RF-01: `get-insert` Attribute

| Detail | Specification |
|--------|---------------|
| **Values** | `append` (default when present with no value), `prepend` |
| **Default (absent)** | Standard `get` behavior -- full content replacement on each fetch |
| **Applies to** | `get` method only (ignored on `post`, `put`, `patch`, `delete`) |
| **DOM behavior (append)** | New content is inserted after existing children, before the sentinel element |
| **DOM behavior (prepend)** | New content is inserted before existing children, after any sentinel element |
| **First fetch** | Always replaces content (there is nothing to append/prepend to yet) |
| **Template interaction** | `get-loading` template is shown inline (appended/prepended) during paginated fetches, not replacing existing content. On the first fetch, loading template replaces content as today. |
| **Context accumulation** | When `as` is set, the context variable accumulates: arrays are concatenated (`[...prev, ...new]` for append, `[...new, ...prev]` for prepend); non-array values are replaced. |

### RF-02: `get-trigger` Attribute

| Value | Behavior |
|-------|----------|
| **(absent)** | Existing behavior -- fetch fires immediately on init for GET, on click/submit for others |
| `scroll` | Fetch fires when a sentinel element enters the viewport via IntersectionObserver. The sentinel is a zero-height `<div data-nojs-sentinel>` auto-inserted as the last (for append) or first (for prepend) child. |
| `button` | NoJS renders a `<button data-nojs-load-more>` element. Fetch fires on click. The button label defaults to `"Load More"` and can be customized via `get-trigger-label`. |
| `visible` | Fetch fires once when the element itself enters the viewport via IntersectionObserver. Observer disconnects after the first fetch. No pagination semantics -- this is a one-shot lazy load. |
| `hover` | Fetch fires once on `mouseenter`. No pagination semantics. Observer disconnects after the first fetch. |
| `none` | No automatic fetch. Only `el.refresh()` triggers a fetch. Reactive URL watching is also suppressed. |

**Composition rules:**
- `get-trigger` without `get-insert`: the trigger controls *when* the fetch fires, but the response still replaces content (standard behavior).
- `get-insert` without `get-trigger`: content is appended/prepended, but the developer must call `el.refresh()` to trigger subsequent fetches (equivalent to `get-trigger="none"`).
- `get-trigger="scroll"` or `get-trigger="button"` implies pagination -- they only make sense with `get-page` or `get-cursor` to advance the URL.

### RF-03: `get-page` Attribute

| Detail | Specification |
|--------|---------------|
| **Value** | Initial page number (integer, defaults to `1` when present with no value) |
| **Context variable** | `page` -- stored in the element's context, not as a self-mutating DOM attribute |
| **URL token** | `{page}` in the `get` URL is interpolated from the context `page` variable |
| **Increment** | After each successful paginated fetch, `page` increments by 1 |
| **Reset** | When the URL pattern changes (reactive URL dependency changes), `page` resets to its initial value |
| **Programmatic access** | `el.__ctx.page` is readable; `el.__ctx.$set('page', n)` allows manual page setting |

### RF-04: `get-cursor` Attribute

| Detail | Specification |
|--------|---------------|
| **Value** | Boolean attribute (presence enables cursor mode) |
| **Context variable** | `cursor` -- initially `null`, set after each response |
| **URL token** | `{cursor}` in the `get` URL is interpolated from the context `cursor` variable |
| **Extraction priority** | 1. `X-NoJS-Cursor` response header; 2. JSON body field lookup (see below) |
| **Default body fields** | `cursor`, `next_cursor`, `nextCursor`, `next` -- checked in order, first non-null wins |
| **Custom field** | `get-cursor-field="field.path"` overrides default body field lookup. Supports dot notation for nested fields. |
| **End-of-data** | Cursor is `null`, `undefined`, `""`, or absent -- pagination stops |
| **Mutual exclusivity** | If both `get-page` and `get-cursor` are present, warn and use `get-cursor` |
| **Data field** | When cursor is extracted from JSON body, the actual data must also be located. By default, the response root is used if it is an array, or the first array-valued field is used. This matches common API patterns (`{ data: [...], cursor: "abc" }`). |

### RF-05: `get-threshold` Attribute

| Detail | Specification |
|--------|---------------|
| **Value** | CSS margin value passed to IntersectionObserver `rootMargin` (e.g., `200px`, `50%`) |
| **Default** | `200px` (start loading before the sentinel is visible, for smoother UX) |
| **Applies to** | `get-trigger="scroll"` and `get-trigger="visible"` only |
| **Root element** | The nearest scrollable ancestor (`overflow: auto|scroll|overlay`), falling back to the viewport |

### RF-06: End-of-Data Detection

The pagination loop stops when any of these conditions are met:

1. **Empty response body** -- `null`, empty string, or `[]` (empty array).
2. **`X-NoJS-Last-Page: true` response header** -- explicit server signal.
3. **Null cursor** -- when using `get-cursor`, a null/empty cursor signals no more pages.

When end-of-data is detected:
- The `get-empty` template renders (if provided).
- The IntersectionObserver disconnects (for scroll/visible triggers).
- The "Load More" button is removed (for button trigger).
- The `fetch:end` event is emitted on the element.
- No further automatic fetches fire.

### RF-07: Concurrency Guard

- While a paginated fetch is in flight, additional trigger events (scroll intersections, button clicks) are ignored.
- The existing SwitchMap abort pattern is preserved: if `el.refresh()` is called during a paginated fetch, the in-flight request is aborted and the new one fires.
- `get-trigger="scroll"` and `refresh` (polling) on the same element are mutually exclusive. If both are present, emit a console warning and disable `refresh`.

### RF-08: Interaction with Existing `get` Features

| Feature | Interaction |
|---------|-------------|
| `refresh="N"` | Mutually exclusive with `get-trigger="scroll"` / `"button"` (warn). Compatible with `get-trigger="visible"` / `"hover"` / `"none"`. When compatible, refresh replaces full content (no append). |
| `as="name"` | Works normally. For paginated fetches with `get-insert`, the context variable accumulates (arrays concatenated). |
| `success="#tpl"` | Renders for the initial fetch. For subsequent paginated fetches, the success template is used to render each page's content before insertion. |
| `then="expr"` | Executes after every paginated fetch, with `result` set to the current page's data. |
| `loading="#tpl"` | On initial fetch: replaces content (existing behavior). On paginated fetches: appended/prepended inline, removed when the response arrives. |
| `error="#tpl"` | Renders on fetch error. For paginated fetches, shown inline (appended/prepended) without removing existing content. The `get-retry` button retries the failed page. |
| `empty="#tpl"` | Repurposed as the end-of-data template for paginated fetches. |
| `skeleton="id"` | Shown during the initial fetch only. Not shown during subsequent paginated fetches. |
| `cached` | Cache applies per-URL. Paginated URLs with different page/cursor values are cached independently. Cached pages are still appended/prepended on cache hit. |
| `into="store"` | Store receives the accumulated data (not just the latest page). |
| `retry` / `retry-delay` | Apply to each individual paginated fetch. |
| Reactive URLs (`{var}`) | When a reactive dependency (other than `page`/`cursor`) changes, pagination resets: `page` returns to initial value, `cursor` returns to `null`, existing appended/prepended content is cleared, and a fresh first-page fetch fires. |
| `el.refresh()` | Resets pagination state and fetches page 1 / initial cursor (full reset). |

### RF-09: Events

| Event | Payload | When |
|-------|---------|------|
| `fetch:page` | `{ url, page, cursor, insert }` | After each successful paginated fetch |
| `fetch:end` | `{ url, totalPages, totalItems? }` | When end-of-data is detected |
| `fetch:success` | (existing) | Still fires for every fetch, including paginated |
| `fetch:error` | (existing) | Still fires on error, including paginated |

### RF-10: DevTools Integration

- Each paginated fetch emits a `fetch:page` devtools event with page number, cursor value, and item count.
- End-of-data emits a `fetch:end` devtools event.
- The element's devtools panel shows the current page/cursor state.

---

## 6. Requisitos Nao Funcionais

### RNF-01: Performance
- The IntersectionObserver must use a single shared observer instance per root element, not one per `get` element.
- Paginated content insertion must not cause layout thrashing. Use `DocumentFragment` for batch DOM insertion.
- Memory: appended/prepended content is standard DOM -- no internal buffer. For very long lists, developers should implement virtual scrolling via Elements (out of scope).

### RNF-02: Bundle Size
- The pagination extension must add no more than **1.5 KB** (minified + gzipped) to the Core bundle.
- IntersectionObserver is a native API -- no polyfill included. If the browser does not support it, `get-trigger="scroll"` and `get-trigger="visible"` fall back to immediate fetch (with a console warning).

### RNF-03: Accessibility
- The auto-generated "Load More" button (`get-trigger="button"`) must have `aria-label="Load more items"` (customizable via `get-trigger-label`).
- After content is appended/prepended, focus must not be moved unless the user interacted with the "Load More" button (in which case focus moves to the first new item).
- The sentinel element must be `aria-hidden="true"` and have zero height/width so screen readers ignore it.
- `role="status"` and `aria-live="polite"` on the loading template during paginated fetches, so assistive technology announces loading state.

### RNF-04: Progressive Enhancement
- Server-rendered initial content must be preserved. When `get-trigger="scroll"` is set and the element already has children, those children are treated as page 1 and the first scroll-triggered fetch loads page 2.
- If JavaScript is disabled, the server-rendered content is still visible.

### RNF-05: Security
- All existing `get` security measures apply: header sanitization, SENSITIVE_HEADERS check, CORS rules.
- Cursor values from response headers/body are treated as opaque strings -- never evaluated as expressions.
- The `get-cursor-field` path is validated to contain only alphanumeric characters, dots, and underscores (no bracket notation, no code injection).

### RNF-06: Disposal
- When the element is disposed (removed from DOM, route change, `if` directive hides it):
  - In-flight paginated fetch is aborted via AbortController (existing pattern).
  - IntersectionObserver is disconnected.
  - "Load More" button event listener is removed.
  - Hover/mouseenter listener is removed.
  - Page/cursor context state is garbage-collected with the context.

---

## 7. Metricas de Sucesso (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Adoption** | 30% of `get` directives in new projects use at least one pagination attribute within 3 months of release | npm download analytics + community survey |
| **Bundle size delta** | < 1.5 KB gzip added to Core | CI bundle-size check |
| **Zero JS claim** | All 7 use cases (HU-1 through HU-7) achievable with zero user-written JavaScript | Manual verification on docs examples |
| **Lighthouse** | Infinite scroll demo page scores 95+ on Performance | Lighthouse CI |
| **Developer satisfaction** | 4.5+ / 5 rating on "ease of use" in post-release survey | Community feedback |
| **Bug reports** | < 5 critical/major bugs in first 30 days | GitHub Issues tracking |

---

## 8. Fora do Escopo

The following are explicitly NOT included in this specification:

| Item | Reason | Where it belongs |
|------|--------|-----------------|
| **Virtual scrolling** | Complex windowing logic for very long lists; requires DOM recycling | NoJS-Elements (`<virtual-list>`) |
| **Scroll-to-top button** | UI element, not a data-fetching concern | NoJS-Elements |
| **Pull-to-refresh** | Touch gesture handling, not a data-fetching concern | NoJS-Elements |
| **Progress indicators** | Visual components (progress bars, percentage loaders) | NoJS-Elements |
| **Offset-based pagination (`get-offset`)** | Can be achieved with `get-page` + arithmetic in the URL (`offset={page * 20}`); a dedicated attribute adds complexity without sufficient value | Future consideration |
| **Bi-directional infinite scroll** | Scrolling up to load older items AND down for newer simultaneously | Future consideration |
| **Server-Sent Events / WebSocket streaming** | Real-time push is a different primitive from request/response pagination | Separate EPIC |
| **Custom sentinel element** | Letting the developer designate their own sentinel instead of the auto-generated one | Future consideration if demand exists |

---

## 9. Cronograma e Marcos

| Marco | Data estimada | Descricao |
|-------|---------------|-----------|
| **PRD Approved** | 2026-06-06 | This document reviewed and accepted |
| **API Design Finalized** | 2026-06-07 | Attribute names, values, and composition rules locked |
| **Core Implementation** | 2026-06-10 | All 5 attributes implemented in `src/directives/http.js` with unit tests |
| **E2E Tests** | 2026-06-11 | Playwright tests covering all 7 user stories |
| **LSP Update** | 2026-06-12 | Autocomplete, hover docs, and validation for new attributes |
| **Skill Update** | 2026-06-12 | New attributes documented in Skill references |
| **Documentation** | 2026-06-13 | Docs site pages for pagination guide and API reference |
| **Release** | 2026-06-14 | Included in next minor version release |

---

## Appendix A: Complete Attribute Reference

```
get-insert="append|prepend"
  Insertion mode for paginated responses.
  - append: new content after existing (default when bare attribute)
  - prepend: new content before existing

get-trigger="scroll|button|visible|hover|none"
  What initiates the fetch.
  - scroll: IntersectionObserver on sentinel
  - button: auto-rendered "Load More" button
  - visible: IntersectionObserver on element itself (one-shot)
  - hover: mouseenter on element (one-shot)
  - none: only el.refresh()

get-page="N"
  Initial page number (integer). Stored as context variable `page`.
  URL token: {page}

get-cursor
  Boolean. Enables cursor-based pagination.
  Context variable: `cursor` (initially null).
  URL token: {cursor}
  Extraction: X-NoJS-Cursor header > JSON body fields.

get-cursor-field="field.path"
  Custom JSON field path for cursor extraction.
  Dot notation supported. Overrides default field lookup.

get-threshold="200px"
  IntersectionObserver rootMargin for scroll/visible triggers.
  Default: 200px.

get-trigger-label="Load More"
  Custom label for the auto-generated button (get-trigger="button").
  Default: "Load More".
```

## Appendix B: Edge Cases

### B-1: Empty Response on First Page
- If the very first fetch returns empty data, the `get-empty` template renders.
- No sentinel or "Load More" button is created.
- This is the same behavior as today's `get` with `empty` template.

### B-2: Error During Pagination
- The error template renders inline (appended/prepended) without removing existing loaded content.
- The `get-retry` button inside the error template retries the failed page (same page number / cursor).
- Page number / cursor does not advance on error.

### B-3: Reactive URL Change Resets Pagination
- When a non-pagination URL variable changes (e.g., `{category}` in `/api/items?cat={category}&page={page}`):
  - All previously appended/prepended content is cleared.
  - `page` resets to its initial value.
  - `cursor` resets to `null`.
  - A fresh page-1 fetch fires.
- When only `{page}` or `{cursor}` changes (from pagination), this reset does NOT trigger.

### B-4: Scroll Position Preservation
- **Append mode:** Browser natively preserves scroll position when content is added below the viewport. No special handling needed.
- **Prepend mode:** Before inserting new content, record `scrollTop` and the height of existing content. After insertion, adjust `scrollTop` by the height difference so the user's visible content does not shift.

### B-5: Concurrent Fetch Prevention
- A boolean `_paginationInFlight` flag prevents overlapping paginated fetches.
- Scroll intersections and button clicks while a fetch is in flight are silently dropped.
- `el.refresh()` bypasses this guard (uses the existing SwitchMap abort pattern).

### B-6: Disposal Mid-Fetch
- Existing `_onDispose` pattern aborts the in-flight request.
- IntersectionObserver is disconnected in the dispose callback.
- No DOM mutations occur after disposal (the AbortError is silently caught).

### B-7: `get-insert` Without Pagination Attributes
- If `get-insert="append"` is set but neither `get-page` nor `get-cursor` is present, content accumulates on each `el.refresh()` call but there is no automatic URL advancement.
- This is a valid (if unusual) use case: manually calling refresh with different context values.

### B-8: `get-trigger="visible"` with `get-insert`
- `visible` is a one-shot trigger. If `get-insert` is also present, only one fetch fires (the visible trigger). Subsequent pages require `el.refresh()` or a different trigger.
- This combination is unusual and a console info message is emitted to suggest using `scroll` instead.
