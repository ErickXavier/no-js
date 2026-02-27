# Error Handling

## Per-Element Error Handling

```html
<div get="/api/users"
     as="users"
     error="#usersError"
     retry="3"
     retry-delay="2000">
  ...
</div>

<template id="usersError" var="err">
  <div class="error-box">
    <p bind="err.message"></p>
    <p>Status: <span bind="err.status"></span></p>
    <button on:click="$el.parentElement.dispatchEvent(new Event('retry'))">
      Try Again
    </button>
  </div>
</template>
```

---

## Global Error Handler

```html
<script>
  NoJS.on('error', (error, context) => {
    console.error('[No.JS Error]', error);
    // Send to error tracking service
  });

  NoJS.on('fetch:error', (url, error) => {
    if (error.status === 401) {
      NoJS.store.auth.user = null;
      NoJS.router.push('/login');
    }
  });
</script>
```

---

## `error-boundary` — Catch Errors in Subtree

```html
<div error-boundary="#errorFallback">
  <!-- If anything in here throws, errorFallback renders instead -->
  <div get="/api/fragile-endpoint" as="data">
    <span bind="data.deep.nested.value"></span>
  </div>
</div>

<template id="errorFallback" var="err">
  <div class="error-boundary">
    <h3>Something went wrong</h3>
    <pre bind="err.message"></pre>
  </div>
</template>
```

---

**Next:** [Configuration →](configuration.md)
