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

## Anchor Links in Hash Mode

When using `mode: 'hash'`, the URL hash (`#`) is used for routing (e.g. `#/docs`). This normally conflicts with standard anchor links like `<a href="#section">` — but No.JS handles it automatically.

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

**Next:** [Animations →](animations.md)
