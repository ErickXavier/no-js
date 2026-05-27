/**
 * Phase 1 Performance QA — NOJS-31
 *
 * Tests verifying correctness of Phase 1A/1B performance optimizations.
 * Each describe block maps to a specific optimization change.
 */

import { _config, _interceptors, _filters, _SENSITIVE_KEYS, _stores, _storeWatchers, _setCurrentEl, _onDispose } from '../src/globals.js';
import { createContext, _startBatch, _endBatch } from '../src/context.js';
import { evaluate, resolve } from '../src/evaluate.js';
import { _sanitizeHtml } from '../src/dom.js';
import { _doFetch } from '../src/fetch.js';
import { registerDirective, processElement, processTree, _disposeTree } from '../src/registry.js';
import { _devtoolsEmit, _ctxRegistry, _isLocalHostname } from '../src/devtools.js';
import { _resetCtxId } from '../src/context.js';

// ═══════════════════════════════════════════════════════════════════════
//  Phase 1A — H2: _SENSITIVE_KEYS guard behind devtools flag
// ═══════════════════════════════════════════════════════════════════════

describe('Phase 1A — H2: _SENSITIVE_KEYS devtools guard', () => {
  function collectEvents(type) {
    const events = [];
    const handler = (e) => {
      if (!type || e.detail.type === type) events.push(e.detail);
    };
    window.addEventListener('nojs:devtools', handler);
    return {
      events,
      cleanup: () => window.removeEventListener('nojs:devtools', handler),
    };
  }

  afterEach(() => {
    _config.devtools = false;
    _ctxRegistry.clear();
    _resetCtxId();
  });

  test('sensitive key values ARE redacted in ctx:updated when devtools=true', () => {
    _config.devtools = true;
    const ctx = createContext({ userPassword: 'secret123' });
    const { events, cleanup } = collectEvents('ctx:updated');

    ctx.userPassword = 'newSecret456';
    cleanup();

    expect(events).toHaveLength(1);
    expect(events[0].data.key).toBe('userPassword');
    expect(events[0].data.oldValue).toBe('[REDACTED]');
    expect(events[0].data.newValue).toBe('[REDACTED]');
  });

  test('non-sensitive key values are NOT redacted when devtools=true', () => {
    _config.devtools = true;
    const ctx = createContext({ count: 0 });
    const { events, cleanup } = collectEvents('ctx:updated');

    ctx.count = 42;
    cleanup();

    expect(events).toHaveLength(1);
    expect(events[0].data.oldValue).toBe(0);
    expect(events[0].data.newValue).toBe(42);
  });

  test('no ctx:updated event emitted when devtools=false', () => {
    _config.devtools = false;
    const ctx = createContext({ userPassword: 'secret123' });
    const { events, cleanup } = collectEvents('ctx:updated');

    ctx.userPassword = 'newSecret456';
    cleanup();

    // No devtools events should be emitted at all
    expect(events).toHaveLength(0);
  });

  test('context set still works correctly with devtools=false', () => {
    _config.devtools = false;
    const ctx = createContext({ name: 'Alice', apiToken: 'tok_123' });

    ctx.name = 'Bob';
    ctx.apiToken = 'tok_456';

    // Values are stored correctly regardless of devtools flag
    expect(ctx.name).toBe('Bob');
    expect(ctx.apiToken).toBe('tok_456');
  });

  test('_FORBIDDEN_CTX_KEYS check ALWAYS runs regardless of devtools flag', () => {
    _config.devtools = false;
    const ctx = createContext({ safe: 1 });

    // __proto__ assignment should be silently blocked
    ctx['__proto__'] = { polluted: true };
    ctx['constructor'] = function() {};
    ctx['prototype'] = {};

    // The prototype chain should not be polluted
    expect({}.polluted).toBeUndefined();
  });

  test('all _SENSITIVE_KEYS entries cause redaction when devtools=true', () => {
    _config.devtools = true;

    for (const sensitiveKey of _SENSITIVE_KEYS) {
      const data = {};
      data[sensitiveKey + 'Field'] = 'initial';
      const ctx = createContext(data);
      const { events, cleanup } = collectEvents('ctx:updated');

      ctx[sensitiveKey + 'Field'] = 'changed';
      cleanup();

      expect(events.length).toBeGreaterThanOrEqual(1);
      const lastEvent = events[events.length - 1];
      expect(lastEvent.data.oldValue).toBe('[REDACTED]');
      expect(lastEvent.data.newValue).toBe('[REDACTED]');
    }
  });

  test('watcher notifications still fire when devtools=false', () => {
    _config.devtools = false;
    const ctx = createContext({ x: 0 });
    const watcher = jest.fn();
    ctx.$watch(watcher);

    ctx.x = 1;

    expect(watcher).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════
//  Phase 1A — M1: _parsePipes() fast-path
// ═══════════════════════════════════════════════════════════════════════

describe('Phase 1A — M1: _parsePipes fast-path (no pipe character)', () => {
  test('expression without any pipe evaluates correctly', () => {
    const ctx = createContext({ x: 10, y: 20 });
    expect(evaluate('x + y', ctx)).toBe(30);
  });

  test('simple variable access without pipe', () => {
    const ctx = createContext({ name: 'hello' });
    expect(evaluate('name', ctx)).toBe('hello');
  });

  test('expression with whitespace but no pipe trims correctly', () => {
    const ctx = createContext({ x: 5 });
    expect(evaluate('  x  ', ctx)).toBe(5);
  });

  test('logical OR (||) without actual pipe still works', () => {
    const ctx = createContext({ a: 0, b: 42 });
    expect(evaluate('a || b', ctx)).toBe(42);
  });

  test('expression with multiple || operators', () => {
    const ctx = createContext({ a: null, b: undefined, c: 'found' });
    expect(evaluate('a || b || c', ctx)).toBe('found');
  });

  test('expression with && and || combined', () => {
    const ctx = createContext({ a: true, b: false, c: true });
    expect(evaluate('a && b || c', ctx)).toBe(true);
  });

  test('ternary expression without pipe', () => {
    const ctx = createContext({ flag: true });
    expect(evaluate("flag ? 'yes' : 'no'", ctx)).toBe('yes');
  });

  test('string containing pipe character (in quotes) evaluates correctly', () => {
    const ctx = createContext({});
    // The string literal itself contains a pipe, but it's inside quotes
    const result = evaluate("'hello|world'", ctx);
    expect(result).toBe('hello|world');
  });

  test('pipe filter still works (not broken by fast-path)', () => {
    _filters.double = (v) => v * 2;
    const ctx = createContext({ x: 5 });
    expect(evaluate('x | double', ctx)).toBe(10);
    delete _filters.double;
  });

  test('chained pipe filters still work', () => {
    _filters.addOne = (v) => v + 1;
    _filters.double = (v) => v * 2;
    const ctx = createContext({ x: 3 });
    // (3 + 1) * 2 = 8
    expect(evaluate('x | addOne | double', ctx)).toBe(8);
    delete _filters.addOne;
    delete _filters.double;
  });

  test('pipe filter with colon args still works', () => {
    _filters.repeat = (v, n) => String(v).repeat(Number(n));
    const ctx = createContext({ word: 'ha' });
    expect(evaluate('word | repeat:3', ctx)).toBe('hahaha');
    delete _filters.repeat;
  });

  test('|| inside parentheses is not confused with pipe', () => {
    const ctx = createContext({ a: 0, b: 5 });
    expect(evaluate('(a || b)', ctx)).toBe(5);
  });

  test('bitwise OR inside brackets is not confused with pipe', () => {
    const ctx = createContext({ a: 1, b: 2 });
    expect(evaluate('[a | b]', ctx)).toEqual([3]);
  });
});

// ═══════════════════════════════════════════════════════════════════════
//  Phase 1A — L5: _endBatch() swap pattern
// ═══════════════════════════════════════════════════════════════════════

describe('Phase 1A — L5: _endBatch swap pattern', () => {
  test('batch fires all queued watchers', () => {
    const ctx = createContext({ a: 0, b: 0 });
    const watcher = jest.fn();
    ctx.$watch(watcher);

    _startBatch();
    ctx.a = 1;
    ctx.b = 2;
    expect(watcher).not.toHaveBeenCalled();
    _endBatch();

    expect(watcher).toHaveBeenCalledTimes(1);
  });

  test('nested batches only flush at outermost endBatch', () => {
    const ctx = createContext({ x: 0 });
    const watcher = jest.fn();
    ctx.$watch(watcher);

    _startBatch();
    _startBatch();
    ctx.x = 1;
    _endBatch(); // inner — should NOT flush
    expect(watcher).not.toHaveBeenCalled();
    _endBatch(); // outer — should flush
    expect(watcher).toHaveBeenCalledTimes(1);
  });

  test('deeply nested batches (3 levels) still work', () => {
    const ctx = createContext({ v: 0 });
    const watcher = jest.fn();
    ctx.$watch(watcher);

    _startBatch();
    _startBatch();
    _startBatch();
    ctx.v = 99;
    _endBatch();
    _endBatch();
    expect(watcher).not.toHaveBeenCalled();
    _endBatch();
    expect(watcher).toHaveBeenCalledTimes(1);
  });

  test('watcher that modifies context during batch flush does not deadlock', () => {
    const ctx = createContext({ a: 0, b: 0 });
    const order = [];

    const watcherA = jest.fn(() => {
      order.push('watcherA');
      // Modifying context during flush — should queue for next micro-flush
      if (ctx.b === 0) ctx.b = 100;
    });
    ctx.$watch(watcherA);

    _startBatch();
    ctx.a = 1;
    _endBatch();

    // watcherA fired and set b=100
    expect(ctx.a).toBe(1);
    expect(ctx.b).toBe(100);
    // No infinite loop — test completes
  });

  test('empty batch (no changes) does not fire watchers', () => {
    const ctx = createContext({ x: 1 });
    const watcher = jest.fn();
    ctx.$watch(watcher);

    _startBatch();
    _endBatch();

    expect(watcher).not.toHaveBeenCalled();
  });

  test('multiple contexts in same batch all get notified', () => {
    const ctx1 = createContext({ a: 0 });
    const ctx2 = createContext({ b: 0 });
    const watcher1 = jest.fn();
    const watcher2 = jest.fn();
    ctx1.$watch(watcher1);
    ctx2.$watch(watcher2);

    _startBatch();
    ctx1.a = 1;
    ctx2.b = 2;
    _endBatch();

    expect(watcher1).toHaveBeenCalledTimes(1);
    expect(watcher2).toHaveBeenCalledTimes(1);
  });

  test('disconnected element watcher is skipped during flush', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const ctx = createContext({ x: 0 });
    const watcher = jest.fn();
    watcher._el = el;
    ctx.$watch(watcher);

    // Remove from DOM before flush
    document.body.removeChild(el);

    _startBatch();
    ctx.x = 1;
    _endBatch();

    // Watcher should be skipped because el is disconnected
    expect(watcher).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════
//  Phase 1B — M3: DOMParser singleton
// ═══════════════════════════════════════════════════════════════════════

describe('Phase 1B — M3: DOMParser singleton (sanitization correctness)', () => {
  beforeEach(() => {
    _config.sanitize = true;
    delete _config.dangerouslyDisableSanitize;
    delete _config.sanitizeHtml;
  });

  test('consecutive sanitizeHtml calls produce correct independent results', () => {
    const result1 = _sanitizeHtml('<p>Hello</p>');
    const result2 = _sanitizeHtml('<b>World</b>');
    const result3 = _sanitizeHtml('<em>Third</em>');

    expect(result1).toContain('Hello');
    expect(result2).toContain('World');
    expect(result3).toContain('Third');
    // Each call is independent — no cross-contamination
    expect(result1).not.toContain('World');
    expect(result2).not.toContain('Hello');
  });

  test('sanitizer blocks script tags after prior clean call', () => {
    // First a clean call
    _sanitizeHtml('<p>Safe content</p>');
    // Then a malicious call
    const result = _sanitizeHtml('<p>Before</p><script>alert("xss")</script><p>After</p>');
    expect(result).not.toContain('<script');
    expect(result).toContain('Before');
    expect(result).toContain('After');
  });

  test('sanitizer blocks iframe tags', () => {
    const result = _sanitizeHtml('<div>Safe<iframe srcdoc="<script>evil()</script>"></iframe></div>');
    expect(result).not.toContain('iframe');
  });

  test('sanitizer blocks object/embed/applet tags', () => {
    const result = _sanitizeHtml('<object data="evil.swf"></object><embed src="evil.swf"><applet code="evil">');
    expect(result).not.toContain('object');
    expect(result).not.toContain('embed');
    expect(result).not.toContain('applet');
  });

  test('sanitizer blocks javascript: protocol in href', () => {
    const result = _sanitizeHtml('<a href="javascript:alert(1)">Click</a>');
    expect(result).not.toContain('javascript:');
  });

  test('sanitizer blocks vbscript: protocol', () => {
    const result = _sanitizeHtml('<a href="vbscript:msgbox(1)">Click</a>');
    expect(result).not.toContain('vbscript:');
  });

  test('sanitizer blocks entity-encoded javascript: href', () => {
    const result = _sanitizeHtml('<a href="&#x6A;avascript:alert(1)">Click</a>');
    expect(result).not.toContain('javascript:');
  });

  test('sanitizer blocks style/meta/link/base/template/form tags', () => {
    const html = '<style>body{display:none}</style><meta charset="utf-8"><link rel="stylesheet"><base href="/"><template><p>hidden</p></template><form action="/steal">';
    const result = _sanitizeHtml(html);
    expect(result).not.toContain('<style');
    expect(result).not.toContain('<meta');
    expect(result).not.toContain('<link');
    expect(result).not.toContain('<base');
    expect(result).not.toContain('<template');
    expect(result).not.toContain('<form');
  });

  test('sanitizer preserves safe HTML after blocking dangerous content', () => {
    // Interleaved safe and dangerous content
    const result = _sanitizeHtml(
      '<h1>Title</h1><script>evil()</script><p>Safe paragraph</p><iframe src="bad"></iframe><ul><li>Item</li></ul>'
    );
    expect(result).toContain('Title');
    expect(result).toContain('Safe paragraph');
    expect(result).toContain('Item');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('<iframe');
  });

  test('sanitizer handles empty string', () => {
    const result = _sanitizeHtml('');
    expect(typeof result).toBe('string');
  });

  test('sanitizer handles plain text (no tags)', () => {
    const result = _sanitizeHtml('Just plain text');
    expect(result).toContain('Just plain text');
  });
});

// ═══════════════════════════════════════════════════════════════════════
//  Phase 1B — M7: Hoisted _MATCH_PATTERNS + L7: Indexed for loop
// ═══════════════════════════════════════════════════════════════════════

describe('Phase 1B — M7/L7: _MATCH_PATTERNS and indexed processElement', () => {
  test('matches style-* pattern directives', () => {
    const initFn = jest.fn();
    registerDirective('style-*', { priority: 20, init: initFn });

    const div = document.createElement('div');
    div.setAttribute('style-color', 'red');
    processElement(div);

    expect(initFn).toHaveBeenCalledWith(div, 'style-color', 'red');
  });

  test('matches bind-* pattern directives', () => {
    const initFn = jest.fn();
    registerDirective('bind-*', { priority: 20, init: initFn });

    const div = document.createElement('div');
    div.setAttribute('bind-title', 'myTitle');
    processElement(div);

    expect(initFn).toHaveBeenCalledWith(div, 'bind-title', 'myTitle');
  });

  test('multiple pattern directives on single element all fire', () => {
    const classFn = jest.fn();
    const styleFn = jest.fn();
    const onFn = jest.fn();
    const bindFn = jest.fn();

    registerDirective('class-*', { priority: 20, init: classFn });
    registerDirective('style-*', { priority: 20, init: styleFn });
    registerDirective('on:*', { priority: 20, init: onFn });
    registerDirective('bind-*', { priority: 20, init: bindFn });

    const div = document.createElement('div');
    div.setAttribute('class-active', 'true');
    div.setAttribute('style-color', 'blue');
    div.setAttribute('on:click', 'doIt()');
    div.setAttribute('bind-href', 'url');
    processElement(div);

    expect(classFn).toHaveBeenCalledTimes(1);
    expect(styleFn).toHaveBeenCalledTimes(1);
    expect(onFn).toHaveBeenCalledTimes(1);
    expect(bindFn).toHaveBeenCalledTimes(1);
  });

  test('priority ordering preserved with indexed loop', () => {
    const order = [];
    registerDirective('test-prio-a', {
      priority: 30,
      init: () => order.push('low'),
    });
    registerDirective('test-prio-b', {
      priority: 5,
      init: () => order.push('high'),
    });
    registerDirective('test-prio-c', {
      priority: 15,
      init: () => order.push('mid'),
    });

    const div = document.createElement('div');
    div.setAttribute('test-prio-a', '');
    div.setAttribute('test-prio-b', '');
    div.setAttribute('test-prio-c', '');
    processElement(div);

    expect(order).toEqual(['high', 'mid', 'low']);
  });

  test('element with no matching directives does not throw', () => {
    const div = document.createElement('div');
    div.setAttribute('id', 'foo');
    div.setAttribute('data-custom', 'bar');
    expect(() => processElement(div)).not.toThrow();
  });

  test('processTree with indexed loop handles nested elements', () => {
    const initFn = jest.fn();
    registerDirective('nested-test', { priority: 10, init: initFn });

    const root = document.createElement('div');
    root.setAttribute('nested-test', 'root');

    const child = document.createElement('span');
    child.setAttribute('nested-test', 'child');
    root.appendChild(child);

    const grandchild = document.createElement('p');
    grandchild.setAttribute('nested-test', 'grandchild');
    child.appendChild(grandchild);

    processTree(root);

    expect(initFn).toHaveBeenCalledTimes(3);
    expect(initFn).toHaveBeenCalledWith(root, 'nested-test', 'root');
    expect(initFn).toHaveBeenCalledWith(child, 'nested-test', 'child');
    expect(initFn).toHaveBeenCalledWith(grandchild, 'nested-test', 'grandchild');
  });

  test('exact match takes precedence over pattern match', () => {
    const exactFn = jest.fn();
    const patternFn = jest.fn();

    registerDirective('class-special', { priority: 20, init: exactFn });
    registerDirective('class-*', { priority: 20, init: patternFn });

    const div = document.createElement('div');
    div.setAttribute('class-special', 'true');
    processElement(div);

    // Exact match wins — pattern should not fire
    expect(exactFn).toHaveBeenCalledTimes(1);
    expect(patternFn).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════
//  Phase 1B — L9: Guarded header strip in fetch
// ═══════════════════════════════════════════════════════════════════════

describe('Phase 1B — L9: Guarded header strip in fetch', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    _config.retries = 0;
    _config.timeout = 10000;
    _config.headers = {};
    _config.csrf = null;
    _config.credentials = 'same-origin';
    _interceptors.request.length = 0;
    _interceptors.response.length = 0;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    _interceptors.request.length = 0;
    _interceptors.response.length = 0;
  });

  test('sensitive headers preserved in fetch call when zero interceptors exist', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ ok: true })),
    });

    _config.headers = { Authorization: 'Bearer my-token' };
    await _doFetch('/api/protected', 'GET');

    const calledHeaders = global.fetch.mock.calls[0][1].headers;
    expect(calledHeaders['Authorization']).toBe('Bearer my-token');
  });

  test('custom x-api-key header preserved with zero interceptors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{}'),
    });

    _config.headers = { 'X-Api-Key': 'key-12345' };
    await _doFetch('/api/data', 'GET');

    const calledHeaders = global.fetch.mock.calls[0][1].headers;
    expect(calledHeaders['X-Api-Key']).toBe('key-12345');
  });

  test('multiple sensitive headers preserved with zero interceptors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{}'),
    });

    _config.headers = {
      Authorization: 'Bearer token',
      Cookie: 'session=abc',
      'X-Api-Key': 'key-456',
    };
    await _doFetch('/api/multi', 'GET');

    const calledHeaders = global.fetch.mock.calls[0][1].headers;
    expect(calledHeaders['Authorization']).toBe('Bearer token');
    expect(calledHeaders['Cookie']).toBe('session=abc');
    expect(calledHeaders['X-Api-Key']).toBe('key-456');
  });

  test('sensitive headers stripped from untrusted interceptor view', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{}'),
    });

    _config.headers = { Authorization: 'Bearer secret-token' };

    let interceptedHeaders = null;
    _interceptors.request.push((url, opts) => {
      interceptedHeaders = { ...opts.headers };
      return opts;
    });

    await _doFetch('/api/test', 'GET');

    // Interceptor should NOT see the sensitive header
    expect(interceptedHeaders['Authorization']).toBeUndefined();
  });

  test('sensitive headers restored after interceptor chain', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{}'),
    });

    _config.headers = { Authorization: 'Bearer restored-token' };

    _interceptors.request.push((url, opts) => {
      // Interceptor adds a custom header
      opts.headers['X-Custom'] = 'added';
      return opts;
    });

    await _doFetch('/api/test', 'GET');

    const calledHeaders = global.fetch.mock.calls[0][1].headers;
    // Sensitive header should be restored after interceptor chain
    expect(calledHeaders['Authorization']).toBe('Bearer restored-token');
    // Custom header from interceptor should also be present
    expect(calledHeaders['X-Custom']).toBe('added');
  });

  test('non-sensitive headers are visible to interceptors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{}'),
    });

    _config.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    let interceptedHeaders = null;
    _interceptors.request.push((url, opts) => {
      interceptedHeaders = { ...opts.headers };
      return opts;
    });

    await _doFetch('/api/test', 'GET');

    expect(interceptedHeaders['Content-Type']).toBe('application/json');
    expect(interceptedHeaders['Accept']).toBe('application/json');
  });

  test('fetch works normally with non-sensitive headers and zero interceptors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: 'result' })),
    });

    _config.headers = { 'Content-Type': 'application/json' };
    const result = await _doFetch('/api/simple', 'GET');

    expect(result).toEqual({ data: 'result' });
    const calledHeaders = global.fetch.mock.calls[0][1].headers;
    expect(calledHeaders['Content-Type']).toBe('application/json');
  });
});
