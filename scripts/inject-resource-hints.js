#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  No.JS — inject-resource-hints
//
//  Post-build script that scans all .html files in dist/ (or a custom glob)
//  and injects <link> resource hints into <head> based on No.JS attributes:
//
//    rel="preload"     ← for every static get= URL (no {interpolation})
//    rel="preconnect"  ← once per unique external origin found in get= URLs
//    rel="prefetch"    ← for every <template route> with a src= attribute
//
//  Hints injected at build time are in the initial HTML payload, so the
//  browser sees them before any JavaScript executes — maximising their
//  impact on LCP and TTFB.
//
//  Usage:
//    node scripts/inject-resource-hints.js
//    node scripts/inject-resource-hints.js "dist/**/*.html"
//
//  Add to package.json:
//    "build": "node build.js && node scripts/inject-resource-hints.js"
//
//  Dependencies:
//    jsdom and glob are already devDependencies (used by the test suite).
//
//  Note on crossorigin:
//    All injected hints use crossorigin="anonymous". This is correct for
//    same-origin and public cross-origin APIs. For APIs that require
//    credentials (cookies, Authorization header), the hint must use
//    crossorigin="use-credentials"; in that case, write the hint manually
//    in <head> rather than relying on this script.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import { JSDOM } from "jsdom";

const pattern = process.argv[2] || "dist/**/*.html";
const files = globSync(pattern);

if (files.length === 0) {
  console.warn(`[no-js/hints] No HTML files matched: ${pattern}`);
  process.exit(0);
}

let total = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const head = document.head;
  let injected = 0;

  // ── preload + preconnect ── from static get= URLs ──────────────────────────
  for (const el of document.querySelectorAll("[get]")) {
    const url = el.getAttribute("get");
    if (!url || /[{}]/.test(url)) continue; // skip dynamic URLs

    // preload
    if (!head.querySelector(`link[rel="preload"][href="${url}"]`)) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = url;
      link.as = "fetch";
      link.crossOrigin = "anonymous";
      head.appendChild(link);
      injected++;
    }

    // preconnect (external origins only)
    try {
      const origin = new URL(url, "http://localhost").origin;
      if (
        origin !== "http://localhost" &&
        !head.querySelector(`link[rel="preconnect"][href="${origin}"]`)
      ) {
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = origin;
        link.crossOrigin = "anonymous";
        head.appendChild(link);
        injected++;
      }
    } catch (_) {}
  }

  // ── prefetch ── from route templates with external src= ───────────────────
  for (const el of document.querySelectorAll("template[route][src]")) {
    const src = el.getAttribute("src");
    if (!src || head.querySelector(`link[rel="prefetch"][href="${src}"]`))
      continue;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = src;
    link.as = "fetch";
    link.crossOrigin = "anonymous";
    head.appendChild(link);
    injected++;
  }

  if (injected > 0) {
    writeFileSync(file, dom.serialize());
    console.log(`[no-js/hints] ${file}: +${injected} hint(s)`);
    total += injected;
  }
}

console.log(`[no-js/hints] Done. ${total} hint(s) injected across ${files.length} file(s).`);
