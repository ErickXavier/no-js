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

## Built-in Animation Names

No.JS ships with these CSS animations:

`fadeIn`, `fadeOut`, `slideInLeft`, `slideInRight`, `slideInUp`, `slideInDown`, `slideOutLeft`, `slideOutRight`, `slideOutUp`, `slideOutDown`, `zoomIn`, `zoomOut`, `bounceIn`, `flipIn`

---

**Next:** [Internationalization →](i18n.md)
