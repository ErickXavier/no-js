<!-- Data Fetching — from data-fetching.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">Data Fetching</h1>
  <p class="hero-subtitle">Declarative HTTP requests — just add attributes to HTML elements</p>
</section>

<div class="doc-content">

  <!-- Base URL -->
  <div class="doc-section">
    <h2 class="doc-title">Base URL</h2>
    <p class="doc-text">Set once on any ancestor element. All descendant <code>get</code>, <code>post</code>, etc. resolve relative URLs against it.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;body</span> <span class="hl-attr">base</span>=<span class="hl-str">"https://api.myapp.com/v1"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/users"</span><span class="hl-tag">&gt;</span>...<span class="hl-tag">&lt;/div&gt;</span>        <span class="hl-cmt">&lt;!-- → https://api.myapp.com/v1/users --&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/posts"</span><span class="hl-tag">&gt;</span>...<span class="hl-tag">&lt;/div&gt;</span>        <span class="hl-cmt">&lt;!-- → https://api.myapp.com/v1/posts --&gt;</span>
<span class="hl-tag">&lt;/body&gt;</span></pre></div>

    <p class="doc-text">Override for specific sections:</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">base</span>=<span class="hl-str">"https://cms.myapp.com/api"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/articles"</span><span class="hl-tag">&gt;</span>...<span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>

    <p class="doc-text">Absolute URLs skip base resolution:</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"https://other-api.com/data"</span><span class="hl-tag">&gt;</span>...<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

  <!-- Programmatic Configuration -->
  <div class="doc-section">
    <h2 class="doc-title">Programmatic Configuration</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-fn">NoJS</span>.<span class="hl-fn">config</span>({
    <span class="hl-attr">baseApiUrl</span>: <span class="hl-str">'https://api.myapp.com/v1'</span>,
    <span class="hl-attr">headers</span>: {
      <span class="hl-str">'Authorization'</span>: <span class="hl-str">'Bearer '</span> + localStorage.<span class="hl-fn">getItem</span>(<span class="hl-str">'token'</span>),
      <span class="hl-str">'Content-Type'</span>: <span class="hl-str">'application/json'</span>
    },
    <span class="hl-attr">timeout</span>: <span class="hl-num">10000</span>,
    <span class="hl-attr">retries</span>: <span class="hl-num">2</span>,
    <span class="hl-attr">retryDelay</span>: <span class="hl-num">1000</span>
  });
<span class="hl-tag">&lt;/script&gt;</span></pre></div>
  </div>

  <!-- Per-Request Headers -->
  <div class="doc-section">
    <h2 class="doc-title">Per-Request Headers</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/me"</span>
     <span class="hl-attr">headers</span>=<span class="hl-str">'{"Authorization": "Bearer abc123"}'</span>
     <span class="hl-attr">as</span>=<span class="hl-str">"user"</span><span class="hl-tag">&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

  <!-- GET -->
  <div class="doc-section">
    <h2 class="doc-title">get — Fetch and Render Data</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/users"</span> <span class="hl-attr">as</span>=<span class="hl-str">"users"</span><span class="hl-tag">&gt;</span>
  <span class="hl-cmt">&lt;!-- `users` is now available in this scope --&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>

    <h3 class="doc-title">Attributes</h3>
    <table class="doc-table">
      <thead><tr><th>Attribute</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>get</code></td><td>string</td><td>URL to fetch (GET request)</td></tr>
        <tr><td><code>as</code></td><td>string</td><td>Name to assign the response in the context. Default: <code>"data"</code></td></tr>
        <tr><td><code>loading</code></td><td>string</td><td>Template ID to show while loading (e.g. <code>"#skeleton"</code>)</td></tr>
        <tr><td><code>error</code></td><td>string</td><td>Template ID to show on fetch error</td></tr>
        <tr><td><code>empty</code></td><td>string</td><td>Template ID to show when response is empty array/null</td></tr>
        <tr><td><code>refresh</code></td><td>number</td><td>Auto-refresh interval in ms (polling)</td></tr>
        <tr><td><code>cached</code></td><td>boolean|string</td><td>Cache responses. <code>cached</code> = memory, <code>cached="local"</code> = localStorage, <code>cached="session"</code> = sessionStorage</td></tr>
        <tr><td><code>into</code></td><td>string</td><td>Write response to a named global store</td></tr>
        <tr><td><code>debounce</code></td><td>number</td><td>Debounce in ms (useful with reactive URLs)</td></tr>
        <tr><td><code>headers</code></td><td>string</td><td>JSON string of additional headers</td></tr>
        <tr><td><code>params</code></td><td>string</td><td>Expression that resolves to query params object</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Full Example -->
  <div class="doc-section">
    <h2 class="doc-title">Full Example</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/users"</span>
     <span class="hl-attr">as</span>=<span class="hl-str">"users"</span>
     <span class="hl-attr">loading</span>=<span class="hl-str">"#usersSkeleton"</span>
     <span class="hl-attr">error</span>=<span class="hl-str">"#usersError"</span>
     <span class="hl-attr">empty</span>=<span class="hl-str">"#noUsers"</span>
     <span class="hl-attr">refresh</span>=<span class="hl-str">"30000"</span>
     <span class="hl-attr">cached</span><span class="hl-tag">&gt;</span>

  <span class="hl-tag">&lt;div</span> <span class="hl-attr">each</span>=<span class="hl-str">"user in users"</span> <span class="hl-attr">template</span>=<span class="hl-str">"userCard"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>

<span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"usersSkeleton"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"skeleton-pulse"</span><span class="hl-tag">&gt;</span>Loading users...<span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"usersError"</span> <span class="hl-attr">var</span>=<span class="hl-str">"err"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"error"</span><span class="hl-tag">&gt;</span>Failed to load: <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"err.message"</span><span class="hl-tag">&gt;&lt;/span&gt;&lt;/div&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"noUsers"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;p&gt;</span>No users found.<span class="hl-tag">&lt;/p&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

  <!-- Reactive URLs -->
  <div class="doc-section">
    <h2 class="doc-title">Reactive URLs</h2>
    <p class="doc-text">URLs that reference state variables re-fetch automatically when those values change.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ page: 1, search: '' }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"text"</span> <span class="hl-attr">bind-value</span>=<span class="hl-str">"search"</span>
         <span class="hl-attr">on:input</span>=<span class="hl-str">"search = $event.target.value"</span> <span class="hl-tag">/&gt;</span>

  <span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/users?page={page}&amp;q={search}"</span>
       <span class="hl-attr">as</span>=<span class="hl-str">"results"</span>
       <span class="hl-attr">debounce</span>=<span class="hl-str">"300"</span><span class="hl-tag">&gt;</span>
    ...
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

  <!-- POST / PUT / PATCH / DELETE -->
  <div class="doc-section">
    <h2 class="doc-title">post, put, patch, delete — Mutating Requests</h2>
    <p class="doc-text">Used on forms or triggered via <code>call</code>.</p>

    <h3 class="doc-title">Form Submission</h3>
    <div class="code-block"><pre><span class="hl-tag">&lt;form</span> <span class="hl-attr">post</span>=<span class="hl-str">"/login"</span>
      <span class="hl-attr">success</span>=<span class="hl-str">"#loginSuccess"</span>
      <span class="hl-attr">error</span>=<span class="hl-str">"#loginError"</span>
      <span class="hl-attr">loading</span>=<span class="hl-str">"#loginLoading"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"text"</span> <span class="hl-attr">name</span>=<span class="hl-str">"email"</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"password"</span> <span class="hl-attr">name</span>=<span class="hl-str">"password"</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;button</span> <span class="hl-attr">type</span>=<span class="hl-str">"submit"</span><span class="hl-tag">&gt;</span>Login<span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;/form&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"loginSuccess"</span> <span class="hl-attr">var</span>=<span class="hl-str">"result"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;p&gt;</span>Welcome, <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"result.user.name"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>!<span class="hl-tag">&lt;/p&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"loginError"</span> <span class="hl-attr">var</span>=<span class="hl-str">"err"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;p</span> <span class="hl-attr">class</span>=<span class="hl-str">"error"</span> <span class="hl-attr">bind</span>=<span class="hl-str">"err.message"</span><span class="hl-tag">&gt;&lt;/p&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>

    <h3 class="doc-title">PUT / PATCH / DELETE</h3>
    <div class="code-block"><pre><span class="hl-tag">&lt;form</span> <span class="hl-attr">put</span>=<span class="hl-str">"/users/{user.id}"</span>
      <span class="hl-attr">body</span>=<span class="hl-str">'{"name": "{user.name}", "role": "{selectedRole}"}'</span>
      <span class="hl-attr">success</span>=<span class="hl-str">"#updateSuccess"</span><span class="hl-tag">&gt;</span>
  ...
<span class="hl-tag">&lt;/form&gt;</span>

<span class="hl-tag">&lt;button</span> <span class="hl-attr">delete</span>=<span class="hl-str">"/users/{user.id}"</span>
        <span class="hl-attr">as</span>=<span class="hl-str">"result"</span>
        <span class="hl-attr">confirm</span>=<span class="hl-str">"Are you sure?"</span>
        <span class="hl-attr">success</span>=<span class="hl-str">"#deleteSuccess"</span>
        <span class="hl-attr">error</span>=<span class="hl-str">"#deleteError"</span><span class="hl-tag">&gt;</span>
  Delete User
<span class="hl-tag">&lt;/button&gt;</span></pre></div>
  </div>

  <!-- Mutation Attributes -->
  <div class="doc-section">
    <h3 class="doc-title">Mutation Attributes</h3>
    <table class="doc-table">
      <thead><tr><th>Attribute</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>post</code>, <code>put</code>, <code>patch</code>, <code>delete</code></td><td>URL for the request</td></tr>
        <tr><td><code>body</code></td><td>Request body (JSON string with interpolation). For forms, auto-serializes fields</td></tr>
        <tr><td><code>success</code></td><td>Template ID to render on success. Receives response as <code>var</code></td></tr>
        <tr><td><code>error</code></td><td>Template ID to render on error. Receives error as <code>var</code></td></tr>
        <tr><td><code>loading</code></td><td>Template ID to show during request</td></tr>
        <tr><td><code>confirm</code></td><td>Show browser <code>confirm()</code> dialog before sending</td></tr>
        <tr><td><code>redirect</code></td><td>URL to navigate to on success (SPA route)</td></tr>
        <tr><td><code>then</code></td><td>Expression to execute on success (e.g. <code>"users.push(result)"</code>)</td></tr>
        <tr><td><code>into</code></td><td>Write response to a named global store</td></tr>
        <tr><td><code>cached</code></td><td>Cache responses (memory/local/session). <em>Note: caching only applies to GET requests.</em></td></tr>
      </tbody>
    </table>
  </div>

  <!-- Request Lifecycle -->
  <div class="doc-section">
    <h3 class="doc-title">Request Lifecycle</h3>
    <div class="code-block"><pre><span class="hl-cmt">[idle] → [loading] → [success | error]</span>
<span class="hl-cmt">                        ↓         ↓</span>
<span class="hl-cmt">                   render tpl   render tpl</span>
<span class="hl-cmt">                   exec `then`  log to console</span>
<span class="hl-cmt">                   `redirect`</span></pre></div>
  </div>

  <!-- Live Demo -->
  <div class="doc-section">
    <h2 class="doc-title">Live Demo — API Fetch</h2>
    <div class="demo-split">
      <div class="demo-code">
        <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"https://jsonplaceholder.typicode.com/users?_limit=3"</span>
     <span class="hl-attr">as</span>=<span class="hl-str">"users"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">each</span>=<span class="hl-str">"user in users"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;strong</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.name"</span><span class="hl-tag">&gt;&lt;/strong&gt;</span>
    <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.email"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
      </div>
      <div class="demo-preview">
        <span class="demo-result-label">Result</span>
        <div get="https://jsonplaceholder.typicode.com/users?_limit=3" as="users">
          <div each="user in users" style="padding: 8px 0; border-bottom: 1px solid var(--border);">
            <strong bind="user.name"></strong><br>
            <span style="color: var(--text-muted); font-size: 0.875rem;" bind="user.email"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>


