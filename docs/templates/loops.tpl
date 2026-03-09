<!-- Loops — from loops.md -->

<section class="hero-section">
  <span class="badge" t="docs.loops.hero.badge">Guides</span>
  <h1 class="hero-title" t="docs.loops.hero.title">Loops</h1>
  <p class="hero-subtitle" t="docs.loops.hero.subtitle">Iterate over arrays with each and foreach</p>
</section>

<div class="doc-content">

  <!-- each -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.loops.each.title">each — Iterate Over Arrays</h2>
    <div class="demo-split">
      <div class="demo-code"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">get</span>=<span class="hl-str">"/posts"</span> <span class="hl-attr">as</span>=<span class="hl-str">"posts"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">each</span>=<span class="hl-str">"post in posts"</span>
       <span class="hl-attr">template</span>=<span class="hl-str">"postCard"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"postCard"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;article&gt;</span>
    <span class="hl-tag">&lt;h2</span> <span class="hl-attr">bind</span>=<span class="hl-str">"post.title"</span><span class="hl-tag">&gt;&lt;/h2&gt;</span>
    <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"'#' + $index"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
  <span class="hl-tag">&lt;/article&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
      <div class="demo-preview" state="{ fruits: ['Apple', 'Banana', 'Cherry', 'Date'] }">
        <div class="demo-result-label" t="docs.loops.each.preview">Preview</div>
        <div each="fruit in fruits" template="fruitItem"></div>
        <template id="fruitItem">
          <div class="item-row">
            <span class="item-index" bind="$index + 1"></span>
            <span class="item-name" bind="fruit"></span>
          </div>
        </template>
      </div>
    </div>
  </div>

  <!-- foreach -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.loops.foreach.title">foreach — Extended Loop</h2>
    <p class="doc-text" t="docs.loops.foreach.text">Offers more control with filtering, sorting, pagination, and custom variable names.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;ul&gt;</span>
  <span class="hl-tag">&lt;li</span> <span class="hl-attr">foreach</span>=<span class="hl-str">"item"</span>
      <span class="hl-attr">from</span>=<span class="hl-str">"menuItems"</span>
      <span class="hl-attr">index</span>=<span class="hl-str">"idx"</span>
      <span class="hl-attr">key</span>=<span class="hl-str">"item.id"</span>
      <span class="hl-attr">else</span>=<span class="hl-str">"#noItems"</span>
      <span class="hl-attr">filter</span>=<span class="hl-str">"item.active"</span>
      <span class="hl-attr">sort</span>=<span class="hl-str">"order"</span>
      <span class="hl-attr">limit</span>=<span class="hl-str">"10"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;a</span> <span class="hl-attr">bind-href</span>=<span class="hl-str">"item.link"</span><span class="hl-tag">&gt;</span>
      <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"item.label"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
    <span class="hl-tag">&lt;/a&gt;</span>
  <span class="hl-tag">&lt;/li&gt;</span>
<span class="hl-tag">&lt;/ul&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"noItems"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;li</span> <span class="hl-attr">class</span>=<span class="hl-str">"empty"</span><span class="hl-tag">&gt;</span>No items available<span class="hl-tag">&lt;/li&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>

    <table class="doc-table">
      <thead>
        <tr><th t="docs.loops.foreach.col1">Attribute</th><th t="docs.loops.foreach.col2">Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>foreach</code></td><td t="docs.loops.foreach.foreach">Variable name for current item</td></tr>
        <tr><td><code>from</code></td><td t="docs.loops.foreach.from">Source array from context</td></tr>
        <tr><td><code>index</code></td><td t="docs.loops.foreach.index">Variable name for the index (default: <code>$index</code>)</td></tr>
        <tr><td><code>key</code></td><td t="docs.loops.foreach.key">Unique key expression for element identification and tracking</td></tr>
        <tr><td><code>else</code></td><td>Template ID to render when array is empty</td></tr>
        <tr><td><code>filter</code></td><td t="docs.loops.foreach.filter">Expression to filter items</td></tr>
        <tr><td><code>sort</code></td><td t="docs.loops.foreach.sort">Property path to sort by (prefix <code>-</code> for descending)</td></tr>
        <tr><td><code>limit</code></td><td t="docs.loops.foreach.limit">Maximum number of items to render</td></tr>
        <tr><td><code>offset</code></td><td t="docs.loops.foreach.offset">Number of items to skip</td></tr>
      </tbody>
    </table>
  </div>

  <!-- loop context variables -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.loops.contextVars.title">Loop Context Variables</h2>
    <table class="doc-table">
      <thead>
        <tr><th t="docs.loops.contextVars.col1">Variable</th><th t="docs.loops.contextVars.col2">Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>$index</code></td><td t="docs.loops.contextVars.index">Current index (0-based)</td></tr>
        <tr><td><code>$count</code></td><td t="docs.loops.contextVars.count">Total number of items</td></tr>
        <tr><td><code>$first</code></td><td t="docs.loops.contextVars.first"><code>true</code> if first item</td></tr>
        <tr><td><code>$last</code></td><td t="docs.loops.contextVars.last"><code>true</code> if last item</td></tr>
        <tr><td><code>$even</code></td><td t="docs.loops.contextVars.even"><code>true</code> if index is even</td></tr>
        <tr><td><code>$odd</code></td><td t="docs.loops.contextVars.odd"><code>true</code> if index is odd</td></tr>
      </tbody>
    </table>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">each</span>=<span class="hl-str">"item in items"</span>
     <span class="hl-attr">template</span>=<span class="hl-str">"contextItem"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"contextItem"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">class-first</span>=<span class="hl-str">"$first"</span>
       <span class="hl-attr">class-last</span>=<span class="hl-str">"$last"</span>
       <span class="hl-attr">class-striped</span>=<span class="hl-str">"$odd"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"$index + 1"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>. <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"item.name"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
  <span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

  <!-- nested loops -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.loops.nested.title">Nested Loops</h2>
    <p class="doc-text" t="docs.loops.nested.text">Child loops can access parent scope variables.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">each</span>=<span class="hl-str">"category in categories"</span>
     <span class="hl-attr">template</span>=<span class="hl-str">"categoryTpl"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"categoryTpl"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;h3</span> <span class="hl-attr">bind</span>=<span class="hl-str">"category.name"</span><span class="hl-tag">&gt;&lt;/h3&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">each</span>=<span class="hl-str">"product in category.products"</span>
       <span class="hl-attr">template</span>=<span class="hl-str">"productTpl"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span>

<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"productTpl"</span><span class="hl-tag">&gt;</span>
  <span class="hl-cmt">&lt;!-- Access both product AND category --&gt;</span>
  <span class="hl-tag">&lt;p&gt;</span><span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"category.name"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>: <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"product.name"</span><span class="hl-tag">&gt;&lt;/span&gt;&lt;/p&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

</div>

