<div class="page-wrapper">
<style>
/* ══════════════════════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════════════════════ */

/* Hero: padding 100/80/80/80, gap 32 */
.landing-hero {
  padding: 100px 80px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  text-align: center;
  padding-top: calc(100px + var(--header-h));
}
.landing-headline {
  font-family: var(--font-heading);
  font-size: 72px;
  font-weight: bold;
  color: var(--text);
  line-height: 1.1;
}
.landing-headline-accent {
  color: var(--primary);
}
.landing-subline {
  font-family: var(--font-body);
  font-size: 20px;
  color: var(--text-muted);
  max-width: 700px;
  text-align: center;
  line-height: 1.5;
}
.landing-cta-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
/* Install tabs — 3-option install widget (CDN / npm / ESM) */
.install-tabs {
  background: var(--code-bg);
  border: 1px solid var(--code-surface);
  border-radius: var(--radius);
  overflow: hidden;
  min-width: 480px;
  max-width: 660px;
}
.install-tabs-nav {
  display: flex;
  background: var(--code-surface);
  border-bottom: 1px solid #334155;
}
.install-tab-btn {
  padding: 10px 18px;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-dim);
  background: transparent;
  border-right: 1px solid #334155;
  transition: color 0.15s, background 0.15s;
}
.install-tab-btn:last-child {
  border-right: none;
}
.install-tab-btn:hover {
  color: #CBD5E1;
}
.install-tab-btn.active {
  color: var(--primary);
  background: var(--code-bg);
}
.install-tab-panel {
  padding: 14px 20px;
}
.install-tab-panel pre {
  font-family: var(--font-mono);
  font-size: 13px;
  color: #E2E8F0;
  margin: 0;
  white-space: pre;
  overflow-x: auto;
}

/* Code Example Section: #F8FAFC bg, padding 80, gap 16 */
.landing-code-section {
  background: var(--surface);
  padding: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.landing-panels {
  display: flex;
  gap: 0;
  width: 100%;
  margin-top: 44px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.landing-code-panel {
  flex: 1;
  background: var(--code-bg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.landing-code-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.landing-code-dots {
  font-size: 12px;
  color: var(--text-muted);
}
.landing-code-filename {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}
.landing-code-panel pre {
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.6;
  color: #E2E8F0;
  margin: 0;
}
.landing-preview-panel {
  flex: 1;
  background: var(--white);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.landing-preview-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.landing-preview-label {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}
.landing-live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--success);
}
.preview-user {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.preview-user-name {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}
.preview-user-email {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-muted);
}
.preview-divider {
  height: 1px;
  background: var(--border);
}

/* Features Section: white bg, padding 100/80, gap 60 */
.landing-features {
  padding: 100px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
}

/* Final CTA: #0F172A bg, padding 100/80, gap 24 */
.landing-cta {
  background: var(--code-bg);
  padding: 100px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}
.landing-cta-headline {
  font-family: var(--font-heading);
  font-size: 48px;
  font-weight: bold;
  color: var(--white);
}
.landing-cta-sub {
  font-family: var(--font-body);
  font-size: 20px;
  color: var(--text-dim);
}

/* ── V7 Landing Sections ── */

/* Code Comparison */
.v7-code-compare {
  background: var(--surface);
  padding: 80px;
  padding-top: calc(80px + var(--header-h));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}
.v7-code-compare-title {
  font-family: var(--font-heading);
  font-size: 80px;
  font-weight: bold;
  color: var(--text);
  text-align: center;
  letter-spacing: -1px;
  line-height: 1.1;
}
.v7-code-compare-sub {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--text-muted);
  text-align: center;
}
.v7-panels {
  display: flex;
  gap: 24px;
  width: 100%;
}
.v7-panel {
  flex: 1;
  background: var(--code-bg);
  border-radius: var(--radius-lg);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.v7-panel-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.v7-panel-label {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
}
.v7-panel-label--react { color: #F87171; }
.v7-panel-label--nojs { color: var(--primary); }
.v7-panel-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}
.v7-panel-code {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  color: #E2E8F0;
  margin: 0;
  white-space: pre;
  overflow-x: auto;
}
.v7-panel-code--nojs { color: #A5F3FC; }
.v7-ln {
  display: inline-block;
  width: 2.5ch;
  text-align: right;
  margin-right: 1.5ch;
  color: #475569;
  user-select: none;
  pointer-events: none;
  opacity: .45;
}
.v7-panel-note {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--primary);
}

/* Bundle Stats */
.v7-bundle {
  background: var(--white);
  padding: 100px 80px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}
.v7-bundle-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 100px;
  background: var(--primary-surface);
  border: 1px solid #BAE6FD;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-dark);
}
.v7-bundle-h1 {
  font-family: var(--font-heading);
  font-size: 64px;
  font-weight: bold;
  color: var(--text);
  letter-spacing: -2px;
}
.v7-bundle-h2 {
  font-family: var(--font-heading);
  font-size: 64px;
  font-weight: bold;
  color: var(--primary);
  letter-spacing: -2px;
}
.v7-bundle-sub {
  font-family: var(--font-body);
  font-size: 20px;
  color: var(--text-dim);
  max-width: 520px;
}
.v7-bundle-btns {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Philosophy Hero / Manifesto */
.v7-manifesto {
  background: var(--code-bg);
  padding: 120px 80px 100px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.v7-kicker {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #475569;
  text-transform: uppercase;
}
.v7-manifesto-h1 {
  font-family: var(--font-heading);
  font-size: 64px;
  font-weight: bold;
  color: var(--white);
  letter-spacing: -3px;
  max-width: 900px;
  line-height: 1.1;
}
.v7-manifesto-h2 {
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: normal;
  color: var(--primary);
  letter-spacing: -1px;
  max-width: 800px;
}
.v7-divider {
  width: 120px;
  height: 3px;
  background: var(--primary);
}

/* Problem Editorial */
.v7-problem {
  background: var(--code-bg);
  padding: 80px;
  display: flex;
  flex-direction: column;
  gap: 60px;
  border-top: 1px solid var(--code-surface);
}
.v7-columns {
  display: flex;
  gap: 48px;
  width: 100%;
}
.v7-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
.v7-column p {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--text-dim);
  line-height: 1.8;
}

/* Principles */
.v7-principles {
  background: #0A1020;
  padding: 80px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}
.v7-principles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
}
.v7-principle-card {
  background: var(--code-bg);
  border: 1px solid var(--code-surface);
  border-radius: var(--radius);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.v7-principle-num {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: bold;
  color: var(--primary);
}
.v7-principle-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
}
.v7-principle-desc {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

/* Pull Quote */
.v7-quote {
  background: var(--surface);
  padding: 80px 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.v7-quote-text {
  font-family: var(--font-heading);
  font-size: 48px;
  font-weight: bold;
  color: var(--primary);
  text-align: center;
  letter-spacing: -2px;
  line-height: 1.3;
  max-width: 900px;
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .landing-hero { padding: 60px 24px 40px; padding-top: calc(60px + var(--header-h)); }
  .landing-headline { font-size: 48px; }
  .landing-code-section { padding: 40px 24px; }
  .landing-features { padding: 60px 24px; }
  .landing-cta { padding: 60px 24px; }
  .landing-cta-headline { font-size: 36px; }
  .landing-panels { flex-direction: column; }
  .v7-code-compare { padding: 40px 24px; padding-top: calc(40px + var(--header-h)); }
  .v7-code-compare-title { font-size: 48px; }
  .v7-panels { flex-direction: column; }
  .v7-bundle { padding: 60px 24px; }
  .v7-bundle-h1, .v7-bundle-h2 { font-size: 40px; }
  .v7-manifesto { padding: 60px 24px; }
  .v7-manifesto-h1 { font-size: 40px; }
  .v7-manifesto-h2 { font-size: 24px; }
  .v7-problem { padding: 40px 24px; }
  .v7-columns { flex-direction: column; gap: 32px; }
  .v7-principles { padding: 40px 24px; }
  .v7-principles-grid { grid-template-columns: repeat(2, 1fr); }
  .v7-quote { padding: 40px 24px; }
  .v7-quote-text { font-size: 32px; }
}
@media (max-width: 768px) {
  .landing-headline { font-size: 36px; }
  .landing-subline { font-size: 16px; }
  .landing-cta-row { flex-direction: column; }
  .v7-code-compare-title { font-size: 36px; }
  .v7-bundle-h1, .v7-bundle-h2 { font-size: 32px; }
  .v7-bundle-btns { flex-direction: column; }
  .v7-manifesto-h1 { font-size: 32px; }
  .v7-manifesto-h2 { font-size: 20px; }
  .v7-principles-grid { grid-template-columns: 1fr; }
  .v7-quote-text { font-size: 24px; }
  .v7-quote { padding: 40px 16px; }
}
</style>
<!-- Landing Page - from design.pen V7 "The Full Story" (bAp6a) -->

<!-- ═══ Section 1: Code Comparison - #F8FAFC bg, padding 80, gap 40 ═══ -->
<section class="v7-code-compare">
  <h2 class="v7-code-compare-title" t="landing.codeCompare.title" t-html></h2>
  <p class="v7-code-compare-sub" t="landing.codeCompare.subtitle"></p>
  <div class="v7-panels">
    <div class="v7-panel">
      <div class="v7-panel-topbar">
        <span class="v7-panel-label v7-panel-label--react" t="landing.codeCompare.reactLabel"></span>
        <span class="v7-panel-meta" t="landing.codeCompare.reactMeta"></span>
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
        <span class="v7-panel-label v7-panel-label--nojs" t="landing.codeCompare.nojsLabel"></span>
        <span class="v7-panel-meta" t="landing.codeCompare.nojsMeta"></span>
      </div>
      <pre class="v7-panel-code v7-panel-code--nojs"><span class="v7-ln">1</span><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ query: '' }"</span> <span class="hl-attr">get</span>=<span class="hl-str">"/api/search?q={{ query }}"</span> <span class="hl-attr">as</span>=<span class="hl-str">"results"</span><span class="hl-tag">&gt;</span>
<span class="v7-ln">2</span>  <span class="hl-tag">&lt;input</span> <span class="hl-attr">model</span>=<span class="hl-str">"query"</span> <span class="hl-tag">/&gt;</span>
<span class="v7-ln">3</span>  <span class="hl-tag">&lt;li</span> <span class="hl-attr">each</span>=<span class="hl-str">"r in results"</span> <span class="hl-attr">bind</span>=<span class="hl-str">"r.name"</span><span class="hl-tag">&gt;&lt;/li&gt;</span>
<span class="v7-ln">4</span><span class="hl-tag">&lt;/div&gt;</span></pre>
      <span class="v7-panel-note" t="landing.codeCompare.nojsNote"></span>
    </div>
  </div>
</section>

<!-- ═══ Section 2: Bundle Stats - white bg, padding 100/80, gap 24, centered ═══ -->
<section class="v7-bundle">
  <span class="v7-bundle-badge" t="landing.bundle.badge"></span>
  <h2 class="v7-bundle-h1" t="landing.bundle.h1"></h2>
  <h2 class="v7-bundle-h2" t="landing.bundle.h2"></h2>
  <p class="v7-bundle-sub" t="landing.bundle.subtitle"></p>
  <div class="v7-bundle-btns">
    <a route="/docs" class="btn btn-primary" t="landing.bundle.getStarted"></a>
    <a route="/features" class="btn btn-secondary" t="landing.bundle.seeFeatures"></a>
  </div>
</section>

<!-- ═══ Section 3: Philosophy Hero - #0F172A bg, padding 120/80/100/80, gap 32 ═══ -->
<section class="v7-manifesto">
  <span class="v7-kicker" t="landing.manifesto.kicker"></span>
  <h1 class="v7-manifesto-h1" t="landing.manifesto.h1"></h1>
  <h2 class="v7-manifesto-h2" t="landing.manifesto.h2"></h2>
  <div class="v7-divider"></div>
</section>

<!-- ═══ Section 4: Problem Editorial - #0F172A bg, padding 80, gap 60 ═══ -->
<section class="v7-problem">
  <span class="v7-kicker" t="landing.problem.kicker"></span>
  <div class="v7-columns">
    <div class="v7-column">
      <p t="landing.problem.col1p1"></p>
      <p t="landing.problem.col1p2"></p>
    </div>
    <div class="v7-column">
      <p t="landing.problem.col2p1"></p>
      <p t="landing.problem.col2p2"></p>
    </div>
    <div class="v7-column">
      <p t="landing.problem.col3p1"></p>
      <p t="landing.problem.col3p2"></p>
    </div>
  </div>
</section>

<!-- ═══ Section 5: Principles - #0A1020 bg, padding 80, gap 48 ═══ -->
<section class="v7-principles">
  <span class="v7-kicker" t="landing.principles.kicker"></span>
  <div class="v7-principles-grid">
    <div class="v7-principle-card">
      <span class="v7-principle-num">01</span>
      <h3 class="v7-principle-title" t="landing.principles.p1Title"></h3>
      <p class="v7-principle-desc" t="landing.principles.p1Desc"></p>
    </div>
    <div class="v7-principle-card">
      <span class="v7-principle-num">02</span>
      <h3 class="v7-principle-title" t="landing.principles.p2Title"></h3>
      <p class="v7-principle-desc" t="landing.principles.p2Desc"></p>
    </div>
    <div class="v7-principle-card">
      <span class="v7-principle-num">03</span>
      <h3 class="v7-principle-title" t="landing.principles.p3Title"></h3>
      <p class="v7-principle-desc" t="landing.principles.p3Desc"></p>
    </div>
    <div class="v7-principle-card">
      <span class="v7-principle-num">04</span>
      <h3 class="v7-principle-title" t="landing.principles.p4Title"></h3>
      <p class="v7-principle-desc" t="landing.principles.p4Desc"></p>
    </div>
  </div>
</section>

<!-- ═══ Section 6: Pull Quote - #F8FAFC bg, padding 80/160, centered ═══ -->
<section class="v7-quote">
  <blockquote class="v7-quote-text" t="landing.quote" t-html></blockquote>
</section>

<!-- ═══ Section 7: CTA - #0F172A bg, padding 80, gap 20, centered ═══ -->
<section class="landing-cta">
  <h2 class="landing-cta-headline" t="landing.cta.headline"></h2>
  <p class="landing-cta-sub" t="landing.cta.subtitle"></p>
  <div class="cta-buttons">
    <a route="/docs" class="btn btn-cta-primary" t="landing.cta.getStarted"></a>
    <a route="/features" class="btn btn-ghost" t="landing.cta.learnMore"></a>
  </div>
</section>
</div>
