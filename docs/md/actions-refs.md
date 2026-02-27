# Actions & Refs

## `call` — Trigger API Requests from Any Element

```html
<!-- Logout button -->
<a call="/api/logout"
   method="post"
   success="#loggedOut"
   error="#logoutError"
   confirm="Are you sure you want to logout?">
  Logout
</a>

<!-- Like button -->
<button call="/api/posts/{post.id}/like"
        method="post"
        then="post.likes++">
  ❤️ <span bind="post.likes"></span>
</button>

<!-- Delete with confirmation -->
<button call="/api/items/{item.id}"
        method="delete"
        confirm="Delete this item?"
        then="items.splice($index, 1)">
  🗑 Delete
</button>

<!-- Write result to a global store -->
<button call="/api/me"
        method="get"
        into="currentUser">
  Load Profile
</button>
```

---

## `trigger` — Emit Custom Events

```html
<!-- Child emits an event -->
<button on:click trigger="item-selected" trigger-data="item">
  Select
</button>

<!-- Parent listens -->
<div on:item-selected="handleSelection($event.detail)">
  <div each="item in items" template="itemTpl"></div>
</div>
```

---

## `ref` — Named References

Access DOM elements without `querySelector`:

```html
<div state="{ }">
  <input ref="searchInput" type="text" />
  <canvas ref="chart"></canvas>
  <button on:click="$refs.searchInput.focus()">Focus Search</button>
</div>
```

---

## `$refs` — Ref Map

All elements with `ref` are accessible via `$refs` in the current scope:

```html
<video ref="player" src="video.mp4"></video>
<button on:click="$refs.player.play()">▶ Play</button>
<button on:click="$refs.player.pause()">⏸ Pause</button>
```

---

**Next:** [Custom Directives →](custom-directives.md)
