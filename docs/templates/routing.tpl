<!-- Routing — from routing.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">Routing</h1>
  <p class="hero-subtitle">Full client-side SPA navigation with no page reloads</p>
</section>

<div class="doc-content">

  <!-- Route Definition -->
  <div class="doc-section">
    <h2 class="doc-title">Route Definition</h2>
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
    <h2 class="doc-title">Route Parameters &amp; Query</h2>
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
    <h2 class="doc-title">$route — Route Context</h2>
    <table class="doc-table">
      <thead><tr><th>Property</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>$route.path</code></td><td>Current path (e.g. <code>"/users/42"</code>)</td></tr>
        <tr><td><code>$route.params</code></td><td>Route parameters (e.g. <code>{ id: "42" }</code>)</td></tr>
        <tr><td><code>$route.query</code></td><td>Query string params (e.g. <code>{ q: "hello" }</code>)</td></tr>
        <tr><td><code>$route.hash</code></td><td>URL hash (e.g. <code>"#section"</code>)</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Active Route Styling -->
  <div class="doc-section">
    <h2 class="doc-title">Active Route Styling</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/"</span> <span class="hl-attr">route-active</span>=<span class="hl-str">"active"</span><span class="hl-tag">&gt;</span>Home<span class="hl-tag">&lt;/a&gt;</span>
<span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/about"</span> <span class="hl-attr">route-active</span>=<span class="hl-str">"active"</span><span class="hl-tag">&gt;</span>About<span class="hl-tag">&lt;/a&gt;</span>

<span class="hl-cmt">&lt;!-- Exact match only (won't match /users/123) --&gt;</span>
<span class="hl-tag">&lt;a</span> <span class="hl-attr">route</span>=<span class="hl-str">"/users"</span> <span class="hl-attr">route-active-exact</span>=<span class="hl-str">"active"</span><span class="hl-tag">&gt;</span>Users<span class="hl-tag">&lt;/a&gt;</span></pre></div>
  </div>

  <!-- Route Guards -->
  <div class="doc-section">
    <h2 class="doc-title">Route Guards</h2>
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
    <h2 class="doc-title">Programmatic Navigation</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$router.push('/users/42')"</span><span class="hl-tag">&gt;</span>Go to User<span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$router.back()"</span><span class="hl-tag">&gt;</span>Go Back<span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$router.replace('/new-path')"</span><span class="hl-tag">&gt;</span>Replace<span class="hl-tag">&lt;/button&gt;</span></pre></div>
    <div class="callout">
      <p><code>$router.push()</code> and <code>$router.replace()</code> return <strong>Promises</strong> — navigation (including remote template loading) is fully async. In <code>on:click</code> handlers the return value is ignored, but in scripts you can <code>await</code> them:</p>
    </div>
    <div class="code-block"><pre><span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-kw">await</span> <span class="hl-fn">NoJS</span>.<span class="hl-fn">router</span>.<span class="hl-fn">push</span>(<span class="hl-str">'/dashboard'</span>);
<span class="hl-tag">&lt;/script&gt;</span></pre></div>
  </div>

  <!-- Nested Routes -->
  <div class="doc-section">
    <h2 class="doc-title">Nested Routes</h2>
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
    <h2 class="doc-title">Remote Templates in Routes</h2>
    <p class="doc-text">Route templates can include <code>&lt;template src="..."&gt;</code> to load content from external files. They are automatically resolved before the route renders:</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/dashboard"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"/partials/dash-header.html"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>
  <span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"/partials/dash-stats.html"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>
  <span class="hl-tag">&lt;p&gt;</span>Dashboard content<span class="hl-tag">&lt;/p&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
    <p class="doc-text">Nested remote templates (a remote template that itself contains more <code>&lt;template src&gt;</code>) are recursively loaded.</p>
  </div>

  <!-- Lazy Template Loading -->
  <div class="doc-section">
    <h2 class="doc-title">Lazy Template Loading</h2>
    <p class="doc-text">The <code>lazy</code> attribute on <code>&lt;template src="..."&gt;</code> controls when a remote template is fetched relative to the first render. Use it to prioritise critical templates and defer heavy or rarely-visited pages.</p>
    <table class="doc-table">
      <thead><tr><th>Value</th><th>Phase</th><th>Behaviour</th></tr></thead>
      <tbody>
        <tr><td><em>(absent)</em></td><td>1 or 2</td><td>Auto: non-route templates and the active route template load before first render (Phase 1); other route templates preload in the background after first render (Phase 2).</td></tr>
        <tr><td><code>lazy="priority"</code></td><td>0</td><td>Load before everything else — even before regular content includes. Use for critical shared layout templates.</td></tr>
        <tr><td><code>lazy="ondemand"</code></td><td>on demand</td><td>Only valid on route templates. Never preloaded — fetched the first time the user navigates to that route. Ideal for heavy or rarely-visited pages.</td></tr>
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

  <!-- Named Outlets (route-view) -->
  <div class="doc-section">
    <h2 class="doc-title">Named Outlets (route-view)</h2>
    <p class="doc-text">Multiple <code>route-view</code> outlets can coexist in the same page. Give each outlet a name via the attribute value, and point route templates at specific outlets using the <code>outlet</code> attribute.</p>
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
      <p>Outlets with no matching template for the current route are always cleared on navigation.</p>
    </div>
  </div>

</div>

