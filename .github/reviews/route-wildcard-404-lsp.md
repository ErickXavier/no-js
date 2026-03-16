# Code Review: Route Wildcard / 404 — LSP Changes

**Date**: 2026-03-16
**Reviewer**: Dev Reviewer Agent
**Spec**: `.github/specs/route-wildcard-404/spec.md`
**Tasks**: TODO 2.1 (metadata) + TODO 2.2 (providers)

## Verdict: ⚠️ CHANGES REQUESTED

## Summary

The LSP changes for the Route Wildcard / 404 Catch-All feature are well-implemented overall. Directive metadata, custom data, snippets, completions, hover, and diagnostics all accurately reflect the framework behavior. Code style is consistent with the rest of the codebase. One warning-level issue was found: `route` is missing from the expression syntax validation skip list in `diagnostics.ts`, causing a false positive hint on `route="*"`.

## Files Reviewed

| File | Status | Issues |
|------|--------|--------|
| `server/src/data/directives.json` | ✅ | None |
| `data/nojs-custom-data.json` | ✅ | None |
| `snippets/nojs.json` | ✅ | None |
| `server/src/providers/completion.ts` | ✅ | None |
| `server/src/providers/diagnostics.ts` | ⚠️ | 1 warning |
| `server/src/providers/hover.ts` | ✅ | 1 suggestion |

## Issues

### Critical ❌

None.

### Warnings ⚠️

- **[diagnostics.ts:L275-279]** `route` is not in the `skipSyntaxCheck` set. Route values are path patterns (e.g., `/about`, `/users/:id`, `*`), not JavaScript expressions. Previously this wasn't a problem because all route values started with `/`, which matches the URL pattern early-return in `validateExpressionSyntax`. However, `*` alone is not a valid JS expression and doesn't match any skip pattern, so `route="*"` will trigger a false positive `DiagnosticSeverity.Hint`: _"Possible syntax error in expression"_.

  ```typescript
  const skipSyntaxCheck = new Set([
    'validate', 'ref', 'store', 't', 'i18n-ns', 'trigger',
    'error-boundary', 'use', 'drag-handle',
  ]);
  ```

  **Suggestion**: Add `'route'` to the `skipSyntaxCheck` set. Route values are string path patterns, never JS expressions:

  ```typescript
  const skipSyntaxCheck = new Set([
    'validate', 'ref', 'store', 't', 'i18n-ns', 'trigger',
    'error-boundary', 'use', 'drag-handle', 'route',
  ]);
  ```

### Suggestions 💡

- **[hover.ts:L129]** The `$route` context key hover description lists `(path, params, query, hash)` but does not mention the new `matched` property. Consider updating it to include `matched`:

  ```typescript
  '$route': 'No.JS: **`$route`** — Current route information (path, params, query, hash, matched).\n\nUsage: `$route.params.id`, `$route.matched`',
  ```

## Detailed Analysis

### directives.json — `route` entry (L537–L570)

- `valueDescription` updated to `"Route path pattern or \"*\" for catch-all wildcard"` — accurate ✅
- `documentation` mentions `route="*"`, `$route.matched`, catch-all behavior, and includes a code example — comprehensive and accurate ✅
- Companions unchanged (`route-active`, `route-active-exact`, `lazy`, `outlet`) — correct, no new companions were introduced ✅

### nojs-custom-data.json — `route` attribute (L319–L322)

- Description updated to mention `"*"` as a catch-all wildcard ✅
- Includes code examples for `<template>`, `<a>`, and wildcard usage ✅

### snippets/nojs.json — `nojs-route-404` snippet (L154–L162)

- Prefix `nojs-route-404` follows existing naming convention ✅
- `$route.path` correctly escaped as `\\$route.path` in JSON → `\$route.path` in snippet syntax → literal `$route.path` in output ✅
- Body produces valid, copy-pasteable HTML ✅
- Description matches spec ✅

### completion.ts — Wildcard completion (L470–L487)

- Wildcard `*` completion gated on `context.element.tag === 'template'` — correctly restricted, won't appear on `<a>` elements ✅
- Partial matching via `'*'.startsWith(partial)` — correct ✅
- Uses `CompletionItemKind.EnumMember` — appropriate for a keyword-like special value (vs. `File` for path routes) ✅
- Documentation in the completion item is accurate and references `$route.matched` ✅
- Sort text `0-*` ensures it appears alongside other route completions ✅

### diagnostics.ts — Duplicate wildcard detection (L246–L308)

- Detection correctly scoped to `name === 'route' && value === '*' && el.tag === 'template'` ✅
- Outlet extraction uses `outlet` attribute with `'default'` fallback — matches framework behavior ✅
- Warning message `"Duplicate wildcard route for outlet '{name}' — only the last one will be used."` is actionable and follows the `No.JS:` prefix convention ✅
- Severity is `Warning` — appropriate for "last one wins" semantics ✅
- Post-loop reporting pattern consistent with existing duplicate detection (state, refs) ✅
- Type signature for `wildcardRoutes` map consistent with `stateDeclarations` and `refDeclarations` ✅

### hover.ts — Wildcard hover (L52–L67)

- Triggers only on `route="*"` on `<template>` — correct ✅
- Documents the fallback chain (local → global → built-in) — matches spec ✅
- References `$route.matched` with correct semantics ✅
- Includes code example ✅
- Placed before the generic `getValueHover` call so it doesn't fall through — correct control flow ✅

## Acceptance Criteria Check (LSP-relevant)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `route="*"` recognized — metadata updated | ✅ Met |
| 2 | Completion for `*` on `<template>` only | ✅ Met |
| 3 | Diagnostic for duplicate wildcards per outlet | ✅ Met |
| 4 | Hover for `route="*"` with fallback chain docs | ✅ Met |
| 5 | Snippet with correct `$route.path` escaping | ✅ Met |
| 6 | No regressions to existing functionality | ⚠️ Partially met — false positive syntax hint on `route="*"` |
| 7 | Code style consistent with codebase | ✅ Met |

## Notes

- Good implementation overall. The code is clean, well-structured, and follows existing patterns consistently.
- The duplicate wildcard detection mirrors the existing duplicate state/ref detection pattern — nice consistency.
- The hover documentation is thorough and will help developers understand the fallback chain without leaving the editor.
- The only actionable issue is adding `'route'` to `skipSyntaxCheck` to prevent a false positive diagnostic on `route="*"`. This is a one-line fix.
