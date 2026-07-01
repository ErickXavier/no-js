# NOJS-206 SPIKE — Language Selector Knowledge Brief

> **Type:** Investigation / knowledge brief (no implementation).
> **Epic:** NOJS-199 — Restore and Overhaul Language Selector on Docs Site.
> **Author:** @architect · **Date:** 2026-07-01.
> **Consumers:** NOJS-200 (flag keys), NOJS-201 (markup), NOJS-202 (styles), NOJS-204 (QA/E2E).
> **Repo:** NoJS Core (`/Users/erick/_projects/_personal/NoJS/NoJS`).

## 0. TL;DR — decisions locked by this spike

1. **Old behavior is fully recovered** (below). It gives us the exact locale list, flag emojis, i18n key path, and the *two-surface* (desktop dropdown + mobile pill row) pattern. The old code is a **behavior/parity reference only** — its visuals (browser Popover API, light styling) are superseded.
2. **New selector is built on the NoJS-Elements `dropdown` element** (`dropdown` / `dropdown-toggle` / `dropdown-menu` / `dropdown-item`). Confirmed from source: it ships full ARIA, keyboard nav, and light-dismiss for free. This supersedes epic §2B (hand-rolled `state`/`show`) and §2C.
3. **Mobile question — RESOLVED as Option (b):** on mobile (`≤600px`) **hide the `dropdown` element and render a separate always-visible horizontal flag "pill row"** at the bottom of the drawer. Rationale in §7. This mirrors exactly what the old impl did.
4. **Two gotchas that will bite implementers:** (a) the element ships **light-theme** base CSS — the dark-mode look is *not* free, devs must override colors on `.nojs-dropdown-*`; (b) the real mobile breakpoint is **`600px`**, not the `820px` written in epic §2C.

---

## PART A — OLD SELECTOR ARCHAEOLOGY

### A.1 Where it lived and when/why it was removed

- **Removed in:** commit `7315571` — `chore(docs): site overhaul, new home page, asset cleanup` (Erick Xavier, 2026-06-24).
- **Nature of removal:** NOT a bug fix. It was a **wholesale navigation rewrite** that replaced the old `.header` / `.header-nav` / Popover-API `#mobile-nav` shell with today's `.sticky-nav` + `.nav-links` + store-driven drawer (`$store.nav.menuOpen`). During that rewrite the **Tools dropdown was re-created** (hand-rolled `.nav-dropdown`), but the **language selector was simply not carried over** — neither the desktop `.lang-dropdown` nor the mobile `.mobile-nav-lang` block. So this is a *redesign omission*, not a design retreat. No motivating bug exists; there is nothing to avoid re-introducing.
- **Last good copy:** `git show 7315571^:docs/index.html`.

### A.2 Old DESKTOP markup (browser Popover API — reference only)

```html
<div class="lang-dropdown">
  <button class="lang-dropdown-btn" if="window.NoJS.locale" popovertarget="lang-menu">
    <span t="shell.flag"></span>
    <svg class="lang-chevron" viewBox="0 0 20 20" fill="currentColor"><path .../></svg>
  </button>
  <div id="lang-menu" class="lang-dropdown-menu" popover>
    <button class="lang-option" on:click="window.NoJS.locale = 'en'" class-active="window.NoJS.locale === 'en'" popovertarget="lang-menu">🇺🇸 English</button>
    <button class="lang-option" on:click="window.NoJS.locale = 'es'" class-active="window.NoJS.locale === 'es'" popovertarget="lang-menu">🇪🇸 Español</button>
    <button class="lang-option" on:click="window.NoJS.locale = 'pt'" class-active="window.NoJS.locale === 'pt'" popovertarget="lang-menu">🇧🇷 Português</button>
    <button class="lang-option" on:click="window.NoJS.locale = 'it'" class-active="window.NoJS.locale === 'it'" popovertarget="lang-menu">🇮🇹 Italiano</button>
    <button class="lang-option" on:click="window.NoJS.locale = 'fr'" class-active="window.NoJS.locale === 'fr'" popovertarget="lang-menu">🇫🇷 Français</button>
  </div>
</div>
```

How it worked:
- **Trigger:** native Popover API — button `popovertarget="lang-menu"` toggled the `popover`-attributed menu.
- **Current-flag display:** the toggle showed `t="shell.flag"` — the current locale's own flag emoji (looked up from the active locale's `shell.json`).
- **Switch wiring:** each option set `window.NoJS.locale = '<code>'` (the old **global** locale setter) and marked the active one via `class-active="window.NoJS.locale === '<code>'"` (adds `.active`).
- **Dismiss on select:** each option also carried `popovertarget="lang-menu"`, so clicking it toggled the (already-open) popover closed.
- **Render guard:** `if="window.NoJS.locale"` — the toggle only rendered once a locale was resolved (avoids a flash of an empty flag).

### A.3 Old MOBILE markup (separate pill block — reference only)

Inside the old Popover-API `#mobile-nav`, after a divider:

```html
<div class="mobile-nav-lang">
  <button class="lang-option" on:click="window.NoJS.locale = 'en'" class-active="window.NoJS.locale === 'en'" popovertarget="mobile-nav">🇺🇸 English</button>
  <button class="lang-option" on:click="window.NoJS.locale = 'es'" class-active="window.NoJS.locale === 'es'" popovertarget="mobile-nav">🇪🇸 Español</button>
  <button class="lang-option" on:click="window.NoJS.locale = 'pt'" class-active="window.NoJS.locale === 'pt'" popovertarget="mobile-nav">🇧🇷 Português</button>
  <button class="lang-option" on:click="window.NoJS.locale = 'it'" class-active="window.NoJS.locale === 'it'" popovertarget="mobile-nav">🇮🇹 Italiano</button>
  <button class="lang-option" on:click="window.NoJS.locale = 'fr'" class-active="window.NoJS.locale === 'fr'" popovertarget="mobile-nav">🇫🇷 Français</button>
</div>
```

**Key precedent:** the old design *already* used a **dedicated, always-visible pill list on mobile** and a **dropdown on desktop** — two separate surfaces, not one responsive element. This is decisive for the mobile resolution (§7): Option (b) is the historically-proven pattern.

### A.4 Locales, flags, and the i18n key path (authoritative for NOJS-200)

| Locale | Code | Flag emoji | Native label |
|--------|------|-----------|--------------|
| English | `en` | 🇺🇸 | English |
| Spanish | `es` | 🇪🇸 | Español |
| Portuguese (Brazil) | `pt` | 🇧🇷 | Português |
| Italian | `it` | 🇮🇹 | Italiano |
| French | `fr` | 🇫🇷 | Français |

> Note: `pt` uses the **Brazil** flag 🇧🇷 (not Portugal 🇵🇹) — matches the old impl and the project's pt-BR locale policy.

**Flag key path — exact nesting (recovered from `7315571^:docs/locales/en/shell.json`):**

```jsonc
{
  "shell": {
    "flag": "🇺🇸",        // ← add this key, FIRST child of "shell", sibling of "header"
    "header": { ... }
  }
}
```

So `t="shell.flag"` resolves to `root.shell.flag`. NOJS-200 must add a `"flag"` entry inside the top-level `"shell"` object of **all five** `docs/locales/<lc>/shell.json` files (currently **absent in all 5** — verified). EN is source of truth; keep the same structure across locales.

---

## PART B — FEATURE-PARITY CHECKLIST (QA-testable for NOJS-204)

Each item is written as an assertion QA can verify on desktop and/or mobile.

| # | Requirement | Verify |
|---|-------------|--------|
| P1 | All **5 locales** are offered: en, es, pt, it, fr. | Count the options/pills = 5. |
| P2 | Each option shows the correct **flag + native label** (see A.4 table). | Visual / text assertion per row. |
| P3 | The **desktop toggle** shows the *current* locale's flag via `t="shell.flag"`. | Switch locale → toggle flag updates. |
| P4 | Selecting a language **actually switches the UI language** (all `t=` text re-renders). | Click each option → assert a known string translates. |
| P5 | The **active** locale is visually marked (`.active` via `class-active`). | After switching, active row/pill has active styling. |
| P6 | Desktop menu **dismisses** after selecting an option. | Click option → menu closes. |
| P7 | Desktop menu **dismisses on outside click** and on **Escape**. | Open → click elsewhere / press Esc → closes. |
| P8 | **Keyboard**: toggle opens on Enter/Space/ArrowDown; Arrow keys move between options; Enter selects; Esc closes and returns focus to the toggle. | Keyboard-only walkthrough. |
| P9 | **ARIA**: toggle exposes `aria-haspopup="menu"` + `aria-expanded` (true/false); menu is `role="menu"`; options are `role="menuitem"`. | Inspect DOM / axe. |
| P10 | On **mobile (≤600px)** the language options are visible as a **horizontal pill row at the bottom of the open drawer** (no separate flag-only toggle). | Resize ≤600px, open drawer, see pills. |
| P11 | Selecting a language on mobile switches language **and closes the drawer**. | Tap a pill → language changes, drawer closes. |
| P12 | No flash of an empty/missing flag on first load. | Reload with a set locale → flag present immediately. |
| P13 | Language choice persists across route navigation (SPA). | Switch, navigate to /docs → stays switched. |
| P14 | axe: no new a11y violations introduced by the selector (desktop + mobile). | `@axe-core/playwright` clean. |

---

## PART C — NoJS-Elements `dropdown` API (confirmed from source)

Source: `NoJS-Elements/src/dropdown/{dropdown.js,item.js,styles.js}`. Canonical fixture: `NoJS-Elements/docs/examples/dropdown/index.html`.

### C.1 Directives & attributes

| Directive (attribute) | Role | Notes |
|-----------------------|------|-------|
| `dropdown` | wrapper | Reads `dropdown-position` (`bottom`\|`top`, default `bottom`) and `dropdown-align` (`start`\|`end`, default `start`). |
| `dropdown-toggle` | trigger button | Gets `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`. Click/keyboard opens. |
| `dropdown-menu` | panel | Gets class `.nojs-dropdown-menu`, `role="menu"`, `popover="auto"`, generated `id`, `data-open` while open. |
| `dropdown-item` | option | Gets `role="menuitem"`, `tabindex="-1"`, class `.nojs-dropdown-item`. Can be `<button>` or `<a href>`. `disabled` → `aria-disabled`. |

### C.2 Behavior shipped for free (do NOT re-implement)

- **ARIA** wiring on toggle/menu/items (see table).
- **Keyboard**: toggle Enter/Space/ArrowDown → open + focus first item; items ArrowUp/Down cycle, Enter/Space activate, **Esc** closes + refocuses toggle, **Tab** closes.
- **Dismiss**: menu uses the **Popover API (`popover="auto"`)** → light-dismiss on outside click + Esc, rendered in the top layer.
- **Close-on-select**: `dropdown-item` has a built-in click handler that calls `_closeMenu(...)` (item.js:112–122) — **selecting an item auto-closes the menu**. Your `on:click` for locale-setting runs *in addition* to this; no manual close needed.
- **Positioning**: `_positionMenu()` sets the menu `position: fixed` and computes top/left from the toggle rect honoring `dropdown-position`/`dropdown-align` (`z-index: 9999`).

### C.3 Emitted CSS classes & base styles (style the RIGHT selectors)

The element injects a one-time `<style data-nojs-dropdown>` with these selectors:

- `.nojs-dropdown-menu` — panel. **Base = LIGHT theme:** `background:#fff; border:1px solid #E2E8F0; border-radius:8px; box-shadow:...; display:none` (block when `[data-open]`).
- `.nojs-dropdown-menu[data-open]` — visible state.
- `.nojs-dropdown-item` — option: `padding:.45rem .875rem; color:#334155; text-align:left`.
- `.nojs-dropdown-item:hover`, `:focus` — `background:#F1F5F9`.
- `.nojs-dropdown-item[aria-disabled="true"]` — dimmed.
- `.nojs-dropdown-item:focus-visible` — `outline:2px solid #0EA5E9`.

> **Target `.nojs-dropdown-*` (NOT `.nav-dropdown-*`).** `.nav-dropdown-*` is the hand-rolled Tools dropdown; the Elements element emits `.nojs-dropdown-*`.

---

## PART D — AUTHORITATIVE NEW MARKUP (desktop) — copy-paste ready

Insert inside `.nav-links` (`docs/index.html`), **after** the Tools `.nav-dropdown` block (which ends ~line 206). The site already loads Elements at `docs/index.html:118` (`<script src="https://cdn-elements.no-js.dev/"></script>`), so no new infra.

```html
<!-- Language Selector (desktop) — NoJS-Elements dropdown -->
<div class="lang-select" dropdown dropdown-position="bottom" dropdown-align="end">
  <button class="lang-select-toggle" dropdown-toggle aria-label="Select language">
    <span t="shell.flag">🌐</span>
    <svg class="nav-dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
  </button>
  <div class="lang-select-menu" dropdown-menu>
    <button dropdown-item on:click="$i18n.locale = 'en'" class-active="$i18n.locale === 'en'">🇺🇸 English</button>
    <button dropdown-item on:click="$i18n.locale = 'es'" class-active="$i18n.locale === 'es'">🇪🇸 Español</button>
    <button dropdown-item on:click="$i18n.locale = 'pt'" class-active="$i18n.locale === 'pt'">🇧🇷 Português</button>
    <button dropdown-item on:click="$i18n.locale = 'it'" class-active="$i18n.locale === 'it'">🇮🇹 Italiano</button>
    <button dropdown-item on:click="$i18n.locale = 'fr'" class-active="$i18n.locale === 'fr'">🇫🇷 Français</button>
  </div>
</div>
```

Notes for NOJS-201:
- **No** `state="{open:false}"`, **no** `show="open"`, **no** `on:click="open=!open"` — the element owns open/close/dismiss.
- `dropdown-align="end"` because the nav sits at the top-right; the menu right-aligns to the toggle so it stays on-screen.
- `class-active` toggles `.active` on the item (used for styling in §E).
- `$i18n.locale` is the current reactive setter (old global was `window.NoJS.locale`). **Verify** the exact reactive setter against the loaded build before shipping (see Gotcha G4); if `$i18n.locale` assignment is not reactive in the current runtime, fall back to the documented locale-switch API.
- The outer `.lang-select` class is *ours* (for layout/visibility toggling); `dropdown` is the element hook. Keep both.

---

## PART E — STYLING GUIDANCE (NOJS-202)

### E.1 What you must NOT do
- Do **not** recreate base dropdown structure/positioning/`display` logic — the element ships it.
- Do **not** target `.nav-dropdown-*` — that's the Tools dropdown.

### E.2 What you MUST add — dark-mode override (the look is not free)

The element's base CSS is light. Override colors on the emitted classes to match the docs dark theme. Target tokens (from `docs/assets/css/style.css :root`): `--surface:#0d0f14`, `--border-color:rgba(255,255,255,.1)`, `--text-secondary:#8b93a3`, `--text-primary:#fff`, `--accent-light:#3b82f6`, `--glass-bg-hover:rgba(255,255,255,.07)`, `--rounded-lg`, `--rounded-md`.

Visual target = parity with the existing `.nav-dropdown-menu` (Tools dropdown), which is the canonical new-design dark dropdown: `background:var(--surface); border:1px solid var(--border-color); border-radius:var(--rounded-lg); box-shadow:0 16px 48px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05)`.

```css
/* ── Language selector: dark-mode skin over the Elements dropdown ── */
.lang-select-menu.nojs-dropdown-menu {   /* element also adds .nojs-dropdown-menu at runtime */
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--rounded-lg);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  padding: 0.375rem;
  min-width: 160px;
}
.lang-select-menu .nojs-dropdown-item {
  border-radius: var(--rounded-md);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 0.875rem;
}
.lang-select-menu .nojs-dropdown-item:hover,
.lang-select-menu .nojs-dropdown-item:focus {
  background: var(--glass-bg-hover);
  color: var(--text-primary);
}
.lang-select-menu .nojs-dropdown-item.active {
  color: var(--accent-light);
  font-weight: 600;
}
.lang-select-toggle {           /* match .nav-dropdown-toggle */
  display: inline-flex; align-items: center; gap: 0.25rem;
  background: none; border: none; cursor: pointer;
  font-family: var(--font-sans); font-size: 14px; font-weight: 500;
  color: var(--text-secondary);
}
.lang-select-toggle:hover { color: var(--text-primary); }
```

> Because the element adds `.nojs-dropdown-menu` at runtime, either scope via `.lang-select-menu .nojs-dropdown-item` (safe) or bump specificity as shown. Confirm cascade order once built.

---

## PART F — MOBILE RESOLUTION (definitive)

### The problem
The epic wants a horizontal flag **pill row at the bottom of the mobile drawer**. But the Elements menu is a **`popover="auto"` element positioned `fixed` in the top layer** by `_positionMenu()`. You cannot cleanly reflow a top-layer popover into the drawer's normal flow. The Tools dropdown gets away with a `display: contents` "flatten" trick on mobile precisely because it is a plain `show="open"` div — **that trick does not transfer** to a popover/top-layer element, and even if forced open it would fixed-position over the page and light-dismiss on the next tap.

### DECISION — Option (b): separate always-visible pill row on mobile; element is desktop-only.

**Rationale (consequence-driven):**
- ✅ Robust: no fighting the top layer, `position:fixed`, the JS re-positioner, or light-dismiss.
- ✅ Matches the drawer's flow layout and the `mobile-navigation-drawer` design frame (pills at the bottom).
- ✅ **Feature-parity by precedent** — the old impl used exactly this two-surface split (§A.3).
- ✅ Accessible: plain buttons in normal flow, no menu semantics needed inline.
- ⚠️ **Trade-off / cost:** the locale list is authored **twice** (dropdown items + pills). Mitigation: keep both lists adjacent in `index.html` with a comment, and (optional) have NOJS-204 assert both lists stay in sync. This duplication is small (5 rows) and was acceptable in the old impl.
- ❌ Rejected Option (a) "force the element open on mobile via CSS/attr": brittle — the menu remains a fixed top-layer popover; CSS overrides (`position:static`, `display:flex`) conflict with the inline `showPopover()`/`_positionMenu()` runtime, and light-dismiss closes it on interaction. High risk, poor payoff.

### Mobile markup — add alongside the desktop block, inside `.nav-links`

```html
<!-- Language pills (mobile drawer only) -->
<div class="lang-pills" aria-label="Select language">
  <button class="lang-pill" on:click="$i18n.locale = 'en'; $store.nav.menuOpen = false" class-active="$i18n.locale === 'en'">🇺🇸 EN</button>
  <button class="lang-pill" on:click="$i18n.locale = 'es'; $store.nav.menuOpen = false" class-active="$i18n.locale === 'es'">🇪🇸 ES</button>
  <button class="lang-pill" on:click="$i18n.locale = 'pt'; $store.nav.menuOpen = false" class-active="$i18n.locale === 'pt'">🇧🇷 PT</button>
  <button class="lang-pill" on:click="$i18n.locale = 'it'; $store.nav.menuOpen = false" class-active="$i18n.locale === 'it'">🇮🇹 IT</button>
  <button class="lang-pill" on:click="$i18n.locale = 'fr'; $store.nav.menuOpen = false" class-active="$i18n.locale === 'fr'">🇫🇷 FR</button>
</div>
```

### Mobile CSS — hide the element, show the pills (breakpoint = 600px)

```css
/* Desktop: dropdown visible, pills hidden */
.lang-pills { display: none; }

@media (max-width: 600px) {          /* ← the drawer breakpoint; NOT 820px */
  .lang-select { display: none; }     /* hide the desktop Elements dropdown */

  .lang-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color);
    width: 100%;
  }
  .lang-pill {
    padding: 0.375rem 0.625rem;
    border: 1px solid var(--border-color);
    border-radius: var(--rounded-md);
    background: none;
    color: var(--text-secondary);
    font: 500 0.8125rem var(--font-sans);
    cursor: pointer;
  }
  .lang-pill.active {
    color: var(--accent-light);
    border-color: var(--accent-light);
    background: var(--glass-bg-hover);
  }
}
```

---

## PART G — DESIGN CONFORMANCE (`docs/design.pen`)

- **File exists:** `docs/design.pen` (encrypted `.pen`, ~54 KB, last edited 2026-06-24). Open with the Pencil editor to view; it cannot be read as text. Frames referenced by the epic: **`desktop-navigation`** and **`mobile-navigation-drawer`**.
- **Authority:** the design file governs *visuals*; the old impl governs *behavior* only.
- **Practical mapping (since the live CSS already implements these frames):**
  - `desktop-navigation` → the language toggle is a compact flag + chevron button living at the right end of `.nav-links`, matching the Tools `.nav-dropdown-toggle` in size/weight/color; the open menu is a dark glass panel (parity with `.nav-dropdown-menu`, §E.2).
  - `mobile-navigation-drawer` → the right-side drawer (`.nav-links` fixed, `width:50%`, `flex-direction:column`, activates `≤600px`); language appears as a **wrapped pill row at the bottom**, visually separated by a top border (§F).
- **Tokens to honor** (already in `:root`): `--surface`, `--border-color`, `--text-primary/secondary`, `--accent-light`, `--glass-bg-hover`, `--rounded-md/-lg`, `--font-sans`. No hard-coded hex.
- **Recommendation:** before final sign-off, NOJS-202/204 should open `design.pen` and confirm pill spacing, active-state color, and toggle placement against the two frames. If the frames disagree with the parity-with-Tools defaults above, the frames win.

---

## PART H — GOTCHAS & RISKS

| ID | Risk | Impact | Mitigation / owner |
|----|------|--------|--------------------|
| G1 | **Light-theme base CSS.** Element ships white/`#334155` styling; without overrides the menu looks broken on the dark site. | High | NOJS-202 must add the §E.2 dark overrides on `.nojs-dropdown-*`. |
| G2 | **Wrong breakpoint.** Epic §2C says `820px`; the actual drawer/hamburger breakpoint is **`600px`**. Using 820 leaves a broken tablet range. | High | Use `600px` (§F). |
| G3 | **Wrong class target.** Styling `.nav-dropdown-*` (Tools) instead of the emitted `.nojs-dropdown-*` will silently no-op. | Med | NOJS-202 targets `.nojs-dropdown-*` / `.lang-select-*`. |
| G4 | **Locale setter API.** Old code used `window.NoJS.locale`; new markup uses `$i18n.locale`. If `$i18n.locale =` assignment isn't reactive in the current build, switching won't work. | High | NOJS-201 verify against the loaded runtime before merge (quick manual click test); fall back to the documented setter if needed. |
| G5 | **Missing flag key path.** `t="shell.flag"` = `root.shell.flag`; must be a child of `"shell"` (sibling of `"header"`), in all 5 locale files (currently absent). | High | NOJS-200 add per A.4; EN is source of truth, mirror structure. |
| G6 | **Empty-flag flash.** Old code guarded with `if="window.NoJS.locale"`. New toggle has a `🌐` fallback in `t="shell.flag">🌐`; confirm no empty render before locale resolves. | Low | Keep the `🌐` fallback; NOJS-204 assert P12. |
| G7 | **Duplicate locale lists** (dropdown + pills). Risk of drift (add a 6th locale later, update one list only). | Low | Keep lists adjacent + comment; optional NOJS-204 sync assertion. |
| G8 | **Menu clipping / z-index.** Element menu is `position:fixed; z-index:9999` — should sit above nav, but verify it isn't clipped by `.nav-links` transforms/overflow on desktop. | Low | NOJS-204 visual check desktop. |
| G9 | **Close-on-select already built in.** Do not also add a manual close (would double-fire / conflict). | Low | Rely on item.js:112–122 (§C.2). |

---

## Appendix — key source references

- Old selector: `git show 7315571^:docs/index.html` (desktop `.lang-dropdown` ~L283–295; mobile `.mobile-nav-lang` ~L323–329). Removed by commit `7315571`.
- Old flag key: `git show 7315571^:docs/locales/en/shell.json` → `shell.flag`.
- Current nav shell: `docs/index.html:166–206` (`store="nav"`, `.sticky-nav`, `.nav-links`, Tools `.nav-dropdown`). Elements loaded at `docs/index.html:118`.
- Current dark dropdown CSS: `docs/assets/css/style.css` — `.nav-dropdown-menu` ~L693, `.nav-links` drawer ~L2581 inside `@media (max-width:600px)` (L2488).
- Element source: `NoJS-Elements/src/dropdown/{dropdown.js,item.js,styles.js}`; fixture `NoJS-Elements/docs/examples/dropdown/index.html`.
