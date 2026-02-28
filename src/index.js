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
} from "./globals.js";
import { _i18n } from "./i18n.js";
import { createContext } from "./context.js";
import { evaluate, resolve } from "./evaluate.js";
import { findContext, _loadRemoteTemplates, _loadRemoteTemplatesPhase1, _loadRemoteTemplatesPhase2, _processTemplateIncludes } from "./dom.js";
import { registerDirective, processTree } from "./registry.js";
import { _createRouter } from "./router.js";

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

// ═══════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════════════

function _getDefaultRoutePath() {
  if (typeof window === "undefined") return null;
  const routerCfg = _config.router || {};
  if (routerCfg.mode === "hash") {
    return window.location.hash.slice(1) || "/";
  }
  const base = (routerCfg.base || "/").replace(/\/$/, "");
  return window.location.pathname.replace(base, "") || "/";
}

const NoJS = {
  get baseApiUrl() {
    return _config.baseApiUrl;
  },
  set baseApiUrl(v) {
    _config.baseApiUrl = v;
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
    if (opts.router) _config.router = { ...prevRouter, ...opts.router };
    if (opts.i18n) {
      _config.i18n = { ...prevI18n, ...opts.i18n };
      _i18n.locale = opts.i18n.defaultLocale || _i18n.locale;
    }
  },

  async init(root) {
    if (typeof document === "undefined") return;
    root = root || document.body;
    _log("Initializing...");

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
    if (_config.devtools && typeof window !== "undefined") {
      window.__NOJS_DEVTOOLS__ = {
        stores: _stores,
        config: _config,
        refs: _refs,
        router: _routerInstance,
        filters: Object.keys(_filters),
        validators: Object.keys(_validators),
        version: NoJS.version,
      };
      _log("DevTools enabled — access via window.__NOJS_DEVTOOLS__");
    }
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
    if (opts.locales) _i18n.locales = opts.locales;
    if (opts.defaultLocale) _i18n.locale = opts.defaultLocale;
    if (opts.fallbackLocale) _config.i18n.fallbackLocale = opts.fallbackLocale;
    if (opts.detectBrowser) {
      const browserLang =
        typeof navigator !== "undefined" ? navigator.language : "en";
      if (_i18n.locales[browserLang]) _i18n.locale = browserLang;
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
  version: "1.0.2",
};

export default NoJS;
