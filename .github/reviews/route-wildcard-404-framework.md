# Code Review: Route Wildcard / 404 Catch-All (Framework)

**Date**: 2026-03-16
**Reviewer**: Dev Reviewer Agent
**Spec**: `.github/specs/route-wildcard-404/spec.md`

## Verdict: ⚠️ CHANGES REQUESTED

## Summary

The route wildcard / 404 catch-all implementation in `src/router.js` and the `res.ok` fix in `src/dom.js` are structurally sound and follow the spec well. Wildcard storage (`_wildcards` Map keyed by outlet name), the fallback chain (local → global → built-in), `$route.matched` timing, guard evaluation, and the built-in 404 HTML are all correctly implemented. The `res.ok` fix in `dom.js` is clean — it prevents caching of error responses, sets `__loadFailed`, and removes loading markers properly.

One warning-level bug was found: when a developer-defined wildcard template's `src` fetch fails, the code does not properly fall back to the built-in 404, resulting in an empty outlet. No security issues were found.

## Files Reviewed

| File | Status | Issues |
|------|--------|--------|
| `src/router.js` | ⚠️ | 1 warning, 1 suggestion |
| `src/dom.js` | ✅ | 1 suggestion |
| `src/globals.js` | ✅ | None (no changes needed) |

## Issues

### Warnings ⚠️

- **[src/router.js:L205-L214]** When a wildcard template has a `src` attribute and the fetch fails (`__loadFailed = true`), the second fallback lookup at L206 retrieves the **same** wildcard template (which already has `__loadFailed`). The code assigns `tpl = wildcardTpl` (line 209) but since `__srcLoaded` is already `true` (line 210), it won't attempt a re-fetch. Execution then falls through to the rendering code (line 216+) with `tpl.__loadFailed` still `true`, resulting in an empty `tpl.content` clone — the outlet renders blank instead of showing the built-in 404.

  Scenario: `<template route="*" src="./pages/404.tpl">` → HTTP 404 on `404.tpl` → empty outlet.

  ```js
  // Current code at ~L205-214:
  if (tpl.__loadFailed) {
    const wildcardTpl = _wildcards.get(outletName)
      || (outletName !== "default" ? _wildcards.get("default") : null);
    if (wildcardTpl) {
      tpl = wildcardTpl;       // ← same template, still __loadFailed
      if (tpl.getAttribute("src") && !tpl.__srcLoaded) {
        await _loadTemplateElement(tpl);
      }
    } else {
      outletEl.innerHTML = _BUILTIN_404_HTML;
      continue;
    }
  }
  ```

  **Suggestion**: After assigning `tpl = wildcardTpl`, check if it still has `__loadFailed`. If so, fall back to the built-in 404:
  ```js
  if (tpl.__loadFailed) {
    const wildcardTpl = _wildcards.get(outletName)
      || (outletName !== "default" ? _wildcards.get("default") : null);
    if (wildcardTpl && !wildcardTpl.__loadFailed) {
      tpl = wildcardTpl;
      if (tpl.getAttribute("src") && !tpl.__srcLoaded) {
        await _loadTemplateElement(tpl);
      }
    }
    // If still failed (no usable wildcard, or wildcard itself failed), use built-in
    if (!tpl || tpl.__loadFailed) {
      outletEl.innerHTML = _BUILTIN_404_HTML;
      continue;
    }
  }
  ```

### Suggestions 💡

- **[src/router.js — `_prefetchRoutes()`]** The selector `[route]:not([route-view])` in `_prefetchRoutes()` (L320) matches `<template route="*">` elements alongside `<a route="...">` links. This causes a pointless file-based template creation and fetch for path `"*"` (e.g., `pages/*.tpl` — which will 404). Adding `path === "*"` to the skip conditions (alongside the existing `path === current.path` check) would avoid the wasted network request.

  ```js
  if (lazy === "ondemand" || path === current.path || path === "*") continue;
  ```

- **[src/dom.js — `_loadRemoteTemplates()`]** The `_loadRemoteTemplates` function does not set `__loadFailed` on the template when `res.ok` is false (line 87-89). It sets `__srcLoaded = true` (line 76) and returns early. If a route template were ever processed by `_loadRemoteTemplates` before `_loadTemplateElement` (e.g., a nested route template inside another template), the router would see the template as valid (no `__loadFailed`) but with empty content. Risk is low since the normal code path uses `_loadTemplateElement` for route templates, but adding `tpl.__loadFailed = true` alongside the early return would make the function more defensive.

## Acceptance Criteria Check

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `<template route="*">` recognized as wildcard | ✅ Met — `init()` detects `path === "*"` and stores in `_wildcards` map |
| 2 | Wildcard renders when no explicit route matches | ✅ Met — fallback chain in `_renderRoute()` activates when `!matched` |
| 3 | Wildcard never matched when explicit route exists | ✅ Met — `matchRoute()` is unmodified; `*` is never registered as a route pattern |
| 4 | `$route.path` accessible in wildcard template | ✅ Met — same `createContext({ $route: current })` as all route templates |
| 5 | `$route.matched` is `false` for wildcard/fallback | ✅ Met — set at L88 before `_renderRoute()` |
| 6 | `$route.matched` is `true` for explicit matches | ✅ Met — set at L71 before `_renderRoute()` |
| 7 | Built-in 404 shown when no `route="*"` defined | ✅ Met — `_BUILTIN_404_HTML` injected at L213 and L262 |
| 8 | Developer `route="*"` overrides built-in 404 | ✅ Met — wildcard checked before built-in fallback |
| 9 | Named outlets support local `route="*" outlet="name"` | ✅ Met — `_wildcards` map keyed by outlet name |
| 10 | Named outlet falls back to global wildcard | ✅ Met — `_wildcards.get("default")` checked when `outletName !== "default"` |
| 11 | Built-in 404 used when no local/global wildcard exists | ✅ Met |
| 12 | Wildcard with `src` attribute | ⚠️ Partially met — works when fetch succeeds; fails silently when fetch fails (see Warning above) |
| 13 | Wildcard with `guard`/`redirect` | ✅ Met — guard evaluated on wildcard in `navigate()` (L90-110) |
| 14 | Wildcard with `i18n-ns` | ✅ Met — i18n loading at L224-227 applies to any tpl including wildcards |
| 15 | `_loadTemplateElement` checks `res.ok` | ✅ Met — L140-144 in dom.js |
| 16 | `_loadRemoteTemplates` checks `res.ok` | ✅ Met — L85-88 in dom.js |
| 17 | File-based routing 404 triggers wildcard chain | ✅ Met — `__loadFailed` flag checked at L189 and L205 |
| 18 | Built-in 404 uses inline styles only | ✅ Met — `_BUILTIN_404_HTML` is self-contained |
| 19 | No regressions in existing router behavior | ✅ Met — `matchRoute()` unchanged; existing rendering path unmodified for matched routes |
| 20 | Wildcard not prefetched | ✅ Met — wildcard templates are stored in `_wildcards`, not `routes`; `_prefetchRoutes()` uses link elements |

## Positive Observations

- **Clean integration**: The wildcard feature layers on top of existing infrastructure without modifying core routing logic (`matchRoute`, `navigate` URL handling, or template rendering). The separation between `routes` and `_wildcards` is well-thought-out.
- **Correct `$route.matched` timing**: Setting `matched` before `_renderRoute()` ensures the flag is available during template processing — this is the right approach.
- **Guard pattern consistency**: The wildcard guard check mirrors the existing matched-route guard check (both evaluate only the default outlet template in `navigate()`). This is consistent with the framework's existing behavior.
- **`res.ok` fix is thorough**: Both `_loadTemplateElement` and `_loadRemoteTemplates` check `res.ok`, the pre-warm cache in `_loadTemplateElement` also checks `r.ok`, and loading markers are properly cleaned up on failure.
- **No XSS risk**: The built-in 404 HTML is a static constant with no user-controlled content. `$route.path` in developer templates is rendered via `bind` (uses `textContent`, not `innerHTML`).
- **`register()` method updated**: The programmatic `register(path, tpl, outlet)` API correctly handles `path === "*"` by storing in `_wildcards` instead of `routes`.

## Notes

- The `__loadFailed` flag on auto-templates persists across navigations (the template is cached in `_autoTemplateCache` with `__srcLoaded = true`). This means a file-based template that fails once will not be retried until page reload. This is consistent with the spec's intentional design ("don't retry the fetch endlessly") but worth being aware of.
- The wildcard guard check in `navigate()` only evaluates the **default** outlet's wildcard guard, matching the existing pattern for matched routes. Named outlet wildcard guards are not evaluated in `navigate()`. This is consistent but could be documented.
