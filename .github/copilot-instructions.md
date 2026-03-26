# No.JS Framework — Project Guidelines

## Overview

No.JS is an HTML-first reactive framework with zero dependencies. Users build dynamic web apps using HTML attributes only — no JavaScript required. The framework is distributed exclusively via CDN — there is no NPM package or ESM/CJS install path for end users.

## Architecture

```
src/
├── index.js          # Public API: NoJS.config(), init(), directive(), filter(), validator(), etc.
├── cdn.js            # CDN entry: exposes window.NoJS, auto-inits on DOMContentLoaded
├── globals.js        # All shared state (_config, _filters, _stores, _eventBus, etc.)
├── context.js        # Reactive proxy contexts with change tracking and batching
├── evaluate.js       # Expression parser: evaluate(), resolve(), _interpolate()
├── registry.js       # registerDirective(), processTree() — DOM tree walking
├── dom.js            # DOM helpers, template loading, HTML sanitization
├── router.js         # SPA router: path matching, guards, nested routes, prefetch
├── i18n.js           # Locale switching, namespace loading, pluralization
├── filters.js        # 32 built-in filters (side-effect registration)
├── animations.js     # Transitions and stagger support
├── fetch.js          # Declarative HTTP (get/post/put/patch/delete)
├── devtools.js       # Browser devtools bridge
└── directives/       # One file per directive category (state, http, binding, loops, etc.)
```

- **Directives** register via `registerDirective(name, handler)` and are invoked by `processTree()` during DOM walking
- **Reactivity** uses JavaScript `Proxy` objects in `createContext()` with `_startBatch()` / `_endBatch()` for batched updates
- **Global state** lives exclusively in `globals.js` — all modules import from there

## Conventions

- **Private API**: prefix with `_` (e.g., `_config`, `_loadRemoteTemplates()`)
- **Public API**: exported via `src/index.js` on the `NoJS` object
- **Side-effect imports**: directives and filters self-register on import
- **Logging**: use `_log()` / `_warn()` (respects `_config.debug`), never `console.log`
- **Cache maps**: use `Map` objects (`_templateHtmlCache`, `_i18nCache`)

## Build

```sh
node build.js        # → dist/iife/no.js (esbuild, minified + sourcemaps)
```

Build target is ES2020. The only user-facing output is `dist/iife/no.js` (served via CDN). Version must be updated in **both** `package.json` and `src/index.js`.

## Testing

```sh
npm test                  # Jest unit tests (jsdom environment)
npm run test:e2e          # Playwright E2E tests
npm run test:all          # Both unit + E2E
```

- Unit tests live in `__tests__/*.test.js`, one file per module
- E2E tests live in `e2e/tests/`, run against local dev server
- Test environment: `jest-environment-jsdom` with `@testing-library/jest-dom`
- All 900+ unit tests must pass before any release

## Documentation Site

- Dev server: `npm start` → `http://localhost:3000` (serves docs + rewrites CDN URLs to local build)
- Templates: `docs/templates/*.tpl` — HTML template files
- Locales: `docs/locales/{en,es,pt,fr,it}/` — JSON translation files, `en` is source of truth
- Translation keys use `t="key.path"` attributes in templates

## Key Patterns

- When adding a new directive: create/update handler in `src/directives/`, register in the handler file, add tests in `__tests__/`, update docs in `docs/md/`
- When adding a new filter: add to `src/filters.js`, add tests in `__tests__/filters.test.js`
- When modifying reactivity: changes in `context.js` affect all data-bound directives — test thoroughly
- Expression evaluation (`evaluate.js`) is security-sensitive — never use `eval()` or `Function()` on untrusted input
