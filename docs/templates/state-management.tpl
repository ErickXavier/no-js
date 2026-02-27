<!-- State Management — from state-management.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">State Management</h1>
  <p class="hero-subtitle">Local state, global stores, computed properties, and watchers</p>
</section>

<div class="doc-content">

  <!-- state -->
  <div class="doc-section">
    <h2 class="doc-title">state — Local State</h2>
    <p class="doc-text">Creates a reactive context scoped to the element and its children.</p>
    <div class="demo-split">
      <div class="demo-code"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ count: 0, name: 'World' }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;h1&gt;</span>Hello, <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"name"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>!<span class="hl-tag">&lt;/h1&gt;</span>
  <span class="hl-tag">&lt;p&gt;</span>Count: <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"count"</span><span class="hl-tag">&gt;&lt;/span&gt;&lt;/p&gt;</span>
  <span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"count++"</span><span class="hl-tag">&gt;</span>+1<span class="hl-tag">&lt;/button&gt;</span>
  <span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"count = 0"</span><span class="hl-tag">&gt;</span>Reset<span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
      <div class="demo-preview" state="{ count: 0, name: 'World' }">
        <div class="demo-result-label">Preview</div>
        <h3>Hello, <span bind="name"></span>!</h3>
        <p>Count: <span bind="count"></span></p>
        <div class="flex gap-2">
          <button class="btn btn-primary btn-sm" on:click="count++">+1</button>
          <button class="btn btn-outline btn-sm" on:click="count = 0">Reset</button>
        </div>
      </div>
    </div>
  </div>

  <!-- store -->
  <div class="doc-section">
    <h2 class="doc-title">store — Global Store</h2>
    <p class="doc-text">A global reactive store accessible from anywhere. Ideal for auth state, theme, shared data.</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Define store (once, typically at top of page) --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">store</span>=<span class="hl-str">"app"</span> <span class="hl-attr">value</span>=<span class="hl-str">"{
  user: null,
  theme: 'dark',
  lang: 'en',
  notifications: []
}"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>

<span class="hl-cmt">&lt;!-- Access store from anywhere --&gt;</span>
<span class="hl-tag">&lt;nav&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"$store.app.user.name"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
<span class="hl-tag">&lt;/nav&gt;</span></pre></div>
  </div>

  <!-- into -->
  <div class="doc-section">
    <h2 class="doc-title">into — Write Fetch Results to a Store</h2>
    <p class="doc-text">The <code>into</code> attribute on any HTTP directive writes the response directly into a named global store.</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Define an empty store --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">store</span>=<span class="hl-str">"currentUser"</span> <span class="hl-attr">value</span>=<span class="hl-str">"{}"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>

<span class="hl-cmt">&lt;!-- Fetch and write into the store --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/me"</span> <span class="hl-attr">as</span>=<span class="hl-str">"user"</span> <span class="hl-attr">into</span>=<span class="hl-str">"currentUser"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>

<span class="hl-cmt">&lt;!-- Read from the store anywhere --&gt;</span>
<span class="hl-tag">&lt;nav&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"$store.currentUser.user.name"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
<span class="hl-tag">&lt;/nav&gt;</span></pre></div>
    <div class="callout"><p>The store doesn't need to be pre-defined — <code>into</code> will create it if it doesn't exist.</p></div>
  </div>

  <!-- computed -->
  <div class="doc-section">
    <h2 class="doc-title">computed — Derived State</h2>
    <p class="doc-text">Values that are automatically recalculated when dependencies change.</p>
    <div class="demo-split">
      <div class="demo-code"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ price: 100, qty: 2, tax: 0.1 }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">computed</span>=<span class="hl-str">"subtotal"</span>
       <span class="hl-attr">expr</span>=<span class="hl-str">"price * qty"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">computed</span>=<span class="hl-str">"total"</span>
       <span class="hl-attr">expr</span>=<span class="hl-str">"subtotal * (1 + tax)"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>

  <span class="hl-tag">&lt;p&gt;</span>Total: $<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"total"</span><span class="hl-tag">&gt;&lt;/span&gt;&lt;/p&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"number"</span> <span class="hl-attr">model</span>=<span class="hl-str">"qty"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
      <div class="demo-preview" state="{ price: 100, qty: 2, tax: 0.1 }">
        <div class="demo-result-label">Preview</div>
        <div computed="subtotal" expr="price * qty"></div>
        <div computed="total" expr="subtotal * (1 + tax)"></div>
        <p>Price: $<span bind="price"></span></p>
        <p>Qty: <input type="number" model="qty" class="input" style="width:80px;display:inline-block" /></p>
        <p>Subtotal: $<span bind="subtotal"></span></p>
        <p><strong>Total: $<span bind="total"></span></strong></p>
      </div>
    </div>
  </div>

  <!-- watch -->
  <div class="doc-section">
    <h2 class="doc-title">watch — Side Effects</h2>
    <p class="doc-text">Execute an action whenever a value changes.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ search: '' }"</span>
     <span class="hl-attr">watch</span>=<span class="hl-str">"search"</span>
     <span class="hl-attr">on:change</span>=<span class="hl-str">"console.log('Search:', search)"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">model</span>=<span class="hl-str">"search"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

  <!-- persistence -->
  <div class="doc-section">
    <h2 class="doc-title">State Persistence</h2>
    <p class="doc-text">Persist state across page reloads using <code>localStorage</code> or <code>sessionStorage</code>.</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Persists to localStorage --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ theme: 'dark', sidebar: true }"</span>
     <span class="hl-attr">persist</span>=<span class="hl-str">"localStorage"</span>
     <span class="hl-attr">persist-key</span>=<span class="hl-str">"app-settings"</span><span class="hl-tag">&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-cmt">&lt;!-- Persists to sessionStorage --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ cartItems: [] }"</span>
     <span class="hl-attr">persist</span>=<span class="hl-str">"sessionStorage"</span>
     <span class="hl-attr">persist-key</span>=<span class="hl-str">"cart"</span><span class="hl-tag">&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

</div>

