#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  No.JS — inject-head-attrs
//
//  Post-build script that scans .html files in dist/ and pre-populates <head>
//  elements for No.JS head-management directives that carry static values.
//
//  Why this script exists
//  ──────────────────────
//  The head-management directives (page-title, page-description, page-canonical,
//  page-jsonld — see PR #27) and the route head attributes on <template route>
//  (PR #34) run at runtime in the browser. That means on the very first load,
//  a crawler or browser sees the <head> without any metadata until JavaScript
//  executes. This script fills in the gap at build time for values that are
//  known statically, so the initial HTML payload already contains the correct
//  <title>, <meta name="description">, <link rel="canonical">, and
//  <script type="application/ld+json"> before any JS runs.
//
//  Companion script: scripts/inject-resource-hints.js (PR #33) handles
//  <link rel="preload|preconnect|prefetch"> for API and template URLs.
//  Run both as part of your build pipeline for maximum effect.
//
//  What is injectable
//  ──────────────────
//  Only static string literals are processed:
//
//    ✅  page-title="'About Us | Store'"        — injected
//    ✅  page-canonical="'/about'"              — injected
//    ✅  page-jsonld body (always JSON)         — injected
//    ❌  page-title="product.name + ' | Store'" — dynamic, skip (runtime handles it)
//    ❌  page-description="product.description" — dynamic, skip (runtime handles it)
//
//  For <template route> head attributes (SSG context):
//  In a server-side-generated site where each route has its own HTML file, the
//  corresponding <template route> element is already present in the file and
//  this script injects its static head attrs. In a standard SPA (single
//  index.html), only the root route template (route="/") is used as a fallback.
//
//  Usage
//  ──────────────────
//    node scripts/inject-head-attrs.js
//    node scripts/inject-head-attrs.js "dist/**/*.html"
//
//  Typical package.json setup:
//    "build": "node build.js && node scripts/inject-head-attrs.js && node scripts/inject-resource-hints.js"
//
//  See docs/md/build-tools.md for full documentation.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import { JSDOM } from "jsdom";

const pattern = process.argv[2] || "dist/**/*.html";
const files = globSync(pattern);

if (files.length === 0) {
  console.warn(`[no-js/head-attrs] No HTML files matched: ${pattern}`);
  process.exit(0);
}

// Returns the string value for a JS string literal expression ('foo' or "foo").
// Returns null for any other expression (dynamic, complex, etc.).
function extractLiteral(expr) {
  if (!expr) return null;
  const m = expr.trim().match(/^(['"])([\s\S]*)\1$/);
  return m ? m[2] : null;
}

// Injects or updates a <title> element in <head>.
function setTitle(head, document, value) {
  let el = head.querySelector("title");
  if (!el) {
    el = document.createElement("title");
    head.appendChild(el);
  }
  el.textContent = value;
}

// Injects or updates <meta name="description">.
function setDescription(head, document, value) {
  let el = head.querySelector('meta[name="description"]');
  if (!el) {
    el = document.createElement("meta");
    el.name = "description";
    head.appendChild(el);
  }
  el.content = value;
}

// Injects or updates <link rel="canonical">.
function setCanonical(head, document, value) {
  let el = head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    head.appendChild(el);
  }
  el.href = value;
}

// Injects or updates <script type="application/ld+json" data-nojs>.
function setJsonLd(head, document, json) {
  let el = head.querySelector('script[type="application/ld+json"][data-nojs]');
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-nojs", "");
    head.appendChild(el);
  }
  el.textContent = json;
}

let totalFiles = 0;
let totalInjected = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const head = document.head;
  let injected = 0;

  // ── Body directives (M1 — PR #27) ─────────────────────────────────────────
  // These are placed as <div hidden page-title="..."> anywhere in the body.
  // Only static string literals are injectable; dynamic expressions are skipped.

  // :not(template[route]) excludes route template head attributes — those are
  // handled below with their own precedence logic.
  for (const el of document.querySelectorAll("[page-title]:not(template[route])")) {
    const val = extractLiteral(el.getAttribute("page-title"));
    if (val == null) continue;
    setTitle(head, document, val);
    injected++;
  }

  for (const el of document.querySelectorAll("[page-description]:not(template[route])")) {
    const val = extractLiteral(el.getAttribute("page-description"));
    if (val == null) continue;
    setDescription(head, document, val);
    injected++;
  }

  for (const el of document.querySelectorAll("[page-canonical]:not(template[route])")) {
    const val = extractLiteral(el.getAttribute("page-canonical"));
    if (val == null) continue;
    setCanonical(head, document, val);
    injected++;
  }

  // page-jsonld: JSON lives in the element body — always static, always injectable.
  for (const el of document.querySelectorAll("[page-jsonld]:not(template[route])")) {
    const json = (el.textContent || el.innerHTML).trim();
    if (!json) continue;
    setJsonLd(head, document, json);
    injected++;
  }

  // ── Route template head attributes (M8 — PR #34, extends M6 — PR #32) ─────
  // <template route="/about" page-title="'About'" page-description="'...'">
  //
  // SSG context: each route's HTML file contains the relevant <template route>.
  // The script processes all <template route> elements found in the file.
  // Body directives (above) take precedence if both are present.
  //
  // SPA context (single index.html): only the root route (route="/") is used
  // as a default fallback for the initial page load.

  const routeTemplates = [...document.querySelectorAll("template[route]")];

  // Prefer an exact "/" route for the SPA default; otherwise use first found.
  const defaultTpl =
    routeTemplates.find((t) => t.getAttribute("route") === "/") ||
    routeTemplates[0];

  for (const tpl of routeTemplates) {
    // In SSG context every template in the file is relevant; in SPA context
    // we only apply the default route's metadata to avoid clobbering.
    const isSpaDefault = tpl === defaultTpl;
    const isOnlyTemplate = routeTemplates.length === 1;
    if (!isSpaDefault && !isOnlyTemplate) continue;

    // Only apply if no body directive already handled it.
    // Use :not(template[route]) so the guard doesn't match the template itself.
    const titleVal = extractLiteral(tpl.getAttribute("page-title"));
    if (titleVal != null && !document.querySelector("[page-title]:not(template[route])")) {
      setTitle(head, document, titleVal);
      injected++;
    }

    const descVal = extractLiteral(tpl.getAttribute("page-description"));
    if (descVal != null && !document.querySelector("[page-description]:not(template[route])")) {
      setDescription(head, document, descVal);
      injected++;
    }

    const canonicalVal = extractLiteral(tpl.getAttribute("page-canonical"));
    if (canonicalVal != null && !document.querySelector("[page-canonical]:not(template[route])")) {
      setCanonical(head, document, canonicalVal);
      injected++;
    }

    const jsonldAttr = tpl.getAttribute("page-jsonld");
    if (jsonldAttr && !document.querySelector("[page-jsonld]:not(template[route])")) {
      setJsonLd(head, document, jsonldAttr);
      injected++;
    }
  }

  if (injected > 0) {
    writeFileSync(file, dom.serialize(), "utf8");
    console.log(`[no-js/head-attrs] ${file}: injected ${injected} head element(s)`);
    totalFiles++;
    totalInjected += injected;
  }
}

console.log(
  `[no-js/head-attrs] Done — ${totalInjected} element(s) across ${totalFiles} file(s).`
);
