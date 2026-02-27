// ═══════════════════════════════════════════════════════════════════════
//  DOM HELPERS & REMOTE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════

import { _config, _log, _warn } from "./globals.js";
import { createContext } from "./context.js";
import { resolveUrl } from "./fetch.js";

// ─── Template HTML cache: url → html string ────────────────────────────────
// Avoids re-fetching the same .tpl file on repeat navigation.
// Controlled by _config.templates.cache (default: true).
export const _templateHtmlCache = new Map();

export function findContext(el) {
  let node = el;
  while (node) {
    if (node.__ctx) return node.__ctx;
    node = node.parentElement;
  }
  return createContext();
}

export function _clearDeclared(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) walker.currentNode.__declared = false;
}

export function _cloneTemplate(id) {
  if (!id) return null;
  const cleanId = id.startsWith("#") ? id.slice(1) : id;
  const tpl = document.getElementById(cleanId);
  if (!tpl) return null;
  return tpl.content ? tpl.content.cloneNode(true) : null;
}

// Simple HTML sanitizer
export function _sanitizeHtml(html) {
  if (!_config.sanitize) return html;
  const safe = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=/gi, "data-blocked=")
    .replace(/javascript:/gi, "");
  return safe;
}

// Resolve a template src path.
// - "./foo.tpl"  → relative to the parent template's folder (__srcBase)
// - "/foo.tpl"   → absolute from server root (kept as-is for fetch)
// - "foo.tpl"    → relative to page URL (kept as-is for fetch)
function _resolveTemplateSrc(src, tpl) {
  if (src.startsWith("./")) {
    // Walk up to find the nearest ancestor with __srcBase
    let node = tpl.parentNode;
    while (node) {
      if (node.__srcBase) {
        return node.__srcBase + src.slice(2);
      }
      node = node.parentNode;
    }
    // No ancestor base found — strip "./" and let fetch resolve from page
    return src.slice(2);
  }
  // Absolute or plain relative — use the existing resolveUrl logic
  return resolveUrl(src, tpl);
}

export async function _loadRemoteTemplates(root) {
  const scope = root || document;
  const templates = scope.querySelectorAll("template[src]");
  _log("[LRT] called on", scope === document ? "document" : scope.nodeName || "fragment", "— found", templates.length, "template[src]", [...templates].map(t => t.getAttribute("src")));
  if (!templates.length) return;
  const promises = [...templates].map(async (tpl) => {
    if (tpl.__srcLoaded) { _log("[LRT] SKIP (already loaded):", tpl.getAttribute("src")); return; }
    tpl.__srcLoaded = true;
    const src = tpl.getAttribute("src");
    const resolvedUrl = _resolveTemplateSrc(src, tpl);
    // Track the folder of this template so children can use "./" paths
    const baseFolder = resolvedUrl.substring(0, resolvedUrl.lastIndexOf("/") + 1);
    try {
      const useCache = _config.templates.cache !== false;
      let html;
      if (useCache && _templateHtmlCache.has(resolvedUrl)) {
        html = _templateHtmlCache.get(resolvedUrl);
        _log("[LRT] CACHE HIT:", resolvedUrl);
      } else {
        const res = await fetch(resolvedUrl);
        html = await res.text();
        if (useCache) _templateHtmlCache.set(resolvedUrl, html);
      }
      tpl.innerHTML = html;
      // Stamp the base folder onto the content so nested templates inherit it
      if (tpl.content) {
        tpl.content.__srcBase = baseFolder;
      }
      _log("Loaded remote template:", src, "→", resolvedUrl);
      // Recursively load nested remote templates
      await _loadRemoteTemplates(tpl.content || tpl);
      // Non-route templates are content-includes: replace them with
      // their loaded content so it actually renders (template elements
      // are inert — the browser never displays their .content).
      if (!tpl.hasAttribute("route") && tpl.parentNode) {
        // Transfer __srcBase to a wrapper so descendants keep the reference
        const frag = tpl.content;
        const children = [...frag.childNodes];
        const parent = tpl.parentNode;
        const ref = tpl.nextSibling;
        parent.removeChild(tpl);
        for (const child of children) {
          if (child.nodeType === 1) child.__srcBase = child.__srcBase || baseFolder;
          parent.insertBefore(child, ref);
        }
      }
    } catch (e) {
      _warn("Failed to load template:", src, e.message);
    }
  });
  await Promise.all(promises);
}

// ─── Single-element loader (core primitive) ────────────────────────────────
export async function _loadTemplateElement(tpl) {
  const src = tpl.getAttribute("src");
  if (tpl.__srcLoaded) { _log("[LTE] SKIP (already loaded):", src); return; }
  _log("[LTE] START fetch:", src, "| route:", tpl.hasAttribute("route"), "| inDOM:", document.contains(tpl), "| loading:", tpl.getAttribute("loading"));
  tpl.__srcLoaded = true;
  const resolvedUrl = _resolveTemplateSrc(src, tpl);
  const baseFolder = resolvedUrl.substring(0, resolvedUrl.lastIndexOf("/") + 1);

  // Synchronously insert loading placeholder before the fetch begins
  let loadingMarker = null;
  const loadingId = tpl.getAttribute("loading");
  if (loadingId && tpl.parentNode) {
    const cleanId = loadingId.startsWith("#") ? loadingId.slice(1) : loadingId;
    const source = document.getElementById(cleanId);
    if (source && source.content) {
      loadingMarker = document.createElement("span");
      loadingMarker.style.cssText = "display:contents";
      loadingMarker.appendChild(source.content.cloneNode(true));
      tpl.parentNode.insertBefore(loadingMarker, tpl);
    }
  }

  try {
    const useCache = _config.templates.cache !== false;
    let html;
    if (useCache && _templateHtmlCache.has(resolvedUrl)) {
      html = _templateHtmlCache.get(resolvedUrl);
      _log("[LTE] CACHE HIT:", resolvedUrl);
    } else {
      const res = await fetch(resolvedUrl);
      html = await res.text();
      if (useCache) _templateHtmlCache.set(resolvedUrl, html);
    }
    tpl.innerHTML = html;
    if (tpl.content) {
      tpl.content.__srcBase = baseFolder;
    }
    _log("Loaded remote template:", src, "→", resolvedUrl);
    // Route templates: defer nested loading until after DOM insertion
    // (ensures loading="#id" placeholder lookup via getElementById works).
    // Content-include templates: load nested ones now.
    if (!tpl.hasAttribute("route")) {
      await _loadRemoteTemplates(tpl.content || tpl);
    }
    // Remove loading placeholder once real content is ready
    if (loadingMarker) loadingMarker.remove();
    // Non-route templates are content-includes: inject content inline
    if (!tpl.hasAttribute("route") && tpl.parentNode) {
      const frag = tpl.content;
      const children = [...frag.childNodes];
      const parent = tpl.parentNode;
      const ref = tpl.nextSibling;
      parent.removeChild(tpl);
      for (const child of children) {
        if (child.nodeType === 1) child.__srcBase = child.__srcBase || baseFolder;
        parent.insertBefore(child, ref);
      }
    }
  } catch (e) {
    if (loadingMarker) loadingMarker.remove();
    _warn("Failed to load template:", src, e.message);
  }
}

// ─── Inline template includes (template[include="id"]) ────────────────────
// Synchronously clones a named inline template into every
// <template include="id"> placeholder. Called before any async fetch
// so skeleton/include content is stamped into the DOM immediately.
export function _processTemplateIncludes(root) {
  const scope = root || document;
  scope.querySelectorAll("template[include]").forEach((tpl) => {
    const id = tpl.getAttribute("include");
    const source = document.getElementById(id.startsWith("#") ? id.slice(1) : id);
    if (!source || !source.content) return;
    tpl.replaceWith(source.content.cloneNode(true));
  });
}

// ─── Phase 1 loader (priority + eager non-route + active route) ────────────
export async function _loadRemoteTemplatesPhase1(defaultRoutePath) {
  const all = [...document.querySelectorAll("template[src]")];

  // Phase 0: lazy="priority" templates — load first, regardless of route type
  const phase0 = all.filter(
    (tpl) => !tpl.__srcLoaded && tpl.getAttribute("lazy") === "priority"
  );
  await Promise.all(phase0.map(_loadTemplateElement));

  // Phase 1: non-route templates + the route matching defaultRoutePath
  // Skip lazy="ondemand" and lazy="priority" (already handled above)
  const phase1 = all.filter((tpl) => {
    if (tpl.__srcLoaded) return false;
    const lazy = tpl.getAttribute("lazy");
    if (lazy === "ondemand" || lazy === "priority") return false;
    const isRoute = tpl.hasAttribute("route");
    if (!isRoute) return true; // content-include: always Phase 1
    // Route template: only include if it matches the current default path
    return defaultRoutePath != null && tpl.getAttribute("route") === defaultRoutePath;
  });
  await Promise.all(phase1.map(_loadTemplateElement));
}

// ─── Phase 2 loader (background preload of remaining route templates) ──────
export function _loadRemoteTemplatesPhase2() {
  const all = [...document.querySelectorAll("template[src]")];
  const phase2 = all.filter((tpl) => {
    if (tpl.__srcLoaded) return false;
    if (tpl.getAttribute("lazy") === "ondemand") return false;
    return tpl.hasAttribute("route");
  });
  return Promise.all(phase2.map(_loadTemplateElement));
}
