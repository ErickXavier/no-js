// ═══════════════════════════════════════════════════════════════════════
//  No.JS — Module Entry Point
//  For npm/ESM/CJS consumers: import NoJS from 'nojs'
// ═══════════════════════════════════════════════════════════════════════

// Core modules
import {
  _config,
  _filters,
  _validators,
  _interceptors,
  _eventBus,
  _stores,
  _refs,
  _routerInstance,
  setRouterInstance,
  _log,
  _notifyStoreWatchers,
} from "./globals.js";
import { _i18n, _loadI18nForLocale } from "./i18n.js";
import { createContext } from "./context.js";
import { evaluate, resolve } from "./evaluate.js";
import { findContext, _loadRemoteTemplates, _loadRemoteTemplatesPhase1, _loadRemoteTemplatesPhase2, _processTemplateIncludes } from "./dom.js";
import { registerDirective, processTree } from "./registry.js";
import { _createRouter } from "./router.js";
import { initDevtools, _devtoolsEmit } from "./devtools.js";

// Side-effect imports: register built-in filters
import "./filters.js";

// Side-effect imports: register all built-in directives
import "./directives/state.js";
import "./directives/http.js";
import "./directives/binding.js";
import "./directives/conditionals.js";
import "./directives/loops.js";
import "./directives/styling.js";
import "./directives/events.js";
import "./directives/refs.js";
import "./directives/validation.js";
import "./directives/i18n.js";
import "./directives/dnd.js";

// ═══════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════════════

function _stripBase(pathname) {
  const base = (_config.router.base || "/").replace(/\/$/, "");
  if (!base) return pathname || "/";
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return pathname.replace(new RegExp("^" + escaped), "") || "/";
}

function _getDefaultRoutePath() {
  if (typeof window === "undefined") return null;
  const routerCfg = _config.router || {};
  if (routerCfg.useHash) {
    return window.location.hash.slice(1) || "/";
  }
  return _stripBase(window.location.pathname);
}

const NoJS = {
  get baseApiUrl() {
    return _config.baseApiUrl;
  },
  set baseApiUrl(v) {
    _config.baseApiUrl = v;
  },

  get locale() {
    return _i18n.locale;
  },
  set locale(v) {
    _i18n.locale = v;
  },

  config(opts = {}) {
    // Save nested objects before shallow assign overwrites them
    const prevHeaders = { ..._config.headers };
    const prevCache = { ..._config.cache };
    const prevTemplates = { ..._config.templates };
    const prevRouter = { ..._config.router };
    const prevI18n = { ..._config.i18n };
    Object.assign(_config, opts);
    if (opts.headers)
      _config.headers = { ...prevHeaders, ...opts.headers };
    if (opts.csrf) _config.csrf = opts.csrf;
    if (opts.cache) _config.cache = { ...prevCache, ...opts.cache };
    if (opts.templates) _config.templates = { ...prevTemplates, ...opts.templates };
    if (opts.router) {
      if ("mode" in opts.router && !("useHash" in opts.router)) {
        _log(
          'router.mode is deprecated. Use router.useHash instead: ' +
          'mode: "hash" → useHash: true, mode: "history" → useHash: false',
          "warn"
        );
        opts.router.useHash = opts.router.mode === "hash";
        delete opts.router.mode;
      }
      _config.router = { ...prevRouter, ...opts.router };
    }
    if (opts.i18n) {
      _config.i18n = { ...prevI18n, ...opts.i18n };
      _i18n.locale = opts.i18n.defaultLocale || _i18n.locale;
    }
    if (opts.stores) {
      for (const [name, data] of Object.entries(opts.stores)) {
        if (!_stores[name]) {
          _stores[name] = createContext(data || {});
          _devtoolsEmit("store:created", { name, keys: Object.keys(data || {}) });
        }
      }
      delete _config.stores;
    }
  },

  async init(root) {
    if (typeof document === "undefined") return;
    if (NoJS._initialized) return;
    NoJS._initialized = true;
    root = root || document.body;
    _log("Initializing...");

    // Load external locale files (blocking — translations must be available for first paint)
    if (_config.i18n.loadPath) {
      const locales = new Set([_i18n.locale, _config.i18n.fallbackLocale]);
      await Promise.all([...locales].map((l) => _loadI18nForLocale(l)));
    }

    // Inline template includes (e.g. skeletons) — synchronous, before any fetch
    _processTemplateIncludes(root);

    // Determine active route path for phase 1 prioritization
    const defaultRoutePath = _getDefaultRoutePath();

    // Phase 1 (blocking): priority + non-route + default route templates
    await _loadRemoteTemplatesPhase1(defaultRoutePath);

    // Check for route-view outlets to activate router
    if (document.querySelector("[route-view]")) {
      setRouterInstance(_createRouter());
    }

    processTree(root); // ← first paint happens here

    // Init router after tree is processed
    if (_routerInstance) await _routerInstance.init();

    _log("Initialized.");

    // Phase 2 (non-blocking): background preload remaining route templates
    _loadRemoteTemplatesPhase2();

    // DevTools integration
    initDevtools(NoJS);
  },

  // Register custom directive
  directive(name, handler) {
    registerDirective(name, handler);
  },

  // Register custom filter
  filter(name, fn) {
    _filters[name] = fn;
  },

  // Register custom validator
  validator(name, fn) {
    _validators[name] = fn;
  },

  // i18n
  i18n(opts) {
    // Set config options BEFORE locale (setter checks loadPath)
    if (opts.loadPath != null) _config.i18n.loadPath = opts.loadPath;
    if (opts.ns) _config.i18n.ns = opts.ns;
    if (opts.cache != null) _config.i18n.cache = opts.cache;
    if (opts.persist != null) _config.i18n.persist = opts.persist;
    if (opts.locales) _i18n.locales = opts.locales;
    if (opts.fallbackLocale) _config.i18n.fallbackLocale = opts.fallbackLocale;

    // Set defaultLocale WITHOUT the setter (avoids overwriting localStorage)
    if (opts.defaultLocale) _i18n._locale = opts.defaultLocale;

    // Restore persisted locale (highest priority)
    if (_config.i18n.persist && typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("nojs-locale");
        if (saved) { _i18n._locale = saved; return; }
      } catch (_) {}
    }

    // Detect browser language (second priority)
    if (opts.detectBrowser) {
      const browserLang =
        typeof navigator !== "undefined" ? navigator.language : "en";
      const prefix = browserLang.split("-")[0];
      if (_i18n.locales[browserLang]) _i18n._locale = browserLang;
      else if (_i18n.locales[prefix]) _i18n._locale = prefix;
    }
  },

  // Event bus
  on(event, fn) {
    if (!_eventBus[event]) _eventBus[event] = [];
    _eventBus[event].push(fn);
    return () => {
      _eventBus[event] = _eventBus[event].filter((f) => f !== fn);
    };
  },

  // Request interceptors
  interceptor(type, fn) {
    if (_interceptors[type]) _interceptors[type].push(fn);
  },

  // Access global stores
  get store() {
    return _stores;
  },

  // Notify global store watchers (for external JS mutations)
  notify() {
    _notifyStoreWatchers();
  },

  // Access router
  get router() {
    return _routerInstance;
  },

  // Utilities (for custom directives)
  createContext,
  evaluate,
  findContext,
  processTree,
  resolve,

  // Version
  version: "1.8.1",
};

export default NoJS;
