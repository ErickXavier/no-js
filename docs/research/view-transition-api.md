# View Transition API — Technical Research Report

**Date:** 2026-05-20
**Author:** Master Researcher Agent
**Issue:** NOJS-7 — T0: Research — View Transition API Deep Dive
**Status:** Complete

---

## Executive Summary

The View Transition API is a W3C web standard that provides a native mechanism for creating animated transitions between different DOM states. It reached Baseline 2025 status in October 2025, meaning it is now supported across all major browsers: Chrome 111+, Edge 111+, Firefox 144+, and Safari 18+. Global browser support currently stands at approximately 89.88% [1].

The API works by capturing bitmap snapshots of the old DOM state, allowing the developer to update the DOM, then capturing the new state and animating between them using CSS animations on a tree of pseudo-elements. This approach is fundamentally different from class-based transition systems (like the one NoJS currently uses) because the browser handles the snapshot capture, overlay positioning, and default cross-fade animation automatically. The developer only needs to wrap their DOM mutation in a `document.startViewTransition()` call and optionally customize the animation via CSS pseudo-element selectors.

For NoJS, this represents a significant upgrade opportunity. The current router transition system requires users to define their own CSS classes (`slide-enter`, `slide-leave-active`, etc.), has no exit animation (DOM is cleared immediately via `innerHTML = ""`), and provides no built-in presets. By adopting the View Transition API, NoJS can offer zero-configuration animated transitions with a single attribute, built-in directional presets via the `types` parameter, element-level morphing via `view-transition-name`, and automatic accessibility support through `prefers-reduced-motion` — all while maintaining the same `transition="name"` attribute surface the framework already uses.

---

## 1. Specification Overview

### 1.1 Level 1 (Same-Document / SPA)

**Specification:** CSS View Transitions Module Level 1 [2]
**Status:** W3C Editor's Draft (16 February 2025)
**Editors:** Tab Atkins-Bittner (Google), Jake Archibald (Google), Khushal Sagar (Google)

Level 1 defines the core View Transition API for **same-document transitions** — transitions that occur within a single page when the DOM is updated programmatically. This is the SPA use case and the primary target for NoJS integration.

Key components defined in Level 1:

- **`document.startViewTransition()`** — The entry point that initiates a view transition
- **`ViewTransition` interface** — The object returned by `startViewTransition()`, providing promises for lifecycle management and the ability to skip transitions
- **Pseudo-element tree** — A tree of CSS pseudo-elements (`::view-transition`, `::view-transition-group()`, `::view-transition-image-pair()`, `::view-transition-old()`, `::view-transition-new()`) that represent the snapshot overlay
- **`view-transition-name` CSS property** — Assigns elements to named snapshot groups for independent animation
- **User Agent stylesheet** — Default cross-fade animation with 0.25s duration

The specification explicitly separates the visual transition from the DOM update. The old state is captured as a static bitmap, the DOM is mutated, the new state is captured as a live representation, and then the browser animates between them using CSS animations on the pseudo-element tree [2].

### 1.2 Level 2 (Cross-Document / MPA)

**Specification:** CSS View Transitions Module Level 2 [3]
**Status:** W3C Editor's Draft (29 April 2026)
**Editors:** Noam Rosenthal (Google), Khushal Sagar (Google), Vladimir Levin (Google), Tab Atkins-Bittner (Google)

Level 2 extends the API with:

- **Cross-document (MPA) transitions** — Animated transitions between separate page navigations, enabled via the `@view-transition` CSS at-rule with `navigation: auto`
- **`pageswap` and `pagereveal` events** — Window events that fire during cross-document navigations, providing access to the `ViewTransition` object for the outgoing and incoming pages respectively
- **View transition types** — The `types` parameter on `startViewTransition()` and the `:active-view-transition-type()` CSS pseudo-class for conditional styling
- **`view-transition-class` CSS property** — Groups elements for shared transition styles without requiring unique names per element
- **`view-transition-group` CSS property** — Enables nested view transition groups
- **`match-element` value for `view-transition-name`** — Automatically assigns unique names to elements
- **`Element.startViewTransition()`** — Scoped view transitions on specific elements (not just the document root)

**Why Level 1 is the right target for NoJS:** NoJS is a same-document SPA framework. Its router swaps DOM content within a `<route-view>` element without performing full page navigations. Level 1 covers exactly this use case. Level 2's cross-document features are irrelevant since NoJS never performs actual page navigations. However, Level 2's `types` parameter and `view-transition-class` property (which have been retroactively specified in Level 2 but are implemented in browsers alongside Level 1 support) are valuable additions that NoJS should leverage.

---

## 2. Core API

### 2.1 document.startViewTransition()

**MDN Reference:** [4]

The method has two call signatures:

```javascript
// Callback form
const transition = document.startViewTransition(updateCallback);

// Object form (with types)
const transition = document.startViewTransition({
  update: updateCallback,
  types: ['slide-left']
});
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `updateCallback` | `Function` (optional) | A callback that updates the DOM. Must return a `Promise`. When the promise fulfills, the transition begins in the next frame. If it rejects, the transition is abandoned. |
| `options.update` | `Function` (optional) | Same as `updateCallback` above. Defaults to `null`. |
| `options.types` | `string[]` (optional) | Array of type identifiers applied to the view transition. Enables selective CSS styling via `:active-view-transition-type()`. Defaults to an empty sequence. |

**Return value:** A `ViewTransition` object instance.

**Process when invoked [2]:**

1. The API takes a snapshot (static bitmap) of all elements with a `view-transition-name` on the current page
2. The `updateCallback` is invoked, which should mutate the DOM
3. When the callback's returned promise resolves, the API captures the new state
4. Transition pseudo-elements are created and the animation begins

If `startViewTransition()` is called without a callback, the API still captures the old state. The developer can then mutate the DOM and the transition animates based on whatever changes are visible when the new state is captured [4].

### 2.2 ViewTransition Object

**MDN Reference:** [5]

The `ViewTransition` interface provides:

**Instance Properties (all read-only):**

| Property | Type | Description |
|----------|------|-------------|
| `updateCallbackDone` | `Promise` | Fulfills when the update callback's returned promise fulfills. Rejects if the callback throws or returns a rejecting promise. |
| `ready` | `Promise` | Fulfills once the pseudo-element tree is created and the transition animation is about to start. Rejects if the transition is skipped (e.g., by `skipTransition()`) before the animation starts. |
| `finished` | `Promise` | Fulfills once the transition animation is finished and the new page view is visible and interactive. Rejects if the transition is skipped. |
| `types` | `ViewTransitionTypeSet` | A `Set`-like object representing the active types of the transition. Can be read and modified during the transition. |

**Instance Methods:**

| Method | Description |
|--------|-------------|
| `skipTransition()` | Skips the animation portion of the view transition. The DOM update still occurs (the `updateCallback` is still called). Rejects the `ready` promise with an `AbortError` DOMException. The `finished` promise resolves based on the `updateCallbackDone` outcome. |

**Additional Access Points:**
- `document.activeViewTransition` — Returns the currently active `ViewTransition` object (if any), accessible from any context without needing to store the return value of `startViewTransition()` [5].

### 2.3 Lifecycle and Promises

The lifecycle of a successful view transition proceeds through these phases [2][3]:

```
1. startViewTransition() called
   └─> ViewTransition object created

2. Old state captured (bitmap snapshots of named elements)

3. Rendering paused (suppressed)

4. updateCallback invoked (DOM mutation happens here)
   └─> If callback promise rejects: transition skipped, updateCallbackDone rejects

5. updateCallbackDone fulfills
   └─> DOM update is complete

6. New state captured (live snapshots)
   └─> If capture fails (e.g., duplicate view-transition-names): transition skipped

7. Pseudo-element tree created

8. Rendering unpaused
   └─> ready promise fulfills
   └─> Custom JS animations can be started here

9. Animations run (CSS animations on pseudo-elements)

10. Animations complete
    └─> Pseudo-elements removed
    └─> finished promise fulfills
```

**Error handling semantics [2]:**

- If the `updateCallback` throws or returns a rejecting promise: `updateCallbackDone` rejects, the transition is skipped, `ready` rejects with `AbortError`, `finished` rejects with the same reason as `updateCallbackDone`
- If `skipTransition()` is called before animations start: `ready` rejects with `AbortError`, `finished` resolves based on `updateCallbackDone`
- If `skipTransition()` is called after animations start: `ready` is already resolved (no-op rejection), animations stop immediately, `finished` resolves
- If the viewport size changes during the transition: the transition is automatically skipped with an `InvalidStateError` [2]
- If duplicate `view-transition-name` values are detected during capture: the transition is skipped with an `InvalidStateError` [3]

**Critical guarantee:** The `updateCallback` is **always** called, even if the transition is skipped. This ensures the DOM update always happens regardless of transition state. The spec explicitly calls this out as "transitions as an enhancement" — the visual animation is optional, but the state change must occur [2].

---

## 3. CSS Pseudo-Elements

### 3.1 Pseudo-Element Tree

During a view transition, the browser creates a tree of pseudo-elements that overlay the page content [6][7][8][9][10]:

```
::view-transition                          ← Root overlay (fixed, covers viewport)
├── ::view-transition-group(root)          ← Group for the default root snapshot
│   └── ::view-transition-image-pair(root) ← Contains old and new images
│       ├── ::view-transition-old(root)    ← Static bitmap of old state
│       └── ::view-transition-new(root)    ← Live representation of new state
├── ::view-transition-group(header)        ← Named group (example)
│   └── ::view-transition-image-pair(header)
│       ├── ::view-transition-old(header)
│       └── ::view-transition-new(header)
└── ::view-transition-group(content)       ← Another named group
    └── ::view-transition-image-pair(content)
        ├── ::view-transition-old(content)
        └── ::view-transition-new(content)
```

**Each pseudo-element's role:**

| Pseudo-Element | Role | Default Styling |
|----------------|------|-----------------|
| `::view-transition` | Root of the overlay. Sits above ALL page content including top-layer elements (dialogs, popovers). Creates a new stacking context called the "view transition layer" [2]. | `position: fixed; inset: 0;` |
| `::view-transition-group(name)` | Represents a named transition group. Animates `width`, `height`, and `transform` from old to new state. | `position: absolute; top: 0; left: 0; animation-duration: 0.25s; animation-fill-mode: both;` |
| `::view-transition-image-pair(name)` | Container for old and new snapshots. Has `isolation: isolate` so children can use non-normal blend modes. | `position: absolute; inset: 0;` inherits animation properties |
| `::view-transition-old(name)` | Static bitmap of the old state. Is a replaced element (supports `object-fit`, `object-position`). Default animation: fade out (opacity 1 to 0). | `position: absolute; inset-block-start: 0; inline-size: 100%; block-size: auto;` |
| `::view-transition-new(name)` | Live representation of the new state. Also a replaced element. Default animation: fade in (opacity 0 to 1). Both old and new use `mix-blend-mode: plus-lighter` during transition for smooth blending [10]. | Same as `::view-transition-old` |

**Stacking context and z-index behavior [2]:**

The `::view-transition` pseudo-element generates a new stacking context that paints **after all other content** of the document, including top-layer elements (like `<dialog>` elements and popovers). This means:

- During a transition, the pseudo-element overlay is visually on top of everything
- The overlay is NOT subject to filters or effects applied to the document content (except insofar as those effects are captured in the snapshots)
- Pointer events during the transition resolve to the `documentElement` when rendering is suppressed
- The `::view-transition-group` pseudo-elements are positioned absolutely within the `::view-transition` root

**Wildcard selector (`*`):**

All pseudo-elements accept a `*` universal selector parameter that matches all groups:

```css
::view-transition-group(*) {
  animation-duration: 0.5s;
}
```

The specificity of `*` is lower than named selectors, allowing specific names to override [8].

### 3.2 view-transition-name

**MDN Reference:** [11]

The `view-transition-name` CSS property assigns an element to a named snapshot group:

```css
.hero-image {
  view-transition-name: hero;
}
```

**Values:**

| Value | Description |
|-------|-------------|
| `<custom-ident>` | A unique name identifying this element's snapshot group. Cannot be `auto`, `match-element`, `none`, or CSS-wide keywords. |
| `match-element` | Browser automatically assigns a unique internal name (Level 2). Cannot be read from the DOM. |
| `none` | Element does not participate in a separate snapshot. Included in its parent's snapshot if the parent has a `view-transition-name`. |

**Uniqueness constraint:** Only **one element** may have a given `view-transition-name` value at the time of snapshot capture. If two elements share the same name, the transition is skipped with an `InvalidStateError` [2][3]. This is a critical constraint that frameworks must manage carefully, especially during route transitions where both old and new content may temporarily coexist.

**Dynamic assignment via JavaScript:**

```javascript
element.style.viewTransitionName = 'hero';
// or
element.style.setProperty('view-transition-name', 'hero');
```

This is commonly used when the same `view-transition-name` needs to be applied to different elements across page states (e.g., a thumbnail on a list page and the full image on a detail page).

**Scoping rules:**
- By default, the `:root` element has `view-transition-name: root` (set in the UA stylesheet), which creates the default root snapshot containing the entire page
- Setting `view-transition-name: none` on `:root` disables the whole-page snapshot
- Names are scoped to the document (or to a specific element when using Element-level transitions in Level 2)

### 3.3 view-transition-class

**MDN Reference:** [12]

The `view-transition-class` CSS property provides additional styling hooks for transition pseudo-elements without requiring unique names:

```css
.card {
  view-transition-class: card;
}

/* Style all card transitions at once */
::view-transition-group(.card) {
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
}
```

**Key characteristics:**

- Unlike `view-transition-name`, classes do **not** need to be unique
- A class does **not** cause an element to participate in a view transition — each element still needs its own unique `view-transition-name`
- Multiple classes can be assigned: `view-transition-class: card fast-slide;`
- Classes are matched using a dot (`.`) prefix in pseudo-element selectors
- Can be combined with name selectors: `::view-transition-group(hero.card)` matches a group named `hero` that also has the `card` class

**Relationship with `view-transition-name`:**

`view-transition-class` is purely a styling mechanism. It provides a way to apply the same transition CSS to multiple named groups without repeating rules for each name. The element must already have a `view-transition-name` to participate in the transition; `view-transition-class` only adds additional selector targets [12].

### 3.4 Styling and Animations

**Default UA animations [2][3]:**

```css
/* Default cross-fade */
@keyframes -ua-view-transition-fade-out {
  to { opacity: 0; }
}
@keyframes -ua-view-transition-fade-in {
  from { opacity: 0; }
}

/* Blending mode for smooth compositing */
@keyframes -ua-mix-blend-mode-plus-lighter {
  from { mix-blend-mode: plus-lighter; }
  to { mix-blend-mode: plus-lighter; }
}
```

The default animation duration is **0.25s** with `animation-fill-mode: both`. The `::view-transition-group(*)` also animates `width`, `height`, and `transform` from the old position/size to the new position/size when both old and new snapshots exist [7].

**Customizing animations:**

```css
/* Custom slide animation for a named group */
::view-transition-old(content) {
  animation: 0.3s ease-out slide-out-left;
}
::view-transition-new(content) {
  animation: 0.3s ease-out slide-in-right;
}

/* Override the default cross-fade for all groups */
::view-transition-old(*) {
  animation-name: none; /* Disable default fade-out */
}
::view-transition-new(*) {
  animation-name: none; /* Disable default fade-in */
}
```

**JavaScript-powered animations via Web Animations API [13]:**

```javascript
const transition = document.startViewTransition(() => {
  updateTheDOMSomehow();
});

transition.ready.then(() => {
  document.documentElement.animate(
    {
      clipPath: [
        `circle(0 at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ],
    },
    {
      duration: 500,
      easing: 'ease-in',
      pseudoElement: '::view-transition-new(root)',
    },
  );
});
```

---

## 4. Types Parameter

### 4.1 API

The `types` parameter enables categorizing view transitions so that different animations can be applied based on the transition type [14]:

```javascript
// Forward navigation
document.startViewTransition({
  update: () => navigateForward(),
  types: ['slide-forward']
});

// Backward navigation
document.startViewTransition({
  update: () => navigateBackward(),
  types: ['slide-backward']
});
```

Types can also be modified dynamically during a transition via the `ViewTransition.types` property, which is a `ViewTransitionTypeSet` (a `Set`-like object) [5][14]:

```javascript
const transition = document.startViewTransition(() => updateDOM());
transition.types.add('slide-left');
transition.types.delete('slide-right');
```

### 4.2 CSS Matching

Types are matched in CSS using pseudo-class selectors on the document root [3][14]:

```css
/* Match when any view transition is active */
:root:active-view-transition {
  /* styles */
}

/* Match a specific type */
:root:active-view-transition-type(slide-forward) {
  ::view-transition-old(content) {
    animation: slide-out-to-left 0.3s ease-out;
  }
  ::view-transition-new(content) {
    animation: slide-in-from-right 0.3s ease-out;
  }
}

:root:active-view-transition-type(slide-backward) {
  ::view-transition-old(content) {
    animation: slide-out-to-right 0.3s ease-out;
  }
  ::view-transition-new(content) {
    animation: slide-in-from-left 0.3s ease-out;
  }
}
```

**Specificity:** `:active-view-transition-type()` has the specificity of one pseudo-class selector [3].

**Multiple types:** A transition can have multiple types simultaneously. The `:active-view-transition-type()` selector matches if the active transition contains **at least one** of the specified types [3]:

```css
/* Matches if types include 'slide-in' OR 'reverse' */
:root:active-view-transition-type(slide-in, reverse) { }
```

### 4.3 Browser Support

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| `startViewTransition(callback)` | 111+ | 144+ | 18+ |
| `startViewTransition({ update, types })` | 125+ | 147+ | 18.2+ |
| `:active-view-transition-type()` | 125+ | 147+ | 18.2+ |
| `ViewTransition.types` | 125+ | 147+ | 18.2+ |
| `view-transition-class` | 125+ | 147+ | 18.2+ |

Sources: [1][4][5]

The object-form `startViewTransition()` with `types` was added later than the basic callback form. Chrome added it in version 125 (May 2024), Firefox in 147 (May 2025), and Safari in 18.2 (December 2024). This means for the broadest compatibility, feature detection should check for both the basic API and the object-form types support separately.

---

## 5. Edge Cases and Gotchas

### 5.1 Nested/Interrupted Transitions

When `startViewTransition()` is called while a previous transition is still active, the previous transition is **automatically skipped** [2]. The specification states:

> "If document's active view transition is not null, then skip the view transition for document's active view transition with an `AbortError` DOMException."

This means:
- The old transition's `ready` and/or `finished` promises reject with `AbortError`
- The old transition's pseudo-elements are removed
- The new transition begins fresh with a new snapshot capture

**Implication for NoJS:** Rapid navigation (e.g., user clicking quickly between routes) will naturally cause transitions to be interrupted. The router should handle `AbortError` rejections gracefully and not treat them as errors.

### 5.2 Elements That Cannot Be Captured

The following elements have restrictions during snapshot capture [2][3]:

- **Cross-origin iframes:** Content is rendered but the captured image may be restricted for security (cross-origin data cannot be exposed to the document)
- **Plugin content:** May not be captured accurately
- **Cross-origin images without CORS:** The snapshot may include the rendered appearance but the image data is protected

The spec notes: "The images generated using capture the image algorithm could contain cross-origin data. The implementations must ensure this data cannot be accessed by the Document" [3].

### 5.3 Performance Implications

**Compositor vs. Main Thread:**
- The snapshot capture happens on the main thread and can cause a brief rendering pause (rendering is suppressed during the capture phase)
- The actual animations run via CSS animations, which browsers typically run on the compositor thread for smooth 60fps performance
- The `::view-transition-old()` is a static bitmap (no layout cost), while `::view-transition-new()` is a live representation (can receive layout updates)

**Memory usage:**
- Each named snapshot captures a bitmap image of the element and its subtree
- Large DOM trees or elements with large ink overflow areas may have their rasterization quality reduced by the browser [2]
- The spec states: "Implementations may clip the rendered contents if the ink overflow rectangle exceeds some implementation-defined maximum" [2]
- Multiple named transitions increase memory proportionally

### 5.4 Overflow and Scroll Position

- Content outside an element's scrolling box is rendered as if scrolled to, without triggering scroll events or `IntersectionObserver` callbacks [2]
- The snapshot capturing process does NOT move or resize the layout viewport
- Scroll position is preserved across the transition

### 5.5 `contain: paint` and `overflow: clip` Implications

During capture, the spec applies specific rendering characteristics [2]:
- Transforms on the element and its ancestors are ignored (they're applied to the `::view-transition-group()` pseudo-element instead)
- Effects like `opacity` and `filter` applied directly on the element are included in the capture, but effects from ancestors are ignored
- The captured area should include at minimum the content intersecting the snapshot containing block

### 5.6 Viewport Size Changes

If the viewport (snapshot containing block) size changes between the old state capture and the new state capture, the transition is automatically skipped with an `InvalidStateError` [2]. This can happen on mobile when:
- Virtual keyboard appears/disappears
- Browser chrome shows/hides
- Device rotation occurs

### 5.7 Duplicate `view-transition-name` Values

If two or more elements share the same `view-transition-name` value at the time of capture (either old or new state), the entire transition is skipped with an `InvalidStateError` [3]. Frameworks must ensure that only one element per name exists at capture time.

---

## 6. Accessibility

### 6.1 `prefers-reduced-motion`

The View Transition API does **not** automatically respect `prefers-reduced-motion`. Developers must handle this explicitly [15][16]:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0s !important;
  }
}
```

Alternatively, check the preference in JavaScript:

```javascript
function navigateWithTransition(updateFn) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    updateFn(); // No transition, just update
    return;
  }
  document.startViewTransition(updateFn);
}
```

Astro's `<ClientRouter />` component includes a built-in CSS media query that disables all view transition animations when `prefers-reduced-motion` is detected [16].

### 6.2 Screen Reader Behavior

During a view transition, rendering is suppressed briefly while snapshots are captured. Because the pseudo-elements are purely visual overlays (not part of the accessible DOM tree), screen readers should continue to interact with the underlying DOM. The spec ensures that:

- The pseudo-element overlay does not interfere with the accessibility tree
- The DOM update happens synchronously (from the screen reader's perspective) when the callback resolves
- Live regions continue to function normally after the transition completes

### 6.3 Focus Management

The View Transition API does **not** automatically manage focus. After a transition completes, focus remains where it was before the transition started (or is lost if the focused element was removed during the DOM update). Developers must handle focus management explicitly:

```javascript
const transition = document.startViewTransition(() => {
  updateRouteContent();
});

transition.finished.then(() => {
  // Move focus to the new content
  const main = document.querySelector('main');
  main.focus();
  // Or announce to screen readers
  announceRouteChange(newRouteTitle);
});
```

### 6.4 WCAG Compliance Considerations

- **WCAG 2.3.3 (Animation from Interactions):** Users must be able to disable animations. Implementing `prefers-reduced-motion` support satisfies this.
- **WCAG 2.4.3 (Focus Order):** After transitions, focus should move to a logical position (typically the start of the new content).
- **WCAG 1.3.2 (Meaningful Sequence):** The visual transition should not change the meaningful reading order of content.
- **WCAG 2.2.1 (Timing Adjustable):** Transition durations should be reasonable (the default 0.25s is well within acceptable limits).

---

## 7. Browser Compatibility

### 7.1 Chrome/Edge

- **First implementor** — Chrome shipped `startViewTransition(callback)` in Chrome 111 (March 2023)
- Object form with `types` added in Chrome 125 (May 2024)
- Most stable and mature implementation
- DevTools support for inspecting view transition pseudo-elements in the Elements panel
- Chrome's compositor handles animations off-main-thread for smooth performance
- Known limitation: Very large snapshots (e.g., full-page captures of complex layouts) may experience brief jank during capture

Source: [1]

### 7.2 Firefox

- Shipped basic support in Firefox 144 (January 2025), was behind a flag since Firefox 143
- Object form with `types` shipped in Firefox 147 (May 2025)
- Latest stable: Firefox 150+ has full support
- Firefox's implementation follows the same spec but rendering engine differences (Gecko vs. Blink) may produce subtle timing differences in animations
- No known major bugs or deviations from the spec

Source: [1]

### 7.3 Safari

- Safari 18.0 shipped basic `startViewTransition(callback)` support (September 2024)
- Safari 18.2 added `types`, `view-transition-class`, and `:active-view-transition-type()` (December 2024)
- WebKit implementation is the newest and may have edge-case differences
- Safari on iOS uses the same WebKit engine, so iOS support mirrors desktop Safari versions

Source: [1]

### 7.4 Mobile

- **Chrome for Android:** Supported since the mobile browser tracks desktop Chrome versions (148+)
- **Safari on iOS:** Supported since iOS 18.0+
- **Firefox for Android:** Supported since Firefox 150
- **Samsung Internet:** Supported since version 23+
- **Opera Mini:** NOT supported
- **UC Browser for Android:** NOT supported (15.5)
- **KaiOS Browser:** NOT supported

**Mobile performance considerations:**
- Snapshot capture is more expensive on lower-end devices due to limited GPU memory
- Virtual keyboard changes can trigger viewport size changes, which skip the transition
- Device rotation during a transition will skip it (viewport size change)
- Developers should consider shorter animation durations (150-200ms) on mobile for perceived performance

Source: [1]

### 7.5 Feature Detection

```javascript
// Basic support
const supportsViewTransitions = 'startViewTransition' in document;

// Types support (object form)
// There is no direct feature detection for types.
// The safest approach is to try/catch or check browser version.
// The object form was added alongside types in all browsers,
// so if the basic API exists and the browser version is recent enough, types work.

// Practical feature detection:
function startTransition(updateFn, types = []) {
  if (!('startViewTransition' in document)) {
    updateFn();
    return null;
  }
  if (types.length > 0) {
    return document.startViewTransition({ update: updateFn, types });
  }
  return document.startViewTransition(updateFn);
}
```

---

## 8. Framework Comparison

### 8.1 Astro

**Approach:** Built-in `<ClientRouter />` component (formerly `<ViewTransitions />`) that converts an MPA into an SPA with client-side routing [16].

**API Surface:**
- `transition:name="hero"` — Sets `view-transition-name` on an element
- `transition:animate="fade|slide|none|initial"` — Built-in animation presets
- `transition:persist` — Maintains component state across navigations (element is not replaced)
- `transition:persist-props` — Also preserves props (not just state)

**Built-in presets:**
- `fade` (default) — Cross-fade animation
- `slide` — Old content slides out left, new slides in from right (reversed for back navigation)
- `none` — Disables animation
- `initial` — Uses browser's default View Transition API animation

**Fallback strategy:** Astro uses the native View Transition API when available but also provides a custom fallback animation system for older browsers. The `<ClientRouter />` component intercepts link clicks and performs SPA-style navigation regardless of browser support.

**Accessibility:** Built-in `prefers-reduced-motion` support that disables all animations automatically.

**Customization:** Developers can define completely custom animations via CSS `@keyframes` and pass them via the `transition:animate` directive using a custom animation object.

**Pros:** Most comprehensive integration. First-class HTML attributes. Auto-naming of elements. Rich preset library. Persist mechanism for state.
**Cons:** Tightly coupled to Astro's routing. Not reusable outside Astro.

### 8.2 SvelteKit

**Approach:** The `onNavigate` lifecycle hook allows developers to wrap navigation in `startViewTransition()` manually [17].

**API Surface:**
```javascript
// In +layout.svelte
import { onNavigate } from '$app/navigation';

onNavigate((navigation) => {
  if (!document.startViewTransition) return;

  return new Promise((resolve) => {
    document.startViewTransition(async () => {
      resolve();
      await navigation.complete;
    });
  });
});
```

**Fallback strategy:** SvelteKit does not provide built-in view transition support. The `onNavigate` hook is a general-purpose navigation lifecycle hook. If the browser doesn't support `startViewTransition`, the navigation proceeds normally.

**Customization:** All animation customization is done via standard CSS pseudo-element selectors. No framework-specific abstractions.

**Pros:** Minimal abstraction, gives full control to the developer. No framework lock-in for the transition logic.
**Cons:** Requires manual setup. No built-in presets. Developer must handle `prefers-reduced-motion` and focus management themselves.

### 8.3 Angular

**Approach:** `withViewTransitions()` router feature [18].

**API Surface:**
```typescript
// In app.config.ts
import { provideRouter, withViewTransitions } from '@angular/router';

export const appConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions({
        onViewTransitionCreated: (info) => {
          // Access to ViewTransition object, from/to routes
        }
      })
    )
  ]
};
```

**How it works:** Angular's router automatically wraps route changes in `document.startViewTransition()` when `withViewTransitions()` is configured. The `onViewTransitionCreated` callback provides the `ViewTransition` object and navigation info for custom logic.

**Fallback strategy:** If the browser doesn't support `startViewTransition`, route changes proceed without animation (graceful degradation).

**Accessibility:** Angular does not automatically handle `prefers-reduced-motion` for view transitions. Developers must add their own CSS.

**Pros:** Single configuration point. Access to transition object and route metadata.
**Cons:** Black-box wrapping — less control over exactly when/how `startViewTransition` is called. Limited built-in presets.

### 8.4 Nuxt

**Approach:** Experimental `viewTransition` option in `nuxt.config.ts` [19].

**API Surface:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    viewTransition: false // default
  },
  experimental: {
    viewTransition: true
  }
})
```

Can also be overridden per-page:
```typescript
// In a page component
definePageMeta({
  viewTransition: true
})
```

**How it works:** When enabled, Nuxt wraps route transitions in `document.startViewTransition()`. The transition occurs during the router's page component swap.

**Fallback strategy:** If the browser doesn't support the API, the page swap occurs without animation.

**Current status:** Still marked as experimental in Nuxt 4.x. Limited built-in customization options.

**Pros:** Simple boolean toggle. Per-page granularity.
**Cons:** Experimental and limited. No built-in presets or type management. Minimal documentation.

### 8.5 React / Next.js

**Approach:** As of Next.js 15.x and React 19, there is **no official built-in View Transition API support** [20]. The community uses manual integration patterns:

```jsx
// Manual integration in React
function navigate(url) {
  if (!document.startViewTransition) {
    router.push(url);
    return;
  }
  document.startViewTransition(() => {
    router.push(url);
  });
}
```

**React 19 and `useTransition`:** React 19's concurrent features (`useTransition`, `startTransition`) are conceptually related but are NOT the same as the View Transition API. React transitions manage rendering priority; View Transitions manage visual animation. They can be combined but require careful coordination.

**Next.js status:** Next.js has been exploring view transition support but has not shipped a stable API as of v16.2.6 (May 2026). Community patterns rely on manual wrapping similar to SvelteKit's approach.

**Pros:** Full control when implemented manually.
**Cons:** No official support. Manual implementation burden. React's virtual DOM diffing can conflict with View Transition API's snapshot timing if not carefully coordinated.

### 8.6 Framework Comparison Matrix

| Feature | Astro | SvelteKit | Angular | Nuxt | React/Next.js |
|---------|-------|-----------|---------|------|---------------|
| Built-in support | Yes (full) | No (manual) | Yes (router) | Experimental | No |
| Configuration | HTML attributes | JS hook | Router config | Config flag | Manual |
| Built-in presets | fade, slide, none | None | None | None | None |
| Types support | Via CSS | Via CSS | Via callback | N/A | N/A |
| Persist/morph | Yes | No | No | No | No |
| prefers-reduced-motion | Automatic | Manual | Manual | Manual | Manual |
| Fallback mechanism | Custom fallback | Graceful skip | Graceful skip | Graceful skip | Manual |

---

## 9. Patterns and Anti-Patterns

### 9.1 Best Practices

**1. Wrap DOM swaps in `startViewTransition()` at the router level:**

```javascript
async function navigateTo(route) {
  if (!document.startViewTransition) {
    await renderRoute(route);
    return;
  }

  const transition = document.startViewTransition(async () => {
    await renderRoute(route);
  });

  // Optionally wait for animation to complete
  await transition.finished;
}
```

**2. Use the callback form for the DOM update:**

The callback passed to `startViewTransition()` should be synchronous or return a promise that resolves when the DOM update is complete. The browser needs to know exactly when the new state is ready to capture.

```javascript
// Good: synchronous DOM update
document.startViewTransition(() => {
  container.innerHTML = newContent;
});

// Good: async with data fetching INSIDE the callback
document.startViewTransition(async () => {
  const data = await fetchRouteData(url);
  container.innerHTML = renderTemplate(data);
});
```

**3. Handle async content loading properly:**

If content needs to be fetched, do it INSIDE the transition callback. The browser pauses rendering and waits for the callback's promise to resolve before capturing the new state. However, keep the callback fast — long-running callbacks delay the transition visually:

```javascript
// Recommended: preload data, then transition
const data = await preloadRouteData(url);
document.startViewTransition(() => {
  renderRouteWithData(container, data);
});
```

**4. Assign `view-transition-name` to key elements:**

```css
.route-view { view-transition-name: route-content; }
.site-header { view-transition-name: site-header; }
.site-nav { view-transition-name: site-nav; }
```

**5. Use types for directional transitions:**

```javascript
document.startViewTransition({
  update: () => renderRoute(newRoute),
  types: [direction === 'forward' ? 'slide-forward' : 'slide-backward']
});
```

### 9.2 Anti-Patterns

**1. NOT handling the fallback case:**

```javascript
// BAD: crashes if API not available
document.startViewTransition(() => updateDOM());

// GOOD: feature detection
if (document.startViewTransition) {
  document.startViewTransition(() => updateDOM());
} else {
  updateDOM();
}
```

**2. Clearing the DOM before starting the transition:**

```javascript
// BAD: old state is empty, no meaningful animation
container.innerHTML = '';
document.startViewTransition(() => {
  container.innerHTML = newContent;
});

// GOOD: let the API capture the old state first
document.startViewTransition(() => {
  container.innerHTML = newContent;
});
```

This is exactly the bug in the current NoJS router — `innerHTML = ""` is called before any transition.

**3. Duplicate `view-transition-name` values:**

```css
/* BAD: if both are in the DOM simultaneously */
.old-hero { view-transition-name: hero; }
.new-hero { view-transition-name: hero; }
```

The fix is to ensure only one element has a given name at any time, or use dynamic assignment.

**4. Ignoring `prefers-reduced-motion`:**

Failing to respect this media query violates WCAG guidelines and creates a poor experience for users with vestibular disorders.

**5. Long-running transition callbacks:**

```javascript
// BAD: 3-second API call delays the transition
document.startViewTransition(async () => {
  const data = await fetch('/api/slow-endpoint'); // 3 seconds
  renderContent(data);
});

// GOOD: preload data first
const data = await fetch('/api/slow-endpoint');
document.startViewTransition(() => {
  renderContent(data);
});
```

### 9.3 Timeout Strategies

The browser does not impose a timeout on the transition callback, but rendering is suppressed during it. For slow transitions, consider:

```javascript
async function transitionWithTimeout(updateFn, timeoutMs = 2000) {
  if (!document.startViewTransition) {
    await updateFn();
    return;
  }

  const transition = document.startViewTransition(updateFn);

  // Skip animation if it takes too long
  const timer = setTimeout(() => {
    transition.skipTransition();
  }, timeoutMs);

  try {
    await transition.finished;
  } finally {
    clearTimeout(timer);
  }
}
```

### 9.4 Combining with Existing CSS Animations

View transitions and regular CSS animations can coexist. The key is that:
- View transition animations target pseudo-elements (`::view-transition-old`, `::view-transition-new`)
- Regular CSS animations target actual DOM elements
- Both run simultaneously without interference
- However, if you have CSS transitions on elements that change during the DOM update, those transitions may fire during the callback execution when the view transition overlay is hiding them — this is generally harmless but can cause unexpected behavior in the transition timeline

---

## 10. Recommendations for NoJS

### 10.1 API Design

**Recommended attribute surface:**

```html
<!-- Basic: use default cross-fade -->
<route-view transition>

<!-- Named transition preset -->
<route-view transition="slide">

<!-- Custom transition name for CSS targeting -->
<route-view transition="my-custom">

<!-- Disable transitions -->
<route-view transition="none">

<!-- Element-level naming for morphing -->
<div view-transition-name="hero">
<img view-transition-name="product-image">
```

**Router integration:**

The router should wrap the DOM update in `document.startViewTransition()`:

```javascript
// Current (broken) approach:
_animateOut(routeView, transition);
routeView.innerHTML = '';       // <-- kills old state immediately
await _renderRoute(matched);    // <-- renders new content
_animateIn(routeView, transition);

// Recommended approach:
async function _transitionRoute(routeView, matched, transition) {
  if (!document.startViewTransition || transition === 'none') {
    routeView.innerHTML = '';
    await _renderRoute(matched);
    return;
  }

  const direction = _getNavigationDirection(); // forward/backward
  const types = _getTransitionTypes(transition, direction);

  const vt = document.startViewTransition({
    update: async () => {
      routeView.innerHTML = '';
      await _renderRoute(matched);
    },
    types
  });

  // Handle errors gracefully
  vt.finished.catch((err) => {
    if (err.name !== 'AbortError') {
      console.warn('[NoJS] View transition failed:', err);
    }
  });
}
```

**Direction detection:**

NoJS should track navigation direction (forward/backward) to pass as a type:

```javascript
function _getTransitionTypes(transitionName, direction) {
  const types = [];
  if (transitionName && transitionName !== 'true') {
    types.push(transitionName); // e.g., 'slide'
  }
  if (direction) {
    types.push(direction); // 'forward' or 'backward'
  }
  return types;
}
```

### 10.2 Built-in Presets

NoJS should ship a CSS file with built-in presets that users can optionally include:

```css
/* nojs-transitions.css */

/* ===== Slide ===== */
:root:active-view-transition-type(slide) {
  &:active-view-transition-type(forward) {
    &::view-transition-old(route-content) {
      animation: 0.3s ease-out nojs-slide-out-left;
    }
    &::view-transition-new(route-content) {
      animation: 0.3s ease-out nojs-slide-in-from-right;
    }
  }
  &:active-view-transition-type(backward) {
    &::view-transition-old(route-content) {
      animation: 0.3s ease-out nojs-slide-out-right;
    }
    &::view-transition-new(route-content) {
      animation: 0.3s ease-out nojs-slide-in-from-left;
    }
  }
}

/* ===== Fade (explicit, overrides default timing) ===== */
:root:active-view-transition-type(fade) {
  ::view-transition-old(route-content) {
    animation: 0.25s ease nojs-fade-out;
  }
  ::view-transition-new(route-content) {
    animation: 0.25s ease nojs-fade-in;
  }
}

/* ===== Scale ===== */
:root:active-view-transition-type(scale) {
  ::view-transition-old(route-content) {
    animation: 0.3s ease nojs-scale-down-fade-out;
  }
  ::view-transition-new(route-content) {
    animation: 0.3s ease nojs-scale-up-fade-in;
  }
}

/* ===== None (disable animation) ===== */
:root:active-view-transition-type(none) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}

/* ===== Reduced motion ===== */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.01ms !important;
  }
}

/* ===== Keyframes ===== */
@keyframes nojs-slide-out-left {
  to { transform: translateX(-100%); opacity: 0; }
}
@keyframes nojs-slide-in-from-right {
  from { transform: translateX(100%); opacity: 0; }
}
@keyframes nojs-slide-out-right {
  to { transform: translateX(100%); opacity: 0; }
}
@keyframes nojs-slide-in-from-left {
  from { transform: translateX(-100%); opacity: 0; }
}
@keyframes nojs-fade-out {
  to { opacity: 0; }
}
@keyframes nojs-fade-in {
  from { opacity: 0; }
}
@keyframes nojs-scale-down-fade-out {
  to { transform: scale(0.95); opacity: 0; }
}
@keyframes nojs-scale-up-fade-in {
  from { transform: scale(0.95); opacity: 0; }
}
```

**Recommended presets:** `fade` (default), `slide`, `scale`, `none`

### 10.3 Fallback Strategy

NoJS should implement a three-tier fallback:

1. **View Transition API available:** Use `document.startViewTransition()` with types and pseudo-element animations
2. **API not available but JavaScript enabled:** Fall back to the current class-based animation system (`slide-enter`, `slide-leave`, etc.) for backward compatibility
3. **No JavaScript:** Content swaps without animation (progressive enhancement)

```javascript
function _transitionRoute(routeView, matched, transition) {
  if (document.startViewTransition && transition !== 'none') {
    return _nativeViewTransition(routeView, matched, transition);
  } else if (transition && transition !== 'none') {
    return _legacyClassTransition(routeView, matched, transition);
  } else {
    return _immediateSwap(routeView, matched);
  }
}
```

The existing class-based system should be maintained as a fallback but deprecated in documentation.

### 10.4 Accessibility Defaults

NoJS should apply these accessibility defaults **automatically**:

1. **`prefers-reduced-motion` respect:** Built into the preset CSS (see Section 10.2). Should reduce animation duration to near-zero, not skip the transition entirely (so the DOM update still happens correctly).

2. **Focus management:** After `transition.finished`, move focus to the new route content:
   ```javascript
   transition.finished.then(() => {
     const main = routeView.querySelector('[autofocus]') || routeView;
     main.focus({ preventScroll: true });
   });
   ```

3. **ARIA live region announcement:** Optionally announce route changes:
   ```javascript
   transition.finished.then(() => {
     const title = document.title;
     announceToScreenReader(`Navigated to ${title}`);
   });
   ```

4. **Reasonable default duration:** The 0.25s default from the UA stylesheet is appropriate. NoJS presets should stay within 0.2-0.4s.

### 10.5 Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Duplicate `view-transition-name` during transition** | High | Ensure old content is removed inside the `startViewTransition` callback, BEFORE new content is inserted. If the framework dynamically assigns names, clear them from old elements first. |
| **Viewport size changes on mobile** | Medium | Catch `InvalidStateError` rejections and handle gracefully. Consider shorter transition durations on mobile. |
| **Interrupted transitions during rapid navigation** | Medium | Catch `AbortError` on `finished` and `ready` promises. Do not treat these as errors. The API handles this automatically by skipping the old transition. |
| **Memory pressure from large snapshots** | Low | Document that `view-transition-name` should only be applied to key UI elements, not every DOM node. Recommend against naming large scrollable containers. |
| **Flash of unstyled content** | Low | Ensure the route template is fully rendered in the callback before the promise resolves. Preload data before starting the transition when possible. |
| **Browser inconsistencies** | Low | Test across Chrome, Firefox, and Safari. Use the wildcard selector (`*`) for base styles and named selectors for specifics. Monitor browser bug trackers. |
| **Legacy browser support** | Medium | Maintain the class-based fallback system. Document the progressive enhancement strategy clearly. Feature-detect `startViewTransition` before use. |

---

## Sources

1. Can I Use — View Transitions API (single-document). https://caniuse.com/view-transitions
2. W3C — CSS View Transitions Module Level 1 (Editor's Draft, 16 February 2025). https://drafts.csswg.org/css-view-transitions-1/
3. W3C — CSS View Transitions Module Level 2 (Editor's Draft, 29 April 2026). https://drafts.csswg.org/css-view-transitions-2/
4. MDN — Document: startViewTransition() method. https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
5. MDN — ViewTransition interface. https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition
6. MDN — ::view-transition CSS pseudo-element. https://developer.mozilla.org/en-US/docs/Web/CSS/::view-transition
7. MDN — ::view-transition-group() CSS pseudo-element. https://developer.mozilla.org/en-US/docs/Web/CSS/::view-transition-group
8. MDN — ::view-transition-image-pair() CSS pseudo-element. https://developer.mozilla.org/en-US/docs/Web/CSS/::view-transition-image-pair
9. MDN — ::view-transition-old() CSS pseudo-element. https://developer.mozilla.org/en-US/docs/Web/CSS/::view-transition-old
10. MDN — ::view-transition-new() CSS pseudo-element. https://developer.mozilla.org/en-US/docs/Web/CSS/::view-transition-new
11. MDN — view-transition-name CSS property. https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name
12. MDN — view-transition-class CSS property. https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class
13. MDN — Using the View Transition API. https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using
14. MDN — Using view transition types. https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using_types
15. MDN — View Transition API overview. https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
16. Astro — View Transitions documentation. https://docs.astro.build/en/guides/view-transitions/
17. SvelteKit — Hooks documentation (onNavigate). https://svelte.dev/docs/kit/hooks
18. Angular — withViewTransitions() API reference. https://angular.dev/api/router/withViewTransitions
19. Nuxt — Configuration: viewTransition. https://nuxt.com/docs/api/nuxt-config#viewtransition
20. Next.js — Version 15 Upgrade Guide. https://nextjs.org/docs/app/building-your-application/upgrading/version-15
21. Chrome for Developers — View Transitions guide. https://developer.chrome.com/docs/web-platform/view-transitions
