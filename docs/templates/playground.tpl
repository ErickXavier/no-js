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
<style>
/* ═══════════════════════════════════════════════════════════
   PLAYGROUND
   ═══════════════════════════════════════════════════════════ */

/* --- Tokens --- */
:root {
  --pg-bg:          #0F172A;
  --pg-sidebar:     #1E293B;
  --pg-border:      #334155;
  --pg-active:      #0EA5E9;
  --pg-line-num:    #475569;
  --pg-console:     #0B1120;
  --pg-tab:         #1E293B;
  --pg-tab-active:  #0F172A;
  --pg-toolbar:     #F8FAFC;
  --pg-toolbar-border: #E2E8F0;
  --pg-text:        #E2E8F0;
  --pg-text-dim:    #94A3B8;
  --pg-success:     #22C55E;
  --pg-warn:        #EAB308;
  --pg-error:       #EF4444;
}

/* --- Layout --- */
.playground-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
  overflow: hidden;
}

.playground-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: var(--pg-toolbar);
  border-bottom: 1px solid var(--pg-toolbar-border);
  gap: 12px;
}

.playground-main {
  display: grid;
  grid-template-columns: 1fr 4px 1fr;
  flex: 1;
  overflow: hidden;
}

/* --- Toolbar --- */
.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  transition: all 0.15s;
  color: inherit;
  font-family: inherit;
}
.toolbar-btn:hover { background: var(--surface); }
.toolbar-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.toolbar-btn i { font-size: 14px; }



/* --- Editor --- */
.playground-editor {
  display: flex;
  flex-direction: column;
  background: var(--pg-bg);
  overflow: hidden;
}
.editor-tab-bar {
  display: flex;
  height: 36px;
  background: var(--pg-tab);
  border-bottom: 1px solid var(--pg-border);
  overflow-x: auto;
  scrollbar-width: none;
}
.editor-tab-bar::-webkit-scrollbar { display: none; }
.editor-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--pg-text-dim);
  border-right: 1px solid var(--pg-border);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.editor-tab:hover {
  background: rgba(255,255,255,0.03);
  color: var(--pg-text);
}
.editor-tab.active {
  background: var(--pg-tab-active);
  color: var(--pg-text);
  border-bottom: 2px solid var(--pg-active);
}
.editor-tab.active .tab-icon { color: var(--pg-active); }
.tab-icon { font-size: 10px; flex-shrink: 0; font-family: var(--font-mono); font-weight: 600; opacity: 0.7; }
.tab-name { pointer-events: none; }
.tab-close {
  font-size: 10px;
  padding: 2px;
  border-radius: 3px;
  color: var(--pg-line-num);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
}
.editor-tab:hover .tab-close,
.editor-tab.active .tab-close { opacity: 1; }
.tab-close:hover {
  background: rgba(255,255,255,0.1);
  color: var(--pg-text);
}
.tab-bar-spacer {
  flex: 1;
  background: var(--pg-tab);
}
.tab-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  font-size: 16px;
  color: var(--pg-text-dim);
  background: var(--pg-tab);
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.tab-add-btn:hover { color: var(--pg-text); background: rgba(255,255,255,0.05); }

.editor-body {
  position: relative;
  flex: 1;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}
.line-numbers {
  position: absolute;
  left: 0;
  top: 0;
  width: 48px;
  padding: 12px 8px 12px 0;
  text-align: right;
  color: var(--pg-line-num);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
  user-select: none;
  pointer-events: none;
}
.code-editor {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  font: inherit;
  line-height: inherit;
}
.code-editable {
  display: block;
  padding: 12px 16px 12px 56px;
  min-height: 100%;
  background: transparent;
  color: var(--pg-text);
  border: none;
  outline: none;
  font: inherit;
  line-height: inherit;
  tab-size: 2;
  white-space: pre;
  overflow: auto;
  caret-color: var(--pg-active);
  word-wrap: normal;
  overflow-wrap: normal;
}

/* Syntax highlight classes */
.code-editable .hl-tag  { color: #7DD3FC; }
.code-editable .hl-attr { color: #C084FC; }
.code-editable .hl-str  { color: #86EFAC; }
.code-editable .hl-cmt  { color: #64748B; font-style: italic; }
.code-editable .hl-kw   { color: #F472B6; }
.code-editable .hl-fn   { color: #FCD34D; }
.code-editable .hl-op   { color: #94A3B8; }
.code-editable .hl-num  { color: #FB923C; }

/* --- Splitter --- */
.playground-splitter {
  background: var(--pg-border);
  cursor: col-resize;
  transition: background 0.15s;
}
.playground-splitter:hover,
.playground-splitter.dragging {
  background: var(--pg-active);
}

/* --- Preview --- */
.playground-preview {
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
}
.preview-iframe {
  flex: 1;
  border: none;
  width: 100%;
  background: white;
}
.preview-tab-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  background: #F8FAFC;
  font-size: 12px;
  font-weight: 600;
  color: #1E293B;
  border-bottom: 1px solid var(--pg-toolbar-border);
}
.preview-tab-spacer { flex: 1; }
.preview-action {
  color: #94A3B8;
  cursor: pointer;
  font-size: 14px;
  background: none;
  border: none;
  padding: 2px;
  transition: color 0.15s;
}
.preview-action:hover { color: var(--pg-active); }

/* --- Console Splitter --- */
.console-splitter {
  height: 4px;
  background: #E2E8F0;
  cursor: row-resize;
  flex-shrink: 0;
}

/* --- Console --- */
.playground-console {
  background: var(--pg-console);
  height: 160px;
  display: flex;
  flex-direction: column;
}
.console-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--pg-text-dim);
  border-bottom: 1px solid var(--pg-border);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.console-title-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.console-actions { display: flex; gap: 8px; }
.console-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  font-size: 12px;
  color: var(--pg-text-dim);
  background: transparent;
  border: 1px solid var(--pg-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}
.console-btn:hover { color: var(--pg-text); background: rgba(255,255,255,0.05); }

.console-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  font-family: var(--font-mono);
  font-size: 12px;
}
.console-line {
  display: flex;
  gap: 8px;
  padding: 3px 12px;
  color: var(--pg-text-dim);
  border-bottom: 1px solid rgba(51,65,85,0.3);
}
.console-line.warn  { color: var(--pg-warn); }
.console-line.error { color: var(--pg-error); }
.console-line.info  { color: var(--pg-active); }
.console-time { flex-shrink: 0; opacity: 0.5; }
.console-msg  { white-space: pre-wrap; word-break: break-word; }

/* --- Dialog (replaces native alert / confirm / prompt) --- */
.pg-dialog {
  border: none;
  border-radius: 12px;
  padding: 0;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(400px, 90vw);
  max-height: 85vh;
  background: #1E293B;
  color: #E2E8F0;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  font-family: system-ui, -apple-system, sans-serif;
}
.pg-dialog::backdrop {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(2px);
}
.pg-dialog-header {
  padding: 16px 20px 0;
}
.pg-dialog-title {
  font-size: 16px;
  font-weight: 700;
}
.pg-dialog-msg {
  padding: 10px 20px 4px;
  font-size: 13px;
  line-height: 1.5;
  color: #94A3B8;
}
.pg-dialog-input {
  display: block;
  width: calc(100% - 40px);
  margin: 8px 20px 0;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #0F172A;
  color: #E2E8F0;
  font-size: 13px;
  font-family: var(--font-mono);
  outline: none;
  transition: border-color 0.15s;
}
.pg-dialog-input:focus {
  border-color: #0EA5E9;
}
.pg-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
}
.pg-dialog-actions button {
  padding: 6px 16px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.pg-dialog-ok {
  background: #0EA5E9;
  color: white;
}
.pg-dialog-ok:hover {
  background: #0284C7;
}
.pg-dialog-cancel {
  background: #334155;
  color: #CBD5E1;
}
.pg-dialog-cancel:hover {
  background: #475569;
}
.pg-dialog--success .pg-dialog-ok {
  background: #22C55E;
}
.pg-dialog--success .pg-dialog-ok:hover {
  background: #16A34A;
}
.pg-dialog--error .pg-dialog-ok {
  background: #EF4444;
}
.pg-dialog--error .pg-dialog-ok:hover {
  background: #DC2626;
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .playground-main {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
  .playground-editor { min-height: 250px; }
  .playground-splitter { display: none; }
  .playground-preview { min-height: 250px; }
}
</style>

  <!-- ═══ Toolbar ═══ -->
  <div class="playground-toolbar">
    <div class="toolbar-left">
      <button class="toolbar-btn" on:click="resetProject()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        <span t="playground.toolbar.reset"></span>
      </button>
    </div>
    <div class="toolbar-right">
      <button class="toolbar-btn" on:click="sharePlayground()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        <span t="playground.toolbar.share"></span>
      </button>
      <button class="toolbar-btn" on:click="downloadProject()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span t="playground.toolbar.download"></span>
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
        <span t="playground.preview.label"></span>
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
            <span t="playground.console.title"></span>
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
      <button class="pg-dialog-cancel" t="playground.dialog.cancel"></button>
      <button class="pg-dialog-ok" t="playground.dialog.ok"></button>
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
