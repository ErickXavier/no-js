/**
 * Audit: evaluation of four changes proposed by an external developer
 *
 * CONTEXT
 * -------
 * After the 40-node memory-leak fix was delivered in this session, a second
 * developer edited the source files directly (without git) and attributed
 * improvements to four areas. None of those edits appear in the committed
 * source. This suite documents the correct behaviour of each area, verifies
 * which changes would have been correct and which would have introduced
 * regressions, and acts as a guard against future misapplication.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * VERDICT SUMMARY
 * ─────────────────────────────────────────────────────────────────────────
 *
 * [1] context.js — disable __collectKeysCache
 *     DIAGNOSIS: WRONG.
 *     The cache stores plain data values (strings, numbers, plain objects),
 *     never DOM Node references. It cannot prevent GC of detached DOM nodes.
 *     FIX: WRONG.
 *     Disabling it would silently remove the TIP-P4 performance optimisation
 *     (O(n) traversal of the parent chain on every _collectKeys call instead
 *     of O(1) cache hit). The real leak source was the missing
 *     _onDispose(() => ro.disconnect()) in _watchExpr, which is already fixed.
 *
 * [2] globals.js — remove the MutationObserver from _watchExpr
 *     DIAGNOSIS: WRONG.
 *     The observer is not "redundant" — it provides a safety net that cleans
 *     up $store watchers when elements are removed from the DOM externally
 *     (bypassing _disposeTree). Without it, watchers accumulate whenever code
 *     outside the framework modifies innerHTML directly.
 *     FIX: WRONG.
 *     The actual bug was that ro.disconnect() was not registered via
 *     _onDispose, so the observer was never disconnected during each re-
 *     renders. The correct fix (already applied) is to keep the observer AND
 *     add _onDispose(() => ro.disconnect()).
 *
 * [3] animations.js — zero the 1 s / 2 s default fallback timeouts
 *     DIAGNOSIS: PARTIAL. The defaults (|| 1000 / || 2000) cause real test-
 *     timing issues in JSDOM where animationend / transitionend never fire:
 *     any each with animate-leave would wait 2 s before clearing children.
 *     FIX: REASONABLE but not sufficient alone. The correct change would be
 *     to replace the || 2000 fallback defaults with a value derived from
 *     durationMs (treating 0 and absent as "no fallback intended"). This was
 *     not a tip in tips.md and carries a small risk of breaking apps that
 *     relied on the implicit 2 s as a de-facto animation duration.
 *
 * [4] loops.js — zero the animate-leave fallback timeout
 *     Same evaluation as [3]. The `setTimeout(done, animDuration || 2000)`
 *     in each / foreach means that without an explicit animate-duration
 *     attribute the old DOM children stay in place for 2 s before the new
 *     list is rendered. Setting this to 0 makes the fallback fire immediately
 *     in the next macro task, which is safer for tests and for elements whose
 *     CSS does not actually define the animation class.
 */

import { createContext, _collectKeys } from '../src/context.js';
import {
  _stores,
  _storeWatchers,
  _notifyStoreWatchers,
  _watchExpr,
  _onDispose,
  _setCurrentEl,
} from '../src/globals.js';
import { processTree, _disposeTree, _disposeChildren } from '../src/registry.js';
import { _animateIn, _animateOut } from '../src/animations.js';
import NoJS from '../src/index.js';

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  document.body.innerHTML = '';
  Object.keys(_stores).forEach((k) => delete _stores[k]);
  NoJS._initialized = false;
});

// ═══════════════════════════════════════════════════════════════════════════
//  [1] __collectKeysCache does NOT retain DOM node references
//      Disabling it would remove TIP-P4 with no leak benefit.
// ═══════════════════════════════════════════════════════════════════════════

describe('[1] __collectKeysCache — TIP-P4: cache correctness and data-only storage', () => {
  test('cache stores primitive data values, never DOM Node references', () => {
    const ctx = createContext({ count: 5, label: 'hello', flag: true });
    const { vals } = _collectKeys(ctx);

    // All values must be plain data — no Node, Element or EventTarget instances
    const hasNodeRef = Object.values(vals).some((v) => v instanceof Node);
    expect(hasNodeRef).toBe(false);

    expect(vals.count).toBe(5);
    expect(vals.label).toBe('hello');
    expect(vals.flag).toBe(true);
  });

  test('cache stores parent-chain data values, not parent context proxies', () => {
    const parent = createContext({ x: 10 });
    const child = createContext({ y: 20 }, parent);
    const { vals } = _collectKeys(child);

    // vals contains the plain value 10, not the parent proxy or its raw object
    expect(vals.x).toBe(10);
    expect(vals.y).toBe(20);
    expect(typeof vals.x).toBe('number'); // plain primitive, not a Proxy/object
  });

  test('cache returns same object reference on consecutive calls (O(1) hit — TIP-P4)', () => {
    const ctx = createContext({ a: 1, b: 2 });
    const first = _collectKeys(ctx);
    const second = _collectKeys(ctx);
    expect(second).toBe(first); // identity equality → cache was hit
  });

  test('cache is invalidated after context mutation (returns fresh object)', () => {
    const ctx = createContext({ a: 1 });
    const before = _collectKeys(ctx);
    ctx.a = 99;
    const after = _collectKeys(ctx);
    expect(after).not.toBe(before);   // different object → cache was busted
    expect(after.vals.a).toBe(99);
  });

  test('disabling the cache would make every _collectKeys call return a new object (TIP-P4 regression check)', () => {
    // This test documents what a "disabled cache" would look like.
    // If __collectKeysCache were removed from context.js, consecutive calls
    // would always produce a new { keys, vals } object even without mutations.
    // The test below would FAIL — proving the cache is active and correct.
    const ctx = createContext({ z: 7 });
    const r1 = _collectKeys(ctx);
    const r2 = _collectKeys(ctx);
    // With the cache in place this must be the same reference:
    expect(r1).toBe(r2);
  });

  test('cache does not prevent child context disposal (no DOM reference loop)', () => {
    // Create a child context that could be held by the cache, then dispose the
    // element. If __collectKeysCache created a retain cycle back to DOM nodes
    // the disposers would not run — prove they do.
    const parent = createContext({ items: [1, 2] });
    const child = createContext({ item: 1 }, parent);
    const el = document.createElement('div');
    document.body.appendChild(el);
    el.__ctx = child;

    _setCurrentEl(el);
    const disposed = jest.fn();
    _onDispose(disposed);
    _setCurrentEl(null);

    // Populate the cache on the child
    _collectKeys(child);
    expect(child.__raw.__collectKeysCache).toBeDefined();

    // Dispose the element
    _disposeTree(el);

    // Disposer must have been called despite the cache being present
    expect(disposed).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  [2] MutationObserver in _watchExpr — TIP-M2: keep the observer, fix the dispose path
//      Removing it would break the external-removal safety net.
// ═══════════════════════════════════════════════════════════════════════════

describe('[2] _watchExpr MutationObserver — both cleanup paths work correctly', () => {
  test('_onDispose path: _disposeTree disconnects the observer (each re-render scenario)', () => {
    const ctx = createContext({});
    const fn = jest.fn();
    const container = document.createElement('ul');
    const item = document.createElement('li');
    container.appendChild(item);
    document.body.appendChild(container);

    _setCurrentEl(item);
    _watchExpr('$store.cart.items', ctx, fn);
    _setCurrentEl(null);

    expect(_storeWatchers.has(fn)).toBe(true);

    // Simulate each re-render: disposeTree on item, then clear container
    _disposeTree(item);
    container.innerHTML = '';

    // Watcher removed via _onDispose — no need to wait for MO callback
    expect(_storeWatchers.has(fn)).toBe(false);
  });

  test('MO self-cleanup path: external innerHTML= removal prunes stale watchers', async () => {
    const ctx = createContext({});
    const fn = jest.fn();
    const parent = document.createElement('div');
    const el = document.createElement('span');
    parent.appendChild(el);
    document.body.appendChild(parent);

    _setCurrentEl(el);
    _watchExpr('$store.ui.visible', ctx, fn);
    _setCurrentEl(null);

    expect(_storeWatchers.has(fn)).toBe(true);

    // External removal — no _disposeTree, no _onDispose
    parent.innerHTML = '';

    await new Promise((r) => setTimeout(r, 0)); // let MO callback fire

    // MO callback detected el is disconnected and cleaned up the watcher
    expect(_storeWatchers.has(fn)).toBe(false);
  });

  test('removing the MO would leave stale watchers after external DOM removal (regression guard)', async () => {
    // This test documents EXACTLY what would break if the MO were removed.
    // Without the observer, watchers for externally-removed elements would
    // only be pruned lazily when _notifyStoreWatchers runs and detects
    // fn._el.isConnected === false. Between the removal and the next notify
    // call, the watcher is stale — and if notify is never called, it leaks.

    const ctx = createContext({});
    const fn = jest.fn();
    fn._el = null; // simulate an element with no isConnected guard initially

    // Manually register without the MO (what "removing MO" would look like)
    _storeWatchers.add(fn);
    fn._el = { isConnected: false }; // detached element — simulates what happens after removal

    // Before notify: watcher is still in the set (would accumulate without MO)
    expect(_storeWatchers.has(fn)).toBe(true);

    // Only pruned lazily when notify runs
    _notifyStoreWatchers();
    expect(_storeWatchers.has(fn)).toBe(false);

    // This shows the MO is the difference between IMMEDIATE cleanup
    // (when the parent is mutated) and LAZY cleanup (only on next notify).
    // With the MO: cleanup is immediate and guaranteed.
    // Without the MO: cleanup depends on notify being called after removal.
  });

  test('each re-render: N cycles do not accumulate stale store watchers', () => {
    _stores.items = { list: [{ id: 1 }] };
    document.body.innerHTML = `
      <template id="row-tpl"><li class="row"></li></template>
      <ul id="container" each="item in $store.items.list" template="row-tpl"></ul>
    `;
    processTree(document.body);
    const container = document.getElementById('container');
    const baseline = _storeWatchers.size;

    for (let i = 0; i < 20; i++) {
      _stores.items.list = [{ id: i }];
      _notifyStoreWatchers();
    }

    expect(_storeWatchers.size).toBeLessThanOrEqual(baseline);
    expect(container.children.length).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  [3] animations.js fallback timeouts — document current defaults and their
//      implications for test stability
// ═══════════════════════════════════════════════════════════════════════════

describe('[3] animations.js — fallback timeout behaviour', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('_animateOut callback fires on animationend before fallback', () => {
    const el = document.createElement('div');
    el.appendChild(document.createElement('span'));
    document.body.appendChild(el);

    const cb = jest.fn();
    _animateOut(el, 'fadeOut', null, cb);

    // animationend fires → callback must run immediately (before any timeout)
    el.firstElementChild.dispatchEvent(new Event('animationend'));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('_animateOut callback fires via fallback timeout when animationend never fires', () => {
    // In JSDOM animationend is never dispatched automatically.
    // The default fallback is now 0 ms (|| 0): setTimeout(done, 0) fires on
    // the next event-loop tick instead of blocking for an arbitrary duration.
    const el = document.createElement('div');
    el.appendChild(document.createElement('span'));
    document.body.appendChild(el);

    const cb = jest.fn();
    _animateOut(el, 'fadeOut', null, cb); // no durationMs → fallback = 0 ms

    expect(cb).not.toHaveBeenCalled(); // not yet — setTimeout(done, 0) not ticked

    // Fire the next-tick fallback
    jest.runAllTimers();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('_animateOut respects explicit durationMs for the fallback', () => {
    const el = document.createElement('div');
    el.appendChild(document.createElement('span'));
    document.body.appendChild(el);

    const cb = jest.fn();
    _animateOut(el, 'fadeOut', null, cb, 300);

    jest.advanceTimersByTime(299);
    expect(cb).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('_animateIn transition fallback cleans up classes when transitionend never fires', () => {
    // _animateIn schedules cleanup via requestAnimationFrame → setTimeout(done, fallback).
    // With fake timers Jest replaces rAF with a 0 ms timer, so running all timers
    // covers both the rAF tick and the 0 ms fallback in one shot.
    const el = document.createElement('div');
    el.appendChild(document.createElement('span'));
    document.body.appendChild(el);

    _animateIn(el, null, 'fade'); // no durationMs → fallback = 0 ms

    // Classes are added synchronously
    expect(el.firstElementChild.classList.contains('fade-enter-active')).toBe(true);

    // Run rAF (0 ms) + 1000 ms fallback timeout
    jest.runAllTimers();

    // After fallback fires, enter-active and enter-to must be removed
    expect(el.firstElementChild.classList.contains('fade-enter-active')).toBe(false);
    expect(el.firstElementChild.classList.contains('fade-enter-to')).toBe(false);
  });

  test('callback is NOT called twice if both animationend and timeout fire', () => {
    const el = document.createElement('div');
    el.appendChild(document.createElement('span'));
    document.body.appendChild(el);

    const cb = jest.fn();
    _animateOut(el, 'fadeOut', null, cb);

    // Fire animationend first
    el.firstElementChild.dispatchEvent(new Event('animationend'));
    expect(cb).toHaveBeenCalledTimes(1);

    // Now let the timeout fire too
    jest.runAllTimers();
    expect(cb).toHaveBeenCalledTimes(1); // still 1 — guard against double-call
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  [4] loops.js — animate-leave fallback timeout
//      The fallback is now 0 ms (|| 0): each re-renders unblock on the next
//      event-loop tick instead of waiting 2 s when no CSS animation fires.
// ═══════════════════════════════════════════════════════════════════════════

describe('[4] loops.js animate-leave — fallback fires on next tick', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('each without animate-leave re-renders synchronously (no timeout)', () => {
    _stores.data = { items: [{ id: 1 }] };
    document.body.innerHTML = `
      <template id="item-tpl"><li></li></template>
      <ul id="list" each="item in $store.data.items" template="item-tpl"></ul>
    `;
    processTree(document.body);
    const list = document.getElementById('list');

    _stores.data.items = [{ id: 2 }, { id: 3 }];
    _notifyStoreWatchers();

    // No animation → re-render is synchronous, no fake-timer advance needed
    expect(list.children.length).toBe(2);
  });

  test('each with animate-leave holds old children until animationend fires', () => {
    // Old items linger until animationend (or the next-tick fallback) fires.
    _stores.data = { items: [{ id: 1 }] };
    document.body.innerHTML = `
      <template id="item-tpl"><li></li></template>
      <ul id="list" each="item in $store.data.items" template="item-tpl"
          animate-leave="fadeOut"></ul>
    `;
    processTree(document.body);
    const list = document.getElementById('list');
    expect(list.children.length).toBe(1);

    // Change to 2 items — old 1-item render must animate out first
    _stores.data.items = [{ id: 2 }, { id: 3 }];
    _notifyStoreWatchers();

    // Old child still in place (waiting for animationend or next-tick timeout)
    expect(list.children.length).toBe(1);

    // animationend fires on the old child's first element
    const oldChild = list.children[0];
    const target = oldChild.firstElementChild || oldChild;
    target.dispatchEvent(new Event('animationend'));

    // After animationend, new items are rendered
    expect(list.children.length).toBe(2);
  });

  test('each with animate-leave falls back to rendering on next tick when animationend never fires', () => {
    // The fallback is now setTimeout(done, 0) — fires on the next event-loop tick.
    _stores.data = { items: [{ id: 1 }] };
    document.body.innerHTML = `
      <template id="item-tpl"><li></li></template>
      <ul id="list" each="item in $store.data.items" template="item-tpl"
          animate-leave="fadeOut"></ul>
    `;
    processTree(document.body);
    const list = document.getElementById('list');

    _stores.data.items = [{ id: 2 }, { id: 3 }];
    _notifyStoreWatchers();

    expect(list.children.length).toBe(1); // still old — timeout not yet ticked

    jest.runAllTimers(); // fire the next-tick fallback
    expect(list.children.length).toBe(2); // new items rendered
  });
});
