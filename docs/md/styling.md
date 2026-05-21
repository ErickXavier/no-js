# Dynamic Styling

Apply CSS classes and inline styles reactively based on your state. When state changes, styles update automatically.

---

## `class-*` — Toggle Individual Classes

Toggle a single CSS class based on an expression. The class is added when the expression is truthy and removed when falsy.

```html
<div state="{ isActive: true, score: 95, isAdmin: false }">
  <div class-active="isActive"
       class-disabled="!isActive"
       class-highlighted="score > 90">
    This element's classes react to state
  </div>
</div>
```

`class-*` directives work alongside static `class` attributes — they add or remove the specified class without affecting other classes on the element:

```html
<!-- Static "card" class is always present; "selected" toggles reactively -->
<div class="card" class-selected="isSelected">...</div>
```

---

## `class-map` — Classes from Object

Apply multiple classes at once using an object expression where keys are class names and values are boolean conditions:

```html
<div class-map="{ active: isActive, 'text-bold': isBold, error: hasError }"></div>
```

---

## `class-list` — Classes from Array

Apply classes from an array expression. Useful when class names are computed dynamically:

```html
<div class-list="['base-class', isAdmin ? 'admin' : 'user', theme + '-theme']"></div>
```

---

## `style-*` — Inline Styles

Set individual inline style properties reactively. Use the CSS property name in kebab-case after `style-`:

```html
<div style-color="isError ? 'red' : 'green'"
     style-font-size="fontSize + 'px'"
     style-opacity="isVisible ? 1 : 0.5"
     style-background="'linear-gradient(135deg, ' + color1 + ', ' + color2 + ')'">
</div>
```

CSS custom properties (variables) work too:

```html
<div style---primary-color="themeColor"
     style---spacing="gap + 'px'">
</div>
```

---

## `style-map` — Styles from Object

Apply multiple inline styles at once using an object expression:

```html
<div style-map="{
  color: textColor,
  fontSize: size + 'px',
  transform: 'rotate(' + rotation + 'deg)'
}"></div>
```

---

## Common Mistakes

```html
<!-- WRONG: camelCase in style-* (use kebab-case) -->
<div style-fontSize="size + 'px'"></div>

<!-- RIGHT: kebab-case matches CSS property names -->
<div style-font-size="size + 'px'"></div>
```

---

## See Also

- [Data Binding](data-binding.md) — `bind-*` for non-style attributes
- [Animations](animations.md) — CSS animations and transitions
- [Conditionals](conditionals.md) — `show`/`hide` for visibility toggling

---

**Previous:** [Actions & Refs ←](actions-refs.md) | **Next:** [Animations →](animations.md)
