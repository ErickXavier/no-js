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
    // key → wrapper div; only populated when the `key` attribute is set.
    const keyMap = new Map();

    function update() {
      let list = /[\[\]()\s+\-*\/!?:&|]/.test(listPath)
        ? evaluate(listPath, ctx)
        : resolve(listPath, ctx);
      if (!Array.isArray(list)) return;

      // Same-reference optimisation: propagate to children without DOM rebuild.
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
          keyMap.clear();
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
      if (keyExpr) {
        reconcileItems(tpl, list);
      } else {
        rebuildItems(tpl, list);
      }
    }

    // Key-based reconciliation: reuses existing wrapper divs for items whose
    // key is still present in the new list, only creating/removing DOM nodes
    // for items that genuinely appeared or disappeared.
    function reconcileItems(tpl, list) {
      const count = list.length;

      // Evaluate the key for every item in the new list up-front.
      const newOrder = list.map((item, i) => {
        const tempCtx = createContext({ [itemName]: item, $index: i }, ctx);
        return { key: evaluate(keyExpr, tempCtx), item, i };
      });

      const nextKeySet = new Set(newOrder.map((e) => e.key));

      // Remove wrappers whose keys are no longer in the list.
      for (const [key, wrapper] of keyMap) {
        if (!nextKeySet.has(key)) {
          _disposeChildren(wrapper);
          wrapper.remove();
          keyMap.delete(key);
        }
      }

      // Create new wrappers and update existing ones.
      newOrder.forEach(({ key, item, i }) => {
        const childData = {
          [itemName]: item,
          $index: i,
          $count: count,
          $first: i === 0,
          $last: i === count - 1,
          $even: i % 2 === 0,
          $odd: i % 2 !== 0,
        };

        if (!keyMap.has(key)) {
          const clone = tpl.content.cloneNode(true);
          const wrapper = document.createElement("div");
          wrapper.style.display = "contents";
          wrapper.__ctx = createContext(childData, ctx);
          wrapper.appendChild(clone);
          keyMap.set(key, wrapper);
          el.appendChild(wrapper); // placed at end; reordered below
          processTree(wrapper);

          if (animEnter) {
            const firstChild = wrapper.firstElementChild;
            if (firstChild) {
              firstChild.classList.add(animEnter);
              firstChild.addEventListener(
                "animationend",
                () => firstChild.classList.remove(animEnter),
                { once: true },
              );
              if (stagger) firstChild.style.animationDelay = i * stagger + "ms";
            }
          }
        } else {
          // Existing item: update positional metadata and notify watchers.
          Object.assign(keyMap.get(key).__ctx.__raw, childData);
          keyMap.get(key).__ctx.$notify();
        }
      });

      // Reorder DOM to match the new list using a single forward pass.
      for (let i = 0; i < newOrder.length; i++) {
        const wrapper = keyMap.get(newOrder[i].key);
        if (wrapper !== el.children[i]) el.insertBefore(wrapper, el.children[i] ?? null);
      }
    }

    // Full rebuild: dispose all children and recreate from scratch.
    // Used when no `key` attribute is set (backward-compatible behaviour).
    function rebuildItems(tpl, list) {
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
    const keyExpr = el.getAttribute("key");
    const animEnter = el.getAttribute("animate-enter") || el.getAttribute("animate");
    const animLeave = el.getAttribute("animate-leave");
    const stagger = parseInt(el.getAttribute("animate-stagger")) || 0;
    const animDuration = parseInt(el.getAttribute("animate-duration")) || 0;

    if (!fromPath || !itemName) return;

    const templateContent = tplId
      ? null // Will use external template
      : el.cloneNode(true); // Use the element itself as template

    // Prevent infinite recursion: strip directive attributes from inline template clone
    if (templateContent) {
      templateContent.removeAttribute("foreach");
      templateContent.removeAttribute("from");
      templateContent.removeAttribute("index");
      templateContent.removeAttribute("filter");
      templateContent.removeAttribute("sort");
      templateContent.removeAttribute("limit");
      templateContent.removeAttribute("offset");
      templateContent.removeAttribute("else");
      templateContent.removeAttribute("template");
      templateContent.removeAttribute("key");
      templateContent.removeAttribute("animate-enter");
      templateContent.removeAttribute("animate");
      templateContent.removeAttribute("animate-leave");
      templateContent.removeAttribute("animate-stagger");
      templateContent.removeAttribute("animate-duration");
    }

    // key → wrapper div; only populated when the `key` attribute is set.
    const keyMap = new Map();

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
          keyMap.clear();
          el.innerHTML = "";
          el.appendChild(clone);
          processTree(el);
        }
        return;
      }

      const tpl = tplId ? document.getElementById(tplId) : null;
      const count = list.length;

      if (keyExpr) {
        reconcileForeachItems(tpl, list, count);
        return;
      }

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

    // Key-based reconciliation for foreach — mirrors each's reconcileItems.
    // Applied to the final (filtered, sorted, sliced) list so keys always
    // correspond to what is actually rendered.
    function reconcileForeachItems(tpl, list, count) {
      const newOrder = list.map((item, i) => {
        const tempCtx = createContext({ [itemName]: item, [indexName]: i }, ctx);
        return { key: evaluate(keyExpr, tempCtx), item, i };
      });

      const nextKeySet = new Set(newOrder.map((e) => e.key));

      for (const [key, wrapper] of keyMap) {
        if (!nextKeySet.has(key)) {
          _disposeChildren(wrapper);
          wrapper.remove();
          keyMap.delete(key);
        }
      }

      newOrder.forEach(({ key, item, i }) => {
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

        if (!keyMap.has(key)) {
          let clone;
          if (tpl) {
            clone = tpl.content.cloneNode(true);
          } else {
            clone = templateContent.cloneNode(true);
          }
          const wrapper = document.createElement("div");
          wrapper.style.display = "contents";
          wrapper.__ctx = createContext(childData, ctx);
          wrapper.appendChild(clone);
          keyMap.set(key, wrapper);
          el.appendChild(wrapper);
          processTree(wrapper);

          if (animEnter) {
            const firstChild = wrapper.firstElementChild;
            if (firstChild) {
              firstChild.classList.add(animEnter);
              firstChild.addEventListener(
                "animationend",
                () => firstChild.classList.remove(animEnter),
                { once: true },
              );
              if (stagger) firstChild.style.animationDelay = i * stagger + "ms";
            }
          }
        } else {
          Object.assign(keyMap.get(key).__ctx.__raw, childData);
          keyMap.get(key).__ctx.$notify();
        }
      });

      for (let i = 0; i < newOrder.length; i++) {
        const wrapper = keyMap.get(newOrder[i].key);
        if (wrapper !== el.children[i]) el.insertBefore(wrapper, el.children[i] ?? null);
      }
    }

    _watchExpr(fromPath, ctx, update);
    update();
  },
});
