// ═══════════════════════════════════════════════════════════════════════
//  DEVTOOLS PROTOCOL
//  Zero-overhead runtime inspection, mutation, and monitoring.
//  All hooks are guarded by _config.devtools — no cost when disabled.
// ═══════════════════════════════════════════════════════════════════════

import { _config, _stores, _refs, _routerInstance } from "./globals.js";
import { _i18n } from "./i18n.js";

// ─── Context registry (populated by createContext when devtools enabled) ────
// Maps __devtoolsId → Proxy reference for inspect/mutate commands.
export const _ctxRegistry = new Map();

// ─── Hostname guard ─────────────────────────────────────────────────────────
// Optional `hostname` param exists for unit-testing without window.location mocking.
export function _isLocalHostname(hostname) {
  if (hostname === undefined) {
    hostname = (typeof window !== "undefined" && window.location) ? window.location.hostname : "";
  }
  return (
    hostname === "" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".localhost")
  );
}

// ─── Emit a devtools event ──────────────────────────────────────────────────
export function _devtoolsEmit(type, data) {
  if (!_config.devtools || typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("nojs:devtools", {
      detail: { type, data, timestamp: Date.now() },
    }),
  );
}

// ─── Serialization helpers ──────────────────────────────────────────────────

function _safeSnapshot(proxy) {
  if (!proxy || !proxy.__isProxy) return null;
  const raw = proxy.__raw;
  const snapshot = {};
  for (const key of Object.keys(raw)) {
    if (key.startsWith("__")) continue;
    const val = raw[key];
    if (val && typeof val === "object" && val.__isProxy) {
      snapshot[key] = _safeSnapshot(val);
    } else {
      try {
        // Verify serializable — drop functions and circular refs
        JSON.stringify(val);
        snapshot[key] = val;
      } catch {
        snapshot[key] = String(val);
      }
    }
  }
  return snapshot;
}

function _elementTag(el) {
  if (!el || !el.tagName) return null;
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.className && typeof el.className === "string"
    ? "." + el.className.trim().split(/\s+/).join(".")
    : "";
  return tag + id + cls;
}

// ─── Inspect commands ───────────────────────────────────────────────────────

function _inspectElement(selector) {
  const el = document.querySelector(selector);
  if (!el) return { error: "Element not found", selector };
  const ctx = el.__ctx;
  return {
    selector,
    tag: _elementTag(el),
    hasContext: !!ctx,
    contextId: ctx?.__raw?.__devtoolsId ?? null,
    data: ctx ? _safeSnapshot(ctx) : null,
    directives: [...el.attributes]
      .filter((a) => !["class", "id", "style"].includes(a.name))
      .map((a) => ({ name: a.name, value: a.value })),
  };
}

function _inspectStore(name) {
  const store = _stores[name];
  if (!store) return { error: "Store not found", name };
  return {
    name,
    contextId: store.__raw?.__devtoolsId ?? null,
    data: _safeSnapshot(store),
  };
}

function _inspectTree(selector) {
  const root = selector ? document.querySelector(selector) : document.body;
  if (!root) return { error: "Root not found", selector };

  function walk(el) {
    const ctx = el.__ctx;
    const node = {
      tag: _elementTag(el),
      contextId: ctx?.__raw?.__devtoolsId ?? null,
      children: [],
    };
    for (const child of el.children) {
      if (child.tagName === "TEMPLATE" || child.tagName === "SCRIPT") continue;
      if (child.__ctx || child.__declared) {
        node.children.push(walk(child));
      }
    }
    return node;
  }

  return walk(root);
}

function _mutateContext(id, key, value) {
  const proxy = _ctxRegistry.get(id);
  if (!proxy) return { error: "Context not found", id };
  proxy[key] = value;
  return { ok: true, id, key };
}

function _mutateStore(name, key, value) {
  const store = _stores[name];
  if (!store) return { error: "Store not found", name };
  store[key] = value;
  return { ok: true, name, key };
}

function _getStats() {
  let listenerCount = 0;
  for (const [, proxy] of _ctxRegistry) {
    if (proxy.__listeners) listenerCount += proxy.__listeners.size;
  }
  return {
    contexts: _ctxRegistry.size,
    stores: Object.keys(_stores).length,
    listeners: listenerCount,
    refs: Object.keys(_refs).length,
    hasRouter: !!_routerInstance,
    locale: _i18n.locale,
  };
}

// ─── Highlight overlay ──────────────────────────────────────────────────────

let _highlightOverlay = null;

function _highlightElement(selector) {
  _unhighlight();
  const el = document.querySelector(selector);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  _highlightOverlay = document.createElement("div");
  _highlightOverlay.id = "__nojs_devtools_highlight__";
  Object.assign(_highlightOverlay.style, {
    position: "fixed",
    top: rect.top + "px",
    left: rect.left + "px",
    width: rect.width + "px",
    height: rect.height + "px",
    background: "rgba(66, 133, 244, 0.25)",
    border: "2px solid rgba(66, 133, 244, 0.8)",
    pointerEvents: "none",
    zIndex: "2147483647",
    borderRadius: "3px",
  });
  document.body.appendChild(_highlightOverlay);
}

function _unhighlight() {
  if (_highlightOverlay) {
    _highlightOverlay.remove();
    _highlightOverlay = null;
  }
}

// ─── Command handler ────────────────────────────────────────────────────────

function _handleDevtoolsCommand(event) {
  const { command, args = {} } = event.detail || {};
  let result;

  switch (command) {
    case "inspect:element":
      result = _inspectElement(args.selector);
      break;
    case "inspect:store":
      result = _inspectStore(args.name);
      break;
    case "inspect:tree":
      result = _inspectTree(args.selector);
      break;
    case "mutate:context":
      result = _mutateContext(args.id, args.key, args.value);
      break;
    case "mutate:store":
      result = _mutateStore(args.name, args.key, args.value);
      break;
    case "get:config":
      result = { ..._config };
      break;
    case "get:routes":
      result = _routerInstance ? _routerInstance.routes || [] : [];
      break;
    case "get:stats":
      result = _getStats();
      break;
    case "highlight:element":
      _highlightElement(args.selector);
      result = { ok: true };
      break;
    case "unhighlight":
      _unhighlight();
      result = { ok: true };
      break;
    default:
      result = { error: "Unknown command", command };
  }

  // Respond with result
  window.dispatchEvent(
    new CustomEvent("nojs:devtools:response", {
      detail: { command, result, timestamp: Date.now() },
    }),
  );
}

// ─── Initialization ─────────────────────────────────────────────────────────

export function initDevtools(nojs) {
  if (!_config.devtools || typeof window === "undefined") return;

  if (!_isLocalHostname()) {
    console.warn("[No.JS] devtools: true is ignored outside local environments. Remove devtools: true before deploying to production.");
    return;
  }

  // Listen for commands
  window.addEventListener("nojs:devtools:cmd", _handleDevtoolsCommand);

  // Expose public API on window
  window.__NOJS_DEVTOOLS__ = {
    // Data access
    stores: _stores,
    config: _config,
    refs: _refs,
    router: _routerInstance,
    version: nojs.version,

    // Inspect API
    inspect: (selector) => _inspectElement(selector),
    inspectStore: (name) => _inspectStore(name),
    inspectTree: (selector) => _inspectTree(selector),
    stats: () => _getStats(),

    // Mutation API
    mutate: (id, key, value) => _mutateContext(id, key, value),
    mutateStore: (name, key, value) => _mutateStore(name, key, value),

    // Visual
    highlight: (selector) => _highlightElement(selector),
    unhighlight: () => _unhighlight(),

    // Event subscription shorthand
    on: (type, fn) => {
      const handler = (e) => {
        if (!type || e.detail.type === type) fn(e.detail);
      };
      window.addEventListener("nojs:devtools", handler);
      return () => window.removeEventListener("nojs:devtools", handler);
    },
  };

  console.log("[No.JS DevTools] enabled — access via window.__NOJS_DEVTOOLS__");
}
