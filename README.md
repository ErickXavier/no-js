<h1>
  <img src="docs/logo-dark-round.png" alt="No.JS" width="26" style="vertical-align: middle; margin-top: -6px;"> No.JS
</h1>

**The HTML-First Reactive Framework**

Build dynamic, reactive web applications using nothing but HTML attributes.
No build step. No virtual DOM. No transpiler. No JSX. Just HTML.

```html
<div get="/users/1" as="user">
  <h1 bind="user.name">Loading...</h1>
  <p bind="user.email"></p>
</div>
```

**Zero JavaScript written. Fully reactive. Real API data.**

---

## Features

- **Declarative HTTP** — `get`, `post`, `put`, `patch`, `delete` as HTML attributes
- **Reactive Binding** — `bind`, `bind-*`, `model` for one/two-way data binding
- **Conditionals & Loops** — `if`, `else-if`, `show`, `hide`, `each`, `foreach`, `switch`
- **State Management** — `state` (local), `store` (global), `computed`, `watch`, `notify()`
- **SPA Routing** — `route`, `route-view`, guards, params, nested routes, wildcard catch-all
- **Forms & Validation** — Built-in validators + `$form` context
- **Animations** — `animate`, `transition` with stagger support
- **i18n** — `t` directive with pluralization
- **Filters** — `uppercase`, `currency`, `date`, `truncate`, 32 built-in pipes
- **Drag & Drop** — `drag`, `drop`, `drag-image`, `drag-data`, `drop-zone`
- **Custom Directives** — Extend with `NoJS.directive()`
- **~20 KB gzipped** — Zero dependencies

---

## Quick Start

### CDN

```html
<script src="https://cdn.no-js.dev/"></script>
```

### NPM

```bash
npm install @erickxavier/no-js
```

```js
import NoJS from "@erickxavier/no-js";
NoJS.init();
```

With the CDN, No.JS auto-starts on `DOMContentLoaded`. You can configure it before it loads:

```html
<script>
NoJS.config({
  debug: true,
  router: {
    useHash: true
  },
});
</script>
```

---

## Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.no-js.dev/"></script>
</head>
<body base="https://jsonplaceholder.typicode.com">

  <!-- Fetch & display data -->
  <div get="/users" as="users" loading="#skeleton">
    <div each="user in users">
      <h2 bind="user.name"></h2>
      <p bind="user.email"></p>
    </div>
  </div>

  <!-- Local state + events -->
  <div state="{ count: 0 }">
    <button on:click="count++">Clicked <span bind="count"></span> times</button>
  </div>

  <!-- Form with validation -->
  <form post="/posts" validate success="#ok">
    <input name="title" required minlength="3" />
    <button type="submit" bind-disabled="!$form.valid">Submit</button>
  </form>

  <template id="skeleton"><p>Loading...</p></template>
  <template id="ok" var="res"><p>Created: <span bind="res.title"></span></p></template>

</body>
</html>
```

No `app.mount()`. No `createApp()`. No `NgModule`. It just works.

---

## Documentation

Full documentation is available in the [docs/](docs/) folder:

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/md/getting-started.md) | Installation, core concepts, how it works |
| [Data Fetching](docs/md/data-fetching.md) | `get`, `post`, `put`, `patch`, `delete`, caching, polling |
| [Data Binding](docs/md/data-binding.md) | `bind`, `bind-html`, `bind-*`, `model` |
| [Conditionals](docs/md/conditionals.md) | `if`, `else-if`, `show`, `hide`, `switch`/`case` |
| [Loops](docs/md/loops.md) | `each`, `foreach`, loop variables, nested loops |
| [Templates](docs/md/templates.md) | Reusable fragments, slots, remote templates |
| [State Management](docs/md/state-management.md) | `state`, `store`, `into`, `computed`, `watch` |
| [Events](docs/md/events.md) | `on:*`, modifiers, lifecycle hooks |
| [Dynamic Styling](docs/md/styling.md) | `class-*`, `style-*` |
| [Forms & Validation](docs/md/forms-validation.md) | `validate`, `$form`, custom validators |
| [Routing](docs/md/routing.md) | SPA navigation, guards, nested routes |
| [Animations](docs/md/animations.md) | `animate`, `transition`, stagger |
| [i18n](docs/md/i18n.md) | Translations, pluralization, formatting |
| [Filters](docs/md/filters.md) | Built-in filters, chaining, custom filters |
| [Actions & Refs](docs/md/actions-refs.md) | `call`, `trigger`, `ref`, `$refs` |
| [Custom Directives](docs/md/custom-directives.md) | Extend No.JS |
| [Error Handling](docs/md/error-handling.md) | Error boundaries, global handler |
| [Configuration](docs/md/configuration.md) | Global settings, interceptors, template caching, security |
| [Cheatsheet](docs/md/cheatsheet.md) | Every directive at a glance |
| [Full SPA Example](docs/md/examples.md) | Complete app with routing, auth, i18n |

---

## How It Works

1. **Parse** — On `DOMContentLoaded`, No.JS walks the DOM for known attributes
2. **Resolve** — Each attribute maps to a directive, executed by priority
3. **React** — Data lives in Proxy-backed reactive contexts; changes auto-update the DOM
4. **Scope** — Contexts inherit from parents, like lexical scoping

---

## Community

Join the conversation and get help:

- [Discord](https://discord.gg/CaSbGYg3xY)
- [GitHub Discussions](https://github.com/ErickXavier/no-js/discussions)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

- [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)

---

<p align="center">
  <strong>No.JS</strong> — Because the best JavaScript is the JavaScript you don't write.<br>
  <code>~20 KB gzipped</code> · <code>Zero dependencies</code> · <code>MIT License</code>
</p>