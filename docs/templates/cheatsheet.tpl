<!-- Cheatsheet — from cheatsheet.md -->

<section class="hero-section">
  <span class="badge">API Reference</span>
  <h1 class="hero-title">Directive Cheatsheet</h1>
  <p class="hero-subtitle">Complete reference of every No.JS directive</p>
</section>

<div class="doc-content">

  <!-- Data -->
  <div class="doc-section">
    <h2 class="doc-title">Data</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>base</code></td><td><code>base="https://api.com"</code></td><td>Set API base URL for descendants</td></tr>
        <tr><td><code>get</code></td><td><code>get="/users"</code></td><td>Fetch data (GET)</td></tr>
        <tr><td><code>post</code></td><td><code>post="/login"</code></td><td>Submit data (POST)</td></tr>
        <tr><td><code>put</code></td><td><code>put="/users/1"</code></td><td>Update data (PUT)</td></tr>
        <tr><td><code>patch</code></td><td><code>patch="/users/1"</code></td><td>Partial update (PATCH)</td></tr>
        <tr><td><code>delete</code></td><td><code>delete="/users/1"</code></td><td>Delete data (DELETE)</td></tr>
        <tr><td><code>as</code></td><td><code>as="users"</code></td><td>Name for fetched data in context</td></tr>
        <tr><td><code>body</code></td><td><code>body='{"key":"val"}'</code></td><td>Request body</td></tr>
        <tr><td><code>headers</code></td><td><code>headers='{"Auth":"Bearer x"}'</code></td><td>Request headers</td></tr>
        <tr><td><code>params</code></td><td><code>params="{ page: 1 }"</code></td><td>Query parameters</td></tr>
        <tr><td><code>cached</code></td><td><code>cached</code> or <code>cached="local"</code></td><td>Cache responses (memory/local/session)</td></tr>
        <tr><td><code>into</code></td><td><code>into="currentUser"</code></td><td>Write response to a named global store</td></tr>
        <tr><td><code>debounce</code></td><td><code>debounce="300"</code></td><td>Debounce reactive URL refetches (ms)</td></tr>
        <tr><td><code>retry</code></td><td><code>retry="3"</code></td><td>Per-element retry count override</td></tr>
        <tr><td><code>refresh</code></td><td><code>refresh="5000"</code></td><td>Polling interval in ms</td></tr>
        <tr><td><code>success</code></td><td><code>success="#ok-tpl"</code></td><td>Template ID to show on success</td></tr>
        <tr><td><code>then</code></td><td><code>then="items = $data"</code></td><td>Expression to execute on success</td></tr>
        <tr><td><code>redirect</code></td><td><code>redirect="/home"</code></td><td>Path to navigate after success</td></tr>
        <tr><td><code>confirm</code></td><td><code>confirm="Are you sure?"</code></td><td>Confirmation message before request</td></tr>
      </tbody>
    </table>
  </div>

  <!-- State -->
  <div class="doc-section">
    <h2 class="doc-title">State</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>state</code></td><td><code>state="{ count: 0 }"</code></td><td>Create local reactive state</td></tr>
        <tr><td><code>store</code></td><td><code>store="auth"</code></td><td>Define/access global store</td></tr>
        <tr><td><code>computed</code></td><td><code>computed="total" expr="a+b"</code></td><td>Derived reactive value</td></tr>
        <tr><td><code>watch</code></td><td><code>watch="search"</code></td><td>React to value changes</td></tr>
        <tr><td><code>persist</code></td><td><code>persist="localStorage"</code></td><td>Attribute of <code>state</code> directive — persists state to storage</td></tr>
        <tr><td><code>model</code></td><td><code>model="name"</code></td><td>Two-way binding for inputs</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Rendering -->
  <div class="doc-section">
    <h2 class="doc-title">Rendering</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>bind</code></td><td><code>bind="user.name"</code></td><td>Set text content</td></tr>
        <tr><td><code>bind-html</code></td><td><code>bind-html="content"</code></td><td>Set innerHTML (sanitized)</td></tr>
        <tr><td><code>bind-*</code></td><td><code>bind-src="url"</code></td><td>Bind any attribute</td></tr>
        <tr><td><code>if</code></td><td><code>if="condition"</code></td><td>Conditional render</td></tr>
        <tr><td><code>else-if</code></td><td><code>else-if="cond"</code></td><td>Chained conditional</td></tr>
        <tr><td><code>then</code></td><td><code>then="templateId"</code></td><td>Template for truthy</td></tr>
        <tr><td><code>else</code></td><td><code>else="templateId"</code></td><td>Template for falsy</td></tr>
        <tr><td><code>show</code></td><td><code>show="condition"</code></td><td>Toggle visibility (CSS)</td></tr>
        <tr><td><code>hide</code></td><td><code>hide="condition"</code></td><td>Inverse of show</td></tr>
        <tr><td><code>switch</code></td><td><code>switch="value"</code></td><td>Switch/case render</td></tr>
        <tr><td><code>case</code></td><td><code>case="'admin'"</code></td><td>Case match</td></tr>
        <tr><td><code>default</code></td><td><code>default</code></td><td>Default case</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Loops -->
  <div class="doc-section">
    <h2 class="doc-title">Loops</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>each</code></td><td><code>each="item in items"</code></td><td>Simple loop</td></tr>
        <tr><td><code>foreach</code></td><td><code>foreach="item"</code></td><td>Extended loop</td></tr>
        <tr><td><code>from</code></td><td><code>from="items"</code></td><td>Source array</td></tr>
        <tr><td><code>template</code></td><td><code>template="tplId"</code></td><td>Template to clone</td></tr>
        <tr><td><code>index</code></td><td><code>index="i"</code></td><td>Index variable name</td></tr>
        <tr><td><code>key</code></td><td><code>key="item.id"</code></td><td>Unique key for diffing</td></tr>
        <tr><td><code>filter</code></td><td><code>filter="item.active"</code></td><td>Filter expression</td></tr>
        <tr><td><code>sort</code></td><td><code>sort="name"</code></td><td>Sort property (name only, not prefixed with item variable)</td></tr>
        <tr><td><code>limit</code></td><td><code>limit="10"</code></td><td>Max items</td></tr>
        <tr><td><code>offset</code></td><td><code>offset="5"</code></td><td>Skip items</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Events -->
  <div class="doc-section">
    <h2 class="doc-title">Events</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>on:click</code></td><td><code>on:click="count++"</code></td><td>Click handler</td></tr>
        <tr><td><code>on:submit</code></td><td><code>on:submit.prevent="..."</code></td><td>Submit handler</td></tr>
        <tr><td><code>on:input</code></td><td><code>on:input="..."</code></td><td>Input handler</td></tr>
        <tr><td><code>on:keydown.*</code></td><td><code>on:keydown.enter="..."</code></td><td>Key handler</td></tr>
        <tr><td><code>on:init</code></td><td><code>on:init="setup()"</code></td><td>Fires immediately during initialization</td></tr>
        <tr><td><code>on:mounted</code></td><td><code>on:mounted="init()"</code></td><td>Lifecycle: mounted</td></tr>
        <tr><td><code>on:unmounted</code></td><td><code>on:unmounted="cleanup()"</code></td><td>Lifecycle: unmounted</td></tr>
        <tr><td><code>.throttle</code></td><td><code>on:scroll.throttle.300="..."</code></td><td>Throttle handler execution (ms)</td></tr>
        <tr><td><code>.self</code></td><td><code>on:click.self="..."</code></td><td>Only fires if event target is the element itself</td></tr>
        <tr><td><code>backspace</code></td><td><code>on:keydown.backspace="..."</code></td><td>Key modifier for Backspace key</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Styling -->
  <div class="doc-section">
    <h2 class="doc-title">Styling</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>class-*</code></td><td><code>class-active="isOn"</code></td><td>Toggle CSS class</td></tr>
        <tr><td><code>class-map</code></td><td><code>class-map="{ a: x }"</code></td><td>Class from object</td></tr>
        <tr><td><code>style-*</code></td><td><code>style-color="c"</code></td><td>Set inline style</td></tr>
        <tr><td><code>style-map</code></td><td><code>style-map="{ ... }"</code></td><td>Style from object</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Forms -->
  <div class="doc-section">
    <h2 class="doc-title">Forms</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>validate</code></td><td><code>validate</code> or <code>validate="email"</code></td><td>Enable form/field validation</td></tr>
        <tr><td><code>error</code></td><td><code>error="#tpl"</code></td><td>Error template for field</td></tr>
        <tr><td><code>success</code></td><td><code>success="#tpl"</code></td><td>Success template</td></tr>
        <tr><td><code>loading</code></td><td><code>loading="#tpl"</code></td><td>Loading template</td></tr>
        <tr><td><code>confirm</code></td><td><code>confirm="Sure?"</code></td><td>Confirmation dialog</td></tr>
        <tr><td><code>redirect</code></td><td><code>redirect="/home"</code></td><td>Redirect on success</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Routing -->
  <div class="doc-section">
    <h2 class="doc-title">Routing</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>route</code></td><td><code>route="/path"</code></td><td>Define route or link</td></tr>
        <tr><td><code>route-view</code></td><td><code>route-view</code></td><td>Route outlet</td></tr>
        <tr><td><code>route-view="name"</code></td><td><code>&lt;aside route-view="sidebar"&gt;</code></td><td>Named route outlet</td></tr>
        <tr><td><code>outlet</code></td><td><code>&lt;template route="/x" outlet="sidebar"&gt;</code></td><td>Target a named outlet</td></tr>
        <tr><td><code>route-active</code></td><td><code>route-active="cls"</code></td><td>Active link class</td></tr>
        <tr><td><code>guard</code></td><td><code>guard="expr"</code></td><td>Route guard condition</td></tr>
        <tr><td><code>route-active-exact</code></td><td><code>route-active-exact="cls"</code></td><td>Exact match active class for route links</td></tr>
        <tr><td><code>redirect</code></td><td><code>redirect="/login"</code></td><td>Redirect path when guard fails</td></tr>
        <tr><td><code>lazy="priority"</code></td><td><code>&lt;template src="..." lazy="priority"&gt;</code></td><td>Load remote template before all others (Phase 0)</td></tr>
        <tr><td><code>lazy="ondemand"</code></td><td><code>&lt;template route="..." src="..." lazy="ondemand"&gt;</code></td><td>Fetch route template only when first visited (route templates only)</td></tr>
        <tr><td><code>$router.forward()</code></td><td><code>$router.forward()</code></td><td>Navigate forward in history</td></tr>
        <tr><td><code>$router.on(fn)</code></td><td><code>$router.on(r =&gt; ...)</code></td><td>Subscribe to route changes</td></tr>
        <tr><td><code>$router.current</code></td><td><code>$router.current.path</code></td><td>Current route object</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Animation -->
  <div class="doc-section">
    <h2 class="doc-title">Animation</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>animate</code></td><td><code>animate="fadeIn"</code></td><td>Enter animation</td></tr>
        <tr><td><code>animate-enter</code></td><td><code>animate-enter="slideIn"</code></td><td>Enter animation</td></tr>
        <tr><td><code>animate-leave</code></td><td><code>animate-leave="slideOut"</code></td><td>Leave animation</td></tr>
        <tr><td><code>animate-duration</code></td><td><code>animate-duration="300"</code></td><td>Duration in ms</td></tr>
        <tr><td><code>animate-stagger</code></td><td><code>animate-stagger="50"</code></td><td>Stagger delay</td></tr>
        <tr><td><code>transition</code></td><td><code>transition="fade"</code></td><td>CSS transition</td></tr>
      </tbody>
    </table>
  </div>

  <!-- i18n -->
  <div class="doc-section">
    <h2 class="doc-title">i18n</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>t</code></td><td><code>t="greeting"</code></td><td>Translate key</td></tr>
        <tr><td><code>t-*</code></td><td><code>t-name="user.name"</code></td><td>Translation param</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Misc -->
  <div class="doc-section">
    <h2 class="doc-title">Misc</h2>
    <table class="doc-table">
      <thead><tr><th>Directive</th><th>Example</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>ref</code></td><td><code>ref="input"</code></td><td>Named element ref</td></tr>
        <tr><td><code>call</code></td><td><code>call="/api/action"</code></td><td>Trigger API call</td></tr>
        <tr><td><code>trigger</code></td><td><code>trigger="event-name"</code></td><td>Emit custom event</td></tr>
        <tr><td><code>use</code></td><td><code>use="templateId"</code></td><td>Instantiate template</td></tr>
        <tr><td><code>src</code> (on template)</td><td><code>src="/tpl.html"</code></td><td>Remote template (see also: <code>lazy</code>)</td></tr>
        <tr><td><code>loading</code> (on template)</td><td><code>&lt;template src="..." loading="#skl"&gt;</code></td><td>Placeholder shown while remote template loads; removed on arrival</td></tr>
        <tr><td><code>include</code> (on template)</td><td><code>&lt;template include="#fragment"&gt;</code></td><td>Synchronously clone an inline template into the current position</td></tr>
        <tr><td><code>error-boundary</code></td><td><code>error-boundary="#fb"</code></td><td>Error boundary</td></tr>
      </tbody>
    </table>
  </div>

</div>
