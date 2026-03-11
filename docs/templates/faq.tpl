<div class="page-wrapper">
<style>
/* ══════════════════════════════════════════════════════════════════
   FAQ PAGE
   ══════════════════════════════════════════════════════════════════ */
.faq-page > .sidebar {
  min-height: -webkit-fill-available;
  min-height: stretch;
}
.faq-search-section {
  display: flex;
  justify-content: center;
}
.faq-search-container {
  padding: 40px 0;
  width: 100%;
  max-width: 600px;
}
.faq-search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 0 20px;
  height: 52px;
}
.faq-search-icon {
  width: 20px;
  height: 20px;
  color: var(--text-dim);
  flex-shrink: 0;
}
.faq-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--text);
}
.faq-search-input::placeholder {
  color: var(--text-dim);
}
.faq-content {
  max-width: 100%;
}
.faq-category {
  padding: 40px 0;
}
.faq-category-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: bold;
  color: var(--text);
  margin-bottom: 16px;
}
.faq-list {
  border-top: 1px solid var(--border);
}
.faq-item {
  border-bottom: 1px solid var(--border);
}
.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  list-style: none;
}
.faq-question::-webkit-details-marker {
  display: none;
}
.faq-question::marker {
  display: none;
  content: "";
}
.faq-chevron {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  position: relative;
  margin-left: 16px;
}
.faq-chevron::before,
.faq-chevron::after {
  content: "";
  position: absolute;
  background: var(--text-dim);
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease, background 0.3s ease;
}
.faq-chevron::before {
  width: 16px;
  height: 2px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.faq-chevron::after {
  width: 2px;
  height: 16px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
details[open] > .faq-question .faq-chevron::before {
  background: var(--primary);
}
details[open] > .faq-question .faq-chevron::after {
  transform: translate(-50%, -50%) rotate(90deg);
  opacity: 0;
  background: var(--primary);
}
.faq-question {
  transition: color 0.3s ease;
}
details[open] > .faq-question {
  color: var(--primary);
}
.faq-answer {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.7;
  padding: 0 0 24px;
  animation: faq-slide-in 0.3s ease;
}
@keyframes faq-slide-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.faq-item.faq-closing > .faq-question {
  color: var(--text);
}
.faq-item.faq-closing > .faq-question .faq-chevron::before {
  background: var(--text-dim);
}
.faq-item.faq-closing > .faq-question .faq-chevron::after {
  transform: translate(-50%, -50%);
  opacity: 1;
  background: var(--text-dim);
}
.faq-item.faq-closing .faq-answer {
  animation: faq-slide-out 0.25s ease forwards;
}
@keyframes faq-slide-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-8px); }
}
.faq-answer code {
  background: var(--surface);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--primary);
}
</style>
<!-- FAQ Page -->

<!-- ═══ Search + Content (shared state for filtering) ═══ -->
<div state="{ search: '' }">

  <!-- Sidebar + Content -->
  <div class="doc-with-sidebar faq-page">

    <!-- Sidebar -->
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <div class="sidebar-group">
          <div class="sidebar-group-title" t="faq.sidebar.questions"></div>
          <a href="#getting-started" class="sidebar-link" t="faq.sidebar.gettingStarted"></a>
          <a href="#core-concepts" class="sidebar-link" t="faq.sidebar.coreConcepts"></a>
          <a href="#comparisons" class="sidebar-link" t="faq.sidebar.comparisons"></a>
          <a href="#security" class="sidebar-link" t="faq.sidebar.security"></a>
        </div>
        <div class="sidebar-group">
          <div class="sidebar-group-title" t="faq.sidebar.resources"></div>
          <a route="/docs" class="sidebar-link" t="faq.sidebar.documentation"></a>
          <a route="/examples" class="sidebar-link" t="faq.sidebar.examples"></a>
          <a href="https://github.com/ErickXavier/no-js/discussions" target="_blank" class="sidebar-link" t="faq.sidebar.discussions"></a>
          <a href="https://discord.gg/CaSbGYg3xY" target="_blank" class="sidebar-link" t="faq.sidebar.discord"></a>
        </div>
      </nav>
    </aside>

    <!-- Content -->
    <div class="doc-main">

      <!-- ═══ Hero ═══ -->
      <section class="hero-section">
        <span class="badge" t="faq.hero.badge"></span>
        <h1 class="hero-title" t="faq.hero.title"></h1>
        <p class="hero-subtitle" t="faq.hero.subtitle"></p>
      </section>

      <!-- FAQ Content -->
      <div class="doc-content faq-content">

      <!-- Search Bar -->
      <section class="faq-search-section">
        <div class="faq-search-container">
          <div class="faq-search-bar">
            <svg class="faq-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="faq-search-input" model="search" bind-placeholder="$i18n.t('faq.search.placeholder')">
          </div>
        </div>
      </section>

      <!-- Getting Started -->
      <section id="getting-started" class="faq-category" faq-filter>
        <h2 class="faq-category-title" t="faq.gettingStarted.title"></h2>
        <div class="faq-list">
          <details class="faq-item" faq-filter="faq.gettingStarted.q1.question">
            <summary class="faq-question"><span t="faq.gettingStarted.q1.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.gettingStarted.q1.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.gettingStarted.q2.question">
            <summary class="faq-question"><span t="faq.gettingStarted.q2.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.gettingStarted.q2.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.gettingStarted.q3.question">
            <summary class="faq-question"><span t="faq.gettingStarted.q3.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.gettingStarted.q3.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.gettingStarted.q4.question">
            <summary class="faq-question"><span t="faq.gettingStarted.q4.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.gettingStarted.q4.answer" t-html></div>
          </details>
        </div>
      </section>

      <!-- Core Concepts -->
      <section id="core-concepts" class="faq-category" faq-filter>
        <h2 class="faq-category-title" t="faq.coreConcepts.title"></h2>
        <div class="faq-list">
          <details class="faq-item" faq-filter="faq.coreConcepts.q5.question">
            <summary class="faq-question"><span t="faq.coreConcepts.q5.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.coreConcepts.q5.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.coreConcepts.q6.question">
            <summary class="faq-question"><span t="faq.coreConcepts.q6.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.coreConcepts.q6.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.coreConcepts.q7.question">
            <summary class="faq-question"><span t="faq.coreConcepts.q7.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.coreConcepts.q7.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.coreConcepts.q8.question">
            <summary class="faq-question"><span t="faq.coreConcepts.q8.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.coreConcepts.q8.answer" t-html></div>
          </details>
        </div>
      </section>

      <!-- Comparisons -->
      <section id="comparisons" class="faq-category" faq-filter>
        <h2 class="faq-category-title" t="faq.comparisons.title"></h2>
        <div class="faq-list">
          <details class="faq-item" faq-filter="faq.comparisons.q9.question">
            <summary class="faq-question"><span t="faq.comparisons.q9.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.comparisons.q9.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.comparisons.q10.question">
            <summary class="faq-question"><span t="faq.comparisons.q10.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.comparisons.q10.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.comparisons.q11.question">
            <summary class="faq-question"><span t="faq.comparisons.q11.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.comparisons.q11.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.comparisons.q12.question">
            <summary class="faq-question"><span t="faq.comparisons.q12.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.comparisons.q12.answer" t-html></div>
          </details>
        </div>
      </section>

      <!-- Security & Production -->
      <section id="security" class="faq-category" faq-filter>
        <h2 class="faq-category-title" t="faq.security.title"></h2>
        <div class="faq-list">
          <details class="faq-item" faq-filter="faq.security.q13.question">
            <summary class="faq-question"><span t="faq.security.q13.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.security.q13.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.security.q14.question">
            <summary class="faq-question"><span t="faq.security.q14.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.security.q14.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.security.q15.question">
            <summary class="faq-question"><span t="faq.security.q15.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.security.q15.answer" t-html></div>
          </details>
          <details class="faq-item" faq-filter="faq.security.q16.question">
            <summary class="faq-question"><span t="faq.security.q16.question"></span><span class="faq-chevron"></span></summary>
            <div class="faq-answer" t="faq.security.q16.answer" t-html></div>
          </details>
        </div>
      </section>

      </div><!-- /doc-content faq-content -->
    </div><!-- /doc-main -->
  </div><!-- /doc-with-sidebar -->
</div><!-- /state wrapper -->

<!-- ═══ CTA ═══ -->
<section class="cta-section">
  <h2 class="cta-title" t="faq.cta.title"></h2>
  <p class="cta-subtitle" t="faq.cta.subtitle"></p>
  <div class="cta-buttons">
    <a route="/docs" class="btn btn-cta-primary" t="faq.cta.docs"></a>
    <a href="https://github.com/ErickXavier/no-js/discussions" target="_blank" class="btn btn-cta-secondary" t="faq.cta.discussions"></a>
    <a href="https://discord.gg/CaSbGYg3xY" target="_blank" class="btn btn-cta-secondary" t="faq.cta.discord"></a>
  </div>
</section>
</div>
