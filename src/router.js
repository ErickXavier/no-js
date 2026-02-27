// ═══════════════════════════════════════════════════════════════════════
//  CLIENT-SIDE ROUTER
// ═══════════════════════════════════════════════════════════════════════

import { _config, _stores, _log } from "./globals.js";
import { createContext } from "./context.js";
import { evaluate } from "./evaluate.js";
import { findContext, _clearDeclared, _loadTemplateElement, _processTemplateIncludes } from "./dom.js";
import { processTree } from "./registry.js";
import { _animateIn } from "./animations.js";

export function _createRouter() {
  const routes = [];
  let current = { path: "", params: {}, query: {}, hash: "" };
  const listeners = new Set();

  function _getOrCreateEntry(path) {
    let entry = routes.find((r) => r.path === path);
    if (!entry) {
      entry = { path, outlets: {} };
      routes.push(entry);
    }
    return entry;
  }

  function parseQuery(search) {
    const params = {};
    new URLSearchParams(search).forEach((v, k) => {
      params[k] = v;
    });
    return params;
  }

  function matchRoute(path) {
    for (const route of routes) {
      const paramNames = [];
      const pattern = route.path.replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return "([^/]+)";
      });
      const regex = new RegExp("^" + pattern + "$");
      const match = path.match(regex);
      if (match) {
        const params = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        return { route, params };
      }
    }
    return null;
  }

  async function navigate(path, replace = false) {
    const hashIdx = path.indexOf("#");
    const hash = hashIdx >= 0 ? path.slice(hashIdx + 1) : "";
    const withoutHash = hashIdx >= 0 ? path.slice(0, hashIdx) : path;
    const [cleanPath, search = ""] = withoutHash.split("?");

    current = {
      path: cleanPath,
      params: {},
      query: parseQuery(search),
      hash: hash ? "#" + hash : "",
    };

    const matched = matchRoute(cleanPath);
    if (matched) {
      current.params = matched.params;

      // Guard check
      const tpl = matched.route.outlets?.["default"];
      const guardExpr = tpl?.getAttribute("guard");
      const redirectPath = tpl?.getAttribute("redirect");

      if (guardExpr) {
        const ctx = createContext({}, null);
        ctx.__raw.$store = _stores;
        ctx.__raw.$route = current;
        const allowed = evaluate(guardExpr, ctx);
        if (!allowed && redirectPath) {
          await navigate(redirectPath, true);
          return;
        }
      }
    }

    // Update URL
    if (_config.router.mode === "hash") {
      const newHash = "#" + path;
      if (replace) window.location.replace(newHash);
      else window.location.hash = path;
    } else {
      const fullPath = _config.router.base.replace(/\/$/, "") + path;
      if (replace) window.history.replaceState({}, "", fullPath);
      else window.history.pushState({}, "", fullPath);
    }

    // Render
    await _renderRoute(matched);
    listeners.forEach((fn) => fn(current));

    // Scroll to anchor if hash is present (e.g. route="/docs#cheatsheet")
    if (current.hash) {
      const anchorId = current.hash.slice(1);
      requestAnimationFrame(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  async function _renderRoute(matched) {
    const outletEls = document.querySelectorAll("[route-view]");
    for (const outletEl of outletEls) {
      // Determine outlet name ("" or missing attribute value → "default")
      const outletAttr = outletEl.getAttribute("route-view");
      const outletName = outletAttr && outletAttr.trim() !== "" ? outletAttr.trim() : "default";

      // Find the template for this outlet in the matched route
      const tpl = matched?.route?.outlets?.[outletName];

      // Always clear first
      outletEl.innerHTML = "";

      if (tpl) {
        // Load template on-demand if not yet fetched
        if (tpl.getAttribute("src") && !tpl.__srcLoaded) {
          _log("Loading route template on demand:", tpl.getAttribute("src"));
          await _loadTemplateElement(tpl);
        }

        const clone = tpl.content.cloneNode(true);

        const routeCtx = createContext(
          { $route: current },
          findContext(outletEl),
        );
        const wrapper = document.createElement("div");
        wrapper.style.display = "contents";
        wrapper.__ctx = routeCtx;
        // Preserve __srcBase so nested ./relative template paths resolve correctly.
        // cloneNode() copies DOM nodes but NOT custom JS properties, so we must
        // re-stamp it on the wrapper element (which IS in the ancestor chain).
        if (tpl.content.__srcBase) wrapper.__srcBase = tpl.content.__srcBase;
        wrapper.appendChild(clone);
        // Insert into live DOM first so nested template loading has DOM access
        // (required for loading="#id" skeleton placeholder lookups via getElementById)
        outletEl.appendChild(wrapper);

        // Process inline template includes synchronously (e.g. template[include])
        _processTemplateIncludes(wrapper);
        // Load each nested template individually via _loadTemplateElement so that:
        //   1. The loading="#id" skeleton placeholder attribute is honoured
        //   2. getElementById can resolve the skeleton (wrapper is already in live DOM)
        //   3. No batch-recursion on a live DOM node (avoids re-entrant fetch loops)
        const nestedTpls = [...wrapper.querySelectorAll("template[src]")];
        _log("[ROUTER] nested templates found in wrapper:", nestedTpls.length, nestedTpls.map(t => t.getAttribute("src") + (t.__srcLoaded ? "[LOADED]" : "[NEW]")));
        await Promise.all(nestedTpls.map(_loadTemplateElement));
        _log("[ROUTER] all nested loads done for route:", current.path);

        const transition = outletEl.getAttribute("transition");
        if (transition) _animateIn(wrapper, null, transition);

        _clearDeclared(wrapper);
        processTree(wrapper);
      }
    }

    // Update active classes
    document.querySelectorAll("[route]").forEach((link) => {
      const routePath = link.getAttribute("route");
      const activeClass = link.getAttribute("route-active") || "active";
      const exactClass = link.getAttribute("route-active-exact");

      if (exactClass) {
        link.classList.toggle(exactClass, current.path === routePath);
      } else if (activeClass && !link.hasAttribute("route-active-exact")) {
        link.classList.toggle(
          activeClass,
          current.path.startsWith(routePath),
        );
      }
    });

    // Scroll behavior
    const scrollBehavior = _config.router.scrollBehavior;
    if (scrollBehavior === "top") {
      window.scrollTo(0, 0);
    } else if (scrollBehavior === "smooth") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // "preserve" — do nothing, keep current scroll position
  }

  function _scrollToAnchor(id, el) {
    el.scrollIntoView({ behavior: "smooth" });

    // Update active class on anchor links that point to "#<id>"
    const selector = 'a[href="#' + id + '"]';
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      if (!a.hasAttribute("route")) {
        a.classList.toggle("active", a.matches(selector));
      }
    });
  }

  const router = {
    get current() {
      return current;
    },
    push(path) {
      return navigate(path);
    },
    replace(path) {
      return navigate(path, true);
    },
    back() {
      window.history.back();
    },
    forward() {
      window.history.forward();
    },
    on(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    register(path, templateEl, outlet = "default") {
      const entry = _getOrCreateEntry(path);
      entry.outlets[outlet] = templateEl;
    },
    async init() {
      // Collect route templates
      document.querySelectorAll("template[route]").forEach((tpl) => {
        const path = tpl.getAttribute("route");
        const outlet = tpl.getAttribute("outlet") || "default";
        const entry = _getOrCreateEntry(path);
        entry.outlets[outlet] = tpl;
      });

      // Bind route links
      document.addEventListener("click", (e) => {
        const link = e.target.closest("[route]");
        if (link && !link.hasAttribute("route-view")) {
          e.preventDefault();
          const path = link.getAttribute("route");
          navigate(path);
          return;
        }

        // In hash mode, intercept plain anchor links (href="#id") so they
        // scroll to the target element instead of conflicting with the router.
        if (_config.router.mode === "hash") {
          const anchor = e.target.closest('a[href^="#"]');
          if (anchor && !anchor.hasAttribute("route")) {
            const href = anchor.getAttribute("href");
            const id = href.slice(1);
            if (id && !id.startsWith("/")) {
              const target = document.getElementById(id);
              if (target) {
                e.preventDefault();
                _scrollToAnchor(id, target);
              }
            }
          }
        }
      });

      // Listen for URL changes
      if (_config.router.mode === "hash") {
        window.addEventListener("hashchange", () => {
          const raw = window.location.hash.slice(1) || "/";
          if (!raw.startsWith("/")) {
            const el = document.getElementById(raw);
            if (el) {
              _scrollToAnchor(raw, el);
              window.history.replaceState(null, "", "#" + current.path);
            }
            return;
          }
          navigate(raw, true);
        });
        // Initial route
        const path = window.location.hash.slice(1) || "/";
        await navigate(path, true);
      } else {
        window.addEventListener("popstate", () => {
          const path =
            window.location.pathname.replace(_config.router.base, "") || "/";
          navigate(path, true);
        });
        const path =
          window.location.pathname.replace(_config.router.base, "") || "/";
        await navigate(path, true);
      }
    },
  };

  return router;
}
