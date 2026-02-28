// ═══════════════════════════════════════════════════════════════════════
//  DIRECTIVES: bind, bind-html, bind-*, model
// ═══════════════════════════════════════════════════════════════════════

import { _watchExpr } from "../globals.js";
import { evaluate, _execStatement } from "../evaluate.js";
import { findContext, _sanitizeHtml } from "../dom.js";
import { registerDirective } from "../registry.js";

registerDirective("bind", {
  priority: 20,
  init(el, name, expr) {
    const ctx = findContext(el);
    function update() {
      const val = evaluate(expr, ctx);
      el.textContent = (val !== undefined && val !== null) ? String(val) : '';
    }
    _watchExpr(expr, ctx, update);
    update();
  },
});

registerDirective("bind-html", {
  priority: 20,
  init(el, name, expr) {
    const ctx = findContext(el);
    function update() {
      const val = evaluate(expr, ctx);
      if (val != null) el.innerHTML = _sanitizeHtml(String(val));
    }
    _watchExpr(expr, ctx, update);
    update();
  },
});

registerDirective("bind-*", {
  priority: 20,
  init(el, name, expr) {
    const attrName = name.replace("bind-", "");
    const ctx = findContext(el);

    // Two-way binding for value
    if (
      attrName === "value" &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT")
    ) {
      el.addEventListener("input", () => {
        const val = el.type === "number" ? Number(el.value) : el.value;
        _execStatement(`${expr} = ${JSON.stringify(val)}`, ctx);
      });
    }

    function update() {
      const val = evaluate(expr, ctx);
      // Boolean attributes
      if (
        [
          "disabled",
          "readonly",
          "checked",
          "selected",
          "hidden",
          "required",
        ].includes(attrName)
      ) {
        if (val) el.setAttribute(attrName, "");
        else el.removeAttribute(attrName);
        if (attrName in el) el[attrName] = !!val;
        return;
      }
      if (val != null) el.setAttribute(attrName, String(val));
      else el.removeAttribute(attrName);
    }
    _watchExpr(expr, ctx, update);
    update();
  },
});

registerDirective("model", {
  priority: 20,
  init(el, name, expr) {
    const ctx = findContext(el);
    const tag = el.tagName;
    const type = el.type;

    // Model → DOM
    function update() {
      const val = evaluate(expr, ctx);
      if (tag === "INPUT" && type === "checkbox") {
        el.checked = !!val;
      } else if (tag === "INPUT" && type === "radio") {
        el.checked = el.value === String(val);
      } else if (tag === "SELECT") {
        el.value = val != null ? String(val) : "";
      } else {
        el.value = val != null ? String(val) : "";
      }
    }

    // DOM → Model
    const event =
      tag === "SELECT" || type === "checkbox" || type === "radio"
        ? "change"
        : "input";
    el.addEventListener(event, () => {
      let val;
      if (type === "checkbox") val = el.checked;
      else if (type === "number" || type === "range") val = Number(el.value);
      else val = el.value;
      _execStatement(`${expr} = __val`, ctx, { __val: val });
    });

    ctx.$watch(update);
    update();
  },
});
