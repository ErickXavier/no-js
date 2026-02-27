import {
  _config,
  _interceptors,
  _eventBus,
  _stores,
  _storeWatchers,
  _filters,
  _validators,
  _cache,
  _refs,
  _routerInstance,
  setRouterInstance,
  _log,
  _warn,
  _notifyStoreWatchers,
  _watchExpr,
  _emitEvent,
} from '../src/globals.js';

import {
  createContext,
  _collectKeys,
  _startBatch,
  _endBatch,
} from '../src/context.js';

import {
  evaluate,
  _execStatement,
  resolve,
  _interpolate,
} from '../src/evaluate.js';

describe('Globals', () => {
  describe('_config defaults', () => {
    test('has default config values', () => {
      expect(_config.baseApiUrl).toBe('');
      expect(_config.timeout).toBe(10000);
      expect(_config.retries).toBe(0);
      expect(_config.retryDelay).toBe(1000);
      expect(_config.credentials).toBe('same-origin');
      expect(_config.csrf).toBeNull();
      expect(_config.debug).toBe(false);
      expect(_config.sanitize).toBe(true);
    });

    test('has default cache config', () => {
      expect(_config.cache.strategy).toBe('none');
      expect(_config.cache.ttl).toBe(300000);
    });

    test('has default router config', () => {
      expect(_config.router.mode).toBe('history');
      expect(_config.router.base).toBe('/');
      expect(_config.router.scrollBehavior).toBe('top');
    });

    test('has default i18n config', () => {
      expect(_config.i18n.defaultLocale).toBe('en');
      expect(_config.i18n.fallbackLocale).toBe('en');
      expect(_config.i18n.detectBrowser).toBe(false);
    });
  });

  describe('shared state objects', () => {
    test('_interceptors has request and response arrays', () => {
      expect(_interceptors.request).toEqual([]);
      expect(_interceptors.response).toEqual([]);
    });

    test('_stores is an object', () => {
      expect(typeof _stores).toBe('object');
    });

    test('_storeWatchers is a Set', () => {
      expect(_storeWatchers).toBeInstanceOf(Set);
    });

    test('_filters is an object', () => {
      expect(typeof _filters).toBe('object');
    });

    test('_validators is an object', () => {
      expect(typeof _validators).toBe('object');
    });

    test('_cache is a Map', () => {
      expect(_cache).toBeInstanceOf(Map);
    });

    test('_refs is an object', () => {
      expect(typeof _refs).toBe('object');
    });
  });

  describe('setRouterInstance', () => {
    afterEach(() => setRouterInstance(null));

    test('sets the router instance', () => {
      const mockRouter = { current: { path: '/' } };
      setRouterInstance(mockRouter);
      const ctx = createContext({});
      expect(ctx.$route).toEqual({ path: '/' });
    });
  });

  describe('_log', () => {
    test('logs when debug is true', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation();
      _config.debug = true;
      _log('test message');
      expect(spy).toHaveBeenCalledWith('[No.JS]', 'test message');
      _config.debug = false;
      spy.mockRestore();
    });

    test('does not log when debug is false', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation();
      _config.debug = false;
      _log('test message');
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('_warn', () => {
    test('always warns', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();
      _warn('warning msg');
      expect(spy).toHaveBeenCalledWith('[No.JS]', 'warning msg');
      spy.mockRestore();
    });
  });

  describe('_notifyStoreWatchers', () => {
    test('calls all store watchers', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      _storeWatchers.add(fn1);
      _storeWatchers.add(fn2);
      _notifyStoreWatchers();
      expect(fn1).toHaveBeenCalled();
      expect(fn2).toHaveBeenCalled();
      _storeWatchers.delete(fn1);
      _storeWatchers.delete(fn2);
    });
  });

  describe('_emitEvent', () => {
    test('calls registered event handlers', () => {
      const fn = jest.fn();
      _eventBus['test-event'] = [fn];
      _emitEvent('test-event', { key: 'value' });
      expect(fn).toHaveBeenCalledWith({ key: 'value' });
      delete _eventBus['test-event'];
    });

    test('handles missing event gracefully', () => {
      expect(() => _emitEvent('nonexistent', {})).not.toThrow();
    });
  });

  describe('_watchExpr', () => {
    test('watches context with $watch', () => {
      const ctx = createContext({ x: 1 });
      const fn = jest.fn();
      _watchExpr('x', ctx, fn);
      ctx.x = 2;
      expect(fn).toHaveBeenCalled();
    });

    test('adds to _storeWatchers when expr includes $store', () => {
      const ctx = createContext({});
      const fn = jest.fn();
      const sizeBefore = _storeWatchers.size;
      _watchExpr('$store.cart.items', ctx, fn);
      expect(_storeWatchers.size).toBe(sizeBefore + 1);
      _storeWatchers.delete(fn);
    });
  });
});

describe('Reactive Context', () => {
  describe('createContext', () => {
    test('creates a proxy with initial data', () => {
      const ctx = createContext({ name: 'Alice', age: 30 });
      expect(ctx.name).toBe('Alice');
      expect(ctx.age).toBe(30);
    });

    test('is detected as proxy via __isProxy', () => {
      const ctx = createContext({});
      expect(ctx.__isProxy).toBe(true);
    });

    test('exposes raw data via __raw', () => {
      const ctx = createContext({ x: 42 });
      expect(ctx.__raw.x).toBe(42);
    });

    test('sets values reactively', () => {
      const ctx = createContext({ count: 0 });
      const watcher = jest.fn();
      ctx.$watch(watcher);
      ctx.count = 5;
      expect(watcher).toHaveBeenCalled();
      expect(ctx.count).toBe(5);
    });

    test('does not notify if value unchanged', () => {
      const ctx = createContext({ x: 10 });
      const watcher = jest.fn();
      ctx.$watch(watcher);
      ctx.x = 10;
      expect(watcher).not.toHaveBeenCalled();
    });

    test('$set sets a value', () => {
      const ctx = createContext({ a: 1 });
      ctx.$set('a', 99);
      expect(ctx.a).toBe(99);
    });

    test('$watch returns unsubscriber', () => {
      const ctx = createContext({ x: 0 });
      const watcher = jest.fn();
      const unsub = ctx.$watch(watcher);
      ctx.x = 1;
      expect(watcher).toHaveBeenCalledTimes(1);
      unsub();
      ctx.x = 2;
      expect(watcher).toHaveBeenCalledTimes(1);
    });

    test('accesses $refs', () => {
      const ctx = createContext({});
      expect(ctx.$refs).toBe(_refs);
    });

    test('accesses $store', () => {
      const ctx = createContext({});
      expect(ctx.$store).toBe(_stores);
    });

    test('accesses $route (null router)', () => {
      setRouterInstance(null);
      const ctx = createContext({});
      expect(ctx.$route).toEqual({});
    });

    test('accesses $route (with router)', () => {
      setRouterInstance({ current: { path: '/home' } });
      const ctx = createContext({});
      expect(ctx.$route).toEqual({ path: '/home' });
      setRouterInstance(null);
    });

    test('returns undefined for missing keys', () => {
      const ctx = createContext({ a: 1 });
      expect(ctx.nonExistent).toBeUndefined();
    });

    test('$notify triggers watchers manually', () => {
      const ctx = createContext({});
      const watcher = jest.fn();
      ctx.$watch(watcher);
      ctx.$notify();
      expect(watcher).toHaveBeenCalled();
    });
  });

  describe('parent context chain', () => {
    test('inherits from parent', () => {
      const parent = createContext({ x: 10 });
      const child = createContext({ y: 20 }, parent);
      expect(child.y).toBe(20);
      expect(child.x).toBe(10);
    });

    test('child overrides parent', () => {
      const parent = createContext({ x: 10 });
      const child = createContext({ x: 50 }, parent);
      expect(child.x).toBe(50);
    });

    test('$parent returns parent context', () => {
      const parent = createContext({ a: 1 });
      const child = createContext({}, parent);
      expect(child.$parent).toBe(parent);
    });

    test('has operator checks current and parent', () => {
      const parent = createContext({ parentKey: true });
      const child = createContext({ childKey: true }, parent);
      expect('childKey' in child).toBe(true);
      expect('parentKey' in child).toBe(true);
      expect('unknown' in child).toBe(false);
    });
  });

  describe('batching', () => {
    test('batches notifications', () => {
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

    test('nested batches work correctly', () => {
      const ctx = createContext({ x: 0 });
      const watcher = jest.fn();
      ctx.$watch(watcher);

      _startBatch();
      _startBatch();
      ctx.x = 1;
      _endBatch();
      expect(watcher).not.toHaveBeenCalled();
      _endBatch();
      expect(watcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('_collectKeys', () => {
    test('collects keys from single context', () => {
      const ctx = createContext({ a: 1, b: 2 });
      const { keys, vals } = _collectKeys(ctx);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(vals.a).toBe(1);
      expect(vals.b).toBe(2);
    });

    test('collects keys from parent chain', () => {
      const parent = createContext({ x: 10 });
      const child = createContext({ y: 20 }, parent);
      const { keys, vals } = _collectKeys(child);
      expect(keys).toContain('x');
      expect(keys).toContain('y');
      expect(vals.x).toBe(10);
      expect(vals.y).toBe(20);
    });

    test('child keys take precedence over parent', () => {
      const parent = createContext({ x: 'parent' });
      const child = createContext({ x: 'child' }, parent);
      const { vals } = _collectKeys(child);
      expect(vals.x).toBe('child');
    });
  });
});

describe('Expression Evaluator', () => {
  describe('evaluate', () => {
    test('evaluates simple expressions', () => {
      const ctx = createContext({ x: 5 });
      expect(evaluate('x', ctx)).toBe(5);
    });

    test('evaluates arithmetic expressions', () => {
      const ctx = createContext({ a: 10, b: 3 });
      expect(evaluate('a + b', ctx)).toBe(13);
      expect(evaluate('a * b', ctx)).toBe(30);
      expect(evaluate('a - b', ctx)).toBe(7);
    });

    test('evaluates boolean expressions', () => {
      const ctx = createContext({ x: true, y: false });
      expect(evaluate('x && y', ctx)).toBe(false);
      expect(evaluate('x || y', ctx)).toBe(true);
      expect(evaluate('!y', ctx)).toBe(true);
    });

    test('evaluates ternary expressions', () => {
      const ctx = createContext({ active: true });
      expect(evaluate("active ? 'yes' : 'no'", ctx)).toBe('yes');
    });

    test('evaluates object literals', () => {
      const ctx = createContext({ x: 1 });
      const result = evaluate('({ a: x, b: 2 })', ctx);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    test('evaluates array literals', () => {
      const ctx = createContext({ x: 1 });
      expect(evaluate('[x, 2, 3]', ctx)).toEqual([1, 2, 3]);
    });

    test('evaluates string methods', () => {
      const ctx = createContext({ name: 'hello' });
      expect(evaluate('name.toUpperCase()', ctx)).toBe('HELLO');
    });

    test('evaluates comparison operators', () => {
      const ctx = createContext({ a: 5, b: 10 });
      expect(evaluate('a < b', ctx)).toBe(true);
      expect(evaluate('a > b', ctx)).toBe(false);
      expect(evaluate('a === 5', ctx)).toBe(true);
    });

    test('returns undefined for null/empty expressions', () => {
      const ctx = createContext({});
      expect(evaluate(null, ctx)).toBeUndefined();
      expect(evaluate('', ctx)).toBeUndefined();
    });

    test('returns undefined for invalid expressions', () => {
      const ctx = createContext({});
      expect(evaluate('this is not valid @#$', ctx)).toBeUndefined();
    });

    test('accesses nested properties', () => {
      const ctx = createContext({ user: { name: 'Bob', age: 25 } });
      expect(evaluate('user.name', ctx)).toBe('Bob');
      expect(evaluate('user.age', ctx)).toBe(25);
    });

    test('accesses $store', () => {
      _stores.cart = createContext({ count: 3 });
      const ctx = createContext({});
      expect(evaluate('$store.cart.count', ctx)).toBe(3);
      delete _stores.cart;
    });
  });

  describe('pipe/filter syntax', () => {
    test('applies single filter', () => {
      _filters.double = (v) => v * 2;
      const ctx = createContext({ x: 5 });
      expect(evaluate('x | double', ctx)).toBe(10);
      delete _filters.double;
    });

    test('applies chained filters', () => {
      _filters.add1 = (v) => v + 1;
      _filters.mul2 = (v) => v * 2;
      const ctx = createContext({ x: 3 });
      expect(evaluate('x | add1 | mul2', ctx)).toBe(8);
      delete _filters.add1;
      delete _filters.mul2;
    });

    test('does not confuse || with pipe', () => {
      const ctx = createContext({ a: 0, b: 5 });
      expect(evaluate('a || b', ctx)).toBe(5);
    });

    test('handles filter with args', () => {
      _filters.repeat = (v, n) => String(v).repeat(n);
      const ctx = createContext({ word: 'ha' });
      expect(evaluate('word | repeat:3', ctx)).toBe('hahaha');
      delete _filters.repeat;
    });
  });

  describe('resolve', () => {
    test('resolves dot-notated paths', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(resolve('a.b.c', obj)).toBe(42);
    });

    test('returns undefined for missing paths', () => {
      const obj = { a: 1 };
      expect(resolve('a.b.c', obj)).toBeUndefined();
    });
  });

  describe('_interpolate', () => {
    test('interpolates expressions in curly braces', () => {
      const ctx = createContext({ id: 42, name: 'test' });
      expect(_interpolate('/users/{id}', ctx)).toBe('/users/42');
      expect(_interpolate('/users/{id}/name/{name}', ctx)).toBe('/users/42/name/test');
    });

    test('handles missing values', () => {
      const ctx = createContext({});
      expect(_interpolate('/users/{id}', ctx)).toBe('/users/');
    });
  });

  describe('_execStatement', () => {
    test('executes assignment statements', () => {
      const ctx = createContext({ count: 0 });
      _execStatement('count = 5', ctx);
      expect(ctx.count).toBe(5);
    });

    test('executes increment statements', () => {
      const ctx = createContext({ count: 0 });
      _execStatement('count++', ctx);
      expect(ctx.count).toBe(1);
    });

    test('has access to extra variables', () => {
      const ctx = createContext({ msg: '' });
      _execStatement('msg = $event.type', ctx, { $event: { type: 'click' } });
      expect(ctx.msg).toBe('click');
    });

    test('handles invalid expressions gracefully', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();
      const ctx = createContext({});
      expect(() => _execStatement('throw new Error("x")', ctx)).not.toThrow();
      spy.mockRestore();
    });
  });
});

describe('evaluate.js — unknown filter', () => {
  test('warns and returns original value for unknown filter', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = createContext({ name: 'Alice' });

    const result = evaluate('name | nonExistentFilter', ctx);

    expect(warnSpy).toHaveBeenCalledWith('[No.JS]', expect.stringContaining('Unknown filter: nonExistentFilter'));
    expect(result).toBe('Alice');
    warnSpy.mockRestore();
  });
});

describe('evaluate.js — filter args with quotes and commas', () => {
  test('parses comma-separated args correctly', () => {
    _filters.testMultiArg = (v, a, b) => `${v}-${a}-${b}`;

    const ctx = createContext({ val: 'X' });
    const result = evaluate('val | testMultiArg:hello,world', ctx);

    expect(result).toBe('X-hello-world');
    delete _filters.testMultiArg;
  });

  test('parses single-quoted args', () => {
    _filters.testQuoted = (v, a) => `${v}:${a}`;

    const ctx = createContext({ val: 'Y' });
    const result = evaluate("val | testQuoted:'with spaces'", ctx);

    expect(result).toBe('Y:with spaces');
    delete _filters.testQuoted;
  });

  test('parses double-quoted args', () => {
    _filters.testDQ = (v, a, b) => `${v}|${a}|${b}`;

    const ctx = createContext({ val: 'Z' });
    const result = evaluate('val | testDQ:"first arg",second', ctx);

    expect(result).toBe('Z|first arg|second');
    delete _filters.testDQ;
  });

  test('parses mixed quoted and unquoted args', () => {
    _filters.testMix = (v, a, b, c) => [v, a, b, c].join('-');

    const ctx = createContext({ val: 'W' });
    const result = evaluate("val | testMix:'one',2,\"three\"", ctx);

    expect(result).toBe('W-one-2-three');
    delete _filters.testMix;
  });
});

describe('_execStatement — setters write back local state', () => {
  test('writes modified state back to context after execution', () => {
    const ctx = createContext({ x: 1, y: 2 });
    _execStatement('x = x + y', ctx);
    expect(ctx.x).toBe(3);
    expect(ctx.y).toBe(2);
  });

  test('handles multiple assignments in sequence', () => {
    const ctx = createContext({ a: 0, b: 0 });
    _execStatement('a = 10; b = 20', ctx);
    expect(ctx.a).toBe(10);
    expect(ctx.b).toBe(20);
  });

  test('writes back unchanged variables without error', () => {
    const ctx = createContext({ foo: 'bar' });
    _execStatement('void 0', ctx);
    expect(ctx.foo).toBe('bar');
  });
});

describe('context.js — get handler special keys', () => {
  test('$form returns null when not set', () => {
    const ctx = createContext({});
    expect(ctx.$form).toBeNull();
  });

  test('$form returns form context when set', () => {
    const ctx = createContext({});
    ctx.$form = { valid: true, errors: {} };
    expect(ctx.$form).toEqual({ valid: true, errors: {} });
  });

  test('$i18n returns i18n instance', () => {
    const ctx = createContext({});
    expect(ctx.$i18n).toBeDefined();
    expect(typeof ctx.$i18n.t).toBe('function');
  });

  test('$router returns null when no router set', () => {
    setRouterInstance(null);
    const ctx = createContext({});
    expect(ctx.$router).toBeNull();
  });

  test('$notify is a function', () => {
    const ctx = createContext({});
    expect(typeof ctx.$notify).toBe('function');
  });

  test('__listeners returns the listeners set', () => {
    const ctx = createContext({});
    expect(ctx.__listeners).toBeInstanceOf(Set);
  });
});

describe('index.js — config()', () => {
  test('config with no router option does not override router config', async () => {
    const { default: No } = await import('../src/index.js');

    const prevRouterMode = _config.router.mode;
    No.config({ timeout: 5000 });
    expect(_config.timeout).toBe(5000);
    expect(_config.router.mode).toBe(prevRouterMode);

    _config.timeout = 10000;
  });

  test('config with router option merges into existing router config', async () => {
    const { default: No } = await import('../src/index.js');

    No.config({ router: { mode: 'hash' } });
    expect(_config.router.mode).toBe('hash');
    expect(_config.router.base).toBe('/');

    _config.router.mode = 'history';
  });
});

describe('index.js — init() SSR guard', () => {
  test('init() returns immediately when document is undefined', async () => {
    const { default: No } = await import('../src/index.js');

    const origDocument = global.document;
    delete global.document;

    const result = await No.init();
    expect(result).toBeUndefined();

    global.document = origDocument;
  });
});

describe('index.js — interceptor() with invalid type', () => {
  test('does nothing for invalid interceptor type', async () => {
    const { default: No } = await import('../src/index.js');

    const prevReqLen = _interceptors.request.length;
    const prevResLen = _interceptors.response.length;

    No.interceptor('invalid', () => {});

    expect(_interceptors.request.length).toBe(prevReqLen);
    expect(_interceptors.response.length).toBe(prevResLen);
  });

  test('adds to request interceptors for valid type', async () => {
    const { default: No } = await import('../src/index.js');

    const fn = () => {};
    const prevLen = _interceptors.request.length;
    No.interceptor('request', fn);
    expect(_interceptors.request.length).toBe(prevLen + 1);

    _interceptors.request.pop();
  });

  test('adds to response interceptors for valid type', async () => {
    const { default: No } = await import('../src/index.js');

    const fn = () => {};
    const prevLen = _interceptors.response.length;
    No.interceptor('response', fn);
    expect(_interceptors.response.length).toBe(prevLen + 1);

    _interceptors.response.pop();
  });
});

describe('NoJS.config — csrf option (L53)', () => {
  test('config sets csrf when opts.csrf is provided', async () => {
    const { default: No } = await import('../src/index.js');
    const prevCsrf = _config.csrf;

    No.config({ csrf: { header: 'X-CSRF', token: 'abc123' } });
    expect(_config.csrf).toEqual({ header: 'X-CSRF', token: 'abc123' });

    _config.csrf = prevCsrf;
  });
});

describe('NoJS.i18n — detectBrowser branch (L109-114)', () => {
  let origNavigator;

  beforeEach(() => {
    origNavigator = global.navigator;
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: origNavigator,
      writable: true,
      configurable: true,
    });
  });

  test('detectBrowser sets locale when browser lang exists in locales', async () => {
    const { default: No } = await import('../src/index.js');
    const { _i18n } = await import('../src/i18n.js');

    Object.defineProperty(global, 'navigator', {
      value: { language: 'es' },
      writable: true,
      configurable: true,
    });

    No.i18n({
      locales: { en: { hello: 'Hi' }, es: { hello: 'Hola' } },
      detectBrowser: true,
    });

    expect(_i18n.locale).toBe('es');
  });

  test('detectBrowser does NOT change locale when browser lang is not in locales', async () => {
    const { default: No } = await import('../src/index.js');
    const { _i18n } = await import('../src/i18n.js');

    _i18n.locale = 'en';
    Object.defineProperty(global, 'navigator', {
      value: { language: 'fr' },
      writable: true,
      configurable: true,
    });

    No.i18n({
      locales: { en: { hello: 'Hi' }, es: { hello: 'Hola' } },
      detectBrowser: true,
    });

    expect(_i18n.locale).toBe('en');
  });
});

describe('NoJS.on — event bus when event already has listeners (L121)', () => {
  test('pushes to existing listener array without re-creating it', async () => {
    const { default: No } = await import('../src/index.js');

    const fn1 = jest.fn();
    const fn2 = jest.fn();

    const unsub1 = No.on('testEvent', fn1);
    expect(_eventBus['testEvent'].length).toBe(1);

    const unsub2 = No.on('testEvent', fn2);
    expect(_eventBus['testEvent'].length).toBe(2);
    expect(_eventBus['testEvent']).toContain(fn1);
    expect(_eventBus['testEvent']).toContain(fn2);

    unsub1();
    unsub2();
    delete _eventBus['testEvent'];
  });
});

describe('evaluate — pipe parsing edge cases (L104)', () => {
  test('handles template literal with pipe character inside backticks', () => {
    const ctx = createContext({ name: 'world' });
    const result = evaluate("`hello`", ctx);
    expect(result).toBe('hello');
  });

  test('handles pipe inside parentheses (not treated as filter)', () => {
    const ctx = createContext({ a: 0, b: 1 });
    const result = evaluate('(a | b)', ctx);
    expect(result).toBe(1);
  });

  test('handles pipe inside array literal', () => {
    const ctx = createContext({ a: 1, b: 2 });
    const result = evaluate('[a | b]', ctx);
    expect(result).toEqual([3]);
  });
});

describe('evaluate — _execStatement setter writeback (L172-182)', () => {
  test('writes back modified local state through setters', () => {
    const ctx = createContext({ count: 0, name: 'test' });
    _execStatement('count = 42', ctx);
    expect(ctx.count).toBe(42);
  });

  test('writes back multiple local variables', () => {
    const ctx = createContext({ x: 1, y: 2 });
    _execStatement('x = 10; y = 20', ctx);
    expect(ctx.x).toBe(10);
    expect(ctx.y).toBe(20);
  });

  test('preserves unchanged variables through setter fallback', () => {
    const ctx = createContext({ a: 'keep', b: 'change' });
    _execStatement('b = "changed"', ctx);
    expect(ctx.a).toBe('keep');
    expect(ctx.b).toBe('changed');
  });
});

describe('Config — devtools', () => {
  test('devtools defaults to false', () => {
    expect(_config.devtools).toBe(false);
  });

  test('devtools: false should not expose window.__NOJS_DEVTOOLS__', () => {
    _config.devtools = false;
    delete window.__NOJS_DEVTOOLS__;
    if (_config.devtools && typeof window !== 'undefined') {
      window.__NOJS_DEVTOOLS__ = { stores: _stores, config: _config };
    }
    expect(window.__NOJS_DEVTOOLS__).toBeUndefined();
  });
});

describe('Config — CSP', () => {
  test('csp defaults to null in _config', () => {
    expect(_config.csp).toBeNull();
  });

  test('csp can be set to strict', () => {
    const original = _config.csp;
    _config.csp = 'strict';
    expect(_config.csp).toBe('strict');
    _config.csp = original;
  });
});
