// ═══════════════════════════════════════════════════════════════════════
//  DIRECTIVES: ref, use, call
// ═══════════════════════════════════════════════════════════════════════

import {
  _refs,
  _stores,
  _notifyStoreWatchers,
} from "../globals.js";
import { createContext } from "../context.js";
import { evaluate, _execStatement, _interpolate } from "../evaluate.js";
import { _doFetch } from "../fetch.js";
import { findContext, _cloneTemplate } from "../dom.js";
import { registerDirective, processTree } from "../registry.js";

registerDirective("ref", {
  priority: 5,
  init(el, name, refName) {
    _refs[refName] = el;
  },
});

registerDirective("use", {
  priority: 10,
  init(el, name, tplId) {
    const ctx = findContext(el);
    const clone = _cloneTemplate(tplId);
    if (!clone) return;

    // Collect var-* attributes
    const vars = {};
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith("var-")) {
        const varName = attr.name.replace("var-", "");
        vars[varName] = evaluate(attr.value, ctx);
      }
    }

    const childCtx = createContext(vars, ctx);

    // Handle slots
    const slots = {};
    for (const child of [...el.children]) {
      const slotName = child.getAttribute("slot") || "default";
      if (!slots[slotName])
        slots[slotName] = document.createDocumentFragment();
      slots[slotName].appendChild(child.cloneNode(true));
    }

    // Replace <slot> elements in template
    const slotEls = clone.querySelectorAll("slot");
    for (const slotEl of slotEls) {
      const slotName = slotEl.getAttribute("name") || "default";
      if (slots[slotName]) {
        slotEl.replaceWith(slots[slotName]);
      }
    }

    el.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.style.display = "contents";
    wrapper.__ctx = childCtx;
    wrapper.appendChild(clone);
    el.appendChild(wrapper);
    processTree(wrapper);
  },
});

registerDirective("call", {
  priority: 20,
  init(el, name, url) {
    const ctx = findContext(el);
    const method = el.getAttribute("method") || "get";
    const asKey = el.getAttribute("as");
    const intoStore = el.getAttribute("into");
    const successTpl = el.getAttribute("success");
    const errorTpl = el.getAttribute("error");
    const thenExpr = el.getAttribute("then");
    const confirmMsg = el.getAttribute("confirm");
    const bodyAttr = el.getAttribute("body");

    el.addEventListener("click", async (e) => {
      e.preventDefault();
      if (confirmMsg && !window.confirm(confirmMsg)) return;

      const resolvedUrl = _interpolate(url, ctx);
      try {
        let reqBody = null;
        if (bodyAttr) {
          const interpolated = _interpolate(bodyAttr, ctx);
          try {
            reqBody = JSON.parse(interpolated);
          } catch {
            reqBody = interpolated;
          }
        }
        const data = await _doFetch(resolvedUrl, method, reqBody, {}, el);
        if (asKey) ctx.$set(asKey, data);
        if (asKey && intoStore) {
          if (!_stores[intoStore]) _stores[intoStore] = createContext({});
          _stores[intoStore].$set(asKey, data);
          _notifyStoreWatchers();
        }
        if (thenExpr) _execStatement(thenExpr, ctx, { result: data });
        if (successTpl) {
          const clone = _cloneTemplate(successTpl);
          if (clone) {
            const tplEl = document.getElementById(
              successTpl.replace("#", ""),
            );
            const vn = tplEl?.getAttribute("var") || "result";
            const childCtx = createContext({ [vn]: data }, ctx);
            const target = el.closest("[route-view]") || el.parentElement;
            const wrapper = document.createElement("div");
            wrapper.style.display = "contents";
            wrapper.__ctx = childCtx;
            wrapper.appendChild(clone);
            target.appendChild(wrapper);
            processTree(wrapper);
          }
        }
      } catch (err) {
        if (errorTpl) {
          const clone = _cloneTemplate(errorTpl);
          if (clone) {
            const tplEl = document.getElementById(errorTpl.replace("#", ""));
            const vn = tplEl?.getAttribute("var") || "err";
            const childCtx = createContext(
              { [vn]: { message: err.message, status: err.status } },
              ctx,
            );
            const target = el.parentElement;
            const wrapper = document.createElement("div");
            wrapper.style.display = "contents";
            wrapper.__ctx = childCtx;
            wrapper.appendChild(clone);
            target.appendChild(wrapper);
            processTree(wrapper);
          }
        }
      }
    });
  },
});
