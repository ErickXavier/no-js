// ═══════════════════════════════════════════════════════════════════════════
// evaluate.js — expression evaluation throughput benchmark
//
// Measures parse + evaluate speed across five complexity tiers:
//   1. Simple property access:   `name`
//   2. Nested path:              `user.address.city`
//   3. Pipe chain:               `name | uppercase`
//   4. Ternary:                  `active ? 'yes' : 'no'`
//   5. Comparison:               `count > 5`
//
// Each expression is evaluated ITERATIONS times against a realistic context.
// Reports: ops/sec, mean, median, p95, min, max per expression type.
// ═══════════════════════════════════════════════════════════════════════════

import { evaluate } from '../src/evaluate.js';
import { createContext } from '../src/context.js';
import { _exprCache, _stmtCache } from '../src/evaluate.js';

// Filters must be loaded so pipe expressions work
import '../src/filters.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITERATIONS = 10000;
const WARMUP = 500;

const EXPRESSIONS = {
  'simple property':  'name',
  'nested path':      'user.address.city',
  'pipe chain':       'name | uppercase',
  'ternary':          "active ? 'yes' : 'no'",
  'comparison':       'count > 5',
};

// ─── Context factory ──────────────────────────────────────────────────────────

function makeContext() {
  return createContext({
    name: 'Alice',
    active: true,
    count: 10,
    user: {
      address: {
        city: 'Portland',
        state: 'OR',
        zip: '97201',
      },
    },
  });
}

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
  const totalMs = sum;
  const opsSec = Math.round((sorted.length / totalMs) * 1000);
  return { opsSec, mean, median, p95, min, max };
}

const fmt = {
  us: (v) => (v * 1000).toFixed(2) + ' µs',
  ops: (v) => v.toLocaleString() + ' ops/s',
};

// ─── Cold-cache vs warm-cache helper ──────────────────────────────────────────

function clearCaches() {
  // Expression and statement caches are LRU Maps — clear them for cold-cache runs
  _exprCache.set('__clear__', null); // access internal map through public API
  // Brute-force: evaluate a bunch of unique expressions to evict the ones we care about
  const ctx = makeContext();
  for (let i = 0; i < 600; i++) {
    try { evaluate(`_flush_${i}`, ctx); } catch { /* ignore */ }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 1 — Expression throughput (warm cache)
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: expression evaluation throughput (warm cache)', () => {
  const results = [];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  EXPRESSION THROUGHPUT — warm cache               ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  for (const [label, expr] of Object.entries(EXPRESSIONS)) {
    test(`[warm] ${label}: "${expr}"`, () => {
      const ctx = makeContext();

      // Warm-up: populate expression cache
      for (let i = 0; i < WARMUP; i++) evaluate(expr, ctx);

      // Measure individual iteration times
      const times = [];
      for (let i = 0; i < ITERATIONS; i++) {
        const t0 = performance.now();
        evaluate(expr, ctx);
        const t1 = performance.now();
        times.push(t1 - t0);
      }

      const s = stats(times);
      results.push({
        expression: label,
        'ops/sec': fmt.ops(s.opsSec),
        mean: fmt.us(s.mean),
        median: fmt.us(s.median),
        p95: fmt.us(s.p95),
        min: fmt.us(s.min),
        max: fmt.us(s.max),
      });

      // Sanity check: expression must return a defined value
      const val = evaluate(expr, ctx);
      expect(val).toBeDefined();
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 2 — Cold-cache vs warm-cache comparison
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: cold-cache vs warm-cache parse+evaluate', () => {
  const results = [];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  COLD vs WARM CACHE comparison                   ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  for (const [label, expr] of Object.entries(EXPRESSIONS)) {
    test(`[cold/warm] ${label}: "${expr}"`, () => {
      const ctx = makeContext();
      const RUNS = 100;

      // Cold-cache: flush then measure first evaluation
      const coldTimes = [];
      for (let r = 0; r < RUNS; r++) {
        clearCaches();
        const t0 = performance.now();
        evaluate(expr, ctx);
        const t1 = performance.now();
        coldTimes.push(t1 - t0);
      }

      // Warm-cache: expression is already cached
      const warmTimes = [];
      evaluate(expr, ctx); // ensure cached
      for (let r = 0; r < RUNS; r++) {
        const t0 = performance.now();
        evaluate(expr, ctx);
        const t1 = performance.now();
        warmTimes.push(t1 - t0);
      }

      const coldS = stats(coldTimes);
      const warmS = stats(warmTimes);
      results.push({
        expression: label,
        'cold mean': fmt.us(coldS.mean),
        'warm mean': fmt.us(warmS.mean),
        'speedup': (coldS.mean / Math.max(warmS.mean, 0.0001)).toFixed(1) + 'x',
        'cold p95': fmt.us(coldS.p95),
        'warm p95': fmt.us(warmS.p95),
      });

      expect(true).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO 3 — Batch evaluation (multiple expressions per context)
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark: batch evaluation — 5 expressions per context', () => {
  const results = [];

  afterAll(() => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  BATCH EVALUATION — 5 expressions/context        ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.table(results);
  });

  const BATCH_SIZES = [100, 500, 1000, 5000, 10000];
  const allExprs = Object.values(EXPRESSIONS);

  for (const batchSize of BATCH_SIZES) {
    test(`batch of ${batchSize} contexts × 5 expressions`, () => {
      const ctx = makeContext();

      // Warm up caches
      for (const expr of allExprs) evaluate(expr, ctx);

      const t0 = performance.now();
      for (let i = 0; i < batchSize; i++) {
        for (const expr of allExprs) {
          evaluate(expr, ctx);
        }
      }
      const t1 = performance.now();

      const totalOps = batchSize * allExprs.length;
      const totalMs = t1 - t0;
      const opsSec = Math.round((totalOps / totalMs) * 1000);

      results.push({
        contexts: batchSize,
        totalOps,
        'total (ms)': totalMs.toFixed(2) + ' ms',
        'ops/sec': opsSec.toLocaleString(),
        'per-op': fmt.us(totalMs / totalOps),
      });

      expect(totalOps).toBe(batchSize * 5);
    });
  }
});
