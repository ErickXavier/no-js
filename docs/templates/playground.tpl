<!-- Playground Page — Interactive NoJS sandbox -->
<div class="playground-page" i18n-ns="playground"
     state="{
       files: {},
       openTabs: ['kanban.html', 'chat.html', 'settings.html'],
       activeFile: 'kanban.html',
       tabScrollPositions: {},
       history: [],
       historyIndex: -1,
       consoleLines: [],
       showConsole: true,
       splitterPos: 50
     }">

  <!-- ═══ Toolbar ═══ -->
  <div class="playground-toolbar">
    <div class="toolbar-left">
      <button class="toolbar-btn" on:click="resetProject()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        <span t="playground.toolbar.reset">Reset</span>
      </button>
    </div>
    <div class="toolbar-right">
      <button class="toolbar-btn" on:click="sharePlayground()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        <span t="playground.toolbar.share">Share</span>
      </button>
      <button class="toolbar-btn" on:click="downloadProject()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span t="playground.toolbar.download">Download</span>
      </button>
    </div>
  </div>

  <!-- ═══ Main Area ═══ -->
  <div class="playground-main">

    <!-- Code Editor (multi-tab) -->
    <div class="playground-editor">
      <div class="editor-tab-bar" ref="tabBar">
        <div each="tab in openTabs" template="editor-tab-tpl" style="display:contents"></div>
        <button class="tab-add-btn" on:click="promptCreateFile()"
                title="New file" aria-label="Create new file">+</button>
        <div class="tab-bar-spacer"></div>
      </div>
      <div class="editor-body">
        <div class="line-numbers" ref="lineNumbers"></div>
        <pre class="code-editor"><code class="code-editable" ref="codeArea"
             contenteditable="true"
             on:input="onCodeChange()"
             on:keydown.tab.prevent="insertTab($event)"
             on:keydown.enter.prevent="insertNewline($event)"
             on:paste.prevent="handlePaste($event)"
             spellcheck="false"
             autocomplete="off"
             autocorrect="off"
             autocapitalize="off"
             role="textbox"
             aria-multiline="true"
             aria-label="Code editor"></code></pre>
      </div>
    </div>

    <!-- Splitter -->
    <div class="playground-splitter"
         on:mousedown="startSplitterDrag($event)"
         role="separator"
         aria-orientation="vertical"></div>

    <!-- Preview + Console -->
    <div class="playground-preview">
      <div class="preview-tab-bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        <span>Preview</span>
        <div class="preview-tab-spacer"></div>
        <svg class="preview-action" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" on:click="downloadProject()" style="cursor:pointer"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <svg class="preview-action" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" on:click="refreshPreview()" style="cursor:pointer"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
      </div>
      <iframe ref="previewFrame" class="preview-iframe"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"></iframe>
      <div class="console-splitter"></div>
      <div class="playground-console" show="showConsole" role="log" aria-live="polite">
        <div class="console-header">
          <div class="console-title-group">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--pg-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
            <span t="playground.console.title">Console</span>
          </div>
          <div class="console-actions">
            <button class="console-btn" on:click="consoleLines = []"
                    aria-label="Clear console">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
        <div class="console-body" ref="consoleBody">
          <div each="line in consoleLines" template="console-line-tpl"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ Dialog (replaces native alert / confirm / prompt) ═══ -->
  <dialog class="pg-dialog">
    <div class="pg-dialog-header">
      <span class="pg-dialog-title"></span>
    </div>
    <p class="pg-dialog-msg"></p>
    <input class="pg-dialog-input" type="text" style="display:none">
    <div class="pg-dialog-actions">
      <button class="pg-dialog-cancel">Cancel</button>
      <button class="pg-dialog-ok">OK</button>
    </div>
  </dialog>

  <!-- ═══ Templates ═══ -->
  <template id="editor-tab-tpl">
    <div class="editor-tab"
         class-active="tab === activeFile"
         on:click="switchTab(tab)">
      <span class="tab-icon" bind="tab.endsWith('.html') ? '&lt;/&gt;' : tab.endsWith('.css') ? '#' : tab.endsWith('.json') ? '{}' : tab.endsWith('.js') ? 'js' : tab.endsWith('.tpl') ? '&lt;&gt;' : '•'"></span>
      <span class="tab-name" bind="files[tab] ? files[tab].name : tab"></span>
      <span class="tab-close"
            on:click.stop="closeTab(tab)"
            show="openTabs.length > 1">✕</span>
    </div>
  </template>

  <template id="console-line-tpl">
    <div class="console-line"
         class-warn="line.type === 'warn'"
         class-error="line.type === 'error'"
         class-info="line.type === 'info'">
      <span class="console-time" bind="line.time"></span>
      <span class="console-msg" bind="line.message"></span>
    </div>
  </template>
</div>
