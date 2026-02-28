// ═══════════════════════════════════════════════════════════════════════
//  DIRECTIVES: validate, error-boundary
//  HELPER: _validateField
// ═══════════════════════════════════════════════════════════════════════

import { _validators } from "../globals.js";
import { createContext } from "../context.js";
import { findContext, _cloneTemplate } from "../dom.js";
import { registerDirective, processTree } from "../registry.js";

function _validateField(value, rules, allValues) {
  const ruleList = rules.split("|").map((r) => r.trim());
  for (const rule of ruleList) {
    const [name, ...args] = rule.split(":");
    const fn = _validators[name];
    if (fn) {
      const result = fn(value, ...args, allValues);
      if (result !== true && result) return result;
    } else {
      // Built-in validators
      switch (name) {
        case "required":
          if (value == null || String(value).trim() === "")
            return "Required";
          break;
        case "email":
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            return "Invalid email";
          break;
        case "url":
          try {
            new URL(value);
          } catch {
            return "Invalid URL";
          }
          break;
        case "min":
          if (Number(value) < Number(args[0]))
            return `Minimum value is ${args[0]}`;
          break;
        case "max":
          if (Number(value) > Number(args[0]))
            return `Maximum value is ${args[0]}`;
          break;
        case "between": {
          const n = Number(value);
          if (n < Number(args[0]) || n > Number(args[1]))
            return `Must be between ${args[0]} and ${args[1]}`;
          break;
        }
        case "match":
          if (value !== allValues[args[0]]) return `Must match ${args[0]}`;
          break;
        case "phone":
          if (!/^[\d\s\-+()]{7,15}$/.test(value))
            return "Invalid phone number";
          break;
        case "cpf":
          if (!/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(value))
            return "Invalid CPF";
          break;
        case "cnpj":
          if (!/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(value))
            return "Invalid CNPJ";
          break;
        case "creditcard":
          if (!/^\d{13,19}$/.test(value.replace(/\s|-/g, "")))
            return "Invalid card number";
          break;
        case "custom":
          if (args[0] && _validators[args[0]]) {
            const result = _validators[args[0]](value, allValues);
            if (result !== true && result) return result;
          }
          break;
      }
    }
  }
  return null;
}

registerDirective("validate", {
  priority: 30,
  init(el, name, rules) {
    const ctx = findContext(el);

    // If on a form, set up form-level validation
    if (el.tagName === "FORM") {
      const formCtx = {
        valid: false,
        dirty: false,
        touched: false,
        submitting: false,
        errors: {},
        values: {},
        reset: () => {
          formCtx.dirty = false;
          formCtx.touched = false;
          el.reset();
          checkValidity();
        },
      };
      ctx.$set("$form", formCtx);

      function checkValidity() {
        const errors = {};
        const values = {};
        let valid = true;

        for (const field of el.querySelectorAll("input, textarea, select")) {
          if (!field.name) continue;
          values[field.name] = field.value;

          const fieldRules = field.getAttribute("validate");
          if (fieldRules) {
            const err = _validateField(field.value, fieldRules, values);
            if (err) {
              errors[field.name] = err;
              valid = false;
            }
          }

          if (!field.checkValidity()) {
            errors[field.name] =
              errors[field.name] || field.validationMessage;
            valid = false;
          }
        }

        formCtx.valid = valid;
        formCtx.errors = errors;
        formCtx.values = values;
        ctx.$set("$form", { ...formCtx });
      }

      el.addEventListener("input", () => {
        formCtx.dirty = true;
        checkValidity();
      });
      el.addEventListener("focusout", () => {
        formCtx.touched = true;
        checkValidity();
      });
      el.addEventListener("submit", () => {
        formCtx.submitting = true;
        ctx.$set("$form", { ...formCtx });
        requestAnimationFrame(() => {
          formCtx.submitting = false;
          ctx.$set("$form", { ...formCtx });
        });
      });

      // Initial check
      requestAnimationFrame(checkValidity);
      return;
    }

    // Field-level validation
    if (
      rules &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT")
    ) {
      const errorTpl = el.getAttribute("error");
      el.addEventListener("input", () => {
        const err = _validateField(el.value, rules, {});
        if (err && errorTpl) {
          // Show error
          let errorEl = el.nextElementSibling?.__validationError
            ? el.nextElementSibling
            : null;
          if (!errorEl) {
            errorEl = document.createElement("div");
            errorEl.__validationError = true;
            errorEl.style.display = "contents";
            el.parentNode.insertBefore(errorEl, el.nextSibling);
          }
          const clone = _cloneTemplate(errorTpl);
          if (clone) {
            const childCtx = createContext({ err: { message: err } }, ctx);
            errorEl.innerHTML = "";
            errorEl.__ctx = childCtx;
            errorEl.appendChild(clone);
            processTree(errorEl);
          }
        } else {
          const errorEl = el.nextElementSibling?.__validationError
            ? el.nextElementSibling
            : null;
          if (errorEl) errorEl.innerHTML = "";
        }
      });
    }
  },
});

registerDirective("error-boundary", {
  priority: 1,
  init(el, name, fallbackTpl) {
    const ctx = findContext(el);

    function showFallback(message) {
      const clone = _cloneTemplate(fallbackTpl);
      if (clone) {
        const childCtx = createContext(
          { err: { message } },
          ctx,
        );
        el.innerHTML = "";
        const wrapper = document.createElement("div");
        wrapper.style.display = "contents";
        wrapper.__ctx = childCtx;
        wrapper.appendChild(clone);
        el.appendChild(wrapper);
        processTree(wrapper);
      }
    }

    // Listen for NoJS expression errors dispatched from event handlers
    el.addEventListener("nojs:error", (e) => {
      showFallback(e.detail?.message || "An error occurred");
    });

    // Listen for window-level errors (resource load failures, etc.)
    window.addEventListener("error", (e) => {
      if (el.contains(e.target) || el === e.target) {
        showFallback(e.message || "An error occurred");
      }
    });
  },
});
