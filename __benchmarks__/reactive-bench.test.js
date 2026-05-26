// ═══════════════════════════════════════════════════════════════════════════
// context.js — reactive update latency benchmark
//
// Measures the time from setting a property on a reactive context until all
// attached watchers have fired. Tests watcher fan-out scaling:
//   1, 10, 50, 200 watchers on the same property.
//
// Also compares batch vs non-batch updates to quantify the coalescing benefit.
//
// Reports: mean, median, p95, min, max per watcher count.
// ═══════════════════════════════════════════════════════════════════════════

import { createContext, _startBatch, _endBatch } from '../src/context.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const RUNS = 200;
const WATCHER_COUNTS = [1, 10, 50, 200];

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
  us: (v) => (v * 1000).toFixed(2) + ' µs',
  ms: (v) => v.toFixed(3) + ' ms',
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 1 — Watcher fan-out scaling (non-batch)
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: reactive update latency — watcher fan-out', () => {
  const results = [];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  REACTIVE LATENCY — watcher fan-out (non-batch)  ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  for (const count of WATCHER_COUNTS) {
    test(`${count} watcher(s) — non-batch`, () => {
      const times = [];

      for (let r = 0; r < RUNS; r++) {
        const ctx = createContext({ value: 0 });
        let fired = 0;

        // Attach watchers
        for (let w = 0; w < count; w++) {
          ctx.$watch(() => { fired++; });
        }

        fired = 0;
        const t0 = performance.now();
        ctx.value = r + 1;
        const t1 = performance.now();

        times.push(t1 - t0);
        expect(fired).toBe(count);
      }

      const s = stats(times);
      results.push({
        watchers: count,
        mean: fmt.us(s.mean),
        median: fmt.us(s.median),
        p95: fmt.us(s.p95),
        min: fmt.us(s.min),
        max: fmt.us(s.max),
        'per-watcher': fmt.us(s.mean / count),
      });
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 2 — Batch vs non-batch comparison
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: batch vs non-batch update (50 watchers)', () => {
  const results = [];
  const WATCHER_COUNT = 50;
  const UPDATES_PER_RUN = 10;

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  BATCH vs NON-BATCH — 50 watchers, 10 updates    ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  test('non-batch: 10 sequential updates', () => {
    const times = [];

    for (let r = 0; r < RUNS; r++) {
      const ctx = createContext({ value: 0 });
      let fired = 0;

      for (let w = 0; w < WATCHER_COUNT; w++) {
        ctx.$watch(() => { fired++; });
      }

      fired = 0;
      const t0 = performance.now();
      for (let u = 0; u < UPDATES_PER_RUN; u++) {
        ctx.value = u + 1;
      }
      const t1 = performance.now();

      times.push(t1 - t0);
      // Each update fires all watchers: 10 × 50 = 500
      expect(fired).toBe(WATCHER_COUNT * UPDATES_PER_RUN);
    }

    const s = stats(times);
    results.push({
      mode: 'non-batch',
      'watcher fires': WATCHER_COUNT * UPDATES_PER_RUN,
      mean: fmt.us(s.mean),
      median: fmt.us(s.median),
      p95: fmt.us(s.p95),
      min: fmt.us(s.min),
      max: fmt.us(s.max),
    });
  });

  test('batch: 10 updates coalesced', () => {
    const times = [];

    for (let r = 0; r < RUNS; r++) {
      const ctx = createContext({ value: 0 });
      let fired = 0;

      for (let w = 0; w < WATCHER_COUNT; w++) {
        ctx.$watch(() => { fired++; });
      }

      fired = 0;
      const t0 = performance.now();
      _startBatch();
      for (let u = 0; u < UPDATES_PER_RUN; u++) {
        ctx.value = u + 1;
      }
      _endBatch();
      const t1 = performance.now();

      times.push(t1 - t0);
      // Batch coalesces: each watcher fires once = 50
      expect(fired).toBe(WATCHER_COUNT);
    }

    const s = stats(times);
    results.push({
      mode: 'batch',
      'watcher fires': WATCHER_COUNT,
      mean: fmt.us(s.mean),
      median: fmt.us(s.median),
      p95: fmt.us(s.p95),
      min: fmt.us(s.min),
      max: fmt.us(s.max),
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 3 — Context creation + disposal throughput
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: context creation throughput', () => {
  const results = [];
  const SIZES = [100, 500, 1000, 5000];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  CONTEXT CREATION THROUGHPUT                      ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  for (const count of SIZES) {
    test(`create ${count} contexts`, () => {
      const data = { name: 'test', value: 42, nested: { a: 1, b: 2 } };

      const h0 = process.memoryUsage().heapUsed;
      const t0 = performance.now();
      const contexts = [];
      for (let i = 0; i < count; i++) {
        contexts.push(createContext({ ...data, id: i }));
      }
      const t1 = performance.now();
      const h1 = process.memoryUsage().heapUsed;

      const totalMs = t1 - t0;
      const opsSec = Math.round((count / totalMs) * 1000);

      results.push({
        count,
        'total (ms)': totalMs.toFixed(2) + ' ms',
        'per-ctx': fmt.us(totalMs / count),
        'ops/sec': opsSec.toLocaleString(),
        'heap delta': ((h1 - h0) / 1024).toFixed(0) + ' KB',
      });

      expect(contexts.length).toBe(count);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 4 — Parent chain depth impact
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: parent chain depth — property resolution', () => {
  const results = [];
  const DEPTHS = [1, 5, 10, 20];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  PARENT CHAIN — property resolution cost          ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  for (const depth of DEPTHS) {
    test(`chain depth ${depth}`, () => {
      // Build a parent chain with the target property at the root
      let root = createContext({ target: 'found', level: 0 });
      let current = root;
      for (let d = 1; d < depth; d++) {
        current = createContext({ level: d }, current);
      }

      const times = [];
      for (let r = 0; r < RUNS; r++) {
        const t0 = performance.now();
        // Access the property — it must walk up the chain
        const val = current.target;
        const t1 = performance.now();
        times.push(t1 - t0);
        expect(val).toBe('found');
      }

      const s = stats(times);
      results.push({
        depth,
        mean: fmt.us(s.mean),
        median: fmt.us(s.median),
        p95: fmt.us(s.p95),
        min: fmt.us(s.min),
        max: fmt.us(s.max),
      });
    });
  }
});
