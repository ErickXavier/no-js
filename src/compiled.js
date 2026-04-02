// ═══════════════════════════════════════════════════════════════════════
//  COMPILED TEMPLATE UTILITIES
//  Helpers for reading pre-compiled directive indices from elements
// ═══════════════════════════════════════════════════════════════════════

import { _SSR_ATTR } from "./globals.js";

const COMPILED_ATTR = "data-nojs-e";
const CACHE_KEY = "__nojs_compiled_map";

/**
 * Returns true if the element carries a compiled-directives attribute.
 * @param {Element} el
 * @returns {boolean}
 */
export function _hasCompiled(el) {
  return !!(el && el.hasAttribute && el.hasAttribute(COMPILED_ATTR));
}

/**
 * Reads the compiled-directives map from the element's `data-nojs-e`
 * attribute, caches the parsed result on the element, and returns the
 * integer index that corresponds to the given directive name.
 *
 * @param {Element} el
 * @param {string}  directiveName  e.g. "bind", "on:click"
 * @returns {number|null}  The compiled function index, or null if the
 *                         directive is not listed in the map.
 */
export function _getCompiledIndex(el, directiveName) {
  if (!_hasCompiled(el)) return null;

  let map = el[CACHE_KEY];
  if (!map) {
    try {
      map = JSON.parse(el.getAttribute(COMPILED_ATTR));
    } catch (_) {
      return null;
    }
    el[CACHE_KEY] = map;
  }

  const idx = map[directiveName];
  return typeof idx === "number" ? idx : null;
}

// ═══════════════════════════════════════════════════════════════════════
//  SSR / SSG DETECTION HELPERS
//  Used by directives to detect pre-rendered (SSG) content and skip
//  the initial render pass, deferring to hydration instead.
// ═══════════════════════════════════════════════════════════════════════

/**
 * Returns true if the element carries an SSR hydration marker.
 * @param {Element} el
 * @returns {boolean}
 */
export function _hasSSR(el) {
  return !!(el && el.hasAttribute && el.hasAttribute(_SSR_ATTR));
}

/**
 * Returns the SSR type string from the hydration marker attribute.
 * @param {Element} el
 * @returns {string|null}  e.g. "bind", "class", "style", "show", "loop", "if"
 */
export function _getSSRType(el) {
  return el && el.getAttribute ? el.getAttribute(_SSR_ATTR) : null;
}
