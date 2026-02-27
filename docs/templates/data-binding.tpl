<!-- Data Binding — from data-binding.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">Data Binding</h1>
  <p class="hero-subtitle">One-way and two-way data binding with bind and model</p>
</section>

<div class="doc-content">

  <!-- bind -->
  <div class="doc-section">
    <h2 class="doc-title">bind — Text Content</h2>
    <p class="doc-text">Replaces the element's <code>textContent</code> with the evaluated expression.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.name"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.age + ' years old'"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"items.length === 0 ? 'Empty' : items.length + ' items'"</span><span class="hl-tag">&gt;&lt;/span&gt;</span></pre></div>
  </div>

  <!-- bind-html -->
  <div class="doc-section">
    <h2 class="doc-title">bind-html — Inner HTML</h2>
    <p class="doc-text">Renders evaluated expression as HTML. Sanitized by default.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">bind-html</span>=<span class="hl-str">"article.content"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">bind-html</span>=<span class="hl-str">"`&lt;em&gt;${user.bio}&lt;/em&gt;`"</span><span class="hl-tag">&gt;&lt;/div&gt;</span></pre></div>
    <div class="callout"><p>⚠️ Uses built-in regex-based sanitization: strips <code>&lt;script&gt;</code> tags, blocks <code>on*</code> event handlers, and removes <code>javascript:</code> URIs.</p></div>
  </div>

  <!-- bind-* -->
  <div class="doc-section">
    <h2 class="doc-title">bind-* — Attribute Binding</h2>
    <p class="doc-text">Bind any HTML attribute dynamically.</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- src, href, alt, title --&gt;</span>
<span class="hl-tag">&lt;img</span> <span class="hl-attr">bind-src</span>=<span class="hl-str">"user.avatarUrl"</span>
     <span class="hl-attr">bind-alt</span>=<span class="hl-str">"user.name + ' avatar'"</span> <span class="hl-tag">/&gt;</span>

<span class="hl-tag">&lt;a</span> <span class="hl-attr">bind-href</span>=<span class="hl-str">"'/users/' + user.id"</span>
   <span class="hl-attr">bind-title</span>=<span class="hl-str">"'View ' + user.name"</span><span class="hl-tag">&gt;</span>Profile<span class="hl-tag">&lt;/a&gt;</span>

<span class="hl-cmt">&lt;!-- disabled, readonly, checked --&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">bind-disabled</span>=<span class="hl-str">"!form.isValid"</span><span class="hl-tag">&gt;</span>Submit<span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"checkbox"</span> <span class="hl-attr">bind-checked</span>=<span class="hl-str">"user.isActive"</span> <span class="hl-tag">/&gt;</span>

<span class="hl-cmt">&lt;!-- Data attributes --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">bind-data-id</span>=<span class="hl-str">"user.id"</span>
     <span class="hl-attr">bind-data-role</span>=<span class="hl-str">"user.role"</span><span class="hl-tag">&gt;&lt;/div&gt;</span></pre></div>
  </div>

  <!-- model -->
  <div class="doc-section">
    <h2 class="doc-title">model — Two-Way Binding</h2>
    <p class="doc-text">For form inputs, <code>model</code> creates automatic two-way data binding.</p>
    <div class="demo-split">
      <div class="demo-code"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ name: '', agreed: false }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"text"</span> <span class="hl-attr">model</span>=<span class="hl-str">"name"</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"checkbox"</span> <span class="hl-attr">model</span>=<span class="hl-str">"agreed"</span> <span class="hl-tag">/&gt;</span>

  <span class="hl-tag">&lt;p&gt;</span>Hello, <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"name"</span><span class="hl-tag">&gt;&lt;/span&gt;&lt;/p&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
      <div class="demo-preview" state="{ name: '', agreed: false }">
        <div class="demo-result-label">Preview</div>
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" model="name" class="input" placeholder="Type your name..." />
        </div>
        <label class="checkbox-label">
          <input type="checkbox" model="agreed" /> I agree
        </label>
        <p class="mt-3">Hello, <strong bind="name || '...'"></strong></p>
        <p class="text-sm text-muted">Agreed: <span bind="agreed"></span></p>
      </div>
    </div>
  </div>

</div>

