<!-- Getting Started — from getting-started.md -->

<section class="hero-section">
  <span class="badge">Getting Started</span>
  <h1 class="hero-title">Documentation</h1>
  <p class="hero-subtitle">Everything you need to build reactive web apps with No.JS</p>
</section>

<div class="doc-content">

  <!-- Introduction -->
  <div class="doc-section">
    <h2 class="doc-title">Introduction</h2>
    <p class="doc-text">No.JS is an HTML-first reactive framework. Build dynamic, data-driven web applications using nothing but HTML attributes — no build step, no virtual DOM, no JSX.</p>
    <div class="callout">
      <p><strong>~11KB gzipped</strong> · Zero dependencies · Works in all modern browsers · No build step required</p>
    </div>
  </div>

  <!-- Installation -->
  <div class="doc-section">
    <h2 class="doc-title">Installation</h2>

    <h3 class="doc-subtitle">CDN (recommended)</h3>
    <div class="code-block"><pre><span class="hl-tag">&lt;script</span> <span class="hl-attr">src</span>=<span class="hl-str">"https://unpkg.com/@erickxavier/no-js@latest/dist/iife/no.js"</span><span class="hl-tag">&gt;&lt;/script&gt;</span></pre></div>

    <h3 class="doc-subtitle">NPM</h3>
    <div class="code-block"><pre><span class="hl-cmt">$ npm install no-js</span></pre></div>
    <div class="code-block"><pre><span class="hl-cmt">// ESM</span>
<span class="hl-kw">import</span> <span class="hl-fn">NoJS</span> <span class="hl-kw">from</span> <span class="hl-str">'no-js'</span>;
<span class="hl-kw">await</span> <span class="hl-fn">NoJS</span>.<span class="hl-fn">init</span>();

<span class="hl-cmt">// CommonJS</span>
<span class="hl-kw">const</span> <span class="hl-fn">NoJS</span> <span class="hl-op">=</span> <span class="hl-fn">require</span>(<span class="hl-str">'no-js'</span>);
<span class="hl-kw">await</span> <span class="hl-fn">NoJS</span>.<span class="hl-fn">init</span>();</pre></div>

    <div class="callout">
      <p><code>init()</code> returns a <strong>Promise</strong> — it loads remote templates and initializes the router before processing directives. When using the CDN <code>&lt;script&gt;</code> tag, this is handled automatically on <code>DOMContentLoaded</code>.</p>
    </div>

    <h3 class="doc-subtitle">Self-hosted</h3>
    <p class="doc-text">Download <code>dist/iife/no.js</code> and include it with a <code>&lt;script&gt;</code> tag. It's a single file, ~11 KB gzipped.</p>
  </div>

  <!-- Quick Start -->
  <div class="doc-section" id="quick-start">
    <h2 class="doc-title">Quick Start</h2>
    <p class="doc-text">Create an <code>index.html</code> file: include the script, add some attributes, and you're done. No <code>app.mount()</code>, no <code>createApp()</code>, no <code>NgModule</code>. It just works.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;!DOCTYPE html&gt;</span>
<span class="hl-tag">&lt;html&gt;</span>
<span class="hl-tag">&lt;head&gt;</span>
  <span class="hl-tag">&lt;script</span> <span class="hl-attr">src</span>=<span class="hl-str">"https://unpkg.com/@erickxavier/no-js@latest/dist/iife/no.js"</span><span class="hl-tag">&gt;&lt;/script&gt;</span>
<span class="hl-tag">&lt;/head&gt;</span>
<span class="hl-tag">&lt;body</span> <span class="hl-attr">base</span>=<span class="hl-str">"https://jsonplaceholder.typicode.com"</span><span class="hl-tag">&gt;</span>

  <span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/users/1"</span> <span class="hl-attr">as</span>=<span class="hl-str">"user"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;h1</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.name"</span><span class="hl-tag">&gt;</span>Loading...<span class="hl-tag">&lt;/h1&gt;</span>
    <span class="hl-tag">&lt;p</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.email"</span><span class="hl-tag">&gt;&lt;/p&gt;</span>
  <span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-tag">&lt;/body&gt;</span>
<span class="hl-tag">&lt;/html&gt;</span></pre></div>
  </div>

  <!-- How It Works -->
  <div class="doc-section">
    <h2 class="doc-title">How It Works</h2>
    <p class="doc-text">On <code>DOMContentLoaded</code>, No.JS walks the DOM looking for elements with known attributes. Each attribute maps to a directive that is executed by priority.</p>
    <div class="concepts-grid">
      <div class="concept-card">
        <div class="concept-card-title">1. Parse</div>
        <div class="concept-card-desc">Walks the DOM looking for elements with known attributes.</div>
      </div>
      <div class="concept-card">
        <div class="concept-card-title">2. Resolve</div>
        <div class="concept-card-desc">Each attribute maps to a directive executed by priority (data fetching first, then conditionals, then rendering).</div>
      </div>
      <div class="concept-card">
        <div class="concept-card-title">3. React</div>
        <div class="concept-card-desc">All data lives in reactive contexts (Proxy-backed). When data changes, every bound element updates automatically.</div>
      </div>
      <div class="concept-card">
        <div class="concept-card-title">4. Scope</div>
        <div class="concept-card-desc">Contexts inherit from parent elements, like lexical scoping. A <code>bind</code> inside an <code>each</code> loop can access both the loop item and ancestor data.</div>
      </div>
    </div>
  </div>

  <!-- Core Concepts -->
  <div class="doc-section" id="core-concepts">
    <h2 class="doc-title">Core Concepts</h2>

    <h3 class="doc-subtitle">Reactive Context</h3>
    <p class="doc-text">Every element can have a context — a reactive data object. Contexts are created by <code>state</code>, <code>get</code>, <code>store</code>, etc. Child elements inherit their parent's context automatically.</p>
    <div class="code-block"><pre><span class="hl-cmt">body          → context: { baseUrl }</span>
<span class="hl-cmt">  div[get]    → context: { user: { name, email } }  ← inherits from body</span>
<span class="hl-cmt">    span[bind="user.name"]                           ← reads from div's context</span>
<span class="hl-cmt">    div[each] → context: { post: { title } }         ← inherits from div</span></pre></div>

    <h3 class="doc-subtitle">Directive Priority</h3>
    <table class="doc-table">
      <thead>
        <tr><th>Priority</th><th>Directives</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td>0</td><td><code>state</code>, <code>store</code></td><td>Initialize local/global state</td></tr>
        <tr><td>1</td><td><code>get</code>, <code>post</code>, <code>put</code>, <code>patch</code>, <code>delete</code></td><td>Fetch data</td></tr>
        <tr><td>5</td><td><code>route</code></td><td>SPA routing</td></tr>
        <tr><td>10</td><td><code>if</code>, <code>switch</code>, <code>each</code>, <code>foreach</code></td><td>Structural (add/remove DOM)</td></tr>
        <tr><td>20</td><td><code>bind</code>, <code>class-*</code>, <code>style-*</code>, <code>show</code>, <code>hide</code></td><td>Rendering (update existing DOM)</td></tr>
        <tr><td>20</td><td><code>on:*</code></td><td>Event binding</td></tr>
        <tr><td>30</td><td><code>validate</code>, <code>animate</code></td><td>Side effects</td></tr>
      </tbody>
    </table>

    <h3 class="doc-subtitle">Expression Syntax</h3>
    <p class="doc-text">Most directive values accept JavaScript expressions evaluated against the current context:</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Simple path --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.name"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>

<span class="hl-cmt">&lt;!-- Ternary --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.age >= 18 ? 'Adult' : 'Minor'"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>

<span class="hl-cmt">&lt;!-- Arithmetic --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"cart.total * 1.1"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>

<span class="hl-cmt">&lt;!-- Filters (pipes) --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.name | uppercase"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>

<span class="hl-cmt">&lt;!-- Template literals (bind-html) --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">bind-html</span>=<span class="hl-str">"`&lt;strong&gt;${user.name}&lt;/strong&gt;`"</span><span class="hl-tag">&gt;&lt;/div&gt;</span></pre></div>
  </div>

</div>
