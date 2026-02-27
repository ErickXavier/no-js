// ═══════════════════════════════════════════════════════════════════════
//  DIRECTIVES: get, post, put, patch, delete
// ═══════════════════════════════════════════════════════════════════════

import {
  _config,
  _log,
  _warn,
  _stores,
  _notifyStoreWatchers,
  _emitEvent,
  _routerInstance,
} from "../globals.js";
import { createContext } from "../context.js";
import { evaluate, _execStatement, _interpolate } from "../evaluate.js";
import { _doFetch, _cacheGet, _cacheSet } from "../fetch.js";
import { findContext, _clearDeclared, _cloneTemplate } from "../dom.js";
import { registerDirective, processTree } from "../registry.js";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];

for (const method of HTTP_METHODS) {
  registerDirective(method, {
    priority: 1,
    init(el, name, url) {
      const asKey = el.getAttribute("as") || "data";
      const loadingTpl = el.getAttribute("loading");
      const errorTpl = el.getAttribute("error");
      const emptyTpl = el.getAttribute("empty");
      const successTpl = el.getAttribute("success");
      const thenExpr = el.getAttribute("then");
      const redirectPath = el.getAttribute("redirect");
      const confirmMsg = el.getAttribute("confirm");
      const refreshInterval = parseInt(el.getAttribute("refresh")) || 0;
      const cachedRaw = el.getAttribute("cached");
      const cacheStrategy = el.hasAttribute("cached")
        ? cachedRaw || "memory"
        : "none";
      const bodyAttr = el.getAttribute("body");
      const headersAttr = el.getAttribute("headers");
      const varName = el.getAttribute("var");
      const intoStore = el.getAttribute("into");
      const retryCount =
        parseInt(el.getAttribute("retry")) || _config.retries;
      const retryDelay =
        parseInt(el.getAttribute("retry-delay")) || _config.retryDelay || 1000;
      const paramsAttr = el.getAttribute("params");

      const parentCtx = el.parentElement
        ? findContext(el.parentElement)
        : createContext();
      const ctx = el.__ctx || createContext({}, parentCtx);
      el.__ctx = ctx;

      const originalChildren = [...el.childNodes].map((n) =>
        n.cloneNode(true),
      );

      let _activeAbort = null;

      async function doRequest() {
        // SwitchMap: abort previous in-flight request
        if (_activeAbort) _activeAbort.abort();
        _activeAbort = new AbortController();

        // Confirmation
        if (confirmMsg && !window.confirm(confirmMsg)) return;

        let resolvedUrl = _interpolate(url, ctx);

        // Append query params
        if (paramsAttr) {
          const paramsObj = evaluate(paramsAttr, ctx);
          if (paramsObj && typeof paramsObj === "object") {
            const sep = resolvedUrl.includes("?") ? "&" : "?";
            const qs = new URLSearchParams(paramsObj).toString();
            if (qs) resolvedUrl += sep + qs;
          }
        }

        const cacheKey = method + ":" + resolvedUrl;

        // Check cache
        if (method === "get") {
          const cached = _cacheGet(cacheKey, cacheStrategy);
          if (cached != null) {
            ctx.$set(asKey, cached);
            _clearDeclared(el);
            processTree(el);
            return;
          }
        }

        // Show loading
        if (loadingTpl) {
          const clone = _cloneTemplate(loadingTpl);
          if (clone) {
            el.innerHTML = "";
            el.appendChild(clone);
            processTree(el);
          }
        }

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

          // For forms, collect form data
          if (el.tagName === "FORM") {
            const formData = new FormData(el);
            reqBody = Object.fromEntries(formData.entries());
          }

          const extraHeaders = headersAttr ? JSON.parse(headersAttr) : {};
          const savedRetries = _config.retries;
          const savedRetryDelay = _config.retryDelay;
          _config.retries = retryCount;
          _config.retryDelay = retryDelay;
          const data = await _doFetch(
            resolvedUrl,
            method,
            reqBody,
            extraHeaders,
            el,
            _activeAbort.signal,
          );
          _config.retries = savedRetries;
          _config.retryDelay = savedRetryDelay;

          // Cache response
          if (method === "get") _cacheSet(cacheKey, data, cacheStrategy);

          // Check empty
          if (
            emptyTpl &&
            (data == null || (Array.isArray(data) && data.length === 0))
          ) {
            const clone = _cloneTemplate(emptyTpl);
            if (clone) {
              el.innerHTML = "";
              el.appendChild(clone);
              processTree(el);
            }
            return;
          }

          ctx.$set(asKey, data);

          // Write to global store if into attribute is present
          if (intoStore) {
            if (!_stores[intoStore]) _stores[intoStore] = createContext({});
            _stores[intoStore].$set(asKey, data);
            _notifyStoreWatchers();
          }

          // Success template
          if (successTpl) {
            const clone = _cloneTemplate(successTpl);
            if (clone) {
              el.innerHTML = "";
              // Inject var
              const tplEl = document.getElementById(
                successTpl.replace("#", ""),
              );
              const vn = tplEl?.getAttribute("var") || varName || "result";
              const childCtx = createContext({ [vn]: data }, ctx);
              const wrapper = document.createElement("div");
              wrapper.style.display = "contents";
              wrapper.__ctx = childCtx;
              wrapper.appendChild(clone);
              el.appendChild(wrapper);
              processTree(wrapper);
            }
          } else {
            // Restore original children and re-process
            el.innerHTML = "";
            for (const child of originalChildren)
              el.appendChild(child.cloneNode(true));
            _clearDeclared(el);
            processTree(el);
          }

          // Then expression
          if (thenExpr) _execStatement(thenExpr, ctx, { result: data });

          // Redirect
          if (redirectPath && _routerInstance)
            _routerInstance.push(redirectPath);

          _emitEvent("fetch:success", { url: resolvedUrl, data });
        } catch (err) {
          // SwitchMap: silently ignore aborted requests
          if (err.name === "AbortError") return;

          _warn(
            `${method.toUpperCase()} ${resolvedUrl} failed:`,
            err.message,
          );
          _emitEvent("fetch:error", { url: resolvedUrl, error: err });
          _emitEvent("error", { url: resolvedUrl, error: err });

          if (errorTpl) {
            const clone = _cloneTemplate(errorTpl);
            if (clone) {
              el.innerHTML = "";
              const tplEl = document.getElementById(
                errorTpl.replace("#", ""),
              );
              const vn = tplEl?.getAttribute("var") || "err";
              const childCtx = createContext(
                {
                  [vn]: {
                    message: err.message,
                    status: err.status,
                    body: err.body,
                  },
                },
                ctx,
              );
              const wrapper = document.createElement("div");
              wrapper.style.display = "contents";
              wrapper.__ctx = childCtx;
              wrapper.appendChild(clone);
              el.appendChild(wrapper);
              processTree(wrapper);
            }
          }
        }
      }

      // For forms, intercept submit
      if (el.tagName === "FORM" && method !== "get") {
        el.addEventListener("submit", (e) => {
          e.preventDefault();
          doRequest();
        });
      } else if (method === "get") {
        doRequest();
      } else {
        // Non-GET on non-FORM: attach click listener
        el.addEventListener("click", (e) => {
          e.preventDefault();
          doRequest();
        });
      }

      // Reactive URL watching: re-fetch when {expressions} in URL change
      const hasInterpolation = /\{[^}]+\}/.test(url);
      if (hasInterpolation) {
        const debounceMs = parseInt(el.getAttribute("debounce")) || 0;
        let _lastResolvedUrl = _interpolate(url, ctx);
        let _debounceTimer = null;

        function onAncestorChange() {
          const newUrl = _interpolate(url, ctx);
          if (newUrl !== _lastResolvedUrl) {
            _lastResolvedUrl = newUrl;
            if (_debounceTimer) clearTimeout(_debounceTimer);
            if (debounceMs > 0) {
              _debounceTimer = setTimeout(doRequest, debounceMs);
            } else {
              doRequest();
            }
          }
        }

        // Watch all ancestor contexts for changes
        let ancestor = parentCtx;
        while (ancestor && ancestor.__isProxy) {
          ancestor.$watch(onAncestorChange);
          ancestor = ancestor.$parent;
        }
      }

      // Polling
      if (refreshInterval > 0) {
        setInterval(doRequest, refreshInterval);
      }
    },
  });
}
