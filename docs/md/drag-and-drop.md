# Drag and Drop

## `drag` — Make an Element Draggable

```html
<!-- Basic draggable -->
<div drag="item">Drag me</div>

<!-- With type (for filtering drop zones) -->
<div drag="task" drag-type="task">Task card</div>

<!-- With handle (only the grip icon starts a drag) -->
<div drag="item" drag-handle=".grip">
  <span class="grip">&#x2801;&#x2801;</span>
  <span bind="item.name"></span>
</div>

<!-- Disabled state (reactive) -->
<div drag="item" drag-disabled="isLocked">Locked item</div>
```

### Drag Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag` | expression | *required* | The value being dragged |
| `drag-type` | string | `"default"` | Named type — only matching `drop-accept` zones respond |
| `drag-effect` | `"copy"` \| `"move"` \| `"link"` | `"move"` | Maps to `dataTransfer.effectAllowed` |
| `drag-handle` | CSS selector | — | Restricts the grab area to a child element |
| `drag-image` | CSS selector \| `"none"` | — | Custom drag ghost element |
| `drag-image-offset` | `"x,y"` | `"0,0"` | Pixel offset for custom drag image |
| `drag-disabled` | expression | `false` | When truthy, disables dragging |
| `drag-class` | string | `"nojs-dragging"` | Class added while dragging |
| `drag-ghost-class` | string | — | Class added to the drag image element |
| `drag-group` | string | — | Group name for multi-select |

---

## `drop` — Define a Drop Zone

```html
<!-- Basic drop zone -->
<div drop="items = [...items, $drag]"
     drop-accept="task">
  Drop tasks here
</div>

<!-- With sortable index -->
<div drop="items.splice($dropIndex, 0, $drag)"
     drop-accept="task"
     drop-sort="vertical"
     drop-placeholder="auto">
</div>

<!-- Max capacity -->
<div drop="slots = [...slots, $drag]"
     drop-accept="*"
     drop-max="3">
  Max 3 items
</div>
```

### Drop Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drop` | statement | *required* | Expression executed on drop |
| `drop-accept` | string (comma-separated) | `"default"` | Accepted `drag-type`(s). Use `"*"` for any |
| `drop-effect` | `"copy"` \| `"move"` \| `"link"` | `"move"` | Maps to `dataTransfer.dropEffect` |
| `drop-class` | string | `"nojs-drag-over"` | Class added when valid item hovers |
| `drop-reject-class` | string | `"nojs-drop-reject"` | Class added when item is rejected (wrong type or max exceeded) |
| `drop-disabled` | expression | `false` | When truthy, disables dropping |
| `drop-max` | expression (number) | `Infinity` | Max items the zone accepts |
| `drop-sort` | `"vertical"` \| `"horizontal"` \| `"grid"` | — | Enables sortable reorder by position |
| `drop-placeholder` | template ID \| `"auto"` | — | Shows a placeholder at insertion point |
| `drop-placeholder-class` | string | `"nojs-drop-placeholder"` | Class for the placeholder |
| `drop-settle-class` | string | `"nojs-drop-settle"` | Custom CSS class for the settle animation |
| `drop-empty-class` | string | `"nojs-drag-list-empty"` | Custom CSS class for empty state on drop zone |

---

## `drag-list` — Sortable List

High-level shorthand for sortable lists bound to arrays. Combines `each` + `drag` + `drop` in one element.

```html
<!-- Basic sortable list -->
<div drag-list="tasks"
     template="task-tpl"
     drag-list-key="id"
     drop-sort="vertical">
</div>

<!-- Two-list transfer (Kanban) -->
<div state="{ todo: [...], done: [] }">
  <div drag-list="todo"
       template="task-tpl"
       drag-list-key="id"
       drag-type="task"
       drop-accept="task"
       drop-sort="vertical"
       drag-list-remove
       on:reorder="console.log('reordered')">
  </div>

  <div drag-list="done"
       template="task-tpl"
       drag-list-key="id"
       drag-type="task"
       drop-accept="task"
       drop-sort="vertical"
       drag-list-remove
       on:receive="console.log('received', $event.detail.item)">
  </div>
</div>

<template id="task-tpl">
  <div class="card">
    <span bind="item.title"></span>
  </div>
</template>
```

### Drag-List Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag-list` | path | *required* | Path to array in state |
| `template` | template ID | — | Template for each item (same as `each`) |
| `drag-list-key` | property name | — | Unique key per item for stable identity |
| `drag-list-item` | variable name | `"item"` | Loop variable name in template |
| `drop-sort` | `"vertical"` \| `"horizontal"` \| `"grid"` | `"vertical"` | Layout direction |
| `drop-accept` | string | *self* | Types accepted (defaults to same list only) |
| `drag-list-copy` | boolean attr | — | Copy items instead of moving |
| `drag-list-remove` | boolean attr | — | Remove items when dragged out |
| `drag-disabled` | expression | `false` | Disables dragging from this list |
| `drop-disabled` | expression | `false` | Disables dropping into this list |
| `drop-max` | expression (number) | `Infinity` | Max items allowed |
| `drop-settle-class` | string | `"nojs-drop-settle"` | Custom CSS class for the settle animation |
| `drop-empty-class` | string | `"nojs-drag-list-empty"` | Custom CSS class for empty state on drag-list |
| `drop-placeholder` | template ID \| `"auto"` | — | Shows a placeholder where the item will be dropped |

### Drag-List Events

| Event | `$event.detail` | Description |
|-------|-----------------|-------------|
| `on:reorder` | `{ list, item, from, to }` | Item reordered within same list |
| `on:receive` | `{ list, item, from, fromList }` | Item received from another list |
| `on:remove` | `{ list, item, index }` | Item removed (dragged out) |

---

## `drag-multiple` — Multi-Select

Enables click-to-select before dragging multiple items as a group.

```html
<div each="card in cards" template="cardTpl" style="display:contents"></div>

<template id="cardTpl">
  <div drag="card"
       drag-type="card"
       drag-group="kanban"
       drag-multiple>
    <span bind="card.title"></span>
  </div>
</template>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `drag-multiple` | boolean attr | — | Enables click-to-select |
| `drag-multiple-class` | string | `"nojs-selected"` | Class added to selected items |
| `drag-group` | string | *required* | Group name — all selected items move together |

- **Click** selects a single item (replaces previous selection)
- **Ctrl/Cmd+Click** adds to selection
- **Escape** clears the selection
- When dragging a selected item, `$drag` becomes an **array** of all selected items

---

## Implicit Variables

Available inside `drop` expressions:

| Variable | Type | Description |
|----------|------|-------------|
| `$drag` | any | The dragged value. Array if multi-select |
| `$dragType` | string | The `drag-type` of the item |
| `$dragEffect` | string | The `drag-effect` |
| `$dropIndex` | number | Insertion index within the drop zone |
| `$source` | object \| null | `{ list, index, el }` — source info |
| `$target` | object \| null | `{ list, index, el }` — target info |

---

## CSS Classes

No.JS automatically injects these classes:

| Class | When applied |
|-------|-------------|
| `.nojs-dragging` | On the source element while dragging |
| `.nojs-drag-over` | On the drop zone while a valid item hovers |
| `.nojs-drop-reject` | On the drop zone when the item is rejected (wrong type or max exceeded) |
| `.nojs-drop-placeholder` | On the insertion placeholder |
| `.nojs-selected` | On multi-selected items |
| `.nojs-drop-settle` | Brief settle animation on drop |
| `.nojs-drag-list-empty` | On a `drag-list` when it has no items |

---

## Accessibility

No.JS automatically adds:

- `draggable="true"` on drag sources
- `aria-grabbed="true/false"` reflecting drag state
- `aria-dropeffect` on drop zones
- `role="listbox"` on `drag-list` containers
- `role="option"` on `drag-list` items
- `tabindex="0"` for keyboard access
- **Space** to grab, **Escape** to cancel, **Arrow keys** to navigate, **Enter** to drop

---

**Next:** [Animations & Transitions →](animations.md)
