<!-- Configuration — from configuration.md -->

<section class="hero-section">
  <span class="badge">API Reference</span>
  <h1 class="hero-title">Configuration &amp; Security</h1>
  <p class="hero-subtitle">Global settings, request interceptors, and security best practices</p>
</section>

<div class="doc-content">

  <!-- Global Settings -->
  <div class="doc-section">
    <h2 class="doc-title">Global Settings</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-fn">NoJS</span>.<span class="hl-fn">config</span>({
    <span class="hl-cmt">// API</span>
    <span class="hl-attr">baseApiUrl</span>: <span class="hl-str">'https://api.myapp.com/v1'</span>,
    <span class="hl-attr">headers</span>: { <span class="hl-str">'Authorization'</span>: <span class="hl-str">'Bearer xxx'</span> },
    <span class="hl-attr">timeout</span>: <span class="hl-num">10000</span>,
    <span class="hl-attr">retries</span>: <span class="hl-num">2</span>,
    <span class="hl-attr">retryDelay</span>: <span class="hl-num">1000</span>,
    <span class="hl-attr">credentials</span>: <span class="hl-str">'include'</span>,    <span class="hl-cmt">// fetch credentials mode</span>

    <span class="hl-cmt">// CSRF</span>
    <span class="hl-attr">csrf</span>: {
      <span class="hl-attr">header</span>: <span class="hl-str">'X-CSRF-Token'</span>,
      <span class="hl-attr">token</span>: <span class="hl-str">'...'</span>
    },

    <span class="hl-cmt">// Caching</span>
    <span class="hl-attr">cache</span>: {
      <span class="hl-attr">strategy</span>: <span class="hl-str">'memory'</span>,     <span class="hl-cmt">// 'none' | 'memory' | 'session' | 'local'</span>
      <span class="hl-attr">ttl</span>: <span class="hl-num">300000</span>              <span class="hl-cmt">// 5 minutes</span>
    },

    <span class="hl-cmt">// Templates</span>
    <span class="hl-attr">templates</span>: {
      <span class="hl-attr">cache</span>: <span class="hl-kw">true</span>               <span class="hl-cmt">// Cache fetched .tpl HTML in memory (default: true)</span>
    },

    <span class="hl-cmt">// Router</span>
    <span class="hl-attr">router</span>: {
      <span class="hl-attr">mode</span>: <span class="hl-str">'history'</span>,        <span class="hl-cmt">// 'history' (default) | 'hash'</span>
      <span class="hl-attr">base</span>: <span class="hl-str">'/'</span>,
      <span class="hl-attr">scrollBehavior</span>: <span class="hl-str">'top'</span>   <span class="hl-cmt">// 'top' | 'preserve' | 'smooth'</span>
    },

    <span class="hl-cmt">// i18n</span>
    <span class="hl-attr">i18n</span>: {
      <span class="hl-attr">defaultLocale</span>: <span class="hl-str">'en'</span>,
      <span class="hl-attr">fallbackLocale</span>: <span class="hl-str">'en'</span>,
      <span class="hl-attr">detectBrowser</span>: <span class="hl-kw">true</span>
    },

    <span class="hl-cmt">// Debugging</span>
    <span class="hl-attr">debug</span>: <span class="hl-kw">true</span>,               <span class="hl-cmt">// Logs directive processing</span>
    <span class="hl-attr">devtools</span>: <span class="hl-kw">true</span>,            <span class="hl-cmt">// Enables browser devtools panel</span>

    <span class="hl-cmt">// Security</span>
    <span class="hl-attr">sanitize</span>: <span class="hl-kw">true</span>,            <span class="hl-cmt">// Sanitize bind-html</span>
    <span class="hl-attr">csp</span>: <span class="hl-str">'strict'</span>              <span class="hl-cmt">// Restrict expressions for CSP compliance</span>
  });
<span class="hl-tag">&lt;/script&gt;</span></pre></div>
  </div>

  <!-- Config Option Details -->
  <div class="doc-section">
    <h2 class="doc-title">Config Option Details</h2>

    <h3 class="doc-title"><code>sanitize</code></h3>
    <p class="doc-text"><strong>Type:</strong> <code>boolean</code> &nbsp;|&nbsp; <strong>Default:</strong> <code>true</code></p>
    <p class="doc-text">Controls whether HTML content rendered via <code>bind-html</code> is sanitized through a DOMPurify-compatible sanitizer. When enabled, all potentially dangerous tags and attributes (e.g., <code>&lt;script&gt;</code>, <code>onerror</code>) are stripped before insertion into the DOM.</p>
    <div class="code-block"><pre><span class="hl-fn">NoJS</span>.<span class="hl-fn">config</span>({ <span class="hl-attr">sanitize</span>: <span class="hl-kw">false</span> }); <span class="hl-cmt">// ⚠ Disable at your own risk — allows raw HTML</span></pre></div>

    <h3 class="doc-title"><code>devtools</code></h3>
    <p class="doc-text"><strong>Type:</strong> <code>boolean</code> &nbsp;|&nbsp; <strong>Default:</strong> <code>false</code></p>
    <p class="doc-text">Enables the No.JS devtools panel, accessible via <code>window.__NOJS_DEVTOOLS__</code>. When active, it exposes reactive state, registered directives, active routes, and component trees for inspection in the browser console.</p>
    <div class="code-block"><pre><span class="hl-fn">NoJS</span>.<span class="hl-fn">config</span>({ <span class="hl-attr">devtools</span>: <span class="hl-kw">true</span> });
<span class="hl-cmt">// Then inspect in console:</span>
<span class="hl-cmt">// window.__NOJS_DEVTOOLS__.state</span>
<span class="hl-cmt">// window.__NOJS_DEVTOOLS__.routes</span></pre></div>

    <h3 class="doc-title"><code>csp</code></h3>
    <p class="doc-text"><strong>Type:</strong> <code>string | null</code> &nbsp;|&nbsp; <strong>Default:</strong> <code>null</code></p>
    <p class="doc-text">Set to <code>'strict'</code> to disable the use of <code>new Function()</code> for expression evaluation. This is required for environments with a Content Security Policy that blocks <code>unsafe-eval</code>. In strict mode, expressions are limited to dot-path property access and simple comparisons — arbitrary JavaScript is not allowed.</p>
    <div class="code-block"><pre><span class="hl-fn">NoJS</span>.<span class="hl-fn">config</span>({ <span class="hl-attr">csp</span>: <span class="hl-str">'strict'</span> }); <span class="hl-cmt">// Safe for strict CSP environments</span></pre></div>
    <h3 class="doc-title"><code>templates.cache</code></h3>
    <p class="doc-text"><strong>Type:</strong> <code>boolean</code> &nbsp;|&nbsp; <strong>Default:</strong> <code>true</code></p>
    <p class="doc-text">Controls whether the HTML content of remotely-fetched <code>.tpl</code> files is stored in an in-memory <code>Map</code> after the first request. On repeated navigations to the same route, the cached HTML is used directly and no HTTP request is made. The cache lives for the duration of the page session (no TTL — template assets are static).</p>
    <div class="code-block"><pre><span class="hl-cmt">// Disable template caching (always re-fetch .tpl files)</span>
<span class="hl-fn">NoJS</span>.<span class="hl-fn">config</span>({ <span class="hl-attr">templates</span>: { <span class="hl-attr">cache</span>: <span class="hl-kw">false</span> } });

<span class="hl-cmt">// Default — caching is on, no configuration needed</span>
<span class="hl-fn">NoJS</span>.<span class="hl-fn">config</span>({ <span class="hl-attr">templates</span>: { <span class="hl-attr">cache</span>: <span class="hl-kw">true</span> } });</pre></div>
    <p class="doc-text">Set to <code>false</code> during local development if you want changes to <code>.tpl</code> files to be reflected without a hard page reload.</p>  </div>

  <!-- API Properties -->
  <div class="doc-section">
    <h2 class="doc-title">API Properties</h2>

    <h3 class="doc-title"><code>NoJS.baseApiUrl</code></h3>
    <p class="doc-text">Getter/setter for the base API URL used by all <code>fetch</code> directives and <code>NoJS.http</code> calls. Can be read or reassigned at runtime.</p>
    <div class="code-block"><pre><span class="hl-cmt">// Set at init</span>
<span class="hl-fn">NoJS</span>.<span class="hl-fn">config</span>({ <span class="hl-attr">baseApiUrl</span>: <span class="hl-str">'https://api.myapp.com/v1'</span> });

<span class="hl-cmt">// Read at runtime</span>
console.<span class="hl-fn">log</span>(<span class="hl-fn">NoJS</span>.baseApiUrl); <span class="hl-cmt">// 'https://api.myapp.com/v1'</span>

<span class="hl-cmt">// Update at runtime</span>
<span class="hl-fn">NoJS</span>.baseApiUrl <span class="hl-op">=</span> <span class="hl-str">'https://staging-api.myapp.com/v1'</span>;</pre></div>

    <h3 class="doc-title"><code>NoJS.version</code></h3>
    <p class="doc-text">Read-only property that returns the current No.JS framework version string.</p>
    <div class="code-block"><pre>console.<span class="hl-fn">log</span>(<span class="hl-fn">NoJS</span>.version); <span class="hl-cmt">// e.g. '1.4.0'</span></pre></div>
  </div>

  <!-- Request Interceptors -->
  <div class="doc-section">
    <h2 class="doc-title">Request Interceptors</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-cmt">// Before every request</span>
  <span class="hl-fn">NoJS</span>.<span class="hl-fn">interceptor</span>(<span class="hl-str">'request'</span>, (<span class="hl-attr">url</span>, <span class="hl-attr">options</span>) <span class="hl-op">=&gt;</span> {
    options.headers[<span class="hl-str">'X-Request-ID'</span>] <span class="hl-op">=</span> crypto.<span class="hl-fn">randomUUID</span>();
    <span class="hl-kw">return</span> options;
  });

  <span class="hl-cmt">// After every response</span>
  <span class="hl-fn">NoJS</span>.<span class="hl-fn">interceptor</span>(<span class="hl-str">'response'</span>, (<span class="hl-attr">response</span>, <span class="hl-attr">url</span>) <span class="hl-op">=&gt;</span> {
    <span class="hl-kw">if</span> (response.status <span class="hl-op">===</span> <span class="hl-num">401</span>) {
      <span class="hl-fn">NoJS</span>.store.auth.user <span class="hl-op">=</span> <span class="hl-kw">null</span>;
      <span class="hl-kw">await</span> <span class="hl-fn">NoJS</span>.router.<span class="hl-fn">push</span>(<span class="hl-str">'/login'</span>);
      <span class="hl-kw">throw new</span> <span class="hl-fn">Error</span>(<span class="hl-str">'Unauthorized'</span>);
    }
    <span class="hl-kw">return</span> response;
  });
<span class="hl-tag">&lt;/script&gt;</span></pre></div>
  </div>

  <!-- XSS Protection -->
  <div class="doc-section">
    <h2 class="doc-title">Security</h2>

    <h3 class="doc-title">XSS Protection</h3>
    <ul class="doc-text">
      <li><code>bind</code> always sets <code>textContent</code>, never <code>innerHTML</code> — safe by default.</li>
      <li><code>bind-html</code> sanitizes content using a built-in regex-based sanitizer (strips <code>&lt;script&gt;</code> tags, blocks <code>on*</code> event handlers, removes <code>javascript:</code> URIs).</li>
      <li>Template expressions are evaluated in a sandboxed <code>Function()</code> scope — no access to <code>window</code>, <code>document</code>, or globals unless explicitly exposed.</li>
    </ul>

    <h3 class="doc-title">CSRF Protection</h3>
    <div class="code-block"><pre><span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-fn">NoJS</span>.<span class="hl-fn">config</span>({
    <span class="hl-attr">csrf</span>: {
      <span class="hl-attr">header</span>: <span class="hl-str">'X-CSRF-Token'</span>,
      <span class="hl-attr">token</span>: document.<span class="hl-fn">querySelector</span>(<span class="hl-str">'meta[name="csrf-token"]'</span>).content
    }
  });
<span class="hl-tag">&lt;/script&gt;</span></pre></div>

    <h3 class="doc-title">Content Security Policy</h3>
    <p class="doc-text">No.JS uses <code>new Function()</code> for expression evaluation. If your CSP blocks <code>unsafe-eval</code>, use the precompiled mode:</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;script</span> <span class="hl-attr">src</span>=<span class="hl-str">"dist/iife/no.js"</span> <span class="hl-attr">data-csp</span>=<span class="hl-str">"strict"</span><span class="hl-tag">&gt;&lt;/script&gt;</span></pre></div>
    <p class="doc-text">In strict mode, expressions are limited to dot-path access and simple comparisons (no arbitrary JS).</p>
  </div>

</div>

