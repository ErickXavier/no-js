# Data Fetching

No.JS makes HTTP requests declarative — just add attributes to HTML elements.

## Base URL

Set once on any ancestor element. All descendant `get`, `post`, etc. resolve relative URLs against it.

```html
<body base="https://api.myapp.com/v1">
  <div get="/users">...</div>        <!-- → https://api.myapp.com/v1/users -->
  <div get="/posts">...</div>        <!-- → https://api.myapp.com/v1/posts -->
</body>
```

Override for specific sections:

```html
<div base="https://cms.myapp.com/api">
  <div get="/articles">...</div>     <!-- → https://cms.myapp.com/api/articles -->
</div>
```

Absolute URLs skip base resolution:

```html
<div get="https://other-api.com/data">...</div>
```

### Programmatic Configuration

```html
<script>
  NoJS.config({
    baseApiUrl: 'https://api.myapp.com/v1',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    timeout: 10000,
    retries: 2,
    retryDelay: 1000
  });
</script>
```

### Per-Request Headers

```html
<div get="/me"
     headers='{"Authorization": "Bearer abc123"}'
     as="user">
</div>
```

---

## `get` — Fetch and Render Data

```html
<div get="/users" as="users">
  <!-- `users` is now available in this scope -->
</div>
```

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `get` | `string` | URL to fetch (GET request) |
| `as` | `string` | Name to assign the response in the context. Default: `"data"` |
| `loading` | `string` | Template ID to show while loading (e.g. `"#skeleton"`) |
| `error` | `string` | Template ID to show on fetch error (e.g. `"#errorTpl"`) |
| `empty` | `string` | Template ID to show when response is empty array/null |
| `refresh` | `number` | Auto-refresh interval in ms (polling) |
| `cached` | `boolean\|string` | Cache responses. `cached` = memory, `cached="local"` = localStorage, `cached="session"` = sessionStorage |
| `into` | `string` | Write response to a named global store |
| `debounce` | `number` | Debounce in ms (useful with reactive URLs) |
| `headers` | `string` | JSON string of additional headers |
| `params` | `string` | Expression that resolves to query params object |

### Full Example

```html
<div get="/users"
     as="users"
     loading="#usersSkeleton"
     error="#usersError"
     empty="#noUsers"
     refresh="30000"
     cached>

  <div each="user in users" template="userCard"></div>

</div>

<template id="usersSkeleton">
  <div class="skeleton-pulse">Loading users...</div>
</template>

<template id="usersError" var="err">
  <div class="error">Failed to load: <span bind="err.message"></span></div>
</template>

<template id="noUsers">
  <p>No users found.</p>
</template>
```

### Reactive URLs

URLs that reference state variables re-fetch automatically when those values change:

```html
<div state="{ page: 1, search: '' }">
  <input type="text" bind-value="search" on:input="search = $event.target.value" />

  <div get="/users?page={page}&q={search}"
       as="results"
       debounce="300">
    ...
  </div>
</div>
```

### URL Interpolation and Encoding

> ⚠️ **Breaking change (v1.10):** Values inside `{…}` placeholders are encoded with `encodeURIComponent`. This means `/` is encoded as `%2F`, which is correct for **query-string values** but will break **path segments** that intentionally contain slashes.
>
> ```html
> <!-- ✅ Safe — query value, encoding is correct -->
> <div get="/search?q={query}">...</div>
>
> <!-- ✅ Safe — single-level path segment, no slashes -->
> <div get="/users/{user.id}/profile">...</div>
>
> <!-- ❌ Broken — path contains "/", will become "%2F" -->
> <div get="/files/{path}">...</div>  <!-- path = "reports/2026" -->
>
> <!-- ✅ Workaround — concatenate outside {} -->
> <div get="'/files/' + path">...</div>
> ```

---

## `post`, `put`, `patch`, `delete` — Mutating Requests

Used on forms or triggered via `call`.

> **Tip:** The `call` directive now supports the same attributes as form-based HTTP directives — including `loading`, `headers`, `redirect`, and `body`. See [Actions & Refs → `call`](actions-refs.md) for full details.

### Form Submission

```html
<form post="/login"
      success="#loginSuccess"
      error="#loginError"
      loading="#loginLoading">
  <input type="text" name="email" />
  <input type="password" name="password" />
  <button type="submit">Login</button>
</form>

<template id="loginSuccess" var="result">
  <p>Welcome, <span bind="result.user.name"></span>!</p>
</template>

<template id="loginError" var="err">
  <p class="error" bind="err.message"></p>
</template>
```

### PUT / PATCH / DELETE

```html
<form put="/users/{user.id}"
      body='{"name": "{user.name}", "role": "{selectedRole}"}'
      success="#updateSuccess">
  ...
</form>

<button delete="/users/{user.id}"
        confirm="Are you sure?"
        success="#deleteSuccess"
        error="#deleteError">
  Delete User
</button>
```

### Mutation Attributes

| Attribute | Description |
|-----------|-------------|
| `post`, `put`, `patch`, `delete` | URL for the request |
| `body` | Request body (JSON string with interpolation). For forms, auto-serializes fields |
| `success` | Template ID to render on success. Receives response as `var` |
| `error` | Template ID to render on error. Receives error as `var` |
| `loading` | Template ID to show during request |
| `confirm` | Show browser `confirm()` dialog before sending |
| `redirect` | URL to navigate to on success (SPA route) |
| `then` | Expression to execute on success (e.g. `"users.push(result)"`) |
| `into` | Write response to a named global store |
| `cached` | Cache responses (memory/local/session) |

### Request Lifecycle

```
[idle] → [loading] → [success | error]
                         ↓         ↓
                    render tpl   render tpl
                    exec `then`  log to console
                    `redirect`
```

---

## Interceptors

Interceptors hook into the fetch pipeline to modify requests, inspect responses, or short-circuit the entire flow. They support async functions and have a 5-second timeout per interceptor.

### Basic Usage

```html
<script>
  // Add a header to every request
  NoJS.interceptor('request', (url, options) => {
    options.headers['X-Request-ID'] = crypto.randomUUID();
    return options;
  });

  // Handle 401 responses globally
  NoJS.interceptor('response', (response, url) => {
    if (response.status === 401) {
      NoJS.store.auth.user = null;
      NoJS.notify();
      NoJS.router.push('/login');
      throw new Error('Unauthorized');
    }
    return response;
  });
</script>
```

### Async Interceptors

Interceptor functions can be async. Each interceptor is given a 5-second timeout — if it does not resolve within that window, it is skipped with a warning and the chain continues.

```html
<script>
  NoJS.interceptor('request', async (url, options) => {
    const token = await refreshTokenIfExpired();
    options.headers['Authorization'] = 'Bearer ' + token;
    return options;
  });
</script>
```

### Cancelling Requests with `NoJS.CANCEL`

Return an object keyed by `NoJS.CANCEL` from a request interceptor to abort the fetch. The request throws an `AbortError`, which triggers the element's `error` template if one is set.

```html
<script>
  NoJS.interceptor('request', (url, opts) => {
    if (!navigator.onLine) {
      return { [NoJS.CANCEL]: true };
    }
    return opts;
  });
</script>
```

### Serving Cached Responses with `NoJS.RESPOND`

Return an object keyed by `NoJS.RESPOND` from a request interceptor to skip the HTTP call entirely and return the value directly as the response data.

```html
<script>
  const cache = new Map();

  NoJS.interceptor('request', (url, opts) => {
    if (opts.method === 'GET' && cache.has(url)) {
      return { [NoJS.RESPOND]: cache.get(url) };
    }
    return opts;
  });
</script>
```

### Replacing Response Data with `NoJS.REPLACE`

Return an object keyed by `NoJS.REPLACE` from a response interceptor to replace the parsed response body with custom data.

```html
<script>
  NoJS.interceptor('response', (response, url) => {
    if (url.includes('/users')) {
      return { [NoJS.REPLACE]: { users: [], normalized: true } };
    }
    return response;
  });
</script>
```

### Header Redaction

By default, interceptors receive redacted copies of requests and responses. Sensitive headers (`Authorization`, `Cookie`, `X-API-Key`, `X-CSRF-Token`, etc.) are stripped from the options object before it reaches untrusted interceptors, and sensitive response headers (`Set-Cookie`, `WWW-Authenticate`, etc.) are removed from the response proxy. URL query parameters matching patterns like `token`, `key`, `secret`, `auth`, `password`, or `credential` are replaced with `[REDACTED]`.

Plugins installed with `{ trusted: true }` via `NoJS.use()` receive the full, unredacted request and response objects. See [Plugins → Trusted Interceptors](plugins.md#trusted-interceptors) for details.

### Sentinel Summary

| Sentinel | Interceptor Type | Effect |
| -------- | ---------------- | ------ |
| `NoJS.CANCEL` | Request | Aborts the request (`AbortError`) |
| `NoJS.RESPOND` | Request | Returns data directly, no HTTP call |
| `NoJS.REPLACE` | Response | Replaces the parsed response body |

---

**Next:** [Data Binding →](data-binding.md)
