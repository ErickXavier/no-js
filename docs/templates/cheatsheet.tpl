<!-- Cheatsheet — from cheatsheet.md -->

<section class="hero-section">
  <span class="badge" t="docs.cheatsheet.hero.badge">API Reference</span>
  <h1 class="hero-title" t="docs.cheatsheet.hero.title">Directive Cheatsheet</h1>
  <p class="hero-subtitle" t="docs.cheatsheet.hero.subtitle">Complete reference of every No.JS directive</p>
</section>

<div class="doc-content">

  <!-- Data -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.data.title">Data</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.data.col1">Directive</th><th t="docs.cheatsheet.data.col2">Example</th><th t="docs.cheatsheet.data.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>base</code></td><td><code>base="https://api.com"</code></td><td t="docs.cheatsheet.data.base">Set API base URL for descendants</td></tr>
        <tr><td><code>get</code></td><td><code>get="/users"</code></td><td t="docs.cheatsheet.data.get">Fetch data (GET)</td></tr>
        <tr><td><code>post</code></td><td><code>post="/login"</code></td><td t="docs.cheatsheet.data.post">Submit data (POST)</td></tr>
        <tr><td><code>put</code></td><td><code>put="/users/1"</code></td><td t="docs.cheatsheet.data.put">Update data (PUT)</td></tr>
        <tr><td><code>patch</code></td><td><code>patch="/users/1"</code></td><td t="docs.cheatsheet.data.patch">Partial update (PATCH)</td></tr>
        <tr><td><code>delete</code></td><td><code>delete="/users/1"</code></td><td t="docs.cheatsheet.data.delete">Delete data (DELETE)</td></tr>
        <tr><td><code>as</code></td><td><code>as="users"</code></td><td t="docs.cheatsheet.data.as">Name for fetched data in context</td></tr>
        <tr><td><code>body</code></td><td><code>body='{"key":"val"}'</code></td><td t="docs.cheatsheet.data.body">Request body</td></tr>
        <tr><td><code>headers</code></td><td><code>headers='{"Auth":"Bearer x"}'</code></td><td t="docs.cheatsheet.data.headers">Request headers</td></tr>
        <tr><td><code>params</code></td><td><code>params="{ page: 1 }"</code></td><td t="docs.cheatsheet.data.params">Query parameters</td></tr>
        <tr><td><code>cached</code></td><td><code>cached</code> or <code>cached="local"</code></td><td t="docs.cheatsheet.data.cached">Cache responses (memory/local/session)</td></tr>
        <tr><td><code>into</code></td><td><code>into="currentUser"</code></td><td t="docs.cheatsheet.data.into">Write response to a named global store</td></tr>
        <tr><td><code>debounce</code></td><td><code>debounce="300"</code></td><td t="docs.cheatsheet.data.debounce">Debounce reactive URL refetches (ms)</td></tr>
        <tr><td><code>retry</code></td><td><code>retry="3"</code></td><td t="docs.cheatsheet.data.retry">Per-element retry count override</td></tr>
        <tr><td><code>refresh</code></td><td><code>refresh="5000"</code></td><td t="docs.cheatsheet.data.refresh">Polling interval in ms</td></tr>
        <tr><td><code>success</code></td><td><code>success="#ok-tpl"</code></td><td t="docs.cheatsheet.data.success">Template ID to show on success</td></tr>
        <tr><td><code>then</code></td><td><code>then="items = $data"</code></td><td t="docs.cheatsheet.data.then">Expression to execute on success</td></tr>
        <tr><td><code>redirect</code></td><td><code>redirect="/home"</code></td><td t="docs.cheatsheet.data.redirect">Path to navigate after success</td></tr>
        <tr><td><code>confirm</code></td><td><code>confirm="Are you sure?"</code></td><td t="docs.cheatsheet.data.confirm">Confirmation message before request</td></tr>
      </tbody>
    </table>
  </div>

  <!-- State -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.state.title">State</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.state.col1">Directive</th><th t="docs.cheatsheet.state.col2">Example</th><th t="docs.cheatsheet.state.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>state</code></td><td><code>state="{ count: 0 }"</code></td><td t="docs.cheatsheet.state.state">Create local reactive state</td></tr>
        <tr><td><code>store</code></td><td><code>store="auth"</code></td><td t="docs.cheatsheet.state.store">Define/access global store</td></tr>
        <tr><td><code>computed</code></td><td><code>computed="total" expr="a+b"</code></td><td t="docs.cheatsheet.state.computed">Derived reactive value</td></tr>
        <tr><td><code>watch</code></td><td><code>watch="search"</code></td><td t="docs.cheatsheet.state.watch">React to value changes</td></tr>
        <tr><td><code>persist</code></td><td><code>persist="localStorage"</code></td><td t="docs.cheatsheet.state.persist">Attribute of <code>state</code> directive — persists state to storage</td></tr>
        <tr><td><code>model</code></td><td><code>model="name"</code></td><td t="docs.cheatsheet.state.model">Two-way binding for inputs</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Rendering -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.rendering.title">Rendering</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.rendering.col1">Directive</th><th t="docs.cheatsheet.rendering.col2">Example</th><th t="docs.cheatsheet.rendering.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>bind</code></td><td><code>bind="user.name"</code></td><td t="docs.cheatsheet.rendering.bind">Set text content</td></tr>
        <tr><td><code>bind-html</code></td><td><code>bind-html="content"</code></td><td t="docs.cheatsheet.rendering.bindHtml">Set innerHTML (sanitized)</td></tr>
        <tr><td><code>bind-*</code></td><td><code>bind-src="url"</code></td><td t="docs.cheatsheet.rendering.bindStar">Bind any attribute</td></tr>
        <tr><td><code>if</code></td><td><code>if="condition"</code></td><td t="docs.cheatsheet.rendering.if">Conditional render</td></tr>
        <tr><td><code>else-if</code></td><td><code>else-if="cond"</code></td><td t="docs.cheatsheet.rendering.elseIf">Chained conditional</td></tr>
        <tr><td><code>then</code></td><td><code>then="templateId"</code></td><td t="docs.cheatsheet.rendering.then">Template for truthy</td></tr>
        <tr><td><code>else</code></td><td><code>else="templateId"</code></td><td t="docs.cheatsheet.rendering.else">Template for falsy</td></tr>
        <tr><td><code>show</code></td><td><code>show="condition"</code></td><td t="docs.cheatsheet.rendering.show">Toggle visibility (CSS)</td></tr>
        <tr><td><code>hide</code></td><td><code>hide="condition"</code></td><td t="docs.cheatsheet.rendering.hide">Inverse of show</td></tr>
        <tr><td><code>switch</code></td><td><code>switch="value"</code></td><td t="docs.cheatsheet.rendering.switch">Switch/case render</td></tr>
        <tr><td><code>case</code></td><td><code>case="'admin'"</code></td><td t="docs.cheatsheet.rendering.case">Case match</td></tr>
        <tr><td><code>default</code></td><td><code>default</code></td><td t="docs.cheatsheet.rendering.default">Default case</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Loops -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.loops.title">Loops</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.loops.col1">Directive</th><th t="docs.cheatsheet.loops.col2">Example</th><th t="docs.cheatsheet.loops.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>each</code></td><td><code>each="item in items"</code></td><td t="docs.cheatsheet.loops.each">Simple loop</td></tr>
        <tr><td><code>foreach</code></td><td><code>foreach="item"</code></td><td t="docs.cheatsheet.loops.foreach">Extended loop</td></tr>
        <tr><td><code>from</code></td><td><code>from="items"</code></td><td t="docs.cheatsheet.loops.from">Source array</td></tr>
        <tr><td><code>template</code></td><td><code>template="tplId"</code></td><td t="docs.cheatsheet.loops.template">Template to clone</td></tr>
        <tr><td><code>index</code></td><td><code>index="i"</code></td><td t="docs.cheatsheet.loops.index">Index variable name</td></tr>
        <tr><td><code>key</code></td><td><code>key="item.id"</code></td><td t="docs.cheatsheet.loops.key">Unique key for diffing</td></tr>
        <tr><td><code>filter</code></td><td><code>filter="item.active"</code></td><td t="docs.cheatsheet.loops.filter">Filter expression</td></tr>
        <tr><td><code>sort</code></td><td><code>sort="name"</code></td><td t="docs.cheatsheet.loops.sort">Sort property (name only, not prefixed with item variable)</td></tr>
        <tr><td><code>limit</code></td><td><code>limit="10"</code></td><td t="docs.cheatsheet.loops.limit">Max items</td></tr>
        <tr><td><code>offset</code></td><td><code>offset="5"</code></td><td t="docs.cheatsheet.loops.offset">Skip items</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Events -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.events.title">Events</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.events.col1">Directive</th><th t="docs.cheatsheet.events.col2">Example</th><th t="docs.cheatsheet.events.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>on:click</code></td><td><code>on:click="count++"</code></td><td t="docs.cheatsheet.events.onClick">Click handler</td></tr>
        <tr><td><code>on:submit</code></td><td><code>on:submit.prevent="..."</code></td><td t="docs.cheatsheet.events.onSubmit">Submit handler</td></tr>
        <tr><td><code>on:input</code></td><td><code>on:input="..."</code></td><td t="docs.cheatsheet.events.onInput">Input handler</td></tr>
        <tr><td><code>on:keydown.*</code></td><td><code>on:keydown.enter="..."</code></td><td t="docs.cheatsheet.events.onKeydown">Key handler</td></tr>
        <tr><td><code>on:init</code></td><td><code>on:init="setup()"</code></td><td t="docs.cheatsheet.events.onInit">Fires immediately during initialization</td></tr>
        <tr><td><code>on:mounted</code></td><td><code>on:mounted="init()"</code></td><td t="docs.cheatsheet.events.onMounted">Lifecycle: mounted</td></tr>
        <tr><td><code>on:unmounted</code></td><td><code>on:unmounted="cleanup()"</code></td><td t="docs.cheatsheet.events.onUnmounted">Lifecycle: unmounted</td></tr>
        <tr><td><code>.throttle</code></td><td><code>on:scroll.throttle.300="..."</code></td><td t="docs.cheatsheet.events.throttle">Throttle handler execution (ms)</td></tr>
        <tr><td><code>.self</code></td><td><code>on:click.self="..."</code></td><td t="docs.cheatsheet.events.self">Only fires if event target is the element itself</td></tr>
        <tr><td><code>backspace</code></td><td><code>on:keydown.backspace="..."</code></td><td t="docs.cheatsheet.events.backspace">Key modifier for Backspace key</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Styling -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.styling.title">Styling</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.styling.col1">Directive</th><th t="docs.cheatsheet.styling.col2">Example</th><th t="docs.cheatsheet.styling.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>class-*</code></td><td><code>class-active="isOn"</code></td><td t="docs.cheatsheet.styling.classStar">Toggle CSS class</td></tr>
        <tr><td><code>class-map</code></td><td><code>class-map="{ a: x }"</code></td><td t="docs.cheatsheet.styling.classMap">Class from object</td></tr>
        <tr><td><code>style-*</code></td><td><code>style-color="c"</code></td><td t="docs.cheatsheet.styling.styleStar">Set inline style</td></tr>
        <tr><td><code>style-map</code></td><td><code>style-map="{ ... }"</code></td><td t="docs.cheatsheet.styling.styleMap">Style from object</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Forms -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.forms.title">Forms</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.forms.col1">Directive</th><th t="docs.cheatsheet.forms.col2">Example</th><th t="docs.cheatsheet.forms.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>validate</code></td><td><code>validate</code> or <code>validate="email"</code></td><td t="docs.cheatsheet.forms.validate">Enable form/field validation</td></tr>
        <tr><td><code>error</code></td><td><code>error="#tpl"</code></td><td t="docs.cheatsheet.forms.error">Error template for field</td></tr>
        <tr><td><code>success</code></td><td><code>success="#tpl"</code></td><td t="docs.cheatsheet.forms.success">Success template</td></tr>
        <tr><td><code>loading</code></td><td><code>loading="#tpl"</code></td><td t="docs.cheatsheet.forms.loading">Loading template</td></tr>
        <tr><td><code>confirm</code></td><td><code>confirm="Sure?"</code></td><td t="docs.cheatsheet.forms.confirm">Confirmation dialog</td></tr>
        <tr><td><code>redirect</code></td><td><code>redirect="/home"</code></td><td t="docs.cheatsheet.forms.redirect">Redirect on success</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Routing -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.routing.title">Routing</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.routing.col1">Directive</th><th t="docs.cheatsheet.routing.col2">Example</th><th t="docs.cheatsheet.routing.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>route</code></td><td><code>route="/path"</code></td><td t="docs.cheatsheet.routing.route">Define route or link</td></tr>
        <tr><td><code>route-view</code></td><td><code>route-view</code></td><td t="docs.cheatsheet.routing.routeView">Route outlet</td></tr>
        <tr><td><code>route-view="name"</code></td><td><code>&lt;aside route-view="sidebar"&gt;</code></td><td t="docs.cheatsheet.routing.routeViewNamed">Named route outlet</td></tr>
        <tr><td><code>route-view[src]</code></td><td><code>&lt;main route-view src="./pages/"&gt;</code></td><td>File-based routing outlet</td></tr>
        <tr><td><code>route-index</code></td><td><code>route-index="overview"</code></td><td>Filename for root <code>/</code> (default <code>"index"</code>)</td></tr>
        <tr><td><code>ext</code></td><td><code>ext=".html"</code></td><td>File extension (default <code>".tpl"</code>, fallback <code>".html"</code>)</td></tr>
        <tr><td><code>i18n-ns</code></td><td><code>i18n-ns</code></td><td>Auto-derive i18n namespace from route filename</td></tr>
        <tr><td><code>outlet</code></td><td><code>&lt;template route="/x" outlet="sidebar"&gt;</code></td><td t="docs.cheatsheet.routing.outlet">Target a named outlet</td></tr>
        <tr><td><code>route-active</code></td><td><code>route-active="cls"</code></td><td t="docs.cheatsheet.routing.routeActive">Active link class</td></tr>
        <tr><td><code>guard</code></td><td><code>guard="expr"</code></td><td t="docs.cheatsheet.routing.guard">Route guard condition</td></tr>
        <tr><td><code>route-active-exact</code></td><td><code>route-active-exact="cls"</code></td><td t="docs.cheatsheet.routing.routeActiveExact">Exact match active class for route links</td></tr>
        <tr><td><code>redirect</code></td><td><code>redirect="/login"</code></td><td t="docs.cheatsheet.routing.redirect">Redirect path when guard fails</td></tr>
        <tr><td><code>lazy="priority"</code></td><td><code>&lt;template src="..." lazy="priority"&gt;</code></td><td t="docs.cheatsheet.routing.lazyPriority">Load remote template before all others (Phase 0)</td></tr>
        <tr><td><code>lazy="ondemand"</code></td><td><code>&lt;template route="..." src="..." lazy="ondemand"&gt;</code></td><td t="docs.cheatsheet.routing.lazyOnDemand">Fetch route template only when first visited (route templates only)</td></tr>
        <tr><td><code>$router.forward()</code></td><td><code>$router.forward()</code></td><td t="docs.cheatsheet.routing.routerForward">Navigate forward in history</td></tr>
        <tr><td><code>$router.on(fn)</code></td><td><code>$router.on(r =&gt; ...)</code></td><td t="docs.cheatsheet.routing.routerOn">Subscribe to route changes</td></tr>
        <tr><td><code>$router.current</code></td><td><code>$router.current.path</code></td><td t="docs.cheatsheet.routing.routerCurrent">Current route object</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Animation -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.animation.title">Animation</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.animation.col1">Directive</th><th t="docs.cheatsheet.animation.col2">Example</th><th t="docs.cheatsheet.animation.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>animate</code></td><td><code>animate="fadeIn"</code></td><td t="docs.cheatsheet.animation.animate">Enter animation</td></tr>
        <tr><td><code>animate-enter</code></td><td><code>animate-enter="slideIn"</code></td><td t="docs.cheatsheet.animation.animateEnter">Enter animation</td></tr>
        <tr><td><code>animate-leave</code></td><td><code>animate-leave="slideOut"</code></td><td t="docs.cheatsheet.animation.animateLeave">Leave animation</td></tr>
        <tr><td><code>animate-duration</code></td><td><code>animate-duration="300"</code></td><td t="docs.cheatsheet.animation.animateDuration">Duration in ms</td></tr>
        <tr><td><code>animate-stagger</code></td><td><code>animate-stagger="50"</code></td><td t="docs.cheatsheet.animation.animateStagger">Stagger delay</td></tr>
        <tr><td><code>transition</code></td><td><code>transition="fade"</code></td><td t="docs.cheatsheet.animation.transition">CSS transition</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Drag and Drop -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.dnd.title">Drag and Drop</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.dnd.col1">Directive</th><th t="docs.cheatsheet.dnd.col2">Example</th><th t="docs.cheatsheet.dnd.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>drag</code></td><td><code>drag</code></td><td t="docs.cheatsheet.dnd.drag">Make element draggable</td></tr>
        <tr><td><code>drag-type</code></td><td><code>drag-type="task"</code></td><td t="docs.cheatsheet.dnd.dragType">Data type identifier</td></tr>
        <tr><td><code>drag-effect</code></td><td><code>drag-effect="move"</code></td><td t="docs.cheatsheet.dnd.dragEffect">Allowed effect (move/copy/link/all)</td></tr>
        <tr><td><code>drag-handle</code></td><td><code>drag-handle=".handle"</code></td><td t="docs.cheatsheet.dnd.dragHandle">Restrict drag to handle selector</td></tr>
        <tr><td><code>drag-disabled</code></td><td><code>drag-disabled="locked"</code></td><td t="docs.cheatsheet.dnd.dragDisabled">Disable drag conditionally</td></tr>
        <tr><td><code>drag-class</code></td><td><code>drag-class="dragging"</code></td><td t="docs.cheatsheet.dnd.dragClass">Class added while dragging</td></tr>
        <tr><td><code>drag-group</code></td><td><code>drag-group="board"</code></td><td t="docs.cheatsheet.dnd.dragGroup">Scope drag to a named group</td></tr>
        <tr><td><code>drop</code></td><td><code>drop</code></td><td t="docs.cheatsheet.dnd.drop">Make element a drop zone</td></tr>
        <tr><td><code>drop-accept</code></td><td><code>drop-accept="task"</code></td><td t="docs.cheatsheet.dnd.dropAccept">Accepted drag type(s)</td></tr>
        <tr><td><code>drop-effect</code></td><td><code>drop-effect="move"</code></td><td t="docs.cheatsheet.dnd.dropEffect">Visual feedback effect</td></tr>
        <tr><td><code>drop-class</code></td><td><code>drop-class="over"</code></td><td t="docs.cheatsheet.dnd.dropClass">Class added on drag-over</td></tr>
        <tr><td><code>drop-reject-class</code></td><td><code>drop-reject-class="nope"</code></td><td>Class added on rejected drag-over</td></tr>
        <tr><td><code>drop-disabled</code></td><td><code>drop-disabled="full"</code></td><td t="docs.cheatsheet.dnd.dropDisabled">Disable drop conditionally</td></tr>
        <tr><td><code>drop-max</code></td><td><code>drop-max="5"</code></td><td t="docs.cheatsheet.dnd.dropMax">Maximum items in drop zone</td></tr>
        <tr><td><code>drop-sort</code></td><td><code>drop-sort</code></td><td t="docs.cheatsheet.dnd.dropSort">Enable positional sorting</td></tr>
        <tr><td><code>drop-placeholder</code></td><td><code>drop-placeholder="#ph"</code></td><td t="docs.cheatsheet.dnd.dropPlaceholder">Placeholder template during drag-over</td></tr>
        <tr><td><code>drop-settle-class</code></td><td><code>drop-settle-class="my-settle"</code></td><td t="docs.cheatsheet.dnd.dropSettleClass">Custom CSS class for settle animation</td></tr>
        <tr><td><code>drop-empty-class</code></td><td><code>drop-empty-class="empty"</code></td><td t="docs.cheatsheet.dnd.dropEmptyClass">Custom CSS class for empty state on drag-list</td></tr>
        <tr><td><code>drag-list</code></td><td><code>drag-list="items"</code></td><td t="docs.cheatsheet.dnd.dragList">Sortable list bound to state array</td></tr>
        <tr><td><code>drag-list-key</code></td><td><code>drag-list-key="id"</code></td><td t="docs.cheatsheet.dnd.dragListKey">Unique key for each item</td></tr>
        <tr><td><code>drag-list-item</code></td><td><code>drag-list-item="task"</code></td><td t="docs.cheatsheet.dnd.dragListItem">Loop variable name in template</td></tr>
        <tr><td><code>drag-list-copy</code></td><td><code>drag-list-copy</code></td><td t="docs.cheatsheet.dnd.dragListCopy">Copy instead of move on transfer</td></tr>
        <tr><td><code>drag-list-remove</code></td><td><code>drag-list-remove</code></td><td t="docs.cheatsheet.dnd.dragListRemove">Remove items from source on transfer</td></tr>
        <tr><td><code>drag-multiple</code></td><td><code>drag-multiple</code></td><td t="docs.cheatsheet.dnd.dragMultiple">Lasso / multi-select on children</td></tr>
        <tr><td><code>drag-multiple-class</code></td><td><code>drag-multiple-class="selected"</code></td><td t="docs.cheatsheet.dnd.dragMultipleClass">Class added to selected items</td></tr>
      </tbody>
    </table>
  </div>

  <!-- i18n -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.i18n.title">i18n</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.i18n.col1">Directive</th><th t="docs.cheatsheet.i18n.col2">Example</th><th t="docs.cheatsheet.i18n.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>t</code></td><td><code>t="greeting"</code></td><td t="docs.cheatsheet.i18n.t">Translate key</td></tr>
        <tr><td><code>t-*</code></td><td><code>t-name="user.name"</code></td><td t="docs.cheatsheet.i18n.tStar">Translation param</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Misc -->
  <div class="doc-section">
    <h2 class="doc-title" t="docs.cheatsheet.misc.title">Misc</h2>
    <table class="doc-table">
      <thead><tr><th t="docs.cheatsheet.misc.col1">Directive</th><th t="docs.cheatsheet.misc.col2">Example</th><th t="docs.cheatsheet.misc.col3">Description</th></tr></thead>
      <tbody>
        <tr><td><code>ref</code></td><td><code>ref="input"</code></td><td t="docs.cheatsheet.misc.ref">Named element ref</td></tr>
        <tr><td><code>call</code></td><td><code>call="/api/action"</code></td><td t="docs.cheatsheet.misc.call">Trigger API call</td></tr>
        <tr><td><code>trigger</code></td><td><code>trigger="event-name"</code></td><td t="docs.cheatsheet.misc.trigger">Emit custom event</td></tr>
        <tr><td><code>use</code></td><td><code>use="templateId"</code></td><td t="docs.cheatsheet.misc.use">Instantiate template</td></tr>
        <tr><td><code>src</code> (on template)</td><td><code>src="/tpl.html"</code></td><td t="docs.cheatsheet.misc.src">Remote template (see also: <code>lazy</code>)</td></tr>
        <tr><td><code>loading</code> (on template)</td><td><code>&lt;template src="..." loading="#skl"&gt;</code></td><td t="docs.cheatsheet.misc.loading">Placeholder shown while remote template loads; removed on arrival</td></tr>
        <tr><td><code>include</code> (on template)</td><td><code>&lt;template include="#fragment"&gt;</code></td><td t="docs.cheatsheet.misc.include">Synchronously clone an inline template into the current position</td></tr>
        <tr><td><code>error-boundary</code></td><td><code>error-boundary="#fb"</code></td><td t="docs.cheatsheet.misc.errorBoundary">Error boundary</td></tr>
      </tbody>
    </table>
  </div>

</div>
