// ═══════════════════════════════════════════════════════════════════════
//  DIRECTIVES: if, else-if, else, show, hide, switch
// ═══════════════════════════════════════════════════════════════════════

import { _watchExpr } from "../globals.js";
import { evaluate } from "../evaluate.js";
import { findContext, _clearDeclared, _cloneTemplate } from "../dom.js";
import { registerDirective, processTree } from "../registry.js";
import { _animateIn, _animateOut } from "../animations.js";

registerDirective("if", {
  priority: 10,
  init(el, name, expr) {
    const ctx = findContext(el);
    const thenId = el.getAttribute("then");
    const elseId = el.getAttribute("else");
    const animEnter =
      el.getAttribute("animate-enter") || el.getAttribute("animate");
    const animLeave = el.getAttribute("animate-leave");
    const transition = el.getAttribute("transition");
    const animDuration = parseInt(el.getAttribute("animate-duration")) || 0;
    const originalChildren = [...el.childNodes].map((n) => n.cloneNode(true));
    let currentState = undefined;

    function update() {
      const result = !!evaluate(expr, ctx);
      if (result === currentState) return;
      currentState = result;

      // Animation leave
      if (animLeave || transition) {
        _animateOut(el, animLeave, transition, () => render(result), animDuration);
      } else {
        render(result);
      }
    }

    function render(result) {
      if (result) {
        if (thenId) {
          const clone = _cloneTemplate(thenId);
          if (clone) {
            el.innerHTML = "";
            el.appendChild(clone);
          }
        } else {
          el.innerHTML = "";
          for (const child of originalChildren)
            el.appendChild(child.cloneNode(true));
        }
      } else {
        if (elseId) {
          const clone = _cloneTemplate(elseId);
          if (clone) {
            el.innerHTML = "";
            el.appendChild(clone);
          }
        } else if (thenId) {
          el.innerHTML = "";
        } else {
          el.innerHTML = "";
        }
      }

      _clearDeclared(el);
      processTree(el);

      // Animation enter
      if (animEnter || transition) {
        _animateIn(el, animEnter, transition, animDuration);
      }
    }

    ctx.$watch(update);
    update();
  },
});

registerDirective("else-if", {
  priority: 10,
  init(el, name, expr) {
    // Works like `if` but checks previous sibling's condition
    const ctx = findContext(el);
    const thenId = el.getAttribute("then");

    function update() {
      // Check if any preceding if/else-if was true
      let prev = el.previousElementSibling;
      while (prev) {
        const prevExpr =
          prev.getAttribute("if") || prev.getAttribute("else-if");
        if (prevExpr) {
          if (evaluate(prevExpr, ctx)) {
            el.innerHTML = "";
            el.style.display = "none";
            return;
          }
        } else break;
        prev = prev.previousElementSibling;
      }

      const result = !!evaluate(expr, ctx);
      el.style.display = "";
      if (result) {
        if (thenId) {
          const clone = _cloneTemplate(thenId);
          if (clone) {
            el.innerHTML = "";
            el.appendChild(clone);
          }
        }
        _clearDeclared(el);
        processTree(el);
      } else {
        el.innerHTML = "";
      }
    }
    ctx.$watch(update);
    update();
  },
});

registerDirective("else", {
  priority: 10,
  init(el) {
    // Skip if this element also has an "if" directive (else is used as an attribute of if)
    if (el.hasAttribute("if")) return;
    const ctx = findContext(el);
    const thenId = el.getAttribute("then");
    const originalChildren = [...el.childNodes].map((n) => n.cloneNode(true));

    function update() {
      // Check if any preceding if/else-if was true
      let prev = el.previousElementSibling;
      while (prev) {
        const prevExpr =
          prev.getAttribute("if") || prev.getAttribute("else-if");
        if (prevExpr) {
          if (evaluate(prevExpr, ctx)) {
            el.innerHTML = "";
            el.style.display = "none";
            return;
          }
        } else break;
        prev = prev.previousElementSibling;
      }

      // No preceding condition was true — show else content
      el.style.display = "";
      if (thenId) {
        const clone = _cloneTemplate(thenId);
        if (clone) {
          el.innerHTML = "";
          el.appendChild(clone);
        }
      } else {
        el.innerHTML = "";
        for (const child of originalChildren)
          el.appendChild(child.cloneNode(true));
      }
      _clearDeclared(el);
      processTree(el);
    }
    ctx.$watch(update);
    update();
  },
});

registerDirective("show", {
  priority: 20,
  init(el, name, expr) {
    const ctx = findContext(el);
    const animEnter = el.getAttribute("animate-enter") || el.getAttribute("animate");
    const animLeave = el.getAttribute("animate-leave");
    const transition = el.getAttribute("transition");
    const animDuration = parseInt(el.getAttribute("animate-duration")) || 0;
    let currentState = undefined;

    function update() {
      const result = !!evaluate(expr, ctx);
      if (result === currentState) return;
      currentState = result;

      if (result) {
        el.style.display = "";
        if (animEnter || transition) _animateIn(el, animEnter, transition, animDuration);
      } else {
        if (animLeave || transition) {
          _animateOut(el, animLeave, transition, () => { el.style.display = "none"; }, animDuration);
        } else {
          el.style.display = "none";
        }
      }
    }
    _watchExpr(expr, ctx, update);
    update();
  },
});

registerDirective("hide", {
  priority: 20,
  init(el, name, expr) {
    const ctx = findContext(el);
    const animEnter = el.getAttribute("animate-enter") || el.getAttribute("animate");
    const animLeave = el.getAttribute("animate-leave");
    const transition = el.getAttribute("transition");
    const animDuration = parseInt(el.getAttribute("animate-duration")) || 0;
    let currentState = undefined;

    function update() {
      const result = !evaluate(expr, ctx);
      if (result === currentState) return;
      currentState = result;

      if (result) {
        el.style.display = "";
        if (animEnter || transition) _animateIn(el, animEnter, transition, animDuration);
      } else {
        if (animLeave || transition) {
          _animateOut(el, animLeave, transition, () => { el.style.display = "none"; }, animDuration);
        } else {
          el.style.display = "none";
        }
      }
    }
    _watchExpr(expr, ctx, update);
    update();
  },
});

registerDirective("switch", {
  priority: 10,
  init(el, name, expr) {
    const ctx = findContext(el);

    function update() {
      const val = evaluate(expr, ctx);
      let matched = false;

      for (const child of [...el.children]) {
        const caseVal = child.getAttribute("case");
        const isDefault = child.hasAttribute("default");
        const thenTpl = child.getAttribute("then");

        if (caseVal) {
          // Support multi-value: case="'a','b'"
          const values = caseVal
            .split(",")
            .map((v) => evaluate(v.trim(), ctx));
          if (!matched && values.includes(val)) {
            matched = true;
            child.style.display = "";
            if (thenTpl) {
              const clone = _cloneTemplate(thenTpl);
              if (clone) {
                child.innerHTML = "";
                child.appendChild(clone);
              }
              child.__declared = false;
              processTree(child);
            }
          } else {
            child.style.display = "none";
          }
        } else if (isDefault) {
          child.style.display = matched ? "none" : "";
          if (!matched && thenTpl) {
            const clone = _cloneTemplate(thenTpl);
            if (clone) {
              child.innerHTML = "";
              child.appendChild(clone);
            }
            child.__declared = false;
            processTree(child);
          }
        }
      }
    }

    ctx.$watch(update);
    update();
  },
});
