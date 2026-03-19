// ═══════════════════════════════════════════════════════════════════════
//  DIRECTIVES: state, store, computed, watch
// ═══════════════════════════════════════════════════════════════════════

import { _stores, _log, _warn, _watchExpr } from "../globals.js";
import { createContext } from "../context.js";
import { evaluate, _execStatement } from "../evaluate.js";
import { findContext } from "../dom.js";
import { registerDirective } from "../registry.js";
import { _devtoolsEmit } from "../devtools.js";

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
    if (persist && !persistKey) {
      _warn(`persist="${persist}" requires a persist-key attribute. State will not be persisted.`);
    }
    if (persist && persistKey) {
      const store =
        persist === "localStorage"
          ? localStorage
          : persist === "sessionStorage"
            ? sessionStorage
            : null;
      if (store) {
        const persistFieldsAttr = el.getAttribute("persist-fields");
        const persistFields = persistFieldsAttr
          ? new Set(persistFieldsAttr.split(",").map((f) => f.trim()))
          : null;
        try {
          const saved = store.getItem("nojs_state_" + persistKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            for (const [k, v] of Object.entries(parsed)) {
              if (!persistFields || persistFields.has(k)) ctx.$set(k, v);
            }
          }
        } catch {
          /* ignore */
        }
        ctx.$watch(() => {
          try {
            const raw = ctx.__raw;
            const data = persistFields
              ? Object.fromEntries(Object.entries(raw).filter(([k]) => persistFields.has(k)))
              : raw;
            store.setItem("nojs_state_" + persistKey, JSON.stringify(data));
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
      _devtoolsEmit("store:created", {
        name: storeName,
        keys: Object.keys(data),
      });
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
    _watchExpr(expr, ctx, update);
    update();
  },
});

registerDirective("watch", {
  priority: 2,
  init(el, name, watchExpr) {
    const ctx = findContext(el);
    const onChange = el.getAttribute("on:change");
    let lastVal = evaluate(watchExpr, ctx);
    _watchExpr(watchExpr, ctx, () => {
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
