<!-- Animations — from animations.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">Animations &amp; Transitions</h1>
  <p class="hero-subtitle">Declarative enter/leave animations and CSS transitions</p>
</section>

<div class="doc-content">

  <!-- animate -->
  <div class="doc-section">
    <h2 class="doc-title">animate — Enter/Leave Animations</h2>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- CSS animation name on enter --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">if</span>=<span class="hl-str">"visible"</span> <span class="hl-attr">animate</span>=<span class="hl-str">"fadeIn"</span><span class="hl-tag">&gt;</span>Content<span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-cmt">&lt;!-- Enter and leave animations --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">if</span>=<span class="hl-str">"visible"</span>
     <span class="hl-attr">animate-enter</span>=<span class="hl-str">"slideInRight"</span>
     <span class="hl-attr">animate-leave</span>=<span class="hl-str">"slideOutLeft"</span>
     <span class="hl-attr">animate-duration</span>=<span class="hl-str">"300"</span><span class="hl-tag">&gt;</span>
  Content
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

  <!-- transition -->
  <div class="doc-section">
    <h2 class="doc-title">transition — CSS Transition Classes</h2>
    <p class="doc-text">Follows a convention similar to Vue's transition system.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">if</span>=<span class="hl-str">"show"</span> <span class="hl-attr">transition</span>=<span class="hl-str">"fade"</span><span class="hl-tag">&gt;</span>Content<span class="hl-tag">&lt;/div&gt;</span></pre></div>

    <p class="doc-text">No.JS adds/removes classes during the transition:</p>
    <table class="doc-table">
      <thead><tr><th>Class</th><th>When</th></tr></thead>
      <tbody>
        <tr><td><code>fade-enter</code></td><td>Start state of enter</td></tr>
        <tr><td><code>fade-enter-active</code></td><td>Active state of enter</td></tr>
        <tr><td><code>fade-enter-to</code></td><td>End state of enter</td></tr>
        <tr><td><code>fade-leave</code></td><td>Start state of leave</td></tr>
        <tr><td><code>fade-leave-active</code></td><td>Active state of leave</td></tr>
        <tr><td><code>fade-leave-to</code></td><td>End state of leave</td></tr>
      </tbody>
    </table>

    <div class="code-block"><pre><span class="hl-kw">.fade-enter-active</span>, <span class="hl-kw">.fade-leave-active</span> {
  <span class="hl-attr">transition</span>: opacity <span class="hl-num">0.3s</span> ease;
}
<span class="hl-kw">.fade-enter</span>, <span class="hl-kw">.fade-leave-to</span> {
  <span class="hl-attr">opacity</span>: <span class="hl-num">0</span>;
}</pre></div>
  </div>

  <!-- Loop Animations -->
  <div class="doc-section">
    <h2 class="doc-title">Loop Animations</h2>
    <p class="doc-text">Both <code>each</code> and <code>foreach</code> loops support enter/leave animations and stagger.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">each</span>=<span class="hl-str">"item in items"</span>
     <span class="hl-attr">template</span>=<span class="hl-str">"itemTpl"</span>
     <span class="hl-attr">animate-enter</span>=<span class="hl-str">"fadeInUp"</span>
     <span class="hl-attr">animate-leave</span>=<span class="hl-str">"fadeOutDown"</span>
     <span class="hl-attr">animate-stagger</span>=<span class="hl-str">"50"</span><span class="hl-tag">&gt;</span>  <span class="hl-cmt">&lt;!-- 50ms delay between each item --&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

  <!-- Built-in Animation Names -->
  <div class="doc-section">
    <h2 class="doc-title">Built-in Animation Names</h2>
    <p class="doc-text">No.JS ships with these CSS animations:</p>
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      <span class="badge">fadeIn</span>
      <span class="badge">fadeOut</span>
      <span class="badge">fadeInUp</span>
      <span class="badge">fadeInDown</span>
      <span class="badge">fadeOutUp</span>
      <span class="badge">fadeOutDown</span>
      <span class="badge">slideInLeft</span>
      <span class="badge">slideInRight</span>
      <span class="badge">slideOutLeft</span>
      <span class="badge">slideOutRight</span>
      <span class="badge">zoomIn</span>
      <span class="badge">zoomOut</span>
      <span class="badge">bounceIn</span>
      <span class="badge">bounceOut</span>
    </div>
  </div>

  <!-- Live Demo -->
  <div class="doc-section">
    <h2 class="doc-title">Live Demo — Toggle Animation</h2>
    <div class="demo-split">
      <div class="demo-code">
        <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ show: true }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"show = !show"</span><span class="hl-tag">&gt;</span>Toggle<span class="hl-tag">&lt;/button&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">if</span>=<span class="hl-str">"show"</span>
       <span class="hl-attr">animate-enter</span>=<span class="hl-str">"fadeIn"</span>
       <span class="hl-attr">animate-leave</span>=<span class="hl-str">"fadeOut"</span><span class="hl-tag">&gt;</span>
    Hello, Animated World!
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
      </div>
      <div class="demo-preview">
        <span class="demo-result-label">Result</span>
        <div state="{ show: true }">
          <button class="btn btn-primary btn-sm" on:click="show = !show" style="margin-bottom: 12px;">Toggle</button>
          <div if="show" animate-enter="fadeIn" animate-leave="fadeOut" style="padding: 16px; background: var(--primary-surface); border-radius: 8px; color: var(--primary);">
            Hello, Animated World! ✨
          </div>
        </div>
      </div>
    </div>
  </div>

</div>