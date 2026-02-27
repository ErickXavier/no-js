# Data Binding

## `bind` — Text Content

Replaces the element's `textContent` with the evaluated expression.

```html
<span bind="user.name"></span>
<span bind="user.age + ' years old'"></span>
<span bind="items.length === 0 ? 'Empty' : items.length + ' items'"></span>
```

---

## `bind-html` — Inner HTML

Renders evaluated expression as HTML. Sanitized by default.

```html
<div bind-html="article.content"></div>
<div bind-html="`<em>${user.bio}</em>`"></div>
```

> ⚠️ Uses DOMPurify-compatible sanitization to prevent XSS.

---

## `bind-*` — Attribute Binding

Bind any HTML attribute dynamically.

```html
<!-- src, href, alt, title, etc. -->
<img bind-src="user.avatarUrl"
     bind-alt="user.name + ' avatar'" />

<a bind-href="'/users/' + user.id"
   bind-title="'View ' + user.name">
  Profile
</a>

<!-- disabled, readonly, checked -->
<button bind-disabled="!form.isValid">Submit</button>
<input type="checkbox" bind-checked="user.isActive" />

<!-- data attributes -->
<div bind-data-id="user.id"
     bind-data-role="user.role"></div>
```

---

## `model` — Two-Way Binding

For form inputs, `model` creates automatic two-way data binding:

```html
<div state="{ name: '', age: 0, agreed: false }">

  <input type="text" model="name" />
  <input type="number" model="age" />
  <input type="checkbox" model="agreed" />
  <select model="role">
    <option value="admin">Admin</option>
    <option value="user">User</option>
  </select>
  <textarea model="bio"></textarea>

  <p>Hello, <span bind="name"></span>. You are <span bind="age"></span>.</p>

</div>
```

---

**Next:** [Conditionals →](conditionals.md)
