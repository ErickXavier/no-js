// ═══════════════════════════════════════════════════════════════════════════
// init — processTree timing benchmark
//
// Measures the cost of walking and processing a DOM tree with various
// directive combinations. Uses jsdom (same as the test suite).
//
// DOM sizes: 10, 50, 200 elements with different directive densities:
//   1. state-only:   each element has `state`
//   2. state + bind: `state` parent + `bind-textContent` children
//   3. mixed:        state, bind, if, each (realistic page)
//   4. heavy:        state, bind, if, each, class-*, style-*, on:click
//
// Reports: mean, median, p95, min, max, heap delta per configuration.
// ═══════════════════════════════════════════════════════════════════════════

import { _stores } from '../src/globals.js';
import { processTree } from '../src/registry.js';

// Import all directive categories to ensure they're registered
import '../src/filters.js';
import '../src/directives/state.js';
import '../src/directives/binding.js';
import '../src/directives/conditionals.js';
import '../src/directives/loops.js';
import '../src/directives/styling.js';
import '../src/directives/events.js';
import '../src/directives/refs.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const RUNS = 10;
const SIZES = [10, 50, 200];

// ─── Measurement helpers ──────────────────────────────────────────────────────

function stats(times) {
  const sorted = [...times].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  return { mean, median, p95, min, max };
}

const fmt = {
  ms: (v) => v.toFixed(2) + ' ms',
  kb: (v) => (v / 1024).toFixed(0) + ' KB',
};

function cleanup() {
  document.body.innerHTML = '';
  Object.keys(_stores).forEach((k) => delete _stores[k]);
}

// ─── DOM builders ─────────────────────────────────────────────────────────────

/** Scenario A: state-only — each element is a `state` container */
function buildStateOnly(count) {
  cleanup();
  const root = document.createElement('div');
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.setAttribute('state', JSON.stringify({ [`val_${i}`]: i }));
    root.appendChild(el);
  }
  document.body.appendChild(root);
  return root;
}

/** Scenario B: state + bind — parent state, children bind */
function buildStateBind(count) {
  cleanup();
  const root = document.createElement('div');
  const state = document.createElement('div');
  // Build a data object with all values
  const data = {};
  for (let i = 0; i < count; i++) data[`item_${i}`] = `value-${i}`;
  state.setAttribute('state', JSON.stringify(data));
  root.appendChild(state);

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.setAttribute('bind-textContent', `item_${i}`);
    state.appendChild(el);
  }
  document.body.appendChild(root);
  return root;
}

/** Scenario C: mixed — state, bind, if, each (realistic) */
function buildMixed(count) {
  cleanup();
  const root = document.createElement('div');

  // Create groups of 5: 1 state parent + 1 bind + 1 if + 1 each container + 1 plain
  const groups = Math.ceil(count / 5);
  for (let g = 0; g < groups; g++) {
    const state = document.createElement('div');
    const items = Array.from({ length: 3 }, (_, i) => ({
      id: g * 3 + i, name: `item-${g * 3 + i}`,
    }));
    state.setAttribute('state', JSON.stringify({
      show: true, label: `group-${g}`, items,
    }));
    root.appendChild(state);

    // bind child
    const bindEl = document.createElement('span');
    bindEl.setAttribute('bind-textContent', 'label');
    state.appendChild(bindEl);

    // if child
    const ifEl = document.createElement('div');
    ifEl.setAttribute('if', 'show');
    ifEl.textContent = 'visible';
    state.appendChild(ifEl);

    // each container — needs a template
    const tpl = document.createElement('template');
    tpl.id = `tpl-mixed-${g}`;
    tpl.innerHTML = '<span class="row"></span>';
    document.body.appendChild(tpl);

    const eachEl = document.createElement('div');
    eachEl.setAttribute('each', 'item in items');
    eachEl.setAttribute('template', `tpl-mixed-${g}`);
    state.appendChild(eachEl);

    // plain child
    const plainEl = document.createElement('div');
    plainEl.textContent = 'plain';
    state.appendChild(plainEl);
  }

  document.body.appendChild(root);
  return root;
}

/** Scenario D: heavy — state, bind, class-*, style-*, on:click */
function buildHeavy(count) {
  cleanup();
  const root = document.createElement('div');
  const state = document.createElement('div');
  const data = { active: true, color: 'red', count: 0 };
  state.setAttribute('state', JSON.stringify(data));
  root.appendChild(state);

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.setAttribute('bind-textContent', 'count');
    el.setAttribute('class-active', 'active');
    el.setAttribute('style-color', 'color');
    el.setAttribute('on:click', 'count = count + 1');
    state.appendChild(el);
  }

  document.body.appendChild(root);
  return root;
}

// ─── Benchmark runner ─────────────────────────────────────────────────────────

function benchmarkInit(buildFn, size, runs) {
  const times = [];
  const heaps = [];

  for (let r = 0; r < runs + 1; r++) { // +1 for warm-up
    const root = buildFn(size);
    const h0 = process.memoryUsage().heapUsed;
    const t0 = performance.now();
    processTree(root);
    const t1 = performance.now();
    const h1 = process.memoryUsage().heapUsed;
    if (r === 0) continue; // discard warm-up
    times.push(t1 - t0);
    heaps.push(h1 - h0);
  }

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return { ...stats(times), avgHeap: avg(heaps) };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 1 — State-only init
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: processTree — state-only elements', () => {
  const results = [];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  INIT — state-only elements                      ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  for (const size of SIZES) {
    test(`${size} state elements`, () => {
      const s = benchmarkInit(buildStateOnly, size, RUNS);
      results.push({
        elements: size,
        mean: fmt.ms(s.mean),
        median: fmt.ms(s.median),
        p95: fmt.ms(s.p95),
        min: fmt.ms(s.min),
        max: fmt.ms(s.max),
        'heap delta': fmt.kb(s.avgHeap),
        'per-element': (s.mean / size * 1000).toFixed(2) + ' µs',
      });
      expect(true).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 2 — State + bind init
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: processTree — state + bind elements', () => {
  const results = [];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  INIT — state + bind elements                    ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  for (const size of SIZES) {
    test(`${size} bind elements`, () => {
      const s = benchmarkInit(buildStateBind, size, RUNS);
      results.push({
        elements: size,
        mean: fmt.ms(s.mean),
        median: fmt.ms(s.median),
        p95: fmt.ms(s.p95),
        min: fmt.ms(s.min),
        max: fmt.ms(s.max),
        'heap delta': fmt.kb(s.avgHeap),
        'per-element': (s.mean / size * 1000).toFixed(2) + ' µs',
      });
      expect(true).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 3 — Mixed directive init
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: processTree — mixed directives', () => {
  const results = [];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  INIT — mixed directives (state/bind/if/each)    ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  for (const size of SIZES) {
    test(`~${size} mixed elements`, () => {
      const s = benchmarkInit(buildMixed, size, RUNS);
      results.push({
        elements: '~' + size,
        mean: fmt.ms(s.mean),
        median: fmt.ms(s.median),
        p95: fmt.ms(s.p95),
        min: fmt.ms(s.min),
        max: fmt.ms(s.max),
        'heap delta': fmt.kb(s.avgHeap),
      });
      expect(true).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 4 — Heavy directive init
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: processTree — heavy directives (bind/class/style/on)', () => {
  const results = [];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  INIT — heavy directives (bind/class/style/on)   ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  for (const size of SIZES) {
    test(`${size} heavy elements`, () => {
      const s = benchmarkInit(buildHeavy, size, RUNS);
      results.push({
        elements: size,
        mean: fmt.ms(s.mean),
        median: fmt.ms(s.median),
        p95: fmt.ms(s.p95),
        min: fmt.ms(s.min),
        max: fmt.ms(s.max),
        'heap delta': fmt.kb(s.avgHeap),
        'per-element': (s.mean / size * 1000).toFixed(2) + ' µs',
      });
      expect(true).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 5 — Scaling comparison across all scenarios
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: processTree — scaling comparison', () => {
  const results = [];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  INIT SCALING — all scenarios at 200 elements     ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  const scenarios = [
    { name: 'state-only', build: buildStateOnly },
    { name: 'state+bind', build: buildStateBind },
    { name: 'mixed',      build: buildMixed },
    { name: 'heavy',      build: buildHeavy },
  ];

  for (const { name, build } of scenarios) {
    test(`200 elements — ${name}`, () => {
      const s = benchmarkInit(build, 200, RUNS);
      results.push({
        scenario: name,
        mean: fmt.ms(s.mean),
        median: fmt.ms(s.median),
        p95: fmt.ms(s.p95),
        'heap delta': fmt.kb(s.avgHeap),
      });
      expect(true).toBe(true);
    });
  }
});
