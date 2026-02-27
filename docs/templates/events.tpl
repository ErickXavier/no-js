<!-- Events — from events.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">Event Handling</h1>
  <p class="hero-subtitle">Bind DOM events directly in HTML with on:event syntax</p>
</section>

<div class="doc-content">

  <!-- on:* -->
  <div class="doc-section">
    <h2 class="doc-title">on:* — Event Handlers</h2>
    <p class="doc-text">Bind any DOM event directly in HTML. Access state and context variables directly in the handler expression.</p>
    <div class="demo-split">
      <div class="demo-code"><pre><span class="hl-cmt">&lt;!-- Click --&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"count++"</span><span class="hl-tag">&gt;</span>Increment<span class="hl-tag">&lt;/button&gt;</span>

<span class="hl-cmt">&lt;!-- Input --&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">on:input</span>=<span class="hl-str">"search = $event.target.value"</span> <span class="hl-tag">/&gt;</span>

<span class="hl-cmt">&lt;!-- Keyboard --&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">on:keydown.enter</span>=<span class="hl-str">"submitForm()"</span>
       <span class="hl-attr">on:keydown.escape</span>=<span class="hl-str">"cancel()"</span> <span class="hl-tag">/&gt;</span>

<span class="hl-cmt">&lt;!-- Mouse --&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">on:mouseenter</span>=<span class="hl-str">"hovered = true"</span>
     <span class="hl-attr">on:mouseleave</span>=<span class="hl-str">"hovered = false"</span><span class="hl-tag">&gt;</span><span class="hl-tag">&lt;/div&gt;</span></pre></div>
      <div class="demo-preview" state="{ count: 0, msg: '' }">
        <div class="demo-result-label">Preview</div>
        <p>Count: <strong bind="count"></strong></p>
        <div class="flex gap-2 mb-3">
          <button class="btn btn-primary btn-sm" on:click="count++">+1</button>
          <button class="btn btn-outline btn-sm" on:click="count--">-1</button>
          <button class="btn btn-outline btn-sm" on:click="count = 0">Reset</button>
        </div>
        <input class="input" model="msg" placeholder="Type something..." />
        <p class="text-sm text-muted mt-2">You typed: <span bind="msg"></span></p>
      </div>
    </div>
  </div>

  <!-- modifiers -->
  <div class="doc-section">
    <h2 class="doc-title">Event Modifiers</h2>
    <p class="doc-text">Modifiers let you control event behavior directly in the attribute:</p>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- .prevent — calls preventDefault() --&gt;</span>
<span class="hl-tag">&lt;form</span> <span class="hl-attr">on:submit.prevent</span>=<span class="hl-str">"handleSubmit()"</span><span class="hl-tag">&gt;</span>

<span class="hl-cmt">&lt;!-- .stop — calls stopPropagation() --&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click.stop</span>=<span class="hl-str">"handleClick()"</span><span class="hl-tag">&gt;</span>

<span class="hl-cmt">&lt;!-- .once — fires only once --&gt;</span>
<span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click.once</span>=<span class="hl-str">"initializeApp()"</span><span class="hl-tag">&gt;</span>

<span class="hl-cmt">&lt;!-- .debounce — debounce the handler --&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">on:input.debounce.300</span>=<span class="hl-str">"search($event.target.value)"</span> <span class="hl-tag">/&gt;</span>

<span class="hl-cmt">&lt;!-- Key modifiers --&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">on:keydown.enter</span>=<span class="hl-str">"submit()"</span>
       <span class="hl-attr">on:keydown.ctrl.enter</span>=<span class="hl-str">"save()"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-cmt">&lt;!-- Note: single-letter keys (e.g. .s) are not supported as modifiers. Use named keys like .enter, .escape, .space, etc. --&gt;</span>

<span class="hl-cmt">&lt;!-- Combine modifiers --&gt;</span>
<span class="hl-tag">&lt;form</span> <span class="hl-attr">on:submit.prevent.once</span>=<span class="hl-str">"register()"</span><span class="hl-tag">&gt;</span></pre></div>
  </div>

  <!-- $event & $el -->
  <div class="doc-section">
    <h2 class="doc-title">$event &amp; $el</h2>
    <p class="doc-text"><code>$event</code> is the native DOM event. <code>$el</code> refers to the current element.</p>
    <div class="code-block"><pre><span class="hl-tag">&lt;input</span> <span class="hl-attr">on:input</span>=<span class="hl-str">"name = $event.target.value"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">on:focus</span>=<span class="hl-str">"$el.select()"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"$el.classList.toggle('expanded')"</span><span class="hl-tag">&gt;&lt;/div&gt;</span></pre></div>
  </div>

  <!-- lifecycle -->
  <div class="doc-section">
    <h2 class="doc-title">Lifecycle Hooks</h2>
    <table class="doc-table">
      <thead>
        <tr><th>Hook</th><th>When</th></tr>
      </thead>
      <tbody>
        <tr><td><code>on:init</code></td><td>Directive first processed</td></tr>
        <tr><td><code>on:mounted</code></td><td>Element inserted into visible DOM</td></tr>
        <tr><td><code>on:updated</code></td><td>Any reactive dependency changed</td></tr>
        <tr><td><code>on:unmounted</code></td><td>Element removed from DOM</td></tr>
        <tr><td><code>on:error</code></td><td>Error in this element's subtree</td></tr>
      </tbody>
    </table>
    <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">on:mounted</span>=<span class="hl-str">"initChart($el)"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;canvas</span> <span class="hl-attr">ref</span>=<span class="hl-str">"chart"</span><span class="hl-tag">&gt;&lt;/canvas&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span>
<span class="hl-tag">&lt;div</span> <span class="hl-attr">on:unmounted</span>=<span class="hl-str">"cleanup()"</span><span class="hl-tag">&gt;&lt;/div&gt;</span></pre></div>
  </div>

</div>

