/**
 * Tests for the core injection logic of scripts/inject-head-attrs.js.
 *
 * The build script processes HTML files on disk; here we exercise the same
 * logic against in-memory document objects so the tests run in Jest's jsdom
 * environment without file I/O or subprocess overhead.
 *
 * See scripts/inject-head-attrs.js for the full implementation.
 */

// ── Core helpers (mirrors scripts/inject-head-attrs.js) ──────────────────────

function extractLiteral(expr) {
  if (!expr) return null;
  const m = expr.trim().match(/^(['"])([\s\S]*)\1$/);
  return m ? m[2] : null;
}

function applyHeadAttrs(document) {
  const head = document.head;

  function setTitle(val) {
    let el = head.querySelector("title");
    if (!el) { el = document.createElement("title"); head.appendChild(el); }
    el.textContent = val;
  }
  function setDescription(val) {
    let el = head.querySelector('meta[name="description"]');
    if (!el) { el = document.createElement("meta"); el.name = "description"; head.appendChild(el); }
    el.content = val;
  }
  function setCanonical(val) {
    let el = head.querySelector('link[rel="canonical"]');
    if (!el) { el = document.createElement("link"); el.rel = "canonical"; head.appendChild(el); }
    el.href = val;
  }
  function setJsonLd(json) {
    let el = head.querySelector('script[type="application/ld+json"][data-nojs]');
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.setAttribute("data-nojs", "");
      head.appendChild(el);
    }
    el.textContent = json;
  }

  // Body directives — exclude template[route] elements (handled separately below)
  for (const el of document.querySelectorAll("[page-title]:not(template[route])")) {
    const val = extractLiteral(el.getAttribute("page-title"));
    if (val != null) setTitle(val);
  }
  for (const el of document.querySelectorAll("[page-description]:not(template[route])")) {
    const val = extractLiteral(el.getAttribute("page-description"));
    if (val != null) setDescription(val);
  }
  for (const el of document.querySelectorAll("[page-canonical]:not(template[route])")) {
    const val = extractLiteral(el.getAttribute("page-canonical"));
    if (val != null) setCanonical(val);
  }
  for (const el of document.querySelectorAll("[page-jsonld]:not(template[route])")) {
    const json = (el.textContent || el.innerHTML).trim();
    if (json) setJsonLd(json);
  }

  // Route template head attributes (M8 — PR #34)
  const routeTemplates = [...document.querySelectorAll("template[route]")];
  const defaultTpl =
    routeTemplates.find((t) => t.getAttribute("route") === "/") ||
    routeTemplates[0];

  for (const tpl of routeTemplates) {
    const isSpaDefault = tpl === defaultTpl;
    const isOnlyTemplate = routeTemplates.length === 1;
    if (!isSpaDefault && !isOnlyTemplate) continue;

    const titleVal = extractLiteral(tpl.getAttribute("page-title"));
    if (titleVal != null && !document.querySelector("[page-title]:not(template[route])")) setTitle(titleVal);

    const descVal = extractLiteral(tpl.getAttribute("page-description"));
    if (descVal != null && !document.querySelector("[page-description]:not(template[route])")) setDescription(descVal);

    const canonicalVal = extractLiteral(tpl.getAttribute("page-canonical"));
    if (canonicalVal != null && !document.querySelector("[page-canonical]:not(template[route])")) setCanonical(canonicalVal);

    const jsonldAttr = tpl.getAttribute("page-jsonld");
    if (jsonldAttr && !document.querySelector("[page-jsonld]:not(template[route])")) setJsonLd(jsonldAttr);
  }
}

// ── Test helpers ──────────────────────────────────────────────────────────────

beforeEach(() => {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
});

// ── extractLiteral ────────────────────────────────────────────────────────────

describe("extractLiteral", () => {
  test("extracts single-quoted string", () => {
    expect(extractLiteral("'About Us | Store'")).toBe("About Us | Store");
  });
  test("extracts double-quoted string", () => {
    expect(extractLiteral('"About Us | Store"')).toBe("About Us | Store");
  });
  test("returns null for dynamic expression", () => {
    expect(extractLiteral("product.name + ' | Store'")).toBeNull();
  });
  test("returns null for variable reference", () => {
    expect(extractLiteral("product.description")).toBeNull();
  });
  test("returns null for empty string", () => {
    expect(extractLiteral("")).toBeNull();
  });
  test("returns null for null", () => {
    expect(extractLiteral(null)).toBeNull();
  });
});

// ── page-title ────────────────────────────────────────────────────────────────

describe("inject-head-attrs — page-title", () => {
  test("injects <title> from a static string literal", () => {
    document.body.innerHTML = `<div hidden page-title="'About Us | Store'"></div>`;
    applyHeadAttrs(document);
    expect(document.querySelector("title").textContent).toBe("About Us | Store");
  });

  test("accepts double-quoted literal", () => {
    document.body.innerHTML = `<div hidden page-title='"My Site"'></div>`;
    applyHeadAttrs(document);
    expect(document.querySelector("title").textContent).toBe("My Site");
  });

  test("updates existing <title> in place without duplicating", () => {
    const existing = document.createElement("title");
    existing.textContent = "Old Title";
    document.head.appendChild(existing);
    document.body.innerHTML = `<div hidden page-title="'New Title'"></div>`;
    applyHeadAttrs(document);
    expect(document.querySelectorAll("title").length).toBe(1);
    expect(document.querySelector("title").textContent).toBe("New Title");
  });

  test("skips dynamic expression — title unchanged", () => {
    const existing = document.createElement("title");
    existing.textContent = "Default";
    document.head.appendChild(existing);
    document.body.innerHTML = `<div hidden page-title="product.name + ' | Store'"></div>`;
    applyHeadAttrs(document);
    expect(document.querySelector("title").textContent).toBe("Default");
  });
});

// ── page-description ──────────────────────────────────────────────────────────

describe("inject-head-attrs — page-description", () => {
  test("creates <meta name=description> from a static literal", () => {
    document.body.innerHTML = `<div hidden page-description="'Best sneakers online'"></div>`;
    applyHeadAttrs(document);
    const meta = document.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta.content).toBe("Best sneakers online");
  });

  test("updates existing description meta without duplicating", () => {
    const existing = document.createElement("meta");
    existing.name = "description";
    existing.content = "Old";
    document.head.appendChild(existing);
    document.body.innerHTML = `<div hidden page-description="'New Description'"></div>`;
    applyHeadAttrs(document);
    const metas = document.querySelectorAll('meta[name="description"]');
    expect(metas.length).toBe(1);
    expect(metas[0].content).toBe("New Description");
  });

  test("skips dynamic expression", () => {
    document.body.innerHTML = `<div hidden page-description="product.description"></div>`;
    applyHeadAttrs(document);
    expect(document.querySelector('meta[name="description"]')).toBeNull();
  });
});

// ── page-canonical ────────────────────────────────────────────────────────────

describe("inject-head-attrs — page-canonical", () => {
  test("creates <link rel=canonical> from a static literal", () => {
    document.body.innerHTML = `<div hidden page-canonical="'/about'"></div>`;
    applyHeadAttrs(document);
    const link = document.querySelector('link[rel="canonical"]');
    expect(link).not.toBeNull();
    expect(link.getAttribute("href")).toContain("/about");
  });

  test("updates existing canonical without duplicating", () => {
    const existing = document.createElement("link");
    existing.rel = "canonical";
    existing.href = "/old";
    document.head.appendChild(existing);
    document.body.innerHTML = `<div hidden page-canonical="'/new'"></div>`;
    applyHeadAttrs(document);
    expect(document.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(document.querySelector('link[rel="canonical"]').getAttribute("href")).toContain("/new");
  });

  test("skips dynamic expression", () => {
    document.body.innerHTML = `<div hidden page-canonical="'/products/' + product.slug"></div>`;
    applyHeadAttrs(document);
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });
});

// ── page-jsonld ───────────────────────────────────────────────────────────────

describe("inject-head-attrs — page-jsonld", () => {
  test("injects <script type=application/ld+json data-nojs>", () => {
    document.body.innerHTML = `<div hidden page-jsonld>{"@type":"WebPage","name":"About"}</div>`;
    applyHeadAttrs(document);
    const script = document.querySelector('script[type="application/ld+json"][data-nojs]');
    expect(script).not.toBeNull();
    expect(script.textContent).toContain("WebPage");
  });

  test("updates managed jsonld script without duplicating", () => {
    const existing = document.createElement("script");
    existing.type = "application/ld+json";
    existing.setAttribute("data-nojs", "");
    existing.textContent = '{"@type":"Old"}';
    document.head.appendChild(existing);
    document.body.innerHTML = `<div hidden page-jsonld>{"@type":"New"}</div>`;
    applyHeadAttrs(document);
    const scripts = document.querySelectorAll('script[type="application/ld+json"][data-nojs]');
    expect(scripts.length).toBe(1);
    expect(scripts[0].textContent).toContain('"New"');
  });

  test("does not touch hand-written jsonld (no data-nojs)", () => {
    const manual = document.createElement("script");
    manual.type = "application/ld+json";
    manual.textContent = '{"@type":"Manual"}';
    document.head.appendChild(manual);
    document.body.innerHTML = `<div hidden page-jsonld>{"@type":"Managed"}</div>`;
    applyHeadAttrs(document);
    const all = document.querySelectorAll('script[type="application/ld+json"]');
    expect(all.length).toBe(2);
    expect(all[0].textContent).toContain("Manual");
  });
});

// ── template[route] head attributes ──────────────────────────────────────────

describe("inject-head-attrs — template[route] head attributes", () => {
  test("injects title from root route template (SPA default)", () => {
    document.body.innerHTML = `
      <div route-view></div>
      <template route="/" page-title="'Home | Store'"><h1>Home</h1></template>
      <template route="/about" page-title="'About | Store'"><h1>About</h1></template>
    `;
    applyHeadAttrs(document);
    expect(document.querySelector("title").textContent).toBe("Home | Store");
  });

  test("injects all four attrs from a single route template", () => {
    document.body.innerHTML = `
      <div route-view></div>
      <template route="/"
        page-title="'Home | Store'"
        page-description="'Welcome to our store'"
        page-canonical="'/'"
        page-jsonld='{"@type":"WebSite","name":"Store"}'>
        <h1>Home</h1>
      </template>
    `;
    applyHeadAttrs(document);
    expect(document.querySelector("title").textContent).toBe("Home | Store");
    expect(document.querySelector('meta[name="description"]').content).toBe("Welcome to our store");
    expect(document.querySelector('link[rel="canonical"]').getAttribute("href")).toContain("/");
    const script = document.querySelector('script[type="application/ld+json"][data-nojs]');
    expect(script.textContent).toContain("WebSite");
  });

  test("body directive takes precedence over route template attribute", () => {
    document.body.innerHTML = `
      <div hidden page-title="'Body Title'"></div>
      <template route="/" page-title="'Route Title'"><h1>Home</h1></template>
    `;
    applyHeadAttrs(document);
    expect(document.querySelector("title").textContent).toBe("Body Title");
  });

  test("skips dynamic route template expressions", () => {
    const existing = document.createElement("title");
    existing.textContent = "Default";
    document.head.appendChild(existing);
    document.body.innerHTML = `
      <template route="/" page-title="'Home | ' + $store.name"><h1>Home</h1></template>
    `;
    applyHeadAttrs(document);
    expect(document.querySelector("title").textContent).toBe("Default");
  });

  test("uses only one route template in SPA context (ignores non-default routes)", () => {
    document.body.innerHTML = `
      <template route="/" page-title="'Home'" page-description="'Home desc'"></template>
      <template route="/about" page-title="'About'" page-description="'About desc'"></template>
    `;
    applyHeadAttrs(document);
    expect(document.querySelector("title").textContent).toBe("Home");
    expect(document.querySelector('meta[name="description"]').content).toBe("Home desc");
  });
});
