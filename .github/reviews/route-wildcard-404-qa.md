# QA Review: Route Wildcard / 404 Catch-All

**Date**: 2026-03-16
**Reviewer**: QA Reviewer Agent
**Spec**: `.github/specs/route-wildcard-404/spec.md`

## Verdict: ❌ BLOCKED

## Summary

Reviewed all new test files for the wildcard 404 catch-all feature across both repos and ran the full test suites. Unit tests pass in both NoJS (987/987) and NoJS-LSP (204/204). However, **all 4 new E2E tests in `routing-404.spec.ts` are failing**, indicating the wildcard feature is not functioning correctly in the built IIFE bundle served to E2E tests. Additionally, **4 pre-existing E2E failures** exist in `forms.spec.ts`. These E2E failures block the review.

## Test Execution Results

### NoJS Framework — Unit Tests
- **Total**: 987 | **Passed**: 987 | **Failed**: 0 | **Skipped**: 0
- Status: ✅ All passing

### NoJS Framework — E2E Tests
- **Total**: 119 | **Passed**: 111 | **Failed**: 8 | **Skipped**: 0
- Browsers: Chromium ❌ | Firefox N/A | WebKit N/A
- Status: ❌ Failures detected (4 new + 4 pre-existing)

### NoJS LSP — Unit Tests
- **Total**: 204 | **Passed**: 204 | **Failed**: 0 | **Skipped**: 0
- Status: ✅ All passing

### Coverage (new code)
| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| `src/router.js` | 95.6% | 88.29% | 100% | 96.51% |
| `src/dom.js` | 96.44% | 90.67% | 95% | 98.6% |

**Coverage target (≥80%)**: ✅ Met

## Pre-existing Failures

| Test | File | Error | Pre-existing? |
|------|------|-------|--------------|
| `8 — Auto-detect HTML5 required (no validate="")` | `e2e/tests/forms.spec.ts:94` | `expect(locator).not.toBeEmpty() failed` | Yes |
| `13 — firstError and errorCount` | `e2e/tests/forms.spec.ts:173` | `expect(locator).toHaveText(expected) failed` | Yes |
| `14 — validate-if conditional validation` | `e2e/tests/forms.spec.ts:188` | `expect(locator).toHaveCount(expected) failed` | Yes |
| `16 — Error template reference` | `e2e/tests/forms.spec.ts:228` | Assertion failure | Yes |

**Pre-existing failures are blockers** — they indicate instability in the codebase that must be resolved.

## New E2E Failures (Feature-Related)

| Test | File | Error | Analysis |
|------|------|-------|----------|
| `1 — Custom 404 page renders for unmatched route` | `e2e/tests/routing-404.spec.ts:12` | `getByTestId('page-404')` not found — element(s) not found | Wildcard template content not rendering in outlet |
| `2 — Go Home link on 404 page navigates back to home` | `e2e/tests/routing-404.spec.ts:21` | `getByTestId('page-404')` not found | Same root cause as test 1 |
| `3 — Valid route renders correctly after visiting 404` | `e2e/tests/routing-404.spec.ts:38` | `getByTestId('page-404')` not found | Same root cause as test 1 |
| `4 — Built-in 404 renders when no wildcard is defined` | `e2e/tests/routing-404.spec.ts:54` | `toContainText('404')` — received `"Not Found"` | Built-in 404 HTML not injected; outlet shows raw "Not Found" text instead |

**Root cause**: The IIFE bundle (`dist/iife/no.js`) may not have been rebuilt after the wildcard feature was implemented in source. Alternatively, the wildcard init/rendering logic is not wiring up correctly in a real browser environment. The unit tests pass because they test source modules directly with mocking, but the E2E tests exercise the built bundle. **Action: rebuild (`node build.js`) and re-run E2E tests. If failures persist, debug the wildcard rendering path in the IIFE build.**

## Files Reviewed

| File | Type | Status | Issues |
|------|------|--------|--------|
| `__tests__/router.test.js` (wildcard block) | Unit | ✅ | Good quality, 16 tests covering all spec scenarios |
| `__tests__/dom.test.js` (HTTP error blocks) | Unit | ✅ | Good quality, 5 tests covering HTTP error and success paths |
| `e2e/tests/routing-404.spec.ts` | E2E | ❌ | All 4 tests failing — see failures above |
| `e2e/examples/routing-404.html` | E2E fixture | ⚠️ | Missing accessibility test, see warnings |
| `e2e/examples/routing-no-wildcard.html` | E2E fixture | ✅ | Clean and minimal |

## Issues

### Critical ❌

- **[e2e/tests/routing-404.spec.ts:all]** All 4 E2E tests are failing. The wildcard feature is not working in the E2E environment. This must be investigated before the feature can ship.
  **Suggestion**: Run `node build.js` to rebuild the IIFE bundle, then re-run E2E tests. If failures persist, inspect the page in the Playwright trace to see what the outlet actually contains when navigating to an unmatched route.

- **[e2e/tests/forms.spec.ts:94,173,188,228]** 4 pre-existing E2E test failures in form validation tests. These are unrelated to this feature but indicate codebase instability.
  **Suggestion**: These should be investigated and fixed as a separate task. They may be caused by a prior feature change that wasn't accompanied by E2E test updates.

### Warnings ⚠️

- **[e2e/playwright.config.ts:L16-21]** E2E config only includes Chromium browser. Firefox and WebKit projects are **not configured**. Per QA standards, E2E tests should run cross-browser.
  **Suggestion**: Add Firefox and WebKit projects to the Playwright config. This is a project-wide issue, not specific to this feature.

- **[e2e/tests/routing-404.spec.ts]** No accessibility test using `@axe-core/playwright`. Per QA standards, each E2E fixture page should have at least one accessibility test.
  **Suggestion**: Add a test like: `test('5 — 404 page is accessible', async ({ page }) => { /* axe scan */ })` for both `routing-404.html` and `routing-no-wildcard.html`.

- **[__tests__/router.test.js:L2098-2120]** The "fallback chain — local then global" test verifies that a sidebar outlet without a local wildcard falls back to the global wildcard. However, it doesn't verify the sidebar renders the *global* wildcard content specifically (it just checks `.global-404` exists). The assertion is correct but could be more explicit about what is being tested by asserting that the sidebar does NOT have the built-in 404.
  **Suggestion**: Add `expect(sidebarOutlet.innerHTML).not.toContain('Page not found')` to confirm the global wildcard won (not the built-in fallback).

- **[__tests__/router.test.js]** Missing test for acceptance criterion #14 (wildcard templates support `i18n-ns`). While this is a general template feature, the spec explicitly calls it out.
  **Suggestion**: Add a test verifying that `<template route="*" i18n-ns="errors">` works correctly.

### Suggestions 💡

- **[e2e/tests/routing-404.spec.ts]** Consider adding an E2E test for the `$route.matched` value being accessible in a conditional template (e.g., `show="!$route.matched"`). The unit tests cover this, but an E2E test would add confidence.

- **[__tests__/router.test.js]** Consider adding a test for the edge case where the routes array is completely empty (no routes at all, no wildcard) — every navigation should show the built-in 404.

## Acceptance Criteria Coverage

| # | Criterion | Unit Test | E2E Test | Status |
|---|-----------|-----------|----------|--------|
| 1 | `<template route="*">` recognized as catch-all | ✅ (registration test) | ❌ (failing) | Partial |
| 2 | Wildcard rendered when no explicit route matches | ✅ (default outlet test) | ❌ (failing) | Partial |
| 3 | Wildcard never matched when explicit route exists | ✅ (explicit routes win) | N/A | Covered |
| 4 | `$route.path` accessible in wildcard template | ✅ ($route.path test) | ❌ (failing) | Partial |
| 5 | `$route.matched` is false for wildcard | ✅ (matched=false test) | N/A | Covered |
| 6 | `$route.matched` is true for explicit match | ✅ (matched=true test) | N/A | Covered |
| 7 | Built-in 404 injected when no wildcard defined | ✅ (built-in 404 test) | ❌ (failing) | Partial |
| 8 | Developer wildcard overrides built-in | ✅ (override test) | N/A | Covered |
| 9 | Named outlets can have own wildcard | ✅ (named outlet test) | N/A | Covered |
| 10 | Named outlet falls back to global wildcard | ✅ (fallback chain test) | N/A | Covered |
| 11 | Built-in 404 used when no wildcard exists anywhere | ✅ (built-in 404 test) | ❌ (failing) | Partial |
| 12 | Wildcard supports `src` attribute | ✅ (src test) | N/A | Covered |
| 13 | Wildcard supports `guard` and `redirect` | ✅ (guard test) | N/A | Covered |
| 14 | Wildcard supports `i18n-ns` | ❌ | N/A | **Gap** |
| 15 | `_loadTemplateElement()` checks `res.ok` | ✅ (HTTP 404/500 tests) | N/A | Covered |
| 16 | `_loadRemoteTemplates()` checks `res.ok` | ✅ (HTTP error test) | N/A | Covered |
| 17 | File-based routing 404 triggers wildcard fallback | ✅ (file-based 404 test) | N/A | Covered |
| 18 | Built-in 404 uses only inline styles | ✅ (implicitly via built-in 404 test) | N/A | Covered |
| 19 | All existing router tests pass | ✅ (987/987) | ❌ (E2E failures) | Partial |
| 20 | `route="*"` not prefetched | ✅ (implicit — not in routes) | N/A | Covered |

**Coverage gap**: Acceptance criterion #14 (`i18n-ns` support on wildcard templates) has no dedicated test.

## Flakiness Risk

| Test | Risk | Reason |
|------|------|--------|
| E2E test 1 — Custom 404 renders | 🟢 Low | Uses auto-retrying `toBeVisible()`, no timing dependencies |
| E2E test 2 — Go Home link | 🟢 Low | Click + visibility assertion, clean pattern |
| E2E test 3 — Valid route after 404 | 🟢 Low | Same clean pattern |
| E2E test 4 — Built-in 404 | 🟢 Low | Uses `toContainText` with retry |
| Unit: wildcard with src (fetch mock) | 🟢 Low | Properly mocked, no real network |
| Unit: file-based routing 404 | 🟢 Low | Properly mocked, deterministic |

No tests identified as high flakiness risk. All properly use auto-retrying assertions and mocked network calls.

## Notes

1. **Build step may be missing**: The most likely root cause for all 4 E2E failures is that the IIFE bundle was not rebuilt after implementing the wildcard feature in source. The unit tests work because they import source modules directly. Rebuilding via `node build.js` and re-running E2E tests should confirm.

2. **Cross-browser testing gap**: The Playwright config only tests Chromium. Firefox and WebKit should be added project-wide (not feature-specific).

3. **No skipped tests found**: All test files are clean — no `.skip`, `xit`, `xtest`, or `xdescribe` usage.

4. **Test quality is generally good**: Tests follow arrange-act-assert pattern, are isolated with proper `beforeEach`/`afterEach` cleanup, and use descriptive names. Mocking is appropriate.

5. **Pre-existing form E2E failures**: 4 tests in `forms.spec.ts` are failing independently of this feature. These need to be tracked and resolved separately.
