// ═══════════════════════════════════════════════════════════════════════
//  i18n SYSTEM
// ═══════════════════════════════════════════════════════════════════════

import { _config } from "./globals.js";

const _i18nListeners = new Set();

export function _watchI18n(fn) {
  _i18nListeners.add(fn);
  return () => _i18nListeners.delete(fn);
}

export const _i18n = {
  _locale: "en",
  locales: {},
  get locale() {
    return this._locale;
  },
  set locale(v) {
    if (this._locale !== v) {
      this._locale = v;
      _i18nListeners.forEach((fn) => fn());
    }
  },
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
