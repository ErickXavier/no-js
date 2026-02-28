<!-- Landing Page - from design.pen V7 "The Full Story" (bAp6a) -->

<!-- ═══ Section 1: Code Comparison - #F8FAFC bg, padding 80, gap 40 ═══ -->
<section class="v7-code-compare">
  <h2 class="v7-code-compare-title">The same app.<br>The real difference.</h2>
  <p class="v7-code-compare-sub">A reactive search box - the most common real-world pattern.</p>
  <div class="v7-panels">
    <div class="v7-panel">
      <div class="v7-panel-topbar">
        <span class="v7-panel-label v7-panel-label--react">React</span>
        <span class="v7-panel-meta">25 lines  ·  react, react-dom, useState, useEffect</span>
      </div>
      <pre class="v7-panel-code"><span class="v7-ln"> 1</span><span class="hl-kw">import</span> { useState, useEffect } <span class="hl-kw">from</span> <span class="hl-str">'react'</span>;
<span class="v7-ln"> 2</span>
<span class="v7-ln"> 3</span><span class="hl-kw">const</span> <span class="hl-fn">Search</span> = () =&gt; {
<span class="v7-ln"> 4</span>  <span class="hl-kw">const</span> [query, setQuery] = <span class="hl-fn">useState</span>(<span class="hl-str">''</span>);
<span class="v7-ln"> 5</span>  <span class="hl-kw">const</span> [results, setResults] = <span class="hl-fn">useState</span>([]);
<span class="v7-ln"> 6</span>
<span class="v7-ln"> 7</span>  <span class="hl-fn">useEffect</span>(() =&gt; {
<span class="v7-ln"> 8</span>    <span class="hl-kw">if</span> (!query) <span class="hl-kw">return</span>;
<span class="v7-ln"> 9</span>    <span class="hl-fn">fetch</span>(<span class="hl-str">`/api/search?q=</span><span class="hl-op">${</span>query<span class="hl-op">}</span><span class="hl-str">`</span>)
<span class="v7-ln">10</span>      .then(r =&gt; r.json())
<span class="v7-ln">11</span>      .then(setResults);
<span class="v7-ln">12</span>  }, [query]);
<span class="v7-ln">13</span>
<span class="v7-ln">14</span>  <span class="hl-kw">return</span> (
<span class="v7-ln">15</span>    <span class="hl-tag">&lt;div&gt;</span>
<span class="v7-ln">16</span>      <span class="hl-tag">&lt;input</span>
<span class="v7-ln">17</span>        <span class="hl-attr">value</span>=<span class="hl-str">{query}</span>
<span class="v7-ln">18</span>        <span class="hl-attr">onChange</span>=<span class="hl-str">{e =&gt; setQuery(e.target.value)}</span>
<span class="v7-ln">19</span>      <span class="hl-tag">/&gt;</span>
<span class="v7-ln">20</span>      {results.map(r =&gt; (
<span class="v7-ln">21</span>        <span class="hl-tag">&lt;li</span> <span class="hl-attr">key</span>=<span class="hl-str">{r.id}</span><span class="hl-tag">&gt;</span>{r.name}<span class="hl-tag">&lt;/li&gt;</span>
<span class="v7-ln">22</span>      ))}
<span class="v7-ln">23</span>    <span class="hl-tag">&lt;/div&gt;</span>
<span class="v7-ln">24</span>  );
<span class="v7-ln">25</span>};</pre>
    </div>
    <div class="v7-panel">
      <div class="v7-panel-topbar">
        <span class="v7-panel-label v7-panel-label--nojs">No.JS</span>
        <span class="v7-panel-meta">4 lines  ·  0 imports</span>
      </div>
      <pre class="v7-panel-code v7-panel-code--nojs"><span class="v7-ln">1</span><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ query: '' }"</span> <span class="hl-attr">get</span>=<span class="hl-str">"/api/search?q={{ query }}"</span> <span class="hl-attr">as</span>=<span class="hl-str">"results"</span><span class="hl-tag">&gt;</span>
<span class="v7-ln">2</span>  <span class="hl-tag">&lt;input</span> <span class="hl-attr">model</span>=<span class="hl-str">"query"</span> <span class="hl-tag">/&gt;</span>
<span class="v7-ln">3</span>  <span class="hl-tag">&lt;li</span> <span class="hl-attr">each</span>=<span class="hl-str">"r in results"</span> <span class="hl-attr">bind</span>=<span class="hl-str">"r.name"</span><span class="hl-tag">&gt;&lt;/li&gt;</span>
<span class="v7-ln">4</span><span class="hl-tag">&lt;/div&gt;</span></pre>
      <span class="v7-panel-note">✓ Reactive  ·  ✓ Auto-fetches  ·  ✓ No build step</span>
    </div>
  </div>
</section>

<!-- ═══ Section 2: Bundle Stats - white bg, padding 100/80, gap 24, centered ═══ -->
<section class="v7-bundle">
  <span class="v7-bundle-badge">The outcome.</span>
  <h2 class="v7-bundle-h1">Your bundle is 2.3 MB.</h2>
  <h2 class="v7-bundle-h2">Ours is 11 KB.</h2>
  <p class="v7-bundle-sub">No build step. No bundler. No excuses.</p>
  <div class="v7-bundle-btns">
    <a route="/docs" class="btn btn-primary">Get Started</a>
    <a route="/docs" class="btn btn-secondary">Read the Docs</a>
  </div>
</section>

<!-- ═══ Section 3: Philosophy Hero - #0F172A bg, padding 120/80/100/80, gap 32 ═══ -->
<section class="v7-manifesto">
  <span class="v7-kicker">A MANIFESTO</span>
  <h1 class="v7-manifesto-h1">The web was already reactive.</h1>
  <h2 class="v7-manifesto-h2">We just gave HTML the attributes to prove it.</h2>
  <div class="v7-divider"></div>
</section>

<!-- ═══ Section 4: Problem Editorial - #0F172A bg, padding 80, gap 60 ═══ -->
<section class="v7-problem">
  <span class="v7-kicker">THE PROBLEM WITH MODERN JAVASCRIPT</span>
  <div class="v7-columns">
    <div class="v7-column">
      <p>Somewhere between "component thinking" and "virtual DOM diffing", we forgot that the browser already understands HTML. It already knows how to update the DOM. It already handles events.</p>
      <p>We built abstraction upon abstraction until a simple form required three files, a build pipeline, and a framework runtime.</p>
    </div>
    <div class="v7-column">
      <p>No.JS is the opposite bet. The browser is not the enemy, it's the platform. HTML is not limited, it's underutilized. Attributes are not primitive, they're a DSL waiting to happen.</p>
      <p>We built No.JS on one conviction: if you can express it in HTML, you should.</p>
    </div>
    <div class="v7-column">
      <p>The result is a framework you can learn in an afternoon and ship in 30 seconds. Not because we made it simple, but because the browser was already capable. We just got out of the way.</p>
      <p>This is not anti-JavaScript. It's pro-HTML.</p>
    </div>
  </div>
</section>

<!-- ═══ Section 5: Principles - #0A1020 bg, padding 80, gap 48 ═══ -->
<section class="v7-principles">
  <span class="v7-kicker">OUR PRINCIPLES</span>
  <div class="v7-principles-grid">
    <div class="v7-principle-card">
      <span class="v7-principle-num">01</span>
      <h3 class="v7-principle-title">The browser is the platform</h3>
      <p class="v7-principle-desc">We don't abstract the browser. We extend HTML to use it fully.</p>
    </div>
    <div class="v7-principle-card">
      <span class="v7-principle-num">02</span>
      <h3 class="v7-principle-title">Complexity is the enemy</h3>
      <p class="v7-principle-desc">If a feature requires a build step to exist, it doesn't belong in No.JS.</p>
    </div>
    <div class="v7-principle-card">
      <span class="v7-principle-num">03</span>
      <h3 class="v7-principle-title">HTML-first, forever</h3>
      <p class="v7-principle-desc">Every directive is an HTML attribute. Your templates are valid HTML that any browser can read.</p>
    </div>
    <div class="v7-principle-card">
      <span class="v7-principle-num">04</span>
      <h3 class="v7-principle-title">Ship on day one</h3>
      <p class="v7-principle-desc">The best framework is the one you can use right now, without asking permission from a terminal.</p>
    </div>
  </div>
</section>

<!-- ═══ Section 6: Pull Quote - #F8FAFC bg, padding 80/160, centered ═══ -->
<section class="v7-quote">
  <blockquote class="v7-quote-text">"The best JavaScript<br>is the JavaScript you don't write."</blockquote>
</section>

<!-- ═══ Section 7: CTA - #0F172A bg, padding 80, gap 20, centered ═══ -->
<section class="landing-cta">
  <h2 class="landing-cta-headline">Ready to Build?</h2>
  <p class="landing-cta-sub">Start using No.JS today.</p>
  <div class="cta-buttons">
    <a route="/docs" class="btn btn-cta-primary">Get Started</a>
    <a route="/docs" class="btn btn-ghost">Learn More</a>
  </div>
</section>
