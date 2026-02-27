// ═══════════════════════════════════════════════════════════════════════
//  i18n SYSTEM
// ═══════════════════════════════════════════════════════════════════════

import { _config } from "./globals.js";

export const _i18n = {
  locale: "en",
  locales: {},
  t(key, params = {}) {
    const messages =
      _i18n.locales[_i18n.locale] ||
      _i18n.locales[_config.i18n.fallbackLocale] ||
      {};
    let msg = key.split(".").reduce((o, k) => o?.[k], messages);
    if (msg == null) return key;

    // Pluralization: "one item | {count} items"
    if (
      typeof msg === "string" &&
      msg.includes("|") &&
      params.count != null
    ) {
      const forms = msg.split("|").map((s) => s.trim());
      msg = Number(params.count) === 1 ? forms[0] : forms[1] || forms[0];
    }

    // Interpolation: {name}
    if (typeof msg === "string") {
      msg = msg.replace(/\{(\w+)\}/g, (_, k) =>
        params[k] != null ? params[k] : "",
      );
    }
    return msg;
  },
};
