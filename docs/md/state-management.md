# State Management

## `state` — Local State

Creates a reactive context scoped to the element and its children.

```html
<div state="{ count: 0, name: 'World' }">
  <h1>Hello, <span bind="name"></span>!</h1>
  <p>Count: <span bind="count"></span></p>
  <button on:click="count++">+1</button>
  <button on:click="count = 0">Reset</button>
</div>
```

---

## `store` — Global Store

A global reactive store accessible from anywhere. Ideal for auth state, theme, shared data.

```html
<!-- Define store (once, typically at the top of the page) -->
<div store="app" value="{
  user: null,
  theme: 'dark',
  lang: 'en',
  notifications: []
}"></div>

<!-- Access store from anywhere -->
<nav>
  <span bind="$store.app.user.name"></span>
  <button on:click="$store.app.theme = $store.app.theme === 'dark' ? 'light' : 'dark'">
    Toggle Theme
  </button>
</nav>

<!-- In a deeply nested component -->
<footer>
  <span bind="$store.app.notifications.length + ' notifications'"></span>
</footer>
```

---

## `into` — Write Fetch Results to a Store

The `into` attribute on any HTTP directive writes the response directly into a named global store.

```html
<!-- Define an empty store -->
<div store="currentUser" value="{}"></div>

<!-- Fetch and write into the store -->
<div get="/me" as="user" into="currentUser">
  <p>Fetched: <span bind="user.name"></span></p>
</div>

<!-- Read from the store anywhere else on the page -->
<nav>
  <span bind="$store.currentUser.name"></span>
  <span bind="$store.currentUser.email"></span>
</nav>
```

The store doesn't need to be pre-defined — `into` will create it if it doesn't exist:

```html
<!-- No store directive needed — into creates it automatically -->
<button call="/api/auth/refresh"
        method="post"
        into="session">
  Refresh Session
</button>

<!-- These update reactively when the call completes -->
<span bind="$store.session.token"></span>
<span bind="$store.session.expiresAt"></span>
```

---

## `computed` — Derived State

Values that are automatically recalculated when dependencies change:

```html
<div state="{ price: 100, quantity: 2, taxRate: 0.1 }">

  <div computed="subtotal" expr="price * quantity"></div>
  <div computed="tax" expr="subtotal * taxRate"></div>
  <div computed="total" expr="subtotal + tax"></div>

  <p>Subtotal: $<span bind="subtotal"></span></p>
  <p>Tax: $<span bind="tax"></span></p>
  <p>Total: $<span bind="total"></span></p>

  <input type="number" model="quantity" />

</div>
```

---

## `watch` — Side Effects on State Change

Execute an action whenever a value changes:

```html
<div state="{ search: '' }"
     watch="search"
     on:change="console.log('Search changed:', search)">

  <input model="search" />

</div>
```

---

## State Persistence

Persist state across page reloads:

```html
<!-- Persists to localStorage -->
<div state="{ theme: 'dark', sidebar: true }"
     persist="localStorage"
     persist-key="app-settings">
  ...
</div>

<!-- Persists to sessionStorage -->
<div state="{ cartItems: [] }"
     persist="sessionStorage"
     persist-key="cart">
  ...
</div>
```

---

**Next:** [Events →](events.md)
