// ═══════════════════════════════════════════════════════════════════════
//  DIRECTIVES: state, store, computed, watch
// ═══════════════════════════════════════════════════════════════════════

import { _stores, _log } from "../globals.js";
import { createContext } from "../context.js";
import { evaluate, _execStatement } from "../evaluate.js";
import { findContext } from "../dom.js";
import { registerDirective } from "../registry.js";

registerDirective("state", {
  priority: 0,
  init(el, name, value) {
    const data = evaluate(value, createContext()) || {};
    const parent = el.parentElement ? findContext(el.parentElement) : null;
    const ctx = createContext(data, parent);
    el.__ctx = ctx;

    // Persistence
    const persist = el.getAttribute("persist");
    const persistKey = el.getAttribute("persist-key");
    if (persist && persistKey) {
      const store =
        persist === "localStorage"
          ? localStorage
          : persist === "sessionStorage"
            ? sessionStorage
            : null;
      if (store) {
        try {
          const saved = store.getItem("nojs_state_" + persistKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            for (const [k, v] of Object.entries(parsed)) ctx.$set(k, v);
          }
        } catch {
          /* ignore */
        }
        ctx.$watch(() => {
          try {
            store.setItem(
              "nojs_state_" + persistKey,
              JSON.stringify(ctx.__raw),
            );
          } catch {
            /* ignore */
          }
        });
      }
    }

    _log("state", data);
  },
});

registerDirective("store", {
  priority: 0,
  init(el, name, storeName) {
    const valueAttr = el.getAttribute("value");
    if (!storeName) return;
    if (!_stores[storeName]) {
      const data = valueAttr
        ? evaluate(valueAttr, createContext()) || {}
        : {};
      _stores[storeName] = createContext(data);
    }
    _log("store", storeName);
  },
});

registerDirective("computed", {
  priority: 2,
  init(el, name, computedName) {
    const expr = el.getAttribute("expr");
    if (!computedName || !expr) return;
    const ctx = findContext(el);
    function update() {
      const val = evaluate(expr, ctx);
      ctx.$set(computedName, val);
    }
    ctx.$watch(update);
    update();
  },
});

registerDirective("watch", {
  priority: 2,
  init(el, name, watchExpr) {
    const ctx = findContext(el);
    const onChange = el.getAttribute("on:change");
    let lastVal = evaluate(watchExpr, ctx);
    ctx.$watch(() => {
      const newVal = evaluate(watchExpr, ctx);
      if (newVal !== lastVal) {
        const oldVal = lastVal;
        lastVal = newVal;
        if (onChange)
          _execStatement(onChange, ctx, { $old: oldVal, $new: newVal });
      }
    });
  },
});
