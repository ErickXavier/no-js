// ═══════════════════════════════════════════════════════════════════════
//  No.JS — CDN Entry Point
//  For <script> tag usage: auto-initializes, sets window.NoJS
// ═══════════════════════════════════════════════════════════════════════

import NoJS from "./index.js";

// Expose globally
window.NoJS = NoJS;

// Auto-init on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => NoJS.init());
} else {
  NoJS.init();
}
