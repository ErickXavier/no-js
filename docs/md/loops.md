# Loops

## `each` — Iterate Over Arrays

```html
<div get="/posts" as="posts">
  <div each="post in posts" template="postCard"></div>
</div>

<template id="postCard">
  <article>
    <h2 bind="post.title"></h2>
    <p bind="post.body"></p>
    <span bind="'#' + $index"></span>
  </article>
</template>
```

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
