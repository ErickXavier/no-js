<!-- Features Page — from design.pen "Features Page" (wejNg) -->

<!-- ═══ Hero: #F8FAFC, padding 80, center, gap 20 ═══ -->
<section class="hero-section">
  <span class="badge">Why No.JS?</span>
  <h1 class="hero-title">Built for Modern Web Development</h1>
  <p class="hero-subtitle">Every feature designed to make HTML-first development powerful, fast, and enjoyable.</p>
</section>

<!-- ═══ Showcase 1 — Reactive State (white bg) ═══ -->
<section class="showcase-section">
  <div class="showcase-content">
    <span class="badge">Core Feature</span>
    <h2 class="showcase-title">Reactive State Management</h2>
    <p class="showcase-desc">Declare state directly in HTML with state. Changes automatically propagate to all bound elements — no store setup, no reducers, no boilerplate.</p>
    <div class="showcase-highlights">
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">Automatic dependency tracking</span></div>
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">Nested object support</span></div>
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">Computed properties</span></div>
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">Cross-component state sharing</span></div>
    </div>
  </div>
  <div class="showcase-code">
    <div class="showcase-preview" state="{ user: 'World' }">
      <span class="showcase-preview-label">▶  PREVIEW</span>
      <div class="showcase-preview-inner">
        <input class="input" model="user" placeholder="Enter name..." style="margin-bottom:0">
        <p class="showcase-preview-output" bind="'Hello, ' + user"></p>
      </div>
    </div>
    <div class="code-block">
      <pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ user: 'World' }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-line-highlight"><span class="hl-tag">&lt;h1</span> <span class="hl-attr">bind</span>=<span class="hl-str">"'Hello, ' + user"</span><span class="hl-tag">&gt;</span></span>
  <span class="hl-tag">&lt;/h1&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre>
    </div>
  </div>
</section>

<!-- ═══ Showcase 2 — Declarative Rendering (#F8FAFC bg, reversed) ═══ -->
<section class="showcase-section alt">
  <div class="showcase-content">
    <span class="badge">Rendering</span>
    <h2 class="showcase-title">Declarative Rendering</h2>
    <p class="showcase-desc">Use if, each, show, and bind to control what renders. No JSX, no template literals — just HTML attributes.</p>
    <div class="showcase-highlights">
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">Conditional rendering with if</span></div>
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">List rendering with each</span></div>
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">Text interpolation with bind</span></div>
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">Visibility toggle with show</span></div>
    </div>
  </div>
  <div class="showcase-code">
    <div class="showcase-preview">
      <span class="showcase-preview-label">▶  PREVIEW</span>
      <div class="showcase-preview-inner">
        <div class="showcase-list-item"><span class="showcase-list-dot active"></span> Buy groceries</div>
        <div class="showcase-list-item"><span class="showcase-list-dot active"></span> Take out trash</div>
        <div class="showcase-list-item inactive"><span class="showcase-list-dot"></span> Fix the bug</div>
      </div>
    </div>
    <div class="code-block">
      <pre><span class="hl-tag">&lt;ul</span> <span class="hl-attr">each</span>=<span class="hl-str">"item in items"</span><span class="hl-tag">&gt;</span>
  <span class="hl-line-highlight"><span class="hl-tag">&lt;li</span> <span class="hl-attr">bind</span>=<span class="hl-str">"item.name"</span></span>
<span class="hl-line-highlight">      <span class="hl-attr">if</span>=<span class="hl-str">"item.active"</span><span class="hl-tag">&gt;&lt;/li&gt;</span></span>
<span class="hl-tag">&lt;/ul&gt;</span></pre>
    </div>
  </div>
</section>

<!-- ═══ Showcase 3 — Event Handling (white bg) ═══ -->
<section class="showcase-section">
  <div class="showcase-content">
    <span class="badge">Interactivity</span>
    <h2 class="showcase-title">Intuitive Event Handling</h2>
    <p class="showcase-desc">Bind events with on:event syntax. Access state directly in handlers without this or callbacks.</p>
    <div class="showcase-highlights">
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">Click, submit, input, and more</span></div>
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">Direct state access in handlers</span></div>
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">Event modifiers support</span></div>
      <div class="highlight-item"><span class="highlight-dot">✓</span><span class="highlight-text">No wrapper functions needed</span></div>
    </div>
  </div>
  <div class="showcase-code">
    <div class="showcase-preview" state="{ count: 0 }">
      <span class="showcase-preview-label">▶  PREVIEW</span>
      <div class="showcase-preview-inner" style="align-items:center">
        <p class="showcase-counter" bind="count"></p>
        <button class="btn btn-primary" on:click="count++">Clicked:&nbsp;<span bind="count"></span></button>
      </div>
    </div>
    <div class="code-block">
      <pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ count: 0 }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-line-highlight"><span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"count++"</span><span class="hl-tag">&gt;</span></span>
    <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"count"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
  <span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre>
    </div>
  </div>
</section>

<!-- ═══ Feature Grid Section: #F8FAFC bg, padding 80, gap 40 ═══ -->
<section class="feature-grid-section">
  <div class="section-header">
    <h2 class="section-title">More Features</h2>
    <p class="section-subtitle">Everything you need, nothing you don't</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="12" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></div>
      <div class="feature-card-title">Client-Side Routing</div>
      <div class="feature-card-desc">Full SPA routing with route and route-view. Hash and history mode, dynamic params, nested routes, and guards.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
      <div class="feature-card-title">Form Handling</div>
      <div class="feature-card-desc">Two-way binding with model, built-in validation, error messages, and form submission handling.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
      <div class="feature-card-title">Fetch &amp; API</div>
      <div class="feature-card-desc">Declarative data fetching with get and post. Loading states, error handling, and caching built in.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg></div>
      <div class="feature-card-title">CSS Bindings</div>
      <div class="feature-card-desc">Dynamic styling with class-* and style-*. Bind CSS classes and inline styles reactively to state.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></div>
      <div class="feature-card-title">Lifecycle Hooks</div>
      <div class="feature-card-desc">Hook into mount, update, and destroy phases. Run setup logic and cleanup with fine-grained control.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
      <div class="feature-card-title">Zero Dependencies</div>
      <div class="feature-card-desc">No build tools, no bundlers, no npm install. Just drop a script tag and start building instantly.</div>
    </div>
  </div>
</section>

<!-- ═══ CTA: #0F172A bg ═══ -->
<section class="cta-section">
  <h2 class="cta-title">Ready to Build?</h2>
  <p class="cta-subtitle">Start using No.JS in under 30 seconds.</p>
  <div class="cta-buttons">
    <a route="/docs" class="btn btn-cta-primary">Get Started Now</a>
  </div>
</section>
