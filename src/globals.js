// ═══════════════════════════════════════════════════════════════════════
//  SHARED STATE & UTILITIES
// ═══════════════════════════════════════════════════════════════════════

export const _config = {
  baseApiUrl: "",
  headers: {},
  timeout: 10000,
  retries: 0,
  retryDelay: 1000,
  credentials: "same-origin",
  csrf: null,
  cache: { strategy: "none", ttl: 300000 },
  templates: { cache: true },
  router: { mode: "history", base: "/", scrollBehavior: "top" },
  i18n: { defaultLocale: "en", fallbackLocale: "en", detectBrowser: false },
  debug: false,
  devtools: false,
  csp: null,
  sanitize: true,
};

export const _interceptors = { request: [], response: [] };
export const _eventBus = {};
export const _stores = {};
export const _storeWatchers = new Set();
export const _filters = {};
export const _validators = {};
export const _cache = new Map();
export const _refs = {};
export let _routerInstance = null;

export function setRouterInstance(r) {
  _routerInstance = r;
}

export function _log(...args) {
  if (_config.debug) console.log("[No.JS]", ...args);
}

export function _warn(...args) {
  console.warn("[No.JS]", ...args);
}

export function _notifyStoreWatchers() {
  for (const fn of _storeWatchers) fn();
}

export function _watchExpr(expr, ctx, fn) {
  ctx.$watch(fn);
  if (typeof expr === "string" && expr.includes("$store")) {
    _storeWatchers.add(fn);
  }
}

export function _emitEvent(name, data) {
  (_eventBus[name] || []).forEach((fn) => fn(data));
}
