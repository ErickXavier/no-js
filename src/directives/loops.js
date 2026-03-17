// ═══════════════════════════════════════════════════════════════════════
//  DIRECTIVES: each, foreach
// ═══════════════════════════════════════════════════════════════════════

import { createContext } from "../context.js";
import { _watchExpr } from "../globals.js";
import { evaluate, resolve } from "../evaluate.js";
import { findContext, _cloneTemplate } from "../dom.js";
import { registerDirective, processTree, _disposeChildren } from "../registry.js";
import { _animateOut } from "../animations.js";

registerDirective("each", {
  priority: 10,
  init(el, name, expr) {
    const ctx = findContext(el);
    const match = expr.match(/^(\w+)\s+in\s+(\S+)$/);
    if (!match) return;
    const [, itemName, listPath] = match;
    const tplId = el.getAttribute("template");
    const elseTpl = el.getAttribute("else");
    const keyExpr = el.getAttribute("key");
    const animEnter =
      el.getAttribute("animate-enter") || el.getAttribute("animate");
    const animLeave = el.getAttribute("animate-leave");
    const stagger = parseInt(el.getAttribute("animate-stagger")) || 0;
    const animDuration = parseInt(el.getAttribute("animate-duration")) || 0;
    let prevList = null;

    function update() {
      let list = /[\[\]()\s+\-*\/!?:&|]/.test(listPath)
        ? evaluate(listPath, ctx)
        : resolve(listPath, ctx);
      if (!Array.isArray(list)) return;

      // If same list reference and items are rendered, skip re-render
      // and just propagate the notification to child contexts so their
      // watchers (bind, show, model, etc.) can react to parent changes
      // without destroying/recreating the DOM (preserves input focus).
      if (list === prevList && list.length > 0 && el.children.length > 0) {
        for (const child of el.children) {
          if (child.__ctx && child.__ctx.$notify) child.__ctx.$notify();
        }
        return;
      }
      prevList = list;

      // Empty state
      if (list.length === 0 && elseTpl) {
        const clone = _cloneTemplate(elseTpl);
        if (clone) {
          _disposeChildren(el);
          el.innerHTML = "";
          el.appendChild(clone);
          processTree(el);
        }
        return;
      }

      const tpl = tplId ? document.getElementById(tplId) : null;
      if (!tpl) return;

      // Animate out old items if animate-leave is set
      if (animLeave && el.children.length > 0) {
        const oldItems = [...el.children];
        let remaining = oldItems.length;
        oldItems.forEach((child) => {
          const target = child.firstElementChild || child;
          target.classList.add(animLeave);
          const done = () => {
            target.classList.remove(animLeave);
            remaining--;
            if (remaining <= 0) renderItems(tpl, list);
          };
          target.addEventListener("animationend", done, { once: true });
          setTimeout(done, animDuration || 2000);
        });
      } else {
        renderItems(tpl, list);
      }
    }

    function renderItems(tpl, list) {
      const count = list.length;
      _disposeChildren(el);
      el.innerHTML = "";

      list.forEach((item, i) => {
        const childData = {
          [itemName]: item,
          $index: i,
          $count: count,
          $first: i === 0,
          $last: i === count - 1,
          $even: i % 2 === 0,
          $odd: i % 2 !== 0,
        };
        const childCtx = createContext(childData, ctx);

        const clone = tpl.content.cloneNode(true);
        const wrapper = document.createElement("div");
        wrapper.style.display = "contents";
        wrapper.__ctx = childCtx;
        wrapper.appendChild(clone);
        el.appendChild(wrapper);
        processTree(wrapper);

        if (animEnter) {
          const firstChild = wrapper.firstElementChild;
          if (firstChild) {
            firstChild.classList.add(animEnter);
            firstChild.addEventListener("animationend", () => firstChild.classList.remove(animEnter), { once: true });
            // Stagger animation — delay must be on the child, not the wrapper
            if (stagger) {
              firstChild.style.animationDelay = i * stagger + "ms";
            }
          }
        }
      });
    }

    _watchExpr(expr, ctx, update);
    update();
  },
});

registerDirective("foreach", {
  priority: 10,
  init(el, name, itemName) {
    const ctx = findContext(el);
    const fromPath = el.getAttribute("from");
    const indexName = el.getAttribute("index") || "$index";
    const elseTpl = el.getAttribute("else");
    const filterExpr = el.getAttribute("filter");
    const sortProp = el.getAttribute("sort");
    const limit = parseInt(el.getAttribute("limit")) || Infinity;
    const offset = parseInt(el.getAttribute("offset")) || 0;
    const tplId = el.getAttribute("template");
    const animEnter = el.getAttribute("animate-enter") || el.getAttribute("animate");
    const animLeave = el.getAttribute("animate-leave");
    const stagger = parseInt(el.getAttribute("animate-stagger")) || 0;
    const animDuration = parseInt(el.getAttribute("animate-duration")) || 0;

    if (!fromPath || !itemName) return;

    const templateContent = tplId
      ? null // Will use external template
      : el.cloneNode(true); // Use the element itself as template

    function update() {
      let list = resolve(fromPath, ctx);
      if (!Array.isArray(list)) return;

      // Filter
      if (filterExpr) {
        list = list.filter((item, i) => {
          const tempCtx = createContext(
            { [itemName]: item, [indexName]: i },
            ctx,
          );
          return !!evaluate(filterExpr, tempCtx);
        });
      }

      // Sort
      if (sortProp) {
        const desc = sortProp.startsWith("-");
        const key = desc ? sortProp.slice(1) : sortProp;
        list = [...list].sort((a, b) => {
          const va = resolve(key, a) ?? a?.[key];
          const vb = resolve(key, b) ?? b?.[key];
          const r = va < vb ? -1 : va > vb ? 1 : 0;
          return desc ? -r : r;
        });
      }

      // Offset and limit
      list = list.slice(offset, offset + limit);

      // Empty
      if (list.length === 0 && elseTpl) {
        const clone = _cloneTemplate(elseTpl);
        if (clone) {
          _disposeChildren(el);
          el.innerHTML = "";
          el.appendChild(clone);
          processTree(el);
        }
        return;
      }

      const tpl = tplId ? document.getElementById(tplId) : null;
      const count = list.length;

      function renderForeachItems() {
        _disposeChildren(el);
        el.innerHTML = "";
        list.forEach((item, i) => {
          const childData = {
            [itemName]: item,
            [indexName]: i,
            $index: i,
            $count: count,
            $first: i === 0,
            $last: i === count - 1,
            $even: i % 2 === 0,
            $odd: i % 2 !== 0,
          };
          const childCtx = createContext(childData, ctx);

          let clone;
          if (tpl) {
            clone = tpl.content.cloneNode(true);
          } else {
            clone = templateContent.cloneNode(true);
          }

          const wrapper = document.createElement("div");
          wrapper.style.display = "contents";
          wrapper.__ctx = childCtx;
          wrapper.appendChild(clone);
          el.appendChild(wrapper);
          processTree(wrapper);

          if (animEnter) {
            const firstChild = wrapper.firstElementChild;
            if (firstChild) {
              firstChild.classList.add(animEnter);
              firstChild.addEventListener("animationend", () => firstChild.classList.remove(animEnter), { once: true });
              // Stagger animation — delay must be on the child, not the wrapper
              if (stagger) {
                firstChild.style.animationDelay = (i * stagger) + "ms";
              }
            }
          }
        });
      }

      // Animate out old items if animate-leave is set
      if (animLeave && el.children.length > 0) {
        const oldItems = [...el.children];
        let remaining = oldItems.length;
        oldItems.forEach((child) => {
          const target = child.firstElementChild || child;
          target.classList.add(animLeave);
          const done = () => {
            target.classList.remove(animLeave);
            remaining--;
            if (remaining <= 0) renderForeachItems();
          };
          target.addEventListener("animationend", done, { once: true });
          setTimeout(done, animDuration || 2000);
        });
      } else {
        renderForeachItems();
      }
    }

    _watchExpr(fromPath, ctx, update);
    update();
  },
});
