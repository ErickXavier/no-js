<!-- Forms & Validation — from forms-validation.md -->

<section class="hero-section">
  <span class="badge">Guides</span>
  <h1 class="hero-title">Forms &amp; Validation</h1>
  <p class="hero-subtitle">Declarative form submission with built-in and custom validation rules</p>
</section>

<div class="doc-content">

  <!-- Declarative Form Submission -->
  <div class="doc-section">
    <h2 class="doc-title">Declarative Form Submission</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;form</span> <span class="hl-attr">post</span>=<span class="hl-str">"/api/register"</span>
      <span class="hl-attr">success</span>=<span class="hl-str">"#registerSuccess"</span>
      <span class="hl-attr">error</span>=<span class="hl-str">"#registerError"</span>
      <span class="hl-attr">loading</span>=<span class="hl-str">"#registerLoading"</span>
      <span class="hl-attr">validate</span><span class="hl-tag">&gt;</span>

  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"text"</span>     <span class="hl-attr">name</span>=<span class="hl-str">"name"</span>     <span class="hl-attr">required</span> <span class="hl-attr">minlength</span>=<span class="hl-str">"2"</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"email"</span>    <span class="hl-attr">name</span>=<span class="hl-str">"email"</span>    <span class="hl-attr">required</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"password"</span> <span class="hl-attr">name</span>=<span class="hl-str">"password"</span> <span class="hl-attr">required</span> <span class="hl-attr">minlength</span>=<span class="hl-str">"8"</span>
         <span class="hl-attr">pattern</span>=<span class="hl-str">"(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"</span> <span class="hl-tag">/&gt;</span>

  <span class="hl-tag">&lt;button</span> <span class="hl-attr">type</span>=<span class="hl-str">"submit"</span> <span class="hl-attr">bind-disabled</span>=<span class="hl-str">"!$form.valid"</span><span class="hl-tag">&gt;</span>Register<span class="hl-tag">&lt;/button&gt;</span>

<span class="hl-tag">&lt;/form&gt;</span></pre></div>
  </div>

  <!-- Validation Rules -->
  <div class="doc-section">
    <h2 class="doc-title">Validation Rules</h2>
    <div class="code-block"><pre><span class="hl-cmt">&lt;!-- Built-in HTML5 validation --&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">required</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">minlength</span>=<span class="hl-str">"3"</span> <span class="hl-attr">maxlength</span>=<span class="hl-str">"50"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"email"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">pattern</span>=<span class="hl-str">"[0-9]{3}-[0-9]{4}"</span> <span class="hl-tag">/&gt;</span>

<span class="hl-cmt">&lt;!-- No.JS custom validators --&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"email"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"cpf"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"cnpj"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"phone"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"url"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"creditcard"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"match:password"</span> <span class="hl-tag">/&gt;</span>          <span class="hl-cmt">&lt;!-- Must match another field --&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"min:18"</span> <span class="hl-tag">/&gt;</span>                  <span class="hl-cmt">&lt;!-- Numeric min --&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"max:120"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"between:1,100"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">validate</span>=<span class="hl-str">"custom:validateUsername"</span> <span class="hl-tag">/&gt;</span>  <span class="hl-cmt">&lt;!-- Custom function --&gt;</span>

<span class="hl-cmt">&lt;!-- Error display --&gt;</span>
<span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"email"</span> <span class="hl-attr">name</span>=<span class="hl-str">"email"</span> <span class="hl-attr">validate</span>=<span class="hl-str">"email"</span> <span class="hl-attr">error</span>=<span class="hl-str">"#emailError"</span> <span class="hl-tag">/&gt;</span>
<span class="hl-tag">&lt;template</span> <span class="hl-attr">id</span>=<span class="hl-str">"emailError"</span> <span class="hl-attr">var</span>=<span class="hl-str">"err"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;span</span> <span class="hl-attr">class</span>=<span class="hl-str">"field-error"</span> <span class="hl-attr">bind</span>=<span class="hl-str">"err.message"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>
<span class="hl-tag">&lt;/template&gt;</span></pre></div>
  </div>

  <!-- $form Context -->
  <div class="doc-section">
    <h2 class="doc-title">$form — Form Context</h2>
    <p class="doc-text">Inside any <code>&lt;form&gt;</code> with the <code>validate</code> attribute, <code>$form</code> provides:</p>
    <table class="doc-table">
      <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>$form.valid</code></td><td>boolean</td><td><code>true</code> if all fields pass validation</td></tr>
        <tr><td><code>$form.dirty</code></td><td>boolean</td><td><code>true</code> if any field has been modified</td></tr>
        <tr><td><code>$form.touched</code></td><td>boolean</td><td><code>true</code> if any field has been focused and blurred</td></tr>
        <tr><td><code>$form.submitting</code></td><td>boolean</td><td><code>true</code> while the request is in flight</td></tr>
        <tr><td><code>$form.errors</code></td><td>object</td><td>Map of field names → error messages</td></tr>
        <tr><td><code>$form.values</code></td><td>object</td><td>Current form values</td></tr>
        <tr><td><code>$form.reset()</code></td><td>function</td><td>Reset form to initial values</td></tr>
      </tbody>
    </table>

    <div class="code-block"><pre><span class="hl-tag">&lt;form</span> <span class="hl-attr">post</span>=<span class="hl-str">"/api/contact"</span> <span class="hl-attr">validate</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"text"</span> <span class="hl-attr">name</span>=<span class="hl-str">"name"</span> <span class="hl-attr">required</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"email"</span> <span class="hl-attr">name</span>=<span class="hl-str">"email"</span> <span class="hl-attr">required</span> <span class="hl-attr">validate</span>=<span class="hl-str">"email"</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;textarea</span> <span class="hl-attr">name</span>=<span class="hl-str">"message"</span> <span class="hl-attr">required</span> <span class="hl-attr">minlength</span>=<span class="hl-str">"10"</span><span class="hl-tag">&gt;&lt;/textarea&gt;</span>

  <span class="hl-tag">&lt;p</span> <span class="hl-attr">show</span>=<span class="hl-str">"$form.errors.email"</span> <span class="hl-attr">class</span>=<span class="hl-str">"error"</span>
     <span class="hl-attr">bind</span>=<span class="hl-str">"$form.errors.email"</span><span class="hl-tag">&gt;&lt;/p&gt;</span>

  <span class="hl-tag">&lt;button</span> <span class="hl-attr">type</span>=<span class="hl-str">"submit"</span>
          <span class="hl-attr">bind-disabled</span>=<span class="hl-str">"!$form.valid || $form.submitting"</span><span class="hl-tag">&gt;</span>
    <span class="hl-tag">&lt;span</span> <span class="hl-attr">hide</span>=<span class="hl-str">"$form.submitting"</span><span class="hl-tag">&gt;</span>Send<span class="hl-tag">&lt;/span&gt;</span>
    <span class="hl-tag">&lt;span</span> <span class="hl-attr">show</span>=<span class="hl-str">"$form.submitting"</span><span class="hl-tag">&gt;</span>Sending...<span class="hl-tag">&lt;/span&gt;</span>
  <span class="hl-tag">&lt;/button&gt;</span>
<span class="hl-tag">&lt;/form&gt;</span></pre></div>
  </div>

  <!-- Custom Validators -->
  <div class="doc-section">
    <h2 class="doc-title">Custom Validators</h2>
    <div class="code-block"><pre><span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-fn">NoJS</span>.<span class="hl-fn">validator</span>(<span class="hl-str">'strongPassword'</span>, (<span class="hl-attr">value</span>) <span class="hl-op">=&gt;</span> {
    <span class="hl-kw">if</span> (value.length <span class="hl-op">&lt;</span> <span class="hl-num">8</span>) <span class="hl-kw">return</span> <span class="hl-str">'Must be at least 8 characters'</span>;
    <span class="hl-kw">if</span> (<span class="hl-op">!</span>/[A-Z]/.<span class="hl-fn">test</span>(value)) <span class="hl-kw">return</span> <span class="hl-str">'Must contain uppercase'</span>;
    <span class="hl-kw">if</span> (<span class="hl-op">!</span>/[0-9]/.<span class="hl-fn">test</span>(value)) <span class="hl-kw">return</span> <span class="hl-str">'Must contain a number'</span>;
    <span class="hl-kw">return</span> <span class="hl-kw">true</span>;
  });
<span class="hl-tag">&lt;/script&gt;</span>

<span class="hl-tag">&lt;input</span> <span class="hl-attr">type</span>=<span class="hl-str">"password"</span> <span class="hl-attr">validate</span>=<span class="hl-str">"strongPassword"</span> <span class="hl-tag">/&gt;</span></pre></div>
  </div>

  <!-- Live Demo -->
  <div class="doc-section">
    <h2 class="doc-title">Live Demo — Contact Form</h2>
    <div class="demo-split">
      <div class="demo-code">
        <div class="code-block"><pre><span class="hl-tag">&lt;div</span> <span class="hl-attr">state</span>=<span class="hl-str">"{ name: '', email: '', sent: false }"</span><span class="hl-tag">&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">model</span>=<span class="hl-str">"name"</span> <span class="hl-attr">placeholder</span>=<span class="hl-str">"Name"</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;input</span> <span class="hl-attr">model</span>=<span class="hl-str">"email"</span> <span class="hl-attr">placeholder</span>=<span class="hl-str">"Email"</span> <span class="hl-tag">/&gt;</span>
  <span class="hl-tag">&lt;button</span> <span class="hl-attr">on:click</span>=<span class="hl-str">"sent = true"</span><span class="hl-tag">&gt;</span>Send<span class="hl-tag">&lt;/button&gt;</span>
  <span class="hl-tag">&lt;p</span> <span class="hl-attr">show</span>=<span class="hl-str">"sent"</span><span class="hl-tag">&gt;</span>Thanks, <span class="hl-tag">&lt;span</span> <span class="hl-attr">bind</span>=<span class="hl-str">"name"</span><span class="hl-tag">&gt;&lt;/span&gt;</span>!<span class="hl-tag">&lt;/p&gt;</span>
<span class="hl-tag">&lt;/div&gt;</span></pre></div>
      </div>
      <div class="demo-preview">
        <span class="demo-result-label">Result</span>
        <div state="{ name: '', email: '', sent: false }">
          <div class="form-group">
            <input class="input" model="name" placeholder="Your name" />
          </div>
          <div class="form-group">
            <input class="input" model="email" placeholder="Your email" />
          </div>
          <button class="btn btn-primary btn-sm" on:click="sent = true">Send</button>
          <p show="sent" style="margin-top: 12px; color: var(--success);">Thanks, <span bind="name"></span>!</p>
        </div>
      </div>
    </div>
  </div>

</div>


