<!-- Styling — from styling.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">Dynamic Styling</h1>
  <p class="hero-subtitle">Toggle CSS classes and inline styles reactively</p>
</section>

<div class="doc-content">

  <!-- class-* -->
  <div class="doc-section">
    <h2 class="doc-title">class-* — Toggle Classes</h2>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Toggle a single class based on expression --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">class-active</span>=<span class="hl-str">"isActive"</span>
     <span class="hl-attr">class-disabled</span>=<span class="hl-str">"!isEnabled"</span>
     <span class="hl-attr">class-highlighted</span>=<span class="hl-str">"score > 90"</span><span class="hl-tag">&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>

    <h3 class="doc-title">Multiple Classes from Object</h3>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">class-map</span>=<span class="hl-str">"{ active: isActive, 'text-bold': isBold, error: hasError }"</span><span class="hl-tag">&gt;&lt;/div&gt;</span></pre></div>

    <h3 class="doc-title">From Array</h3>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">class-list</span>=<span class="hl-str">"['base-class', isAdmin ? 'admin' : 'user']"</span><span class="hl-tag">&gt;&lt;/div&gt;</span></pre></div>
  </div>

  <!-- style-* -->
  <div class="doc-section">
    <h2 class="doc-title">style-* — Inline Styles</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">style-color</span>=<span class="hl-str">"isError ? 'red' : 'green'"</span>
     <span class="hl-attr">style-font-size</span>=<span class="hl-str">"fontSize + 'px'"</span>
     <span class="hl-attr">style-opacity</span>=<span class="hl-str">"isVisible ? 1 : 0.5"</span>
     <span class="hl-attr">style-background</span>=<span class="hl-str">"'linear-gradient(135deg, ' + color1 + ', ' + color2 + ')'"</span><span class="hl-tag">&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>

    <h3 class="doc-title">From Object</h3>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">style-map</span>=<span class="hl-str">"{
  color: textColor,
  fontSize: size + 'px',
  transform: 'rotate(' + rotation + 'deg)'
}"</span><span class="hl-tag">&gt;&lt;/div&gt;</span></pre></div>
  </div>

  <!-- Live Demo -->
  <div class="doc-section">
    <h2 class="doc-title">Live Demo — Dynamic Styling</h2>
    <div class="demo-split">
      <div class="demo-code">
        <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ active: false, color: '#0EA5E9' }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"active = !active"</span><span class="hl-tag">&gt;</span>Toggle<span class="hl-tag">&lt;/button&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">class-active</span>=<span class="hl-str">"active"</span>
       <span class="hl-attr">style-color</span>=<span class="hl-str">"color"</span><span class="hl-tag">&gt;</span>
    Styled box
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
      </div>
      <div class="demo-preview">
        <span class="demo-result-label">Result</span>
        <div state="{ active: false, color: '#0EA5E9' }">
          <button class="btn btn-primary btn-sm" on:click="active = !active" style="margin-bottom: 12px;">Toggle Active</button>
          <div class-active="active"
               style-color="color"
               style="padding: 16px; border-radius: 8px; border: 2px solid var(--border); transition: all 0.2s;">
            <span bind="active ? '✓ Active' : '✗ Inactive'"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>
