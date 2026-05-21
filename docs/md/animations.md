# Animations & Transitions

## `animate` — Enter/Leave Animations

```html
<!-- CSS animation name on enter -->
<div if="visible" animate="fadeIn">Content</div>

<!-- Enter and leave animations -->
<div if="visible"
     animate-enter="slideInRight"
     animate-leave="slideOutLeft"
     animate-duration="300">
  Content
</div>
```

### Animation attributes

| Attribute | Description |
|-----------|-------------|
| `animate` / `animate-enter` | CSS animation class added when the element enters |
| `animate-leave` | CSS animation class added when the element leaves |
| `animate-duration` | Duration in milliseconds forwarded to `animationDuration` and used as the fallback timeout. When omitted the fallback fires on the next event-loop tick (0 ms) — see note below |
| `animate-stagger` | Delay in milliseconds between each item in a loop (`each` / `foreach`) |

> **Fallback timeout.** No.JS listens for `animationend` / `transitionend` to clean up
> classes and trigger re-renders after leave animations. If the event never fires (e.g.
> CSS is absent, element is detached) a `setTimeout` safety net ensures the pipeline
> is never permanently stalled. When `animate-duration` is omitted the timeout is 0 ms —
> it fires on the next event-loop tick with no artificial wait. Passing an explicit
> `animate-duration="300"` sets both `animation-duration` on the target element *and*
> the safety-net timeout to 300 ms.

---

## `transition` — CSS Transition Classes

Follows a convention similar to Vue's transition system:

```html
<div if="show" transition="fade">Content</div>
```

No.JS adds/removes classes during the transition:

| Class | When |
|-------|------|
| `fade-enter` | Start state of enter |
| `fade-enter-active` | Active state of enter |
| `fade-enter-to` | End state of enter |
| `fade-leave` | Start state of leave |
| `fade-leave-active` | Active state of leave |
| `fade-leave-to` | End state of leave |

```css
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
```

---

## Loop Animations

```html
<div each="item in items"
     template="itemTpl"
     animate-enter="fadeInUp"
     animate-leave="fadeOutDown"
     animate-stagger="50">  <!-- 50ms delay between each item -->
</div>
```

---

## View Transitions (Route Navigation)

No.JS uses the [View Transition API](https://developer.chrome.com/docs/web-platform/view-transitions/) for smooth route transitions. This is the recommended approach for route animations — it is enabled by default.

Add a `transition` attribute to your `route-view` outlet:

```html
<main route-view transition="slide"></main>
```

### Built-in Presets

| Preset | Effect |
|--------|--------|
| `slide` | Slides content left/right (auto-detects forward/backward navigation) |
| `fade` | Cross-fade between old and new content |
| `scale` | Scale down old content, scale up new content |
| `none` | Disables the transition for this outlet |

### Custom CSS

Target the transition pseudo-elements for custom styling:

```css
::view-transition-old(route-content) {
  animation: slide-out 0.3s ease-in;
}
::view-transition-new(route-content) {
  animation: slide-in 0.3s ease-out;
}
```

### Configuration

View Transitions are enabled by default. Disable them globally:

```javascript
NoJS.config({ router: { viewTransition: false } });
```

When disabled, the `transition` attribute on `route-view` falls back to legacy class-based transitions.

### Accessibility

View Transitions automatically respect `prefers-reduced-motion: reduce` — animations are skipped when the user has requested reduced motion.

---

## Built-in Animation Names

No.JS ships with these CSS animations:

`fadeIn`, `fadeOut`, `slideInLeft`, `slideInRight`, `slideInUp`, `slideInDown`, `slideOutLeft`, `slideOutRight`, `slideOutUp`, `slideOutDown`, `zoomIn`, `zoomOut`, `bounceIn`, `flipIn`

---

## Accessibility

No.JS includes a `prefers-reduced-motion: reduce` media query that disables all built-in CSS keyframe animations when the user has reduced motion enabled.

---

## See Also

- [Routing](routing.md) — route-level transitions and navigation
- [Dynamic Styling](styling.md) — reactive CSS classes for animation triggers
- [Loops](loops.md) — `animate-stagger` for list enter/leave animations

**Previous:** [Dynamic Styling ←](styling.md) | **Next:** [Internationalization →](i18n.md)
