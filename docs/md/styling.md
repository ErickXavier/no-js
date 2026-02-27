# Dynamic Styling

## `class-*` — Toggle Classes

```html
<!-- Toggle a single class based on expression -->
<div class-active="isActive"
     class-disabled="!isEnabled"
     class-highlighted="score > 90">
</div>

<!-- Multiple classes from object -->
<div class-map="{ active: isActive, 'text-bold': isBold, error: hasError }"></div>

<!-- From array -->
<div class-list="['base-class', isAdmin ? 'admin' : 'user']"></div>
```

---

## `style-*` — Inline Styles

```html
<div style-color="isError ? 'red' : 'green'"
     style-font-size="fontSize + 'px'"
     style-opacity="isVisible ? 1 : 0.5"
     style-background="'linear-gradient(135deg, ' + color1 + ', ' + color2 + ')'">
</div>

<!-- From object -->
<div style-map="{
  color: textColor,
  fontSize: size + 'px',
  transform: 'rotate(' + rotation + 'deg)'
}"></div>
```

---

**Next:** [Forms & Validation →](forms-validation.md)
