# Getting Started

## Installation

### CDN (recommended)

```html
<script src="https://unpkg.com/@erickxavier/no-js@latest/dist/iife/no.js"></script>
```

### NPM

```bash
npm install no-js
```

```js
// ESM
import NoJS from 'no-js';
await NoJS.init();

// CommonJS
const NoJS = require('no-js');
await NoJS.init();
```

> `init()` returns a **Promise** — it loads remote templates and initializes the router before processing directives. When using the CDN `<script>` tag, this is handled automatically on `DOMContentLoaded`.

### Self-hosted

Download `dist/iife/no.js` and include it with a `<script>` tag. It's a single file, ~11 KB gzipped.

---

## Minimal Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/@erickxavier/no-js@latest/dist/iife/no.js"></script>
</head>
<body base="https://jsonplaceholder.typicode.com">

  <div get="/users/1" as="user">
    <h1 bind="user.name">Loading...</h1>
    <p bind="user.email"></p>
  </div>

</body>
</html>
```

That's it. No `app.mount()`. No `createApp()`. No `NgModule`. It just works.

---

## How It Works

1. **Parse** — On `DOMContentLoaded`, No.JS walks the DOM looking for elements with known attributes.
2. **Resolve** — Each attribute maps to a **directive** that is executed by priority (data fetching first, then conditionals, then rendering).
3. **React** — All data lives in **reactive contexts** (Proxy-backed). When data changes, every bound element updates automatically.
4. **Scope** — Contexts inherit from parent elements, like lexical scoping. A `bind` inside an `each` loop can access both the loop item and ancestor data.

---

## Core Concepts

### Reactive Context

Every element can have a **context** — a reactive data object. Contexts are created by `state`, `get`, `store`, etc. Child elements inherit their parent's context automatically.

```
body          → context: { baseUrl }
  div[get]    → context: { user: { name, email } }  ← inherits from body
    span[bind="user.name"]                           ← reads from div's context
    div[each] → context: { post: { title } }         ← inherits from div (can access user + post)
```

### Directive Priority

Directives run in a defined order:

| Priority | Directives | Description |
|----------|-----------|-------------|
| 0 | `state`, `store` | Initialize local/global state |
| 1 | `get`, `post`, `put`, `patch`, `delete` | Fetch data |
| 5 | `route` | SPA routing |
| 10 | `if`, `switch`, `each`, `foreach` | Structural (add/remove DOM) |
| 20 | `bind`, `class-*`, `style-*`, `show`, `hide` | Rendering (update existing DOM) |
| 20 | `on:*` | Event binding |
| 30 | `validate`, `animate` | Side effects |

### Expression Syntax

Most directive values accept **JavaScript expressions** evaluated against the current context:

```html
<!-- Simple path -->
<span bind="user.name"></span>

<!-- Ternary -->
<span bind="user.age >= 18 ? 'Adult' : 'Minor'"></span>

<!-- Arithmetic -->
<span bind="cart.total * 1.1"></span>

<!-- Filters (pipes) -->
<span bind="user.name | uppercase"></span>

<!-- Template literals (bind-html) -->
<div bind-html="`<strong>${user.name}</strong>`"></div>
```

---

**Next:** [Data Fetching →](data-fetching.md)
