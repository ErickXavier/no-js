// ═══════════════════════════════════════════════════════════════════════
//  REACTIVE CONTEXT
// ═══════════════════════════════════════════════════════════════════════

import { _stores, _refs, _routerInstance } from "./globals.js";
import { _i18n } from "./i18n.js";

let _batchDepth = 0;
const _batchQueue = new Set();

export function _startBatch() {
  _batchDepth++;
}

export function _endBatch() {
  _batchDepth--;
  if (_batchDepth === 0 && _batchQueue.size > 0) {
    const fns = [..._batchQueue];
    _batchQueue.clear();
    fns.forEach((fn) => fn());
  }
}

export function createContext(data = {}, parent = null) {
  const listeners = new Set();
  const raw = {};
  Object.assign(raw, data);
  let notifying = false;

  function notify() {
    if (notifying) return;
    notifying = true;
    try {
      if (_batchDepth > 0) {
        listeners.forEach((fn) => _batchQueue.add(fn));
      } else {
        listeners.forEach((fn) => fn());
      }
    } finally {
      notifying = false;
    }
  }

  const handler = {
    get(target, key) {
      if (key === "__isProxy") return true;
      if (key === "__raw") return target;
      if (key === "__listeners") return listeners;
      if (key === "$watch")
        return (fn) => {
          listeners.add(fn);
          return () => listeners.delete(fn);
        };
      if (key === "$notify") return notify;
      if (key === "$set")
        return (k, v) => {
          proxy[k] = v;
        };
      if (key === "$parent") return parent;
      if (key === "$refs") return _refs;
      if (key === "$store") return _stores;
      if (key === "$route")
        return _routerInstance ? _routerInstance.current : {};
      if (key === "$router") return _routerInstance;
      if (key === "$i18n") return _i18n;
      if (key === "$form") return target.$form || null;
      if (key in target) return target[key];
      if (parent && parent.__isProxy) return parent[key];
      return undefined;
    },
    set(target, key, value) {
      const old = target[key];
      target[key] = value;
      if (old !== value) notify();
      return true;
    },
    has(target, key) {
      if (key in target) return true;
      if (parent && parent.__isProxy) return key in parent;
      return false;
    },
  };

  const proxy = new Proxy(raw, handler);
  return proxy;
}

// Collect all keys from a context + its parent chain
export function _collectKeys(ctx) {
  const allKeys = new Set();
  const allVals = {};
  let c = ctx;
  while (c && c.__isProxy) {
    const raw = c.__raw;
    for (const k of Object.keys(raw)) {
      if (!allKeys.has(k)) {
        allKeys.add(k);
        allVals[k] = raw[k];
      }
    }
    c = c.$parent;
  }
  return { keys: [...allKeys], vals: allVals };
}
