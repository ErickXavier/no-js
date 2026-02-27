<!-- Templates — from templates.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">Templates</h1>
  <p class="hero-subtitle">Reusable HTML fragments with variables, slots, and remote loading</p>
</section>

<div class="doc-content">

  <div class="doc-section">
    <h2 class="doc-title">Basic Template</h2>
    <p class="doc-text">Templates are reusable HTML fragments that are never rendered directly. They are cloned when referenced by directives like <code>then</code>, <code>else</code>, <code>template</code>, <code>loading</code>, <code>error</code>, etc.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"userCard"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"card"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;h3</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.name"</span><span class="hl-tag">&gt;&lt;/h3&gt;</span>
    <span class="hl-tag">&lt;p</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.email"</span><span class="hl-tag">&gt;&lt;/p&gt;</span>
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

  <div class="doc-section">
    <h2 class="doc-title">Template Variables (var)</h2>
    <p class="doc-text">Templates can declare which variable they expect from the calling context.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;form</span> <span class="hl-attr">post</span>=<span class="hl-str">"/login"</span> <span class="hl-attr">success</span>=<span class="hl-str">"#loginOk"</span> <span class="hl-attr">error</span>=<span class="hl-str">"#loginFail"</span><span class="hl-tag">&gt;</span>
  ...
<span class="hl-tag">&lt;/form&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"loginOk"</span> <span class="hl-attr">var</span>=<span class="hl-str">"result"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;p&gt;</span>Welcome, <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"result.user.name"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>!<span class="hl-tag">&lt;/p&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"loginFail"</span> <span class="hl-attr">var</span>=<span class="hl-str">"error"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;p&gt;</span>Error: <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"error.message"</span><span class="hl-tag">&gt;&lt;/span&gt;&lt;/p&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

  <div class="doc-section">
    <h2 class="doc-title">Template Slots</h2>
    <p class="doc-text">Allow templates to accept projected content.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"card"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"card"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"card-header"</span><span class="hl-tag">&gt;&lt;slot</span> <span class="hl-attr">name</span>=<span class="hl-str">"header"</span><span class="hl-tag">&gt;&lt;/slot&gt;&lt;/div&gt;</span>
    <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"card-body"</span><span class="hl-tag">&gt;&lt;slot&gt;&lt;/slot&gt;&lt;/div&gt;</span>
    <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"card-footer"</span><span class="hl-tag">&gt;&lt;slot</span> <span class="hl-attr">name</span>=<span class="hl-str">"footer"</span><span class="hl-tag">&gt;&lt;/slot&gt;&lt;/div&gt;</span>
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- Usage --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">use</span>=<span class="hl-str">"card"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">slot</span>=<span class="hl-str">"header"</span><span class="hl-tag">&gt;</span>My Title<span class="hl-tag">&lt;/span&gt;</span>
  <span class="hl-tag">&lt;p&gt;</span>Main content goes here<span class="hl-tag">&lt;/p&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">slot</span>=<span class="hl-str">"footer"</span><span class="hl-tag">&gt;</span>Footer info<span class="hl-tag">&lt;/span&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

  <div class="doc-section">
    <h2 class="doc-title">Remote Templates (src)</h2>
    <p class="doc-text">Load templates from external HTML files.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"header"</span> <span class="hl-attr">src</span>=<span class="hl-str">"/templates/header.html"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"footer"</span> <span class="hl-attr">src</span>=<span class="hl-str">"/templates/footer.html"</span><span class="hl-tag">&gt;&lt;/template&gt;</span></pre></div>
  </div>

  <div class="doc-section">
    <h3 class="doc-subtitle">Recursive Loading</h3>
    <p class="doc-text">Remote templates are loaded <strong>recursively</strong> — if a remote template itself contains <code>&lt;template src="..."&gt;</code> elements, those are automatically resolved too:</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- main page --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"layout"</span> <span class="hl-attr">src</span>=<span class="hl-str">"/templates/layout.html"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- /templates/layout.html can itself contain: --&gt;</span>
<span class="hl-tag">&lt;nav&gt;</span>
  <span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"/templates/nav.html"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>
<span class="hl-tag">&lt;/nav&gt;</span></pre></div>

    <h3 class="doc-subtitle">Remote Templates in Routes</h3>
    <p class="doc-text">Remote templates inside route content are also automatically resolved before the route renders. See <a href="#routing">Routing</a> for details.</p>
  </div>

  <div class="doc-section">
    <h2 class="doc-title">Lazy Loading (lazy)</h2>
    <p class="doc-text">Control when remote templates are fetched using the <code>lazy</code> attribute on <code>&lt;template src="..."&gt;</code> elements. NoJS loads templates in phases to optimise time-to-first-render.</p>
    <table class="doc-table">
      <thead><tr><th>Value</th><th>Behaviour</th></tr></thead>
      <tbody>
        <tr><td><em>(absent)</em></td><td>Default auto-prioritisation: content-include templates and the current route template load before first render; other route templates are preloaded in the background after first render.</td></tr>
        <tr><td><code>lazy="priority"</code></td><td>Force load before everything else — even before regular content includes. Useful for critical shared layout templates.</td></tr>
        <tr><td><code>lazy="ondemand"</code></td><td>Only valid on route templates. Never preloaded — fetched lazily the first time the user navigates to that route. Ideal for heavy or rarely-visited pages.</td></tr>
      </tbody>
    </table>
    <h3 class="doc-subtitle">Loading Phases</h3>
    <p class="doc-text">Templates are resolved in four ordered phases: <strong>Phase 0</strong> fetches <code>lazy="priority"</code> templates first; <strong>Phase 1</strong> fetches all other non-route templates plus the active route template (blocking before first render); <strong>Phase 2</strong> preloads remaining route templates in the background after first render; and <strong>on-demand</strong> fetches <code>lazy="ondemand"</code> route templates only when the user first navigates to them.</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Default: loads in Phase 1, perfect for content includes --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"./components/header.tpl"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- Priority: loads before everything, guaranteed first --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"./components/critical-layout.tpl"</span> <span class="hl-attr">lazy</span>=<span class="hl-str">"priority"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- Default route (auto Phase 1), no lazy needed --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/home.tpl"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- Auto Phase 2: preloaded in background after first render --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/about"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/about.tpl"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-cmt">&lt;!-- On demand: only fetched when user navigates to /heavy-page --&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">route</span>=<span class="hl-str">"/heavy-page"</span> <span class="hl-attr">src</span>=<span class="hl-str">"./pages/heavy.tpl"</span> <span class="hl-attr">lazy</span>=<span class="hl-str">"ondemand"</span><span class="hl-tag">&gt;&lt;/template&gt;</span></pre></div>
  </div>

  <div class="doc-section">
    <h2 class="doc-title">Loading Placeholder (loading)</h2>
    <p class="doc-text">Show a placeholder template while a remote template is being fetched. The placeholder is inserted synchronously — before any network request — and removed automatically once the real content arrives. Works for both static content-includes and nested templates inside route pages.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"./dashboard.tpl"</span> <span class="hl-attr">loading</span>=<span class="hl-str">"#spinner"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"spinner"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"skeleton"</span><span class="hl-tag">&gt;</span>Loading...<span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
    <p class="doc-text">Both plain IDs and <code>#id</code> syntax are accepted. The placeholder template is cloned each time, so it can be reused across multiple remote templates:</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"./section-a.tpl"</span> <span class="hl-attr">loading</span>=<span class="hl-str">"#page-skeleton"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"./section-b.tpl"</span> <span class="hl-attr">loading</span>=<span class="hl-str">"#page-skeleton"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">src</span>=<span class="hl-str">"./section-c.tpl"</span> <span class="hl-attr">loading</span>=<span class="hl-str">"#page-skeleton"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"page-skeleton"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"skeleton"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

  <div class="doc-section">
    <h2 class="doc-title">Inline Template Include (include)</h2>
    <p class="doc-text">Clone an inline template into the current position synchronously, before any fetches. Useful for injecting reusable markup (e.g. icon sets, common fragments) without making a network request.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;template</span> <span class="hl-attr">include</span>=<span class="hl-str">"#icon-set"</span><span class="hl-tag">&gt;&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"icon-set"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;svg</span> <span class="hl-attr">hidden</span><span class="hl-tag">&gt;</span>...<span class="hl-tag">&lt;/svg&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
    <p class="doc-text"><code>include</code> and <code>loading</code> serve different purposes: <code>include</code> clones inline content permanently; <code>loading</code> inserts a temporary placeholder that disappears once a remote template finishes loading.</p>
  </div>

</div>

