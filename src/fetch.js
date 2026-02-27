// ═══════════════════════════════════════════════════════════════════════
//  FETCH HELPER, URL RESOLUTION & CACHE
// ═══════════════════════════════════════════════════════════════════════

import { _config, _interceptors, _cache } from "./globals.js";

export function resolveUrl(url, el) {
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//")
  )
    return url;
  let node = el;
  while (node) {
    const base = node.getAttribute?.("base");
    if (base) return base.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
    node = node.parentElement;
  }
  if (_config.baseApiUrl)
    return (
      _config.baseApiUrl.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "")
    );
  return url;
}

export async function _doFetch(
  url,
  method = "GET",
  body = null,
  extraHeaders = {},
  el = null,
  externalSignal = null,
) {
  const fullUrl = resolveUrl(url, el);
  let opts = {
    method: method.toUpperCase(),
    headers: { ...(_config.headers || {}), ...extraHeaders },
    credentials: _config.credentials,
  };

  if (body && method !== "GET") {
    if (typeof body === "string") {
      try {
        JSON.parse(body);
        opts.headers["Content-Type"] = "application/json";
        opts.body = body;
      } catch {
        opts.body = body;
      }
    } else if (body instanceof FormData) {
      opts.body = body;
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
  }

  // CSRF
  if (_config.csrf && method !== "GET") {
    opts.headers[_config.csrf.header || "X-CSRF-Token"] =
      _config.csrf.token || "";
  }

  // Request interceptors
  for (const fn of _interceptors.request) {
    opts = fn(fullUrl, opts) || opts;
  }

  // Retry logic
  const maxRetries = _config.retries || 0;
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        _config.timeout || 10000,
      );
      // Wire external abort signal (switchMap) to internal controller
      if (externalSignal) {
        if (externalSignal.aborted) {
          clearTimeout(timeout);
          throw new DOMException("Aborted", "AbortError");
        }
        externalSignal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
      }
      opts.signal = controller.signal;

      let response = await fetch(fullUrl, opts);
      clearTimeout(timeout);

      // Response interceptors
      for (const fn of _interceptors.response) {
        response = fn(response, fullUrl) || response;
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const err = new Error(errBody.message || `HTTP ${response.status}`);
        err.status = response.status;
        err.body = errBody;
        throw err;
      }

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (e) {
      if (e.name === "AbortError") throw e; // Don't retry aborted requests
      lastError = e;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, _config.retryDelay || 1000));
      }
    }
  }
  throw lastError;
}

export function _cacheGet(key, strategy) {
  if (strategy === "none") return null;
  if (strategy === "memory") {
    const entry = _cache.get(key);
    if (entry && Date.now() - entry.time < (_config.cache.ttl || 300000))
      return entry.data;
    return null;
  }
  const store =
    strategy === "local"
      ? localStorage
      : strategy === "session"
        ? sessionStorage
        : null;
  if (!store) return null;
  try {
    const raw = store.getItem("nojs_cache_" + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.time < (_config.cache.ttl || 300000))
      return entry.data;
    store.removeItem("nojs_cache_" + key);
  } catch {
    /* ignore */
  }
  return null;
}

export function _cacheSet(key, data, strategy) {
  if (strategy === "none") return;
  const entry = { data, time: Date.now() };
  if (strategy === "memory") {
    _cache.set(key, entry);
    return;
  }
  const store =
    strategy === "local"
      ? localStorage
      : strategy === "session"
        ? sessionStorage
        : null;
  if (store) {
    try {
      store.setItem("nojs_cache_" + key, JSON.stringify(entry));
    } catch {
      /* ignore */
    }
  }
}
