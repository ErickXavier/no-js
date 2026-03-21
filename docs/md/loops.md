# Loops

## `each` — Iterate Over Arrays

```html
<div get="/posts" as="posts">
  <div each="post in posts" key="post.id" template="postCard"></div>
</div>

<template id="postCard">
  <article>
    <h2 bind="post.title"></h2>
    <p bind="post.body"></p>
    <span bind="'#' + $index"></span>
  </article>
</template>
```

### Attributes

| Attribute | Description |
|---|---|
| `each` | `"item in array"` — variable name and source expression |
| `template` | ID of the `<template>` element to clone for each item |
| `key` | Expression for a unique, stable item identity. Enables DOM reconciliation. |
| `else` | Template ID to render when the array is empty |
| `animate` / `animate-enter` | CSS class added to each new item on insert |
| `animate-leave` | CSS class added to items before removal |
| `animate-stagger` | Delay (ms) between each item's enter animation |
| `animate-duration` | Max duration (ms) before leave animation is force-completed |

---

## `foreach` — Extended Loop

Offers more control with filtering, sorting, pagination, and custom variable names.

```html
<ul>
  <li foreach="item"
      from="menuItems"
      index="idx"
      key="item.id"
      else="#noItems"
      filter="item.active"
      sort="item.order"
      limit="10"
      offset="0">
    <a bind-href="item.link">
      <span bind="idx + 1"></span> - <span bind="item.label"></span>
    </a>
  </li>
</ul>

<template id="noItems">
  <li class="empty">No items available</li>
</template>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `foreach` | Variable name for current item |
| `from` | Source array from context |
| `index` | Variable name for the index (default: `$index`) |
| `key` | Unique key expression for DOM diffing |
| `else` | Template ID to render when array is empty |
| `filter` | Expression to filter items (like `Array.filter`) |
| `sort` | Property path to sort by (prefix with `-` for descending) |
| `limit` | Maximum number of items to render |
| `offset` | Number of items to skip |

---

## Key-Based Reconciliation

By default, when the source array changes, the loop directive performs a **full rebuild** — all child nodes are disposed and recreated from scratch. This is simple and correct, but destroys and re-mounts DOM nodes on every update.

When you supply a `key` attribute, the directive switches to **key-based reconciliation**: existing DOM nodes for items whose key is still in the list are reused and their context is updated in place. Only items that genuinely appeared or disappeared trigger DOM mutations.

```html
<!-- Without key: full rebuild on every change -->
<div each="item in items" template="itemTpl"></div>

<!-- With key: only changed items are added/removed -->
<div each="item in items" key="item.id" template="itemTpl"></div>
```

The `key` value must be **unique and stable** across renders — typically a database ID or UUID. Using a non-unique key (e.g. `$index`) defeats reconciliation since items will always appear to match.

### When to use `key`

| Use case | Recommendation |
|---|---|
| Static lists, rendered once | No key needed |
| Lists with < ~10 items, infrequent updates | No key needed (full rebuild is negligible) |
| Large lists (50+ items) with frequent updates | Use `key` |
| `push` / `splice` / `sort` on reactive arrays | Use `key` to preserve focus, scroll, and input state |
| Items with embedded inputs, video, canvas | Use `key` — full rebuild resets state |

### Positional metadata after reorder

After a reorder (e.g. sort), the reconciler calls `$notify()` on the context of each retained wrapper. This propagates the updated `$index`, `$first`, `$last`, `$even`, `$odd`, and `$count` values to all child watchers, including nested bindings and class expressions that depend on position.

```html
<template id="itemTpl">
  <!-- $index, $odd, $first re-render correctly after sort or reorder -->
  <div class-striped="$odd" class-first="$first">
    <span bind="($index + 1) + '. ' + item.name"></span>
  </div>
</template>
```

---

## Loop Context Variables

Inside any loop, these variables are automatically available:

| Variable | Description |
|----------|-------------|
| `$index` | Current index (0-based) |
| `$count` | Total number of items |
| `$first` | `true` if first item |
| `$last` | `true` if last item |
| `$even` | `true` if index is even |
| `$odd` | `true` if index is odd |

```html
<div each="item in items" template="itemTpl"></div>

<template id="itemTpl">
  <div class-first="$first"
       class-last="$last"
       class-striped="$odd">
    <span bind="($index + 1) + ' of ' + $count"></span>
    <span bind="item.name"></span>
  </div>
</template>
```

---

## Nested Loops

Child loops can access parent scope variables:

```html
<div each="category in categories" template="catTpl"></div>

<template id="catTpl">
  <h3 bind="category.name"></h3>
  <div each="product in category.products" template="prodTpl"></div>
</template>

<template id="prodTpl">
  <!-- Access both product AND category from parent scope -->
  <p><span bind="category.name"></span>: <span bind="product.name"></span></p>
</template>
```

---

**Next:** [Templates →](templates.md)
