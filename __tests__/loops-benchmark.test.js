// ═══════════════════════════════════════════════════════════════════════════
// loops.js — key reconciliation vs full-rebuild benchmark
//
// Measures DOM node creation count, execution time, and heap allocation for
// push / sort / splice / in-place-update operations across list sizes.
// Prints a formatted report via console.table at the end of each describe block.
// ═══════════════════════════════════════════════════════════════════════════

import { _stores } from '../src/globals.js';
import { createContext } from '../src/context.js';
import { processTree, _disposeChildren } from '../src/registry.js';

import '../src/filters.js';
import '../src/directives/state.js';
import '../src/directives/binding.js';
import '../src/directives/conditionals.js';
import '../src/directives/loops.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeItems(n, offset = 0) {
  return Array.from({ length: n }, (_, i) => ({ id: offset + i + 1, name: `item-${offset + i + 1}` }));
}

function setupDOM(items, keyed) {
  document.body.innerHTML = '';
  Object.keys(_stores).forEach((k) => delete _stores[k]);

  const tpl = document.createElement('template');
  tpl.id = 'bench-tpl';
  tpl.innerHTML = '<span class="row"></span>';
  document.body.appendChild(tpl);

  const state = document.createElement('div');
  state.setAttribute('state', JSON.stringify({ items }));
  document.body.appendChild(state);

  const list = document.createElement('div');
  list.setAttribute('each', 'item in items');
  list.setAttribute('template', 'bench-tpl');
  if (keyed) list.setAttribute('key', 'item.id');
  state.appendChild(list);

  processTree(state);
  return { state, list, ctx: state.__ctx };
}

/** Count createElement and cloneNode calls during a mutation. */
function measureDOMOps(fn) {
  let creates = 0;
  let clones = 0;
  let removes = 0;

  const origCreate = document.createElement.bind(document);
  const origClone = Element.prototype.cloneNode;
  const origRemove = Element.prototype.remove;

  document.createElement = (...a) => { creates++; return origCreate(...a); };
  Element.prototype.cloneNode = function (...a) { clones++; return origClone.call(this, ...a); };
  Element.prototype.remove = function (...a) { removes++; return origRemove.call(this, ...a); };

  fn();

  document.createElement = origCreate;
  Element.prototype.cloneNode = origClone;
  Element.prototype.remove = origRemove;

  return { creates, clones, removes };
}

/** Run fn RUNS times and return average wall-clock ms + heap delta. */
function benchmark(fn, runs = 5) {
  const times = [];
  const heaps = [];

  for (let r = 0; r < runs; r++) {
    const h0 = process.memoryUsage().heapUsed;
    const t0 = performance.now();
    fn();
    const t1 = performance.now();
    const h1 = process.memoryUsage().heapUsed;
    times.push(t1 - t0);
    heaps.push(h1 - h0);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / runs;
  const avgHeap = heaps.reduce((a, b) => a + b, 0) / runs;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return { avgTime, minTime, maxTime, avgHeap };
}

/** Format bytes → KB with 1 decimal. */
function kb(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}

/** Format ms with 3 decimals. */
function ms(v) {
  return v.toFixed(3) + ' ms';
}

// ─── Scenarios ───────────────────────────────────────────────────────────────

const SIZES = [5, 20, 100, 500];
const RUNS = 8;

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 1 — push one item
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: push one item onto an existing list', () => {
  const results = [];

  afterAll(() => {
    console.log('\n── push(1) benchmark ─────────────────────────────────────');
    console.table(results);
  });

  for (const size of SIZES) {
    for (const keyed of [false, true]) {
      const label = keyed ? 'keyed' : 'full';

      test(`[${label}] list size=${size}`, () => {
        // Warm-up: initial render outside measurement
        const { ctx, list } = setupDOM(makeItems(size), keyed);
        const extra = { id: size + 1, name: `item-${size + 1}` };

        const domOps = measureDOMOps(() => {
          ctx.items = [...ctx.items, extra];
        });

        // Reset and measure timing + heap over multiple runs
        const { avgTime, minTime, maxTime, avgHeap } = benchmark(() => {
          const { ctx: c } = setupDOM(makeItems(size), keyed);
          c.items = [...c.items, { id: size + 1, name: `item-${size + 1}` }];
        }, RUNS);

        results.push({
          strategy: label,
          listSize: size,
          'avgTime': ms(avgTime),
          'minTime': ms(minTime),
          'maxTime': ms(maxTime),
          'heapDelta': kb(avgHeap),
          'createElement': domOps.creates,
          'cloneNode': domOps.clones,
          'remove': domOps.removes,
        });

        // Correctness: list grew by 1
        expect(list.children.length).toBe(size + 1);
      });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 2 — sort (reverse)
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: sort/reverse entire list', () => {
  const results = [];

  afterAll(() => {
    console.log('\n── sort/reverse benchmark ────────────────────────────────');
    console.table(results);
  });

  for (const size of SIZES) {
    for (const keyed of [false, true]) {
      const label = keyed ? 'keyed' : 'full';

      test(`[${label}] list size=${size}`, () => {
        const { ctx, list } = setupDOM(makeItems(size), keyed);

        const domOps = measureDOMOps(() => {
          ctx.items = [...ctx.items].reverse();
        });

        const { avgTime, minTime, maxTime, avgHeap } = benchmark(() => {
          const { ctx: c } = setupDOM(makeItems(size), keyed);
          c.items = [...c.items].reverse();
        }, RUNS);

        results.push({
          strategy: label,
          listSize: size,
          'avgTime': ms(avgTime),
          'minTime': ms(minTime),
          'maxTime': ms(maxTime),
          'heapDelta': kb(avgHeap),
          'createElement': domOps.creates,
          'cloneNode': domOps.clones,
          'remove': domOps.removes,
        });

        expect(list.children.length).toBe(size);
      });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 3 — splice (remove one from middle, add one)
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: splice — remove 1 from middle, insert 1 new', () => {
  const results = [];

  afterAll(() => {
    console.log('\n── splice(mid, 1, newItem) benchmark ─────────────────────');
    console.table(results);
  });

  for (const size of SIZES) {
    for (const keyed of [false, true]) {
      const label = keyed ? 'keyed' : 'full';

      test(`[${label}] list size=${size}`, () => {
        const { ctx, list } = setupDOM(makeItems(size), keyed);
        const mid = Math.floor(size / 2);
        const newItem = { id: size + 99, name: 'spliced' };

        const domOps = measureDOMOps(() => {
          const next = [...ctx.items];
          next.splice(mid, 1, newItem);
          ctx.items = next;
        });

        const { avgTime, minTime, maxTime, avgHeap } = benchmark(() => {
          const { ctx: c } = setupDOM(makeItems(size), keyed);
          const next = [...c.items];
          next.splice(mid, 1, newItem);
          c.items = next;
        }, RUNS);

        results.push({
          strategy: label,
          listSize: size,
          'avgTime': ms(avgTime),
          'minTime': ms(minTime),
          'maxTime': ms(maxTime),
          'heapDelta': kb(avgHeap),
          'createElement': domOps.creates,
          'cloneNode': domOps.clones,
          'remove': domOps.removes,
        });

        expect(list.children.length).toBe(size);
      });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 4 — in-place property update (same keys, different values)
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: in-place update — same keys, new name values', () => {
  const results = [];

  afterAll(() => {
    console.log('\n── in-place update benchmark ─────────────────────────────');
    console.table(results);
  });

  for (const size of SIZES) {
    for (const keyed of [false, true]) {
      const label = keyed ? 'keyed' : 'full';

      test(`[${label}] list size=${size}`, () => {
        const { ctx, list } = setupDOM(makeItems(size), keyed);

        const domOps = measureDOMOps(() => {
          ctx.items = ctx.items.map((it) => ({ ...it, name: it.name + '-updated' }));
        });

        const { avgTime, minTime, maxTime, avgHeap } = benchmark(() => {
          const { ctx: c } = setupDOM(makeItems(size), keyed);
          c.items = c.items.map((it) => ({ ...it, name: it.name + '-updated' }));
        }, RUNS);

        results.push({
          strategy: label,
          listSize: size,
          'avgTime': ms(avgTime),
          'minTime': ms(minTime),
          'maxTime': ms(maxTime),
          'heapDelta': kb(avgHeap),
          'createElement': domOps.creates,
          'cloneNode': domOps.clones,
          'remove': domOps.removes,
        });

        expect(list.children.length).toBe(size);
      });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 5 — replace entire list (worst case for keyed)
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: full replacement — all new items (worst case for keyed)', () => {
  const results = [];

  afterAll(() => {
    console.log('\n── full replacement benchmark ────────────────────────────');
    console.table(results);
  });

  for (const size of SIZES) {
    for (const keyed of [false, true]) {
      const label = keyed ? 'keyed' : 'full';

      test(`[${label}] list size=${size}`, () => {
        const { ctx, list } = setupDOM(makeItems(size), keyed);

        const domOps = measureDOMOps(() => {
          ctx.items = makeItems(size, size * 10); // all-new IDs
        });

        const { avgTime, minTime, maxTime, avgHeap } = benchmark(() => {
          const { ctx: c } = setupDOM(makeItems(size), keyed);
          c.items = makeItems(size, size * 10);
        }, RUNS);

        results.push({
          strategy: label,
          listSize: size,
          'avgTime': ms(avgTime),
          'minTime': ms(minTime),
          'maxTime': ms(maxTime),
          'heapDelta': kb(avgHeap),
          'createElement': domOps.creates,
          'cloneNode': domOps.clones,
          'remove': domOps.removes,
        });

        expect(list.children.length).toBe(size);
      });
    }
  }
});
