# Routing — SPA Navigation

Full client-side routing with no page reloads.

## Route Definition

```html
<body>
  <nav>
    <a route="/">Home</a>
    <a route="/about">About</a>
    <a route="/users">Users</a>
    <a route="/users/:id">User Detail</a>
  </nav>

  <!-- This is where route content renders -->
  <main route-view></main>

  <!-- Route templates -->
  <template route="/" id="homePage">
    <h1>Home</h1>
    <p>Welcome to No.JS</p>
  </template>

  <template route="/about" id="aboutPage">
    <h1>About</h1>
  </template>

  <template route="/users" id="usersPage">
    <div get="/api/users" as="users">
      <div each="user in users" template="userLink"></div>
    </div>
  </template>

  <template route="/users/:id" id="userDetail">
    <div get="/api/users/{$route.params.id}" as="user">
      <h1 bind="user.name"></h1>
    </div>
  </template>
</body>
```

---

## Route Parameters & Query

```html
<!-- Params: /users/42 -->
<template route="/users/:id">
  <span bind="$route.params.id"></span>    <!-- "42" -->
</template>

<!-- Query: /search?q=hello&page=2 -->
<template route="/search">
  <span bind="$route.query.q"></span>      <!-- "hello" -->
  <span bind="$route.query.page"></span>   <!-- "2" -->
</template>
```

---

## `$route` — Route Context

| Property | Description |
|----------|-------------|
| `$route.path` | Current path (e.g. `"/users/42"`) |
| `$route.params` | Route parameters (e.g. `{ id: "42" }`) |
| `$route.query` | Query string params (e.g. `{ q: "hello" }`) |
| `$route.hash` | URL hash (e.g. `"#section"`) |
| `$route.matched` | Whether an explicit route matched (`true`) or a wildcard/fallback is rendering (`false`) |

---

## Active Route Styling

```html
<a route="/" route-active="active">Home</a>
<a route="/about" route-active="active">About</a>

<!-- Exact match only (won't match /users/123) -->
<a route="/users" route-active-exact="active">Users</a>
```

---

## Route Guards

```html
<!-- Redirect if not authenticated -->
<template route="/dashboard" guard="$store.auth.user" redirect="/login">
  <h1>Dashboard</h1>
</template>

<!-- Redirect if already logged in -->
<template route="/login" guard="!$store.auth.user" redirect="/dashboard">
  <form post="/api/login">...</form>
</template>
```

---

## Programmatic Navigation

```html
<button on:click="$router.push('/users/42')">Go to User</button>
<button on:click="$router.back()">Go Back</button>
<button on:click="$router.replace('/new-path')">Replace</button>
```

> **Note:** `$router.push()` and `$router.replace()` return Promises — navigation (including remote template loading) is fully async. In `on:click` handlers the return value is ignored, but in scripts you can `await` them:
>
> ```html
> <script>
>   await NoJS.router.push('/dashboard');
> </script>
> ```

---

## Nested Routes

```html
<template route="/settings" id="settingsPage">
  <nav>
    <a route="/settings/profile">Profile</a>
    <a route="/settings/security">Security</a>
  </nav>
  <div route-view></div>  <!-- Nested route content renders here -->
</template>

<template route="/settings/profile">
  <h2>Profile Settings</h2>
</template>

<template route="/settings/security">
  <h2>Security Settings</h2>
</template>
```

---

## Remote Templates in Routes

Route templates can include `<template src="...">` to load content from external files. They are automatically resolved before the route renders:

```html
<template route="/dashboard">
  <template src="/partials/dash-header.html"></template>
  <template src="/partials/dash-stats.html"></template>
  <p>Dashboard content</p>
</template>
```

Nested remote templates (a remote template that itself contains more `<template src>`) are recursively loaded.

---

## File-Based Routing

Instead of declaring each route template manually, point your `route-view` outlet at a folder. No.JS will automatically resolve route paths to template files inside that folder.

```html
<!-- Traditional (explicit) routing -->
<template route="/" src="./pages/overview.tpl"></template>
<template route="/analytics" src="./pages/analytics.tpl"></template>
<template route="/users" src="./pages/users.tpl"></template>

<!-- File-based routing — one line replaces all of the above! -->
<main route-view src="./pages/" route-index="overview"></main>
```

### How it works

1. Add `route-view` to your outlet element — file-based routing is enabled by default (config `router.templates: "pages"`). Override per-outlet with `src="folder/"`.
2. When a user navigates to `/analytics`, No.JS resolves it to `pages/analytics.tpl`
3. The template is fetched, cached, and rendered — automatically

### Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `src` | `"pages"` | Base folder for template resolution (per-outlet override; config: `router.templates`) |
| `route-index` | `"index"` | Filename for the root route `/` |
| `ext` | `".tpl"` | File extension appended to route segments (fallback: `".html"`) |
| `i18n-ns` | — | When present, auto-derives i18n namespace from filename |

> **Config default:** The default `router.templates` is `"pages"`, so file-based routing works out of the box — just add `route-view` to your outlet. Override with `NoJS.config({ router: { templates: 'views' } })` or per-outlet via `src="./custom/"`.

### Example — SaaS Dashboard

```
pages/
├── overview.tpl    ← /
├── analytics.tpl   ← /analytics
├── users.tpl       ← /users
├── revenue.tpl     ← /revenue
├── billing.tpl     ← /billing
└── settings.tpl    ← /settings
```

```html
<template src="./components/sidebar.tpl"></template>

<main route-view src="./pages/" route-index="overview"></main>
```

That's it — **two lines** for a full SPA with six routes.

### Mixing Explicit & File-Based Routes

Explicit `<template route="...">` declarations **always take priority**. This lets you combine both approaches — use file-based routing for simple pages and explicit templates for routes that need guards, params, or named outlets:

```html
<!-- File-based routing handles most pages automatically -->
<main route-view src="./pages/"></main>

<!-- Explicit route for param-based pages -->
<template route="/users/:id" src="./pages/user-detail.tpl"></template>

<!-- Explicit route with guard -->
<template route="/admin" src="./pages/admin.tpl"
          guard="$store.auth.isAdmin" redirect="/"></template>
```

### Auto i18n Namespace

When the `route-view` element has an `i18n-ns` attribute (even without a value), No.JS automatically loads the i18n namespace matching the filename:

```html
<!-- Auto-derives namespace: "/" → "landing", "/features" → "features", etc. -->
<main route-view src="templates/" route-index="landing" i18n-ns></main>
```

This replaces the need to add `i18n-ns="..."` on each route template individually.

---

## Lazy Template Loading

Route templates support a `lazy` attribute to control when their remote file is fetched:

| Value | Phase | Behaviour |
|-------|-------|-----------|
| *(absent)* | Auto | Active route loads before first render; others preload silently after |
| `lazy="priority"` | 0 | Fetched first, before all other templates |
| `lazy="ondemand"` | On demand | Only fetched the first time the user navigates to that route |

```html
<!-- Auto-prioritised: loads before first render (it's the active route at startup) -->
<template route="/" src="./home.tpl"></template>

<!-- Silently preloaded in background after first render -->
<template route="/about" src="./about.tpl"></template>

<!-- Loaded only when the user first visits /dashboard -->
<template route="/dashboard" src="./dashboard.tpl" lazy="ondemand"></template>

<!-- Forced priority — loads before all content-includes too -->
<template route="/critical" src="./critical.tpl" lazy="priority"></template>
```

> `lazy="ondemand"` is skipped entirely during initialisation. The router fetches the file on the first navigation and caches it for all subsequent visits.

---

## Anchor Links

When using `useHash: true`, the URL hash (`#`) is used for routing (e.g. `#/docs`). This normally conflicts with standard anchor links like `<a href="#section">` — but No.JS handles it automatically in both hash and history modes.

Anchor links that point to an element `id` on the page are intercepted by the router: the target element is scrolled into view smoothly, and the clicked link receives an `active` class. The route itself is **not** affected.

```html
<!-- These work in hash mode — no special attributes needed -->
<nav>
  <a href="#introduction">Introduction</a>
  <a href="#getting-started">Getting Started</a>
  <a href="#api">API Reference</a>
</nav>

<div id="introduction">
  <h2>Introduction</h2>
  <p>...</p>
</div>

<div id="getting-started">
  <h2>Getting Started</h2>
  <p>...</p>
</div>

<div id="api">
  <h2>API Reference</h2>
  <p>...</p>
</div>
```

**How it works:**

- Clicking `<a href="#introduction">` scrolls to `<div id="introduction">` with smooth behavior
- The `.active` class is toggled on the clicked link (and removed from siblings)
- The current route path is preserved — no navigation occurs
- Links with a `route` attribute are always treated as route navigation, not anchors

> **Tip:** Style the active anchor link with `.active` in your CSS — the router manages the class for you.

---

## Named Outlets

Multiple `route-view` outlets can coexist in the same layout. Give each outlet a name (the attribute value), then point route templates at specific outlets using the `outlet` attribute.

```html
<!-- Layout -->
<main route-view></main>              <!-- "default" outlet -->
<aside route-view="sidebar"></aside>
<header route-view="topbar"></header>

<!-- /home fills all three outlets -->
<template route="/home">
  <h1>Home page</h1>
</template>

<template route="/home" outlet="sidebar">
  <nav>Home navigation</nav>
</template>

<template route="/home" outlet="topbar">
  <span>Home breadcrumb</span>
</template>

<!-- /about only fills default; sidebar and topbar are cleared automatically -->
<template route="/about">
  <h1>About us</h1>
</template>
```

> Outlets with no matching template for the active route are **always cleared** on navigation.

### Programmatic Registration

```js
router.register('/home', mainTpl);                // → "default" outlet
router.register('/home', sidebarTpl, 'sidebar');  // → "sidebar" outlet
```

---

## 404 / Catch-All Routes

Use `route="*"` to define a **wildcard catch-all** template that renders when no explicit route matches the current path. The wildcard is always evaluated last, regardless of DOM order.

```html
<nav>
  <a route="/">Home</a>
  <a route="/about">About</a>
</nav>

<main route-view></main>

<template route="/">
  <h1>Home</h1>
</template>

<template route="/about">
  <h1>About Us</h1>
</template>

<!-- Catch-all 404 -->
<template route="*">
  <h1>404 — Page Not Found</h1>
  <p>Sorry, <code bind="$route.path"></code> doesn't exist.</p>
  <a route="/">Back to Home</a>
</template>
```

Explicit routes **always take priority** — the wildcard only fires when `matchRoute()` returns no match.

---

### Automatic 404 Fallback

If you don't define a `route="*"` template, No.JS automatically shows a minimal built-in 404 page when no route matches. This ensures users always see something meaningful instead of a blank outlet.

```html
<!-- No route="*" defined here -->
<main route-view></main>

<template route="/">
  <h1>Home</h1>
</template>

<!-- Navigating to /xyz shows a built-in "404 — Page not found" message -->
```

> **Tip:** The built-in fallback is intentionally minimal and unstyled. Define your own `route="*"` template for production apps.

---

### Named Outlet Wildcards

Each named outlet can have its own wildcard fallback. When no route matches for an outlet, the framework resolves fallbacks in this order:

1. **Local wildcard** — `<template route="*" outlet="{name}">` for that specific outlet
2. **Global wildcard** — `<template route="*">` (the default outlet's wildcard), used only for non-default outlets
3. **Built-in 404** — the framework's minimal fallback page

```html
<main route-view></main>
<aside route-view="sidebar"></aside>

<template route="/">
  <h1>Home</h1>
</template>

<template route="/" outlet="sidebar">
  <nav>Home sidebar</nav>
</template>

<!-- Global wildcard (default outlet) -->
<template route="*">
  <h1>Page not found</h1>
</template>

<!-- Sidebar-specific wildcard -->
<template route="*" outlet="sidebar">
  <p>No sidebar content for this page</p>
</template>
```

If the sidebar has no local wildcard, it falls back to the global `route="*"`. If neither exists, the built-in 404 is used.

---

### `$route.matched`

The `$route.matched` boolean tells you whether the current path hit an explicit route (`true`) or a wildcard/fallback (`false`). Use it for conditional rendering inside your templates:

```html
<template route="*">
  <div show="!$route.matched">
    <h1>404</h1>
    <p>Path <code bind="$route.path"></code> was not found.</p>
    <a route="/">Go Home</a>
  </div>
</template>
```

`$route.matched` is set **before** the template renders, so it's always available during processing.

---

### Remote 404 Template

Wildcard routes support all the same attributes as regular route templates, including `src` for remote loading:

```html
<template route="*" src="./pages/404.tpl"></template>
```

The remote template is fetched, cached, and rendered just like any other route template — and it has full access to `$route.path`, `$route.matched`, and all other framework features.

---

### File-Based Routing 404

When using [file-based routing](#file-based-routing), navigating to a path whose `.tpl` file doesn't exist on the server (HTTP 404 or other error) automatically triggers the wildcard fallback chain.

```html
<!-- File-based routing -->
<main route-view src="./pages/"></main>

<!-- If ./pages/xyz.tpl returns HTTP 404, this catches it -->
<template route="*">
  <h1>404 — Page Not Found</h1>
  <p><code bind="$route.path"></code> could not be loaded.</p>
</template>
```

The failed HTTP response is **not** cached — subsequent navigations to other paths are unaffected.

---

---

## Per-Route Document Title (`page-title`)

Set `document.title` declaratively on each `<template route>` element. The
value is a No.JS expression; `$route` and `$store` are available in scope.

```html
<!-- Static string literal -->
<template route="/about" page-title="'About Us | My Store'">
  <h1>About</h1>
</template>

<!-- Expression using route params -->
<template route="/products/:id" page-title="'Product ' + $route.params.id + ' | Store'">
  <h1>Product Detail</h1>
</template>

<!-- Expression using global store (e.g. after login) -->
<template route="/account" page-title="$store.user.name + ' — My Account'">
  <h1>Account</h1>
</template>
```

The title is updated on every navigation. If the attribute is absent on a
template, `document.title` is not changed — allowing a default title set in
`<head>` to persist for that route.

> **Tip:** For full head management (description, canonical URL, JSON-LD) from
> route templates see [Route Head Attributes →](#route-head-attributes).
> For non-routing pages see [Head Management →](head-management.md).

---

**Next:** [Animations →](animations.md)
