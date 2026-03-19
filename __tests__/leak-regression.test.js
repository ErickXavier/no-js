/**
 * Leak Regression Tests — No.JS each / on:* / get / store watchers
 *
 * These tests mirror the memory-leak regression suite run as Playwright CDP
 * tests in the consumer project. Since JSDOM does not provide CDP metrics
 * (m.Nodes, m.JSEventListeners), each test asserts the observable state that
 * the CDP metric would reflect:
 *
 *   - el.children.length   → equivalent to DOM node count growth
 *   - _storeWatchers.size  → equivalent to JS event listener accumulation
 *   - listener Set sizes   → internal watcher bookkeeping
 *
 * Analysis of the three candidate issues raised alongside the 40-node leak:
 *
 * [A] __collectKeysCache retaining references:
 *     The cache (ctx.__raw.__collectKeysCache) stores plain data values from
 *     Object.keys(raw), never DOM node references. Child contexts live on
 *     their own raw objects. When _disposeChildren + innerHTML="" runs,
 *     nothing in __collectKeysCache prevents GC of detached wrappers.
 *     NOT a DOM node leak source.
 *
 * [B] Incomplete disposers / redundant MutationObservers:
 *     This was the real bug: _watchExpr created a MutationObserver for
 *     $store expressions but did not register ro.disconnect() via _onDispose.
 *     When _disposeChildren ran during each re-renders, the observer remained
 *     active and held el.parentElement (item wrapper) alive as a detached node.
 *     FIXED: _onDispose(() => ro.disconnect()) was added to _watchExpr.
 *     Multiple $store bindings on the same element create multiple observers —
 *     redundant but not dangerous since all are now disposed correctly.
 *
 * [C] Animation delays creating zombie nodes:
 *     When animate-leave is set on an each, old item wrappers stay in the DOM
 *     until animationend fires or the animDuration fallback timeout expires
 *     (default 2 s). In JSDOM, animationend never fires, so tests using fake
 *     timers would need to advance the clock. In the external project's tests
 *     no animation attributes are used, so this path is never taken and does
 *     not contribute to the 40-node leak. A TEST TIMING concern, not a
 *     production memory leak.
 */

import NoJS from '../src/index.js';
import { _stores, _storeWatchers, _notifyStoreWatchers } from '../src/globals.js';
import { processTree, _disposeTree, _disposeChildren } from '../src/registry.js';

// ─── Setup / Teardown ───────────────────────────────────────────────────────

function clearStores() {
  Object.keys(_stores).forEach((k) => delete _stores[k]);
}

beforeEach(() => {
  document.body.innerHTML = '';
  clearStores();
  NoJS._initialized = false;
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildEachWithStore(items) {
  _stores.list = { items };
  document.body.innerHTML = `
    <template id="row-tpl">
      <li class="row"></li>
    </template>
    <ul id="container" each="item in $store.list.items" template="row-tpl"></ul>
  `;
  processTree(document.body);
}

function buildEachWithEvents(items) {
  _stores.list = { items };
  document.body.innerHTML = `
    <template id="row-tpl">
      <li class="row" on:click="clicked = true"></li>
    </template>
    <ul id="container" each="item in $store.list.items" template="row-tpl"></ul>
  `;
  processTree(document.body);
}

// ─── T1: each baseline recovery ─────────────────────────────────────────────
// CDP equivalent: nodesDrift after clear < 80.
// Mirrors: [T1] "each — limpar carrinho deve liberar nós".

describe('[T1] each — clearing the list releases all child wrappers', () => {
  test('children.length drops to zero after store list is emptied', () => {
    buildEachWithStore([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]);
    const container = document.getElementById('container');
    expect(container.children.length).toBe(5);

    _stores.list.items = [];
    _notifyStoreWatchers();

    expect(container.children.length).toBe(0);
  });

  test('disposed child wrappers have no remaining disposers', () => {
    buildEachWithStore([{ id: 1 }, { id: 2 }]);
    const container = document.getElementById('container');
    const wrappers = [...container.children];

    _stores.list.items = [];
    _notifyStoreWatchers();

    // _disposeChildren ran: all wrapper disposers must have been called
    wrappers.forEach((w) => {
      // _disposeElement nulls __disposers after running them
      expect(w.__disposers == null).toBe(true);
    });
  });
});

// ─── T2: on:* handler accumulation ──────────────────────────────────────────
// CDP equivalent: listenersDrift after 30 add/remove cycles < 50.
// Mirrors: [T2] "on:* — ciclos add/remove não devem acumular listeners".

describe('[T2] on:* — add/remove cycles do not accumulate child wrappers', () => {
  test('30 add→remove cycles leave zero children in the container', () => {
    const CYCLES = 30;
    const item = { id: 1 };

    buildEachWithEvents([]);
    const container = document.getElementById('container');

    for (let i = 0; i < CYCLES; i++) {
      _stores.list.items = [item];
      _notifyStoreWatchers();
      expect(container.children.length).toBe(1);

      _stores.list.items = [];
      _notifyStoreWatchers();
      expect(container.children.length).toBe(0);
    }
  });

  test('_storeWatchers size is stable across 30 add/remove cycles', () => {
    const item = { id: 1 };
    buildEachWithEvents([]);

    // Baseline after initial processTree (each's own watcher is registered)
    const baseline = _storeWatchers.size;

    for (let i = 0; i < 30; i++) {
      _stores.list.items = [item];
      _notifyStoreWatchers();
      _stores.list.items = [];
      _notifyStoreWatchers();
    }

    // Watcher set must not grow compared to baseline
    expect(_storeWatchers.size).toBeLessThanOrEqual(baseline);
  });
});

// ─── T3: re-renders with same list size do not accumulate ───────────────────
// CDP equivalent: nodeDiff < 60 after 40 re-renders of a 1-item list.
// Mirrors: [T3] "on:* — incrementos de quantidade não devem acumular listeners".

describe('[T3] each — N re-renders with same list size do not accumulate', () => {
  test('40 new-array-ref re-renders of a 1-item list keep children.length === 1', () => {
    const RENDERS = 40;
    buildEachWithStore([{ id: 1 }]);
    const container = document.getElementById('container');

    for (let i = 0; i < RENDERS; i++) {
      // New array reference every time (same as cart.updateQty pattern)
      _stores.list.items = [{ id: 1 }];
      _notifyStoreWatchers();
    }

    expect(container.children.length).toBe(1);
  });

  test('_storeWatchers size does not grow across 40 re-renders', () => {
    const RENDERS = 40;
    buildEachWithStore([{ id: 1 }]);

    const baseline = _storeWatchers.size;

    for (let i = 0; i < RENDERS; i++) {
      _stores.list.items = [{ id: 1 }];
      _notifyStoreWatchers();
    }

    expect(_storeWatchers.size).toBeLessThanOrEqual(baseline);
  });
});

// ─── T4: get directive calls _disposeChildren before innerHTML="" ────────────
// CDP equivalent: nodeRange < 100 across 5 page loads with same response.
// Mirrors: [T2b] "get — reloads com mesmo conteúdo devem ter nodes estáveis".
//
// Verified by reading http.js: every branch that assigns innerHTML="":
//   loading, empty, success, error, and restore — all call _disposeChildren(el)
// first. This is a static assertion; no runtime test is needed beyond confirming
// the call order in the current source.

describe('[T4] get directive — _disposeChildren precedes innerHTML="" in all branches', () => {
  test('loading, success, empty, error and restore branches all dispose before clearing', () => {
    // Read the source and confirm the pattern statically.
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(__dirname, '../src/directives/http.js'),
      'utf8',
    );

    // Extract every pair of consecutive statements involving innerHTML
    // and verify _disposeChildren always appears before el.innerHTML = ""
    const disposePositions = [...src.matchAll(/_disposeChildren\(el\)/g)].map((m) => m.index);
    const clearPositions   = [...src.matchAll(/el\.innerHTML\s*=\s*""/g)].map((m) => m.index);

    expect(disposePositions.length).toBeGreaterThan(0);
    expect(clearPositions.length).toBe(disposePositions.length);

    // Every innerHTML="" must be preceded by a _disposeChildren(el)
    clearPositions.forEach((clearPos, i) => {
      expect(disposePositions[i]).toBeLessThan(clearPos);
    });
  });
});

// ─── T5: children proportional to state, not to operation count ─────────────
// CDP equivalent: delta20 - delta5 < 150 (plateau behaviour).
// Mirrors: [T5] "crescimento de nodes deve ser proporcional ao estado final".

describe('[T5] each — DOM children track list length, not re-render count', () => {
  test('children.length equals list.length regardless of prior re-render count', () => {
    buildEachWithStore([]);
    const container = document.getElementById('container');

    // Phase 1: grow to 5 items across 5 re-renders
    for (let i = 1; i <= 5; i++) {
      _stores.list.items = Array.from({ length: i }, (_, j) => ({ id: j }));
      _notifyStoreWatchers();
    }
    expect(container.children.length).toBe(5);

    // Phase 2: 10 more re-renders with the same 5-item list (new refs)
    for (let i = 0; i < 10; i++) {
      _stores.list.items = Array.from({ length: 5 }, (_, j) => ({ id: j }));
      _notifyStoreWatchers();
    }
    expect(container.children.length).toBe(5);

    // Phase 3: shrink to 3
    _stores.list.items = [{ id: 0 }, { id: 1 }, { id: 2 }];
    _notifyStoreWatchers();
    expect(container.children.length).toBe(3);

    // Phase 4: clear
    _stores.list.items = [];
    _notifyStoreWatchers();
    expect(container.children.length).toBe(0);
  });
});

// ─── T6: full session cycle — no cumulative leak ────────────────────────────
// CDP equivalent: cumulativeDrift (cycle1→cycle5) < 200.
// Mirrors: [T6] "ciclo completo — sessão de compra não deve vazar memória".

describe('[T6] full cycle — repeated add/clear sessions do not accumulate', () => {
  test('5 fill→clear cycles leave _storeWatchers at baseline', () => {
    buildEachWithStore([]);
    const baseline = _storeWatchers.size;
    const container = document.getElementById('container');

    const CYCLES = 5;
    for (let cycle = 0; cycle < CYCLES; cycle++) {
      // Fill with 5 items
      _stores.list.items = Array.from({ length: 5 }, (_, i) => ({ id: i }));
      _notifyStoreWatchers();
      expect(container.children.length).toBe(5);

      // Clear
      _stores.list.items = [];
      _notifyStoreWatchers();
      expect(container.children.length).toBe(0);
    }

    // Store watcher count must not have grown cumulatively
    expect(_storeWatchers.size).toBeLessThanOrEqual(baseline);
  });

  test('5 fill→clear cycles leave zero detached wrapper children', () => {
    buildEachWithStore([]);
    const container = document.getElementById('container');

    for (let cycle = 0; cycle < 5; cycle++) {
      _stores.list.items = Array.from({ length: 5 }, (_, i) => ({ id: i }));
      _notifyStoreWatchers();
      _stores.list.items = [];
      _notifyStoreWatchers();
    }

    expect(container.children.length).toBe(0);
    expect(container.innerHTML.trim()).toBe('');
  });

  test('MutationObserver for $store watcher is disconnected by _disposeTree (regression: 40-node leak)', () => {
    // This test covers the exact pattern that caused the 40-node leak:
    // - item wrapper has a child element with a $store expression
    // - _disposeChildren disposes the child → _onDispose fires ro.disconnect()
    // - container.innerHTML = "" frees the wrapper from the DOM
    // - GC can collect the wrapper because no observer holds it alive

    _stores.list = { items: [{ id: 1 }] };
    document.body.innerHTML = `
      <template id="bind-tpl">
        <span bind-attr-data-count="$store.list.items.length"></span>
      </template>
      <ul id="container" each="item in $store.list.items" template="bind-tpl"></ul>
    `;
    processTree(document.body);

    const container = document.getElementById('container');
    expect(container.children.length).toBe(1);

    const wrapper = container.children[0];
    const span = wrapper.querySelector('span');

    // span should have a disposer for the MutationObserver registered by _watchExpr
    const disposersBefore = span ? (span.__disposers || []).length : 0;
    expect(disposersBefore).toBeGreaterThan(0);

    // Simulate each re-render: dispose children then clear
    _disposeChildren(container);
    container.innerHTML = '';

    // After disposal, the wrapper is no longer a child
    expect(container.children.length).toBe(0);

    // _disposeElement nulls out __disposers after running them
    if (span) {
      expect(span.__disposers).toBeNull();
    }
  });
});
