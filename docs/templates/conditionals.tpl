<!-- Conditionals — from conditionals.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">Conditionals</h1>
  <p class="hero-subtitle">Control rendering with if, show, hide, and switch</p>
</section>

<div class="doc-content">

  <!-- if/then/else -->
  <div class="doc-section">
    <h2 class="doc-title">if / then / else</h2>
    <p class="doc-text">Conditionally render elements or templates based on expressions.</p>
    <div class="demo-split">
      <div class="demo-code"><pre><span class="hl-cmt">&lt;!-- Inline content --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">if</span>=<span class="hl-str">"user.isLoggedIn"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;p&gt;</span>Welcome back!<span class="hl-tag">&lt;/p&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-cmt">&lt;!-- With templates --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">if</span>=<span class="hl-str">"user.isAdmin"</span>
     <span class="hl-attr">then</span>=<span class="hl-str">"adminPanel"</span>
     <span class="hl-attr">else</span>=<span class="hl-str">"userPanel"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>

<span class="hl-cmt">&lt;!-- Complex expressions --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">if</span>=<span class="hl-str">"cart.items.length > 0"</span>
     <span class="hl-attr">then</span>=<span class="hl-str">"cartTpl"</span>
     <span class="hl-attr">else</span>=<span class="hl-str">"emptyCartTpl"</span><span class="hl-tag">&gt;&lt;/div&gt;</span></pre></div>
      <div class="demo-preview" state="{ loggedIn: true }">
        <div class="demo-result-label">Preview</div>
        <label class="checkbox-label mb-3">
          <input type="checkbox" model="loggedIn" /> Logged in
        </label>
        <div if="loggedIn">
          <div class="alert alert-success">✅ Welcome back!</div>
        </div>
        <div if="!loggedIn">
          <div class="alert alert-info">Please log in.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- else-if -->
  <div class="doc-section">
    <h2 class="doc-title">else-if — Chained Conditionals</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">if</span>=<span class="hl-str">"status === 'loading'"</span> <span class="hl-attr">then</span>=<span class="hl-str">"loadingTpl"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">else-if</span>=<span class="hl-str">"status === 'error'"</span> <span class="hl-attr">then</span>=<span class="hl-str">"errorTpl"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">else-if</span>=<span class="hl-str">"status === 'empty'"</span> <span class="hl-attr">then</span>=<span class="hl-str">"emptyTpl"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">else</span> <span class="hl-attr">then</span>=<span class="hl-str">"contentTpl"</span><span class="hl-tag">&gt;&lt;/div&gt;</span></pre></div>
  </div>

  <!-- show/hide -->
  <div class="doc-section">
    <h2 class="doc-title">show / hide</h2>
    <p class="doc-text">Toggles <code>display: none</code> without adding/removing DOM elements. Better for frequently toggled elements.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">show</span>=<span class="hl-str">"user.isLoggedIn"</span><span class="hl-tag">&gt;</span>Welcome!<span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">hide</span>=<span class="hl-str">"user.isLoggedIn"</span><span class="hl-tag">&gt;</span>Please log in.<span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-tag">&lt;button</span> <span class="hl-attr">show</span>=<span class="hl-str">"!editing"</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"editing = true"</span><span class="hl-tag">&gt;</span>Edit<span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">show</span>=<span class="hl-str">"editing"</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"editing = false"</span><span class="hl-tag">&gt;</span>Save<span class="hl-tag">&lt;/button&gt;</span></pre></div>

    <h3 class="doc-subtitle">if vs show</h3>
    <table class="doc-table">
      <thead>
        <tr><th></th><th><code>if</code></th><th><code>show</code></th></tr>
      </thead>
      <tbody>
        <tr><td>Mechanism</td><td>Adds/removes DOM elements</td><td>Toggles CSS <code>display</code></td></tr>
        <tr><td>Best for</td><td>Rarely toggled content</td><td>Frequently toggled content</td></tr>
        <tr><td>Preserves state</td><td>No (re-creates)</td><td>Yes</td></tr>
      </tbody>
    </table>
  </div>

  <!-- switch -->
  <div class="doc-section">
    <h2 class="doc-title">switch / case</h2>
    <p class="doc-text">Render one of many templates based on a value.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/me"</span> <span class="hl-attr">as</span>=<span class="hl-str">"user"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">switch</span>=<span class="hl-str">"user.role"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;div</span> <span class="hl-attr">case</span>=<span class="hl-str">"'admin'"</span>    <span class="hl-attr">then</span>=<span class="hl-str">"adminDashboard"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
    <span class="hl-tag">&lt;div</span> <span class="hl-attr">case</span>=<span class="hl-str">"'editor'"</span>   <span class="hl-attr">then</span>=<span class="hl-str">"editorDashboard"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
    <span class="hl-tag">&lt;div</span> <span class="hl-attr">case</span>=<span class="hl-str">"'viewer'"</span>   <span class="hl-attr">then</span>=<span class="hl-str">"viewerDashboard"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
    <span class="hl-tag">&lt;div</span> <span class="hl-attr">default</span>           <span class="hl-attr">then</span>=<span class="hl-str">"guestDashboard"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>

    <h3 class="doc-subtitle">Inline Content (no templates)</h3>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">switch</span>=<span class="hl-str">"order.status"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">case</span>=<span class="hl-str">"'pending'"</span><span class="hl-tag">&gt;</span>⏳ Pending<span class="hl-tag">&lt;/span&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">case</span>=<span class="hl-str">"'shipped'"</span><span class="hl-tag">&gt;</span>📦 Shipped<span class="hl-tag">&lt;/span&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">case</span>=<span class="hl-str">"'delivered'"</span><span class="hl-tag">&gt;</span>✅ Delivered<span class="hl-tag">&lt;/span&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">default</span><span class="hl-tag">&gt;</span>Unknown<span class="hl-tag">&lt;/span&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>

    <h3 class="doc-subtitle">Multi-Value Case</h3>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">switch</span>=<span class="hl-str">"user.role"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">case</span>=<span class="hl-str">"'admin','superadmin'"</span> <span class="hl-attr">then</span>=<span class="hl-str">"adminPanel"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">case</span>=<span class="hl-str">"'editor','writer'"</span>    <span class="hl-attr">then</span>=<span class="hl-str">"editorPanel"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">default</span>                     <span class="hl-attr">then</span>=<span class="hl-str">"viewerPanel"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

</div>

