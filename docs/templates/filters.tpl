<!-- Filters — from filters.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">Filters &amp; Pipes</h1>
  <p class="hero-subtitle">Transform values in bind expressions using the | pipe syntax</p>
</section>

<div class="doc-content">

  <!-- Text Filters -->
  <div class="doc-section">
    <h2 class="doc-title">Text Filters</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"name | uppercase"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>           <span class="hl-cmt">&lt;!-- JOHN --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"name | lowercase"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>           <span class="hl-cmt">&lt;!-- john --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"name | capitalize"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>          <span class="hl-cmt">&lt;!-- John Doe --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"text | truncate:100"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>        <span class="hl-cmt">&lt;!-- First 100 chars + ... --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"text | stripHtml"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>           <span class="hl-cmt">&lt;!-- Remove HTML tags --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"slug | slugify"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>             <span class="hl-cmt">&lt;!-- hello-world --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"text | nl2br"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>               <span class="hl-cmt">&lt;!-- Newlines to &lt;br&gt; --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"input | trim"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>               <span class="hl-cmt">&lt;!-- Remove leading/trailing whitespace --&gt;</span></pre></div>
  </div>

  <!-- Number Filters -->
  <div class="doc-section">
    <h2 class="doc-title">Number Filters</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"price | currency"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>           <span class="hl-cmt">&lt;!-- $29.99 --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"value | number:2"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>           <span class="hl-cmt">&lt;!-- 1,234.56 --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"ratio | percent"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>            <span class="hl-cmt">&lt;!-- 42% --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"bytes | filesize"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>           <span class="hl-cmt">&lt;!-- 1.5 MB --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"value | ordinal"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>            <span class="hl-cmt">&lt;!-- 1st, 2nd, 3rd --&gt;</span></pre></div>
  </div>

  <!-- Array Filters -->
  <div class="doc-section">
    <h2 class="doc-title">Array Filters</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"items | count"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>              <span class="hl-cmt">&lt;!-- 5 --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"items | first"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>              <span class="hl-cmt">&lt;!-- First item --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"items | last"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>               <span class="hl-cmt">&lt;!-- Last item --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"items | join:', '"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>          <span class="hl-cmt">&lt;!-- a, b, c --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"items | reverse"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>            <span class="hl-cmt">&lt;!-- Reversed array --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"items | unique"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>             <span class="hl-cmt">&lt;!-- Deduplicated --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"items | pluck:'name'"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>       <span class="hl-cmt">&lt;!-- Extract property --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"items | sortBy:'date'"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>      <span class="hl-cmt">&lt;!-- Sort by property --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"users | where:'role':'admin'"</span><span class="hl-tag">&gt;&lt;/span&gt;</span> <span class="hl-cmt">&lt;!-- Filter by key/value --&gt;</span></pre></div>
  </div>

  <!-- Date Filters -->
  <div class="doc-section">
    <h2 class="doc-title">Date Filters</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"date | date:'short'"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>        <span class="hl-cmt">&lt;!-- 02/25/26 --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"date | relative"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>            <span class="hl-cmt">&lt;!-- 3 days ago --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"date | datetime"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>            <span class="hl-cmt">&lt;!-- Feb 25, 2026, 3:30 PM --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"date | fromNow"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>             <span class="hl-cmt">&lt;!-- in 2 hours --&gt;</span></pre></div>
  </div>

  <!-- Utility Filters -->
  <div class="doc-section">
    <h2 class="doc-title">Utility Filters</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"value | default:'N/A'"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>      <span class="hl-cmt">&lt;!-- Fallback for null/undefined --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"obj | json"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>                <span class="hl-cmt">&lt;!-- JSON.stringify --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"items | debug"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>              <span class="hl-cmt">&lt;!-- console.log + passthrough --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"url | encodeUri"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>           <span class="hl-cmt">&lt;!-- URL-encode a string --&gt;</span></pre></div>
  </div>

  <!-- Object Filters -->
  <div class="doc-section">
    <h2 class="doc-title">Object Filters</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user | keys"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>               <span class="hl-cmt">&lt;!-- ['name', 'email', 'age'] --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user | values"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>             <span class="hl-cmt">&lt;!-- ['John', 'john@ex.com', 30] --&gt;</span></pre></div>
  </div>

  <!-- Chaining Filters -->
  <div class="doc-section">
    <h2 class="doc-title">Chaining Filters</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.bio | stripHtml | truncate:200 | capitalize"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"price | number:2 | currency:'USD'"</span><span class="hl-tag">&gt;&lt;/span&gt;</span></pre></div>
  </div>

  <!-- Custom Filters -->
  <div class="doc-section">
    <h2 class="doc-title">Custom Filters</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-fn">NoJS</span>.<span class="hl-fn">filter</span>(<span class="hl-str">'initials'</span>, (<span class="hl-attr">fullName</span>) <span class="hl-op">=&gt;</span> {
    <span class="hl-kw">return</span> fullName.<span class="hl-fn">split</span>(<span class="hl-str">' '</span>).<span class="hl-fn">map</span>(n <span class="hl-op">=&gt;</span> n[<span class="hl-num">0</span>]).<span class="hl-fn">join</span>(<span class="hl-str">''</span>).<span class="hl-fn">toUpperCase</span>();
  });

  <span class="hl-fn">NoJS</span>.<span class="hl-fn">filter</span>(<span class="hl-str">'timeAgo'</span>, (<span class="hl-attr">date</span>) <span class="hl-op">=&gt;</span> {
    <span class="hl-kw">const</span> diff <span class="hl-op">=</span> Date.<span class="hl-fn">now</span>() <span class="hl-op">-</span> <span class="hl-kw">new</span> <span class="hl-fn">Date</span>(date).<span class="hl-fn">getTime</span>();
    <span class="hl-kw">const</span> minutes <span class="hl-op">=</span> Math.<span class="hl-fn">floor</span>(diff <span class="hl-op">/</span> <span class="hl-num">60000</span>);
    <span class="hl-kw">if</span> (minutes <span class="hl-op">&lt;</span> <span class="hl-num">60</span>) <span class="hl-kw">return</span> minutes <span class="hl-op">+</span> <span class="hl-str">'m ago'</span>;
    <span class="hl-kw">if</span> (minutes <span class="hl-op">&lt;</span> <span class="hl-num">1440</span>) <span class="hl-kw">return</span> Math.<span class="hl-fn">floor</span>(minutes <span class="hl-op">/</span> <span class="hl-num">60</span>) <span class="hl-op">+</span> <span class="hl-str">'h ago'</span>;
    <span class="hl-kw">return</span> Math.<span class="hl-fn">floor</span>(minutes <span class="hl-op">/</span> <span class="hl-num">1440</span>) <span class="hl-op">+</span> <span class="hl-str">'d ago'</span>;
  });
<span class="hl-tag">&lt;/script&gt;</span>

<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"user.name | initials"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>      <span class="hl-cmt">&lt;!-- JD --&gt;</span>
<span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"post.createdAt | timeAgo"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>   <span class="hl-cmt">&lt;!-- 3h ago --&gt;</span></pre></div>
  </div>

  <!-- Live Demo -->
  <div class="doc-section">
    <h2 class="doc-title">Live Demo — Filters</h2>
    <div class="demo-split">
      <div class="demo-code">
        <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ name: 'John Doe' }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">model</span>=<span class="hl-str">"name"</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;p</span> <span class="hl-attr">bind</span>=<span class="hl-str">"name | uppercase"</span><span class="hl-tag">&gt;&lt;/p&gt;</span>
  <span class="hl-tag">&lt;p</span> <span class="hl-attr">bind</span>=<span class="hl-str">"name | initials"</span><span class="hl-tag">&gt;&lt;/p&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
      </div>
      <div class="demo-preview">
        <span class="demo-result-label">Result</span>
        <div state="{ name: 'John Doe' }">
          <div class="form-group">
            <input class="input" model="name" />
          </div>
          <p>Uppercase: <strong bind="name | uppercase"></strong></p>
          <p>Initials: <strong bind="name | initials"></strong></p>
        </div>
      </div>
    </div>
  </div>

</div>