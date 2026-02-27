<!-- Actions & Refs — from actions-refs.md -->

<section class="hero-section">
  <span class="badge">API Reference</span>
  <h1 class="hero-title">Actions &amp; Refs</h1>
  <p class="hero-subtitle">Trigger API calls, emit custom events, and reference DOM elements</p>
</section>

<div class="doc-content">

  <!-- call -->
  <div class="doc-section">
    <h2 class="doc-title">call — Trigger API Requests from Any Element</h2>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Logout button --&gt;</span>
<span class="hl-tag">&lt;a</span> <span class="hl-attr">call</span>=<span class="hl-str">"/api/logout"</span>
   <span class="hl-attr">method</span>=<span class="hl-str">"post"</span>
   <span class="hl-attr">success</span>=<span class="hl-str">"#loggedOut"</span>
   <span class="hl-attr">error</span>=<span class="hl-str">"#logoutError"</span>
   <span class="hl-attr">confirm</span>=<span class="hl-str">"Are you sure you want to logout?"</span><span class="hl-tag">&gt;</span>
  Logout
<span class="hl-tag">&lt;/a&gt;</span>

<span class="hl-cmt">&lt;!-- Like button --&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">call</span>=<span class="hl-str">"/api/posts/{post.id}/like"</span>
        <span class="hl-attr">method</span>=<span class="hl-str">"post"</span>
        <span class="hl-attr">then</span>=<span class="hl-str">"post.likes++"</span><span class="hl-tag">&gt;</span>
  ❤️ <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"post.likes"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
<span class="hl-tag">&lt;/button&gt;</span>

<span class="hl-cmt">&lt;!-- Delete with confirmation --&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">call</span>=<span class="hl-str">"/api/items/{item.id}"</span>
        <span class="hl-attr">method</span>=<span class="hl-str">"delete"</span>
        <span class="hl-attr">confirm</span>=<span class="hl-str">"Delete this item?"</span>
        <span class="hl-attr">then</span>=<span class="hl-str">"items.splice($index, 1)"</span><span class="hl-tag">&gt;</span>
  🗑 Delete
<span class="hl-tag">&lt;/button&gt;</span>

<span class="hl-cmt">&lt;!-- Write result to a global store --&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">call</span>=<span class="hl-str">"/api/me"</span>
        <span class="hl-attr">method</span>=<span class="hl-str">"get"</span>
        <span class="hl-attr">as</span>=<span class="hl-str">"user"</span>
        <span class="hl-attr">into</span>=<span class="hl-str">"currentUser"</span><span class="hl-tag">&gt;</span>
  Load Profile
<span class="hl-tag">&lt;/button&gt;</span></pre></div>
  </div>

  <!-- trigger -->
  <div class="doc-section">
    <h2 class="doc-title">trigger — Emit Custom Events</h2>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Child emits an event --&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">trigger</span>=<span class="hl-str">"item-selected"</span> <span class="hl-attr">trigger-data</span>=<span class="hl-str">"item"</span><span class="hl-tag">&gt;</span>
  Select
<span class="hl-tag">&lt;/button&gt;</span>

<span class="hl-cmt">&lt;!-- Parent listens --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">on:item-selected</span>=<span class="hl-str">"handleSelection($event.detail)"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;div</span> <span class="hl-attr">each</span>=<span class="hl-str">"item in items"</span> <span class="hl-attr">template</span>=<span class="hl-str">"itemTpl"</span><span class="hl-tag">&gt;&lt;/div&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

  <!-- ref -->
  <div class="doc-section">
    <h2 class="doc-title">ref — Named References</h2>
    <p class="doc-text">Access DOM elements without <code>querySelector</code>:</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">ref</span>=<span class="hl-str">"searchInput"</span> <span class="hl-attr">type</span>=<span class="hl-str">"text"</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;canvas</span> <span class="hl-attr">ref</span>=<span class="hl-str">"chart"</span><span class="hl-tag">&gt;&lt;/canvas&gt;</span>
  <span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$refs.searchInput.focus()"</span><span class="hl-tag">&gt;</span>Focus Search<span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
  </div>

  <!-- $refs -->
  <div class="doc-section">
    <h2 class="doc-title">$refs — Ref Map</h2>
    <p class="doc-text">All elements with <code>ref</code> are accessible via <code>$refs</code> in the current scope:</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;video</span> <span class="hl-attr">ref</span>=<span class="hl-str">"player"</span> <span class="hl-attr">src</span>=<span class="hl-str">"video.mp4"</span><span class="hl-tag">&gt;&lt;/video&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$refs.player.play()"</span><span class="hl-tag">&gt;</span>▶ Play<span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$refs.player.pause()"</span><span class="hl-tag">&gt;</span>⏸ Pause<span class="hl-tag">&lt;/button&gt;</span></pre></div>
  </div>

</div>