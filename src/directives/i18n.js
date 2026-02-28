// ═══════════════════════════════════════════════════════════════════════
//  DIRECTIVE: t (i18n translations)
// ═══════════════════════════════════════════════════════════════════════

import { _i18n, _watchI18n } from "../i18n.js";
import { evaluate } from "../evaluate.js";
import { findContext } from "../dom.js";
import { registerDirective } from "../registry.js";

registerDirective("t", {
  priority: 20,
  init(el, name, key) {
    const ctx = findContext(el);

    function update() {
      const params = {};
      for (const attr of [...el.attributes]) {
        if (attr.name.startsWith("t-") && attr.name !== "t") {
          const paramName = attr.name.replace("t-", "");
          params[paramName] = evaluate(attr.value, ctx) ?? attr.value;
        }
      }
      el.textContent = _i18n.t(key, params);
    }

    ctx.$watch(update);
    _watchI18n(update);
    update();
  },
});
