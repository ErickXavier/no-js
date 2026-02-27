<!-- Error Handling — from error-handling.md -->

<section class="hero-section">
  <span class="badge">API Reference</span>
  <h1 class="hero-title">Error Handling</h1>
  <p class="hero-subtitle">Per-element error templates, retry logic, and global error handlers</p>
</section>

<div class="doc-content">

  <!-- Per-Element Error Handling -->
  <div class="doc-section">
    <h2 class="doc-title">Per-Element Error Handling</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/api/users"</span>
     <span class="hl-attr">as</span>=<span class="hl-str">"users"</span>
     <span class="hl-attr">error</span>=<span class="hl-str">"#usersError"</span>
     <span class="hl-attr">retry</span>=<span class="hl-str">"3"</span>
     <span class="hl-attr">retry-delay</span>=<span class="hl-str">"2000"</span><span class="hl-tag">&gt;</span>
  ...
<span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"usersError"</span> <span class="hl-attr">var</span>=<span class="hl-str">"err"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"error-box"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;p</span> <span class="hl-attr">bind</span>=<span class="hl-str">"err.message"</span><span class="hl-tag">&gt;&lt;/p&gt;</span>
    <span class="hl-tag">&lt;p&gt;</span>Status: <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"err.status"</span><span class="hl-tag">&gt;&lt;/span&gt;&lt;/p&gt;</span>
    <span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$el.parentElement.dispatchEvent(new Event('retry'))"</span><span class="hl-tag">&gt;</span>
      Try Again
    <span class="hl-tag">&lt;/button&gt;</span>
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

  <!-- Global Error Handler -->
  <div class="doc-section">
    <h2 class="doc-title">Global Error Handler</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-fn">NoJS</span>.<span class="hl-fn">on</span>(<span class="hl-str">'error'</span>, (<span class="hl-attr">error</span>, <span class="hl-attr">context</span>) <span class="hl-op">=&gt;</span> {
    console.<span class="hl-fn">error</span>(<span class="hl-str">'[No.JS Error]'</span>, error);
    <span class="hl-cmt">// Send to error tracking service</span>
  });

  <span class="hl-fn">NoJS</span>.<span class="hl-fn">on</span>(<span class="hl-str">'fetch:error'</span>, <span class="hl-kw">async</span> ({ <span class="hl-attr">url</span>, <span class="hl-attr">error</span> }) <span class="hl-op">=&gt;</span> {
    <span class="hl-kw">if</span> (error.status <span class="hl-op">===</span> <span class="hl-num">401</span>) {
      <span class="hl-fn">NoJS</span>.store.auth.user <span class="hl-op">=</span> <span class="hl-kw">null</span>;
      <span class="hl-kw">await</span> <span class="hl-fn">NoJS</span>.router.<span class="hl-fn">push</span>(<span class="hl-str">'/login'</span>);
    }
  });
<span class="hl-tag">&lt;/script&gt;</span></pre></div>
  </div>

  <!-- error-boundary -->
  <div class="doc-section">
    <h2 class="doc-title">error-boundary — Catch Errors in Subtree</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">error-boundary</span>=<span class="hl-str">"#errorFallback"</span><span class="hl-tag">&gt;</span>
  <span class="hl-cmt">&lt;!-- Catches uncaught runtime errors (via window error listener) in this subtree --&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/api/fragile-endpoint"</span> <span class="hl-attr">as</span>=<span class="hl-str">"data"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"data.deep.nested.value"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"errorFallback"</span> <span class="hl-attr">var</span>=<span class="hl-str">"err"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">class</span>=<span class="hl-str">"error-boundary"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;h3&gt;</span>Something went wrong<span class="hl-tag">&lt;/h3&gt;</span>
    <span class="hl-tag">&lt;pre</span> <span class="hl-attr">bind</span>=<span class="hl-str">"err.message"</span><span class="hl-tag">&gt;&lt;/pre&gt;</span>
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

</div>
