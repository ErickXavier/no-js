# Configuration & Security

## Global Settings

```html
<script>
  NoJS.config({
    // API
    baseApiUrl: 'https://api.myapp.com/v1',
    headers: { 'Authorization': 'Bearer xxx' },
    timeout: 10000,
    retries: 2,
    retryDelay: 1000,
    credentials: 'include',    // fetch credentials mode

    // CSRF
    csrf: {
      header: 'X-CSRF-Token',
      token: '...'
    },

    // Caching
    cache: {
      strategy: 'memory',     // 'none' | 'memory' | 'session' | 'local'
      ttl: 300000              // 5 minutes
    },

    // Templates
    templates: {
      cache: true             // Cache fetched .tpl HTML in memory (default: true)
    },

    // Router
    router: {
      mode: 'hash',           // 'hash' | 'history'
      base: '/',
      scrollBehavior: 'top'   // 'top' | 'preserve' | 'smooth'
    },
    // Note: In hash mode, standard anchor links (href="#id")
    // are automatically intercepted — they scroll to the target
    // element without triggering route navigation.

    // i18n
    i18n: {
      defaultLocale: 'en',
      fallbackLocale: 'en',
      detectBrowser: true
    },

    // Debugging
    debug: true,               // Logs directive processing
    devtools: true,            // Enables browser devtools panel

    // Security
    sanitize: true,            // Sanitize bind-html
    csp: 'strict'              // Restrict expressions for CSP compliance
  });
</script>
```

---

## Request Interceptors

```html
<script>
  // Before every request
  NoJS.interceptor('request', (url, options) => {
    options.headers['X-Request-ID'] = crypto.randomUUID();
    return options;
  });

  // After every response
  NoJS.interceptor('response', (response, url) => {
    if (response.status === 401) {
      NoJS.store.auth.user = null;
      NoJS.router.push('/login');
      throw new Error('Unauthorized');
    }
    return response;
  });
</script>
```

---

## Security

### XSS Protection

- `bind` always sets `textContent`, never `innerHTML` — safe by default.
- `bind-html` sanitizes content through a DOMPurify-compatible sanitizer.
- Template expressions are evaluated in a sandboxed `Function()` scope — no access to `window`, `document`, or globals unless explicitly exposed.

### CSRF Protection

```html
<script>
  NoJS.config({
    csrf: {
      header: 'X-CSRF-Token',
      token: document.querySelector('meta[name="csrf-token"]').content
    }
  });
</script>
```

### Content Security Policy

No.JS uses `new Function()` for expression evaluation. If your CSP blocks `unsafe-eval`, use the precompiled mode:

```html
<script src="dist/iife/no.js" data-csp="strict"></script>
```

In strict mode, expressions are limited to dot-path access and simple comparisons (no arbitrary JS).

---

### `templates.cache`

**Type:** `boolean` | **Default:** `true`

Controls whether the HTML content of remotely-fetched `.tpl` files is stored in an in-memory `Map` after the first request. On repeated navigations to the same route, the cached HTML is used directly — no HTTP request is made. The cache lives for the duration of the page session (no TTL — template assets are static, not data).

```js
// Disable template caching (always re-fetch .tpl files)
NoJS.config({ templates: { cache: false } });

// Default — caching is on, no configuration needed
NoJS.config({ templates: { cache: true } });
```

Set to `false` during local development if you want changes to `.tpl` files to be reflected without a hard page reload.

---

**Next:** [Directive Cheatsheet →](cheatsheet.md)
