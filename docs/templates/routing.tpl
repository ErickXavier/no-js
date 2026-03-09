<!-- Routing — from routing.md -->

<section class="hero-section">
  <span class="badge" t="docs.routing.hero.badge">Guides</span>
  <h1 class="hero-title" t="docs.routing.hero.title">Routing</h1>
  <p class="hero-subtitle" t="docs.routing.hero.subtitle">Full client-side SPA navigation with no page reloads</p>
</section>

<div class="doc-content">

  <!-- Route Definition -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.definition.title">Route Definition</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;body&gt;</span>
  <span class="hl-tag">&lt;nav&gt;</span>
    <span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/"</span><span class="hl-tag">&gt;</span>Home<span class="hl-tag">&lt;/a&gt;</span>
    <span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/about"</span><span class="hl-tag">&gt;</span>About<span class="hl-tag">&lt;/a&gt;</span>
    <span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/users"</span><span class="hl-tag">&gt;</span>Users<span class="hl-tag">&lt;/a&gt;</span>
    <span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/users/:id"</span><span class="hl-tag">&gt;</span>User Detail<span class="hl-tag">&lt;/a&gt;</span>
  <span class="hl-tag">&lt;/nav&gt;</span>

  <span class="hl-cmt">&lt;!-- This is where route content renders --&gt;</span>
  <span class="hl-tag">&lt;main</span> <span class="hl-attr">route-view</span><span class="hl-tag">&gt;&lt;/main&gt;</span>

  <span class="hl-cmt">&lt;!-- Route templates --&gt;</span>
  <span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/"</span> <span class="hl-attr">id</span>=<span class="hl-str">"homePage"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;h1&gt;</span>Home<span class="hl-tag">&lt;/h1&gt;</span>
    <span class="hl-tag">&lt;p&gt;</span>Welcome to No.JS<span class="hl-tag">&lt;/p&gt;</span>
  <span class="hl-tag">&lt;/template&gt;</span>

  <span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/users"</span> <span class="hl-attr">id</span>=<span class="hl-str">"usersPage"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/api/users"</span> <span class="hl-attr">as</span>=<span class="hl-str">"users"</span><span class="hl-tag">&gt;</span>
      <span class="hl-tag">&lt;div</span> <span class="hl-attr">each</span>=<span class="hl-str">"user in users"</span> <span class="hl-attr">template</span>=<span class="hl-str">"userLink"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
    <span class="hl-tag">&lt;/div&gt;</span>
  <span class="hl-tag">&lt;/template&gt;</span>

  <span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/users/:id"</span> <span class="hl-attr">id</span>=<span class="hl-str">"userDetail"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/api/users/{$route.params.id}"</span> <span class="hl-attr">as</span>=<span class="hl-str">"user"</span><span class="hl-tag">&gt;</span>
      <span class="hl-tag">&lt;h1</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.name"</span><span class="hl-tag">&gt;&lt;/h1&gt;</span>
    <span class="hl-tag">&lt;/div&gt;</span>
  <span class="hl-tag">&lt;/template&gt;</span>
<span class="hl-tag">&lt;/body&gt;</span></pre></div>
  </div>

  <!-- Route Parameters & Query -->
  <div class="doc-section">
    <h2 class="doc-title" t-html="docs.routing.params.title">Route Parameters &amp; Query</h2>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Params: /users/42 --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/users/:id"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"$route.params.id"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>    <span class="hl-cmt">&lt;!-- "42" --&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- Query: /search?q=hello&amp;page=2 --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/search"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"$route.query.q"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>      <span class="hl-cmt">&lt;!-- "hello" --&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"$route.query.page"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>   <span class="hl-cmt">&lt;!-- "2" --&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

  <!-- $route Context -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.context.title">$route — Route Context</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.routing.context.col1">Property</th><th t="docs.routing.context.col2">Description</th></tr></thead>
      <tbody>
        <tr><td><code>$route.path</code></td><td t="docs.routing.context.path">Current path (e.g. <code>"/users/42"</code>)</td></tr>
        <tr><td><code>$route.params</code></td><td t="docs.routing.context.params">Route parameters (e.g. <code>{ id: "42" }</code>)</td></tr>
        <tr><td><code>$route.query</code></td><td t="docs.routing.context.query">Query string params (e.g. <code>{ q: "hello" }</code>)</td></tr>
        <tr><td><code>$route.hash</code></td><td t="docs.routing.context.hash">URL hash (e.g. <code>"#section"</code>)</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Active Route Styling -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.activeStyle.title">Active Route Styling</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/"</span> <span class="hl-attr">route-active</span>=<span class="hl-str">"active"</span><span class="hl-tag">&gt;</span>Home<span class="hl-tag">&lt;/a&gt;</span>
<span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/about"</span> <span class="hl-attr">route-active</span>=<span class="hl-str">"active"</span><span class="hl-tag">&gt;</span>About<span class="hl-tag">&lt;/a&gt;</span>

<span class="hl-cmt">&lt;!-- Exact match only (won't match /users/123) --&gt;</span>
<span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/users"</span> <span class="hl-attr">route-active-exact</span>=<span class="hl-str">"active"</span><span class="hl-tag">&gt;</span>Users<span class="hl-tag">&lt;/a&gt;</span></pre></div>
  </div>

  <!-- Route Guards -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.guards.title">Route Guards</h2>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Redirect if not authenticated --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/dashboard"</span>
          <span class="hl-attr">guard</span>=<span class="hl-str">"$store.auth.user"</span>
          <span class="hl-attr">redirect</span>=<span class="hl-str">"/login"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;h1&gt;</span>Dashboard<span class="hl-tag">&lt;/h1&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- Redirect if already logged in --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/login"</span>
          <span class="hl-attr">guard</span>=<span class="hl-str">"!$store.auth.user"</span>
          <span class="hl-attr">redirect</span>=<span class="hl-str">"/dashboard"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;form</span> <span class="hl-attr">post</span>=<span class="hl-str">"/api/login"</span><span class="hl-tag">&gt;</span>...<span class="hl-tag">&lt;/form&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

  <!-- Programmatic Navigation -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.programmatic.title">Programmatic Navigation</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$router.push('/users/42')"</span><span class="hl-tag">&gt;</span>Go to User<span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$router.back()"</span><span class="hl-tag">&gt;</span>Go Back<span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$router.replace('/new-path')"</span><span class="hl-tag">&gt;</span>Replace<span class="hl-tag">&lt;/button&gt;</span></pre></div>
    <div class="callout">
      <p t="docs.routing.programmatic.callout"><code>$router.push()</code> and <code>$router.replace()</code> return <strong>Promises</strong> — navigation (including remote template loading) is fully async. In <code>on:click</code> handlers the return value is ignored, but in scripts you can <code>await</code> them:</p>
    </div>
    <div class="code-block"><pre><span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-kw">await</span> <span class="hl-fn">NoJS</span>.<span class="hl-fn">router</span>.<span class="hl-fn">push</span>(<span class="hl-str">'/dashboard'</span>);
<span class="hl-tag">&lt;/script&gt;</span></pre></div>
  </div>

  <!-- Nested Routes -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.nested.title">Nested Routes</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/settings"</span> <span class="hl-attr">id</span>=<span class="hl-str">"settingsPage"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;nav&gt;</span>
    <span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/settings/profile"</span><span class="hl-tag">&gt;</span>Profile<span class="hl-tag">&lt;/a&gt;</span>
    <span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/settings/security"</span><span class="hl-tag">&gt;</span>Security<span class="hl-tag">&lt;/a&gt;</span>
  <span class="hl-tag">&lt;/nav&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">route-view</span><span class="hl-tag">&gt;&lt;/div&gt;</span>  <span class="hl-cmt">&lt;!-- Nested route content renders here --&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/settings/profile"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;h2&gt;</span>Profile Settings<span class="hl-tag">&lt;/h2&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/settings/security"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;h2&gt;</span>Security Settings<span class="hl-tag">&lt;/h2&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

  <!-- Remote Templates in Routes -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.remoteTemplates.title">Remote Templates in Routes</h2>
    <p class="doc-text" t="docs.routing.remoteTemplates.text1">Route templates can include <code>&lt;template src="..."&gt;</code> to load content from external files. They are automatically resolved before the route renders:</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/dashboard"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"/partials/dash-header.html"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>
  <span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"/partials/dash-stats.html"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>
  <span class="hl-tag">&lt;p&gt;</span>Dashboard content<span class="hl-tag">&lt;/p&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
    <p class="doc-text" t="docs.routing.remoteTemplates.text2">Nested remote templates (a remote template that itself contains more <code>&lt;template src&gt;</code>) are recursively loaded.</p>
  </div>

  <!-- File-Based Routing -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.fileBased.title">File-Based Routing</h2>
    <p class="doc-text" t="docs.routing.fileBased.text">Instead of declaring each route template manually, point your <code>route-view</code> outlet at a folder. No.JS will automatically resolve route paths to template files inside that folder.</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Traditional (explicit) routing --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/overview.tpl"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/analytics"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/analytics.tpl"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/users"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/users.tpl"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- File-based routing &mdash; one line replaces all of the above! --&gt;</span>
<span class="hl-tag">&lt;main</span> <span class="hl-attr">route-view</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/"</span> <span class="hl-attr">route-index</span>=<span class="hl-str">"overview"</span><span class="hl-tag">&gt;&lt;/main&gt;</span></pre></div>
    <h3 class="doc-subtitle" t="docs.routing.fileBased.howItWorks">How it works</h3>
    <ol class="doc-list">
      <li t="docs.routing.fileBased.list1">Add <code>route-view</code> to your outlet element &mdash; file-based routing is enabled by default (config <code>router.templates: "pages"</code>). Override per-outlet with <code>src="folder/"</code>.</li>
      <li t="docs.routing.fileBased.list2">When a user navigates to <code>/analytics</code>, No.JS resolves it to <code>pages/analytics.tpl</code></li>
      <li t="docs.routing.fileBased.list3">The template is fetched, cached, and rendered &mdash; automatically</li>
    </ol>
    <h3 class="doc-subtitle" t="docs.routing.fileBased.attributesTitle">Attributes</h3>
    <table class="doc-table">
      <thead><tr><th t="docs.routing.fileBased.colAttr">Attribute</th><th t="docs.routing.fileBased.colDefault">Default</th><th t="docs.routing.fileBased.colDesc">Description</th></tr></thead>
      <tbody>
        <tr><td><code>src</code></td><td><code>"pages"</code></td><td t="docs.routing.fileBased.srcDesc">Base folder for template resolution (per-outlet override; config: <code>router.templates</code>)</td></tr>
        <tr><td><code>route-index</code></td><td><code>"index"</code></td><td t="docs.routing.fileBased.routeIndexDesc">Filename for the root route <code>/</code></td></tr>
        <tr><td><code>ext</code></td><td><code>".tpl"</code></td><td t="docs.routing.fileBased.extDesc">File extension appended to route segments (fallback: <code>".html"</code>)</td></tr>
        <tr><td><code>i18n-ns</code></td><td>&mdash;</td><td t="docs.routing.fileBased.i18nNsDesc">When present, auto-derives i18n namespace from filename</td></tr>
      </tbody>
    </table>
    <div class="callout">
      <p t="docs.routing.fileBased.callout"><strong>Config default:</strong> The default <code>router.templates</code> is <code>"pages"</code>, so file-based routing works out of the box &mdash; just add <code>route-view</code> to your outlet. Override with <code>NoJS.config({ router: { templates: 'views' } })</code> or per-outlet via <code>src="./custom/"</code>.</p>
    </div>
    <h3 class="doc-subtitle" t="docs.routing.fileBased.exampleTitle">Example &mdash; SaaS Dashboard</h3>
    <div class="code-block"><pre><span class="hl-cmt">pages/</span>
<span class="hl-cmt">├── overview.tpl    ← /</span>
<span class="hl-cmt">├── analytics.tpl   ← /analytics</span>
<span class="hl-cmt">├── users.tpl       ← /users</span>
<span class="hl-cmt">├── revenue.tpl     ← /revenue</span>
<span class="hl-cmt">├── billing.tpl     ← /billing</span>
<span class="hl-cmt">└── settings.tpl    ← /settings</span></pre></div>
    <div class="code-block"><pre><span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"./components/sidebar.tpl"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-tag">&lt;main</span> <span class="hl-attr">route-view</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/"</span> <span class="hl-attr">route-index</span>=<span class="hl-str">"overview"</span><span class="hl-tag">&gt;&lt;/main&gt;</span></pre></div>
    <p class="doc-text" t="docs.routing.fileBased.exampleText">That&rsquo;s it &mdash; <strong>two lines</strong> for a full SPA with six routes.</p>
    <h3 class="doc-subtitle" t="docs.routing.fileBased.mixingTitle">Mixing Explicit &amp; File-Based Routes</h3>
    <p class="doc-text" t="docs.routing.fileBased.mixingText">Explicit <code>&lt;template route="..."&gt;</code> declarations <strong>always take priority</strong>. This lets you combine both approaches &mdash; use file-based routing for simple pages and explicit templates for routes that need guards, params, or named outlets:</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- File-based routing handles most pages automatically --&gt;</span>
<span class="hl-tag">&lt;main</span> <span class="hl-attr">route-view</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/"</span><span class="hl-tag">&gt;&lt;/main&gt;</span>

<span class="hl-cmt">&lt;!-- Explicit route for param-based pages --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/users/:id"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/user-detail.tpl"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- Explicit route with guard --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/admin"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/admin.tpl"</span>
          <span class="hl-attr">guard</span>=<span class="hl-str">"$store.auth.isAdmin"</span> <span class="hl-attr">redirect</span>=<span class="hl-str">"/"</span><span class="hl-tag">&gt;&lt;/template&gt;</span></pre></div>
    <h3 class="doc-subtitle" t="docs.routing.fileBased.autoI18nTitle">Auto i18n Namespace</h3>
    <p class="doc-text" t="docs.routing.fileBased.autoI18nText">When the <code>route-view</code> element has an <code>i18n-ns</code> attribute (even without a value), No.JS automatically loads the i18n namespace matching the filename:</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Auto-derives namespace: "/" &rarr; "landing", "/features" &rarr; "features", etc. --&gt;</span>
<span class="hl-tag">&lt;main</span> <span class="hl-attr">route-view</span> <span class="hl-attr">src</span>=<span class="hl-str">"templates/"</span> <span class="hl-attr">route-index</span>=<span class="hl-str">"landing"</span> <span class="hl-attr">i18n-ns</span><span class="hl-tag">&gt;&lt;/main&gt;</span></pre></div>
    <p class="doc-text" t="docs.routing.fileBased.autoI18nText2">This replaces the need to add <code>i18n-ns="..."</code> on each route template individually.</p>
  </div>

  <!-- Lazy Template Loading -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.lazyLoading.title">Lazy Template Loading</h2>
    <p class="doc-text" t="docs.routing.lazyLoading.text">The <code>lazy</code> attribute on <code>&lt;template src="..."&gt;</code> controls when a remote template is fetched relative to the first render. Use it to prioritise critical templates and defer heavy or rarely-visited pages.</p>
    <table class="doc-table">
      <thead><tr><th t="docs.routing.lazyLoading.col1">Value</th><th t="docs.routing.lazyLoading.col2">Phase</th><th t="docs.routing.lazyLoading.col3">Behaviour</th></tr></thead>
      <tbody>
        <tr><td><em t="docs.routing.lazyLoading.absent">(absent)</em></td><td t="docs.routing.lazyLoading.absentPhase">1 or 2</td><td t="docs.routing.lazyLoading.absentDesc">Auto: non-route templates and the active route template load before first render (Phase 1); other route templates preload in the background after first render (Phase 2).</td></tr>
        <tr><td><code>lazy="priority"</code></td><td t="docs.routing.lazyLoading.priorityPhase">0</td><td t="docs.routing.lazyLoading.priorityDesc">Load before everything else — even before regular content includes. Use for critical shared layout templates.</td></tr>
        <tr><td><code>lazy="ondemand"</code></td><td t="docs.routing.lazyLoading.ondemandPhase">on demand</td><td t="docs.routing.lazyLoading.ondemandDesc">Only valid on route templates. Never preloaded — fetched the first time the user navigates to that route. Ideal for heavy or rarely-visited pages.</td></tr>
      </tbody>
    </table>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Priority: fetched first, before any other template --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"./components/critical-layout.tpl"</span> <span class="hl-attr">lazy</span>=<span class="hl-str">"priority"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- Default route (auto Phase 1) — no lazy attribute needed --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/home.tpl"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- Auto Phase 2: preloaded in background after first render --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/about"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/about.tpl"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- On demand: fetched only when user first navigates here --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/heavy-page"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/heavy.tpl"</span> <span class="hl-attr">lazy</span>=<span class="hl-str">"ondemand"</span><span class="hl-tag">&gt;&lt;/template&gt;</span></pre></div>
  </div>

  <!-- Anchor Links in Hash Mode -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.anchor.title">Anchor Links in Hash Mode</h2>
    <p class="doc-text" t="docs.routing.anchor.text1">When using <code>mode: 'hash'</code>, the URL hash (<code>#</code>) is used for routing (e.g. <code>#/docs</code>). This normally conflicts with standard anchor links like <code>&lt;a href="#section"&gt;</code> &mdash; but No.JS handles it automatically.</p>
    <p class="doc-text" t="docs.routing.anchor.text2">Anchor links that point to an element <code>id</code> on the page are intercepted by the router: the target element is scrolled into view smoothly, and the clicked link receives an <code>active</code> class. The route itself is <strong>not</strong> affected.</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- These work in hash mode &mdash; no special attributes needed --&gt;</span>
<span class="hl-tag">&lt;nav&gt;</span>
  <span class="hl-tag">&lt;a</span> <span class="hl-attr">href</span>=<span class="hl-str">"#introduction"</span><span class="hl-tag">&gt;</span>Introduction<span class="hl-tag">&lt;/a&gt;</span>
  <span class="hl-tag">&lt;a</span> <span class="hl-attr">href</span>=<span class="hl-str">"#getting-started"</span><span class="hl-tag">&gt;</span>Getting Started<span class="hl-tag">&lt;/a&gt;</span>
  <span class="hl-tag">&lt;a</span> <span class="hl-attr">href</span>=<span class="hl-str">"#api"</span><span class="hl-tag">&gt;</span>API Reference<span class="hl-tag">&lt;/a&gt;</span>
<span class="hl-tag">&lt;/nav&gt;</span>

<span class="hl-tag">&lt;div</span> <span class="hl-attr">id</span>=<span class="hl-str">"introduction"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;h2&gt;</span>Introduction<span class="hl-tag">&lt;/h2&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-tag">&lt;div</span> <span class="hl-attr">id</span>=<span class="hl-str">"getting-started"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;h2&gt;</span>Getting Started<span class="hl-tag">&lt;/h2&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-tag">&lt;div</span> <span class="hl-attr">id</span>=<span class="hl-str">"api"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;h2&gt;</span>API Reference<span class="hl-tag">&lt;/h2&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
    <p class="doc-text" t="docs.routing.anchor.howItWorks"><strong>How it works:</strong></p>
    <ul class="doc-list">
      <li t="docs.routing.anchor.list1">Clicking <code>&lt;a href="#introduction"&gt;</code> scrolls to <code>&lt;div id="introduction"&gt;</code> with smooth behavior</li>
      <li t="docs.routing.anchor.list2">The <code>.active</code> class is toggled on the clicked link (and removed from siblings)</li>
      <li t="docs.routing.anchor.list3">The current route path is preserved &mdash; no navigation occurs</li>
      <li t="docs.routing.anchor.list4">Links with a <code>route</code> attribute are always treated as route navigation, not anchors</li>
    </ul>
    <div class="callout">
      <p t="docs.routing.anchor.tip"><strong>Tip:</strong> Style the active anchor link with <code>.active</code> in your CSS &mdash; the router manages the class for you.</p>
    </div>
  </div>

  <!-- Named Outlets (route-view) -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.routing.namedOutlets.title">Named Outlets (route-view)</h2>
    <p class="doc-text" t="docs.routing.namedOutlets.text">Multiple <code>route-view</code> outlets can coexist in the same page. Give each outlet a name via the attribute value, and point route templates at specific outlets using the <code>outlet</code> attribute.</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Layout with named outlets --&gt;</span>
<span class="hl-tag">&lt;main</span> <span class="hl-attr">route-view</span><span class="hl-tag">&gt;&lt;/main&gt;</span>            <span class="hl-cmt">&lt;!-- "default" outlet --&gt;</span>
<span class="hl-tag">&lt;aside</span> <span class="hl-attr">route-view</span>=<span class="hl-str">"sidebar"</span><span class="hl-tag">&gt;&lt;/aside&gt;</span>
<span class="hl-tag">&lt;header</span> <span class="hl-attr">route-view</span>=<span class="hl-str">"topbar"</span><span class="hl-tag">&gt;&lt;/header&gt;</span>

<span class="hl-cmt">&lt;!-- /home fills all three outlets --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/home"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;h1&gt;</span>Home page<span class="hl-tag">&lt;/h1&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/home"</span> <span class="hl-attr">outlet</span>=<span class="hl-str">"sidebar"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;nav&gt;</span>Home navigation<span class="hl-tag">&lt;/nav&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/home"</span> <span class="hl-attr">outlet</span>=<span class="hl-str">"topbar"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;span&gt;</span>Home breadcrumb<span class="hl-tag">&lt;/span&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- /about only fills default; sidebar and topbar are cleared --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/about"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;h1&gt;</span>About us<span class="hl-tag">&lt;/h1&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
    <div class="callout">
      <p t="docs.routing.namedOutlets.callout">Outlets with no matching template for the current route are always cleared on navigation.</p>
    </div>
  </div>

</div>

