// ═══════════════════════════════════════════════════════════════════════
//  DIRECTIVES: on:*, trigger
// ═══════════════════════════════════════════════════════════════════════

import { evaluate, _execStatement } from "../evaluate.js";
import { findContext } from "../dom.js";
import { registerDirective } from "../registry.js";

registerDirective("on:*", {
  priority: 20,
  init(el, name, expr) {
    const ctx = findContext(el);
    const parts = name.replace("on:", "").split(".");
    const event = parts[0];
    const modifiers = new Set(parts.slice(1));

    // Lifecycle hooks
    if (event === "mounted") {
      requestAnimationFrame(() => _execStatement(expr, ctx, { $el: el }));
      return;
    }
    if (event === "init") {
      _execStatement(expr, ctx, { $el: el });
      return;
    }
    if (event === "updated") {
      const updatedObserver = new MutationObserver(() => {
        _execStatement(expr, ctx, { $el: el });
      });
      updatedObserver.observe(el, { childList: true, subtree: true, characterData: true, attributes: true });
      return;
    }
    if (event === "error") {
      window.addEventListener("error", (e) => {
        if (el.contains(e.target) || e.target === el) {
          _execStatement(expr, ctx, { $el: el, $error: e.error || e.message });
        }
      });
      return;
    }
    if (event === "unmounted") {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.removedNodes) {
            if (node === el || node.contains?.(el)) {
              _execStatement(expr, ctx, { $el: el });
              observer.disconnect();
              return;
            }
          }
        }
      });
      if (el.parentElement)
        observer.observe(el.parentElement, { childList: true });
      return;
    }

    // Debounce / throttle
    let debounceMs = 0;
    let throttleMs = 0;
    for (const mod of modifiers) {
      if (/^\d+$/.test(mod)) {
        if (modifiers.has("debounce")) debounceMs = parseInt(mod);
        else if (modifiers.has("throttle")) throttleMs = parseInt(mod);
      }
    }

    let handler = (e) => {
      // Key modifiers
      if (event === "keydown" || event === "keyup" || event === "keypress") {
        const keyMods = [
          "enter",
          "escape",
          "tab",
          "space",
          "delete",
          "backspace",
          "up",
          "down",
          "left",
          "right",
          "ctrl",
          "alt",
          "shift",
          "meta",
        ];
        for (const mod of modifiers) {
          if (!keyMods.includes(mod)) continue;
          if (mod === "enter" && e.key !== "Enter") return;
          if (mod === "escape" && e.key !== "Escape") return;
          if (mod === "tab" && e.key !== "Tab") return;
          if (mod === "space" && e.key !== " ") return;
          if (mod === "delete" && e.key !== "Delete" && e.key !== "Backspace")
            return;
          if (mod === "up" && e.key !== "ArrowUp") return;
          if (mod === "down" && e.key !== "ArrowDown") return;
          if (mod === "left" && e.key !== "ArrowLeft") return;
          if (mod === "right" && e.key !== "ArrowRight") return;
          if (mod === "ctrl" && !e.ctrlKey) return;
          if (mod === "alt" && !e.altKey) return;
          if (mod === "shift" && !e.shiftKey) return;
          if (mod === "meta" && !e.metaKey) return;
        }
      }

      if (modifiers.has("prevent")) e.preventDefault();
      if (modifiers.has("stop")) e.stopPropagation();
      if (modifiers.has("self") && e.target !== el) return;

      _execStatement(expr, ctx, { $event: e, $el: el });
    };

    // Wrap with debounce
    if (debounceMs > 0) {
      const original = handler;
      let timer;
      handler = (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => original(e), debounceMs);
      };
    }

    // Wrap with throttle
    if (throttleMs > 0) {
      const original = handler;
      let last = 0;
      handler = (e) => {
        const now = Date.now();
        if (now - last >= throttleMs) {
          last = now;
          original(e);
        }
      };
    }

    const opts = {};
    if (modifiers.has("once")) opts.once = true;

    el.addEventListener(event, handler, opts);
  },
});

registerDirective("trigger", {
  priority: 20,
  init(el, name, eventName) {
    const ctx = findContext(el);
    const dataExpr = el.getAttribute("trigger-data");
    el.addEventListener("click", () => {
      const detail = dataExpr ? evaluate(dataExpr, ctx) : null;
      el.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true }));
    });
  },
});
