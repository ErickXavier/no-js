import { _i18n, _i18nListeners, _watchI18n, _notifyI18n, _deepMerge, _i18nCache, _loadLocale, _loadI18nForLocale, _loadI18nNamespace } from '../src/i18n.js';
import { _config } from '../src/globals.js';

describe('i18n System', () => {
  beforeEach(() => {
    _i18n.locale = 'en';
    _i18n.locales = {
      en: {
        greeting: 'Hello',
        welcome: 'Welcome, {name}!',
        items: 'one item | {count} items',
        nested: {
          deep: {
            key: 'Deep value',
          },
        },
      },
      es: {
        greeting: 'Hola',
        welcome: 'Bienvenido, {name}!',
        items: 'un artículo | {count} artículos',
      },
      pt: {
        greeting: 'Olá',
      },
    };
    _config.i18n.fallbackLocale = 'en';
  });

  afterEach(() => {
    _i18n.locale = 'en';
    _i18n.locales = {};
  });

  test('translates simple key', () => {
    expect(_i18n.t('greeting')).toBe('Hello');
  });

  test('translates with locale switch', () => {
    _i18n.locale = 'es';
    expect(_i18n.t('greeting')).toBe('Hola');
  });

  test('interpolates parameters', () => {
    expect(_i18n.t('welcome', { name: 'Alice' })).toBe('Welcome, Alice!');
  });

  test('interpolates parameters in different locale', () => {
    _i18n.locale = 'es';
    expect(_i18n.t('welcome', { name: 'Carlos' })).toBe('Bienvenido, Carlos!');
  });

  test('pluralization - singular', () => {
    expect(_i18n.t('items', { count: 1 })).toBe('one item');
  });

  test('pluralization - plural', () => {
    expect(_i18n.t('items', { count: 5 })).toBe('5 items');
  });

  test('pluralization - zero', () => {
    expect(_i18n.t('items', { count: 0 })).toBe('0 items');
  });

  test('resolves nested keys with dot notation', () => {
    expect(_i18n.t('nested.deep.key')).toBe('Deep value');
  });

  test('returns key when translation not found', () => {
    expect(_i18n.t('nonexistent.key')).toBe('nonexistent.key');
  });

  test('falls back to fallback locale', () => {
    _i18n.locale = 'fr';
    _config.i18n.fallbackLocale = 'en';
    expect(_i18n.t('greeting')).toBe('Hello');
  });

  test('returns key when neither locale nor fallback has translation', () => {
    _i18n.locale = 'fr';
    _config.i18n.fallbackLocale = 'de';
    expect(_i18n.t('greeting')).toBe('greeting');
  });

  test('handles missing parameter gracefully', () => {
    expect(_i18n.t('welcome', {})).toBe('Welcome, !');
  });

  test('handles empty params', () => {
    expect(_i18n.t('greeting', {})).toBe('Hello');
  });
});

describe('i18n — pluralization edge cases', () => {
  beforeEach(() => {
    _i18n.locale = 'en';
    _i18n.locales = {
      en: {
        items: 'one item | {count} items',
        greeting: 'Hello',
        nested: { msg: 'nested value' },
      },
    };
    _config.i18n.fallbackLocale = 'en';
  });

  afterEach(() => {
    _i18n.locale = 'en';
    _i18n.locales = {};
  });

  test('does not split on | when count is not in params', () => {
    const result = _i18n.t('items', { name: 'Alice' });
    expect(result).toContain('|');
    expect(result).toBe('one item |  items');
  });

  test('does not split on | with empty params', () => {
    const result = _i18n.t('items', {});
    expect(result).toContain('|');
  });

  test('does not split on | with no params', () => {
    const result = _i18n.t('items');
    expect(result).toContain('|');
  });
});

describe('i18n — non-string message value', () => {
  beforeEach(() => {
    _i18n.locale = 'en';
    _i18n.locales = {
      en: {
        count: 42,
        flag: true,
        obj: { nested: 'value' },
        arr: [1, 2, 3],
      },
    };
    _config.i18n.fallbackLocale = 'en';
  });

  afterEach(() => {
    _i18n.locale = 'en';
    _i18n.locales = {};
  });

  test('returns number value as-is', () => {
    expect(_i18n.t('count')).toBe(42);
  });

  test('returns boolean value as-is', () => {
    expect(_i18n.t('flag')).toBe(true);
  });

  test('returns object value as-is (no interpolation)', () => {
    expect(_i18n.t('obj')).toEqual({ nested: 'value' });
  });

  test('returns array value as-is', () => {
    expect(_i18n.t('arr')).toEqual([1, 2, 3]);
  });
});

describe('i18n — pluralization forms[1] fallback (L25)', () => {
  beforeEach(() => {
    _i18n.locale = 'en';
    _i18n.locales = {
      en: {
        thing: 'item',
        singlePipe: 'one thing |',
        normalPlural: 'one item | {count} items',
      },
    };
  });

  afterEach(() => {
    _i18n.locale = 'en';
    _i18n.locales = {};
  });

  test('falls back to forms[0] when forms[1] is empty string and count > 1', () => {
    const result = _i18n.t('singlePipe', { count: 5 });
    expect(result).toBe('one thing');
  });

  test('uses forms[0] when count is 1', () => {
    const result = _i18n.t('normalPlural', { count: 1 });
    expect(result).toBe('one item');
  });

  test('uses forms[1] when count > 1 and forms[1] exists', () => {
    const result = _i18n.t('normalPlural', { count: 3 });
    expect(result).toBe('3 items');
  });
});

// ═══════════════════════════════════════════════════════════════════════
//  EXTERNAL FILE LOADING — NEW TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('_deepMerge', () => {
  test('merges flat objects', () => {
    expect(_deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  test('deep merges nested objects', () => {
    const target = { nav: { home: 'Home' } };
    const source = { nav: { docs: 'Docs' } };
    expect(_deepMerge(target, source)).toEqual({ nav: { home: 'Home', docs: 'Docs' } });
  });

  test('source overwrites scalar', () => {
    expect(_deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });

  test('does not merge arrays (replaces)', () => {
    expect(_deepMerge({ a: [1] }, { a: [2, 3] })).toEqual({ a: [2, 3] });
  });

  test('returns new object (no mutation)', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = _deepMerge(target, source);
    expect(result).not.toBe(target);
    expect(result).not.toBe(source);
    expect(target).toEqual({ a: 1 });
    expect(source).toEqual({ b: 2 });
  });

  test('handles empty inputs', () => {
    expect(_deepMerge({}, { a: 1 })).toEqual({ a: 1 });
    expect(_deepMerge({ a: 1 }, {})).toEqual({ a: 1 });
  });
});

describe('_loadLocale', () => {
  const originalFetch = global.fetch;
  let fetchMock;

  beforeEach(() => {
    _i18n.locales = {};
    _i18nCache.clear();
    _config.i18n.loadPath = '/locales/{locale}.json';
    _config.i18n.cache = true;

    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ greeting: 'Hello' }),
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    _i18n.locales = {};
    _i18nCache.clear();
    _config.i18n.loadPath = null;
    _config.i18n.cache = true;
    global.fetch = originalFetch;
  });

  test('flat mode: fetches and merges', async () => {
    await _loadLocale('en', null);
    expect(fetchMock).toHaveBeenCalledWith('/locales/en.json');
    expect(_i18n.locales.en).toEqual({ greeting: 'Hello' });
  });

  test('ns mode: fetches with namespace', async () => {
    _config.i18n.loadPath = '/locales/{locale}/{ns}.json';
    await _loadLocale('en', 'dashboard');
    expect(fetchMock).toHaveBeenCalledWith('/locales/en/dashboard.json');
  });

  test('caches response', async () => {
    await _loadLocale('en', null);
    await _loadLocale('en', null);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('skips fetch when cache hit', async () => {
    _i18nCache.set('en', { greeting: 'Cached' });
    await _loadLocale('en', null);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('handles fetch error gracefully', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    await _loadLocale('en', null);
    expect(warnSpy).toHaveBeenCalled();
    expect(_i18n.locales.en).toBeUndefined();
    warnSpy.mockRestore();
  });

  test('respects cache:false', async () => {
    _config.i18n.cache = false;
    await _loadLocale('en', null);
    await _loadLocale('en', null);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('deep merges into existing locale data', async () => {
    _i18n.locales.en = { existing: 'value', nav: { home: 'Home' } };
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ greeting: 'Hello', nav: { docs: 'Docs' } }),
    });
    _config.i18n.cache = false;
    await _loadLocale('en', null);
    expect(_i18n.locales.en).toEqual({
      existing: 'value',
      greeting: 'Hello',
      nav: { home: 'Home', docs: 'Docs' },
    });
  });

  test('handles network error gracefully', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    await _loadLocale('en', null);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('_loadI18nForLocale', () => {
  const originalFetch = global.fetch;
  let fetchMock;

  beforeEach(() => {
    _i18n.locales = {};
    _i18nCache.clear();
    _config.i18n.cache = false;

    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ hello: 'Hello' }),
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    _i18n.locales = {};
    _i18nCache.clear();
    _config.i18n.loadPath = null;
    _config.i18n.ns = [];
    _config.i18n.cache = true;
    global.fetch = originalFetch;
  });

  test('flat mode: calls _loadLocale(locale, null)', async () => {
    _config.i18n.loadPath = '/locales/{locale}.json';
    _config.i18n.ns = [];
    await _loadI18nForLocale('en');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/locales/en.json');
  });

  test('ns mode: calls _loadLocale per namespace', async () => {
    _config.i18n.loadPath = '/locales/{locale}/{ns}.json';
    _config.i18n.ns = ['common', 'page'];
    await _loadI18nForLocale('en');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith('/locales/en/common.json');
    expect(fetchMock).toHaveBeenCalledWith('/locales/en/page.json');
  });

  test('no-ops when loadPath is null', async () => {
    _config.i18n.loadPath = null;
    await _loadI18nForLocale('en');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('flat mode when loadPath has no {ns}', async () => {
    _config.i18n.loadPath = '/locales/{locale}.json';
    _config.i18n.ns = ['common'];
    await _loadI18nForLocale('en');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/locales/en.json');
  });
});

describe('_loadI18nNamespace', () => {
  const originalFetch = global.fetch;
  let fetchMock;

  beforeEach(() => {
    _i18n._locale = 'es';
    _i18n.locales = {};
    _i18nCache.clear();
    _config.i18n.loadPath = '/locales/{locale}/{ns}.json';
    _config.i18n.fallbackLocale = 'en';
    _config.i18n.cache = false;

    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ title: 'Title' }),
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    _i18n._locale = 'en';
    _i18n.locales = {};
    _i18nCache.clear();
    _config.i18n.loadPath = null;
    _config.i18n.ns = [];
    _config.i18n.cache = true;
    _config.i18n.fallbackLocale = 'en';
    global.fetch = originalFetch;
  });

  test('loads for current + fallback locales', async () => {
    await _loadI18nNamespace('dashboard');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith('/locales/es/dashboard.json');
    expect(fetchMock).toHaveBeenCalledWith('/locales/en/dashboard.json');
  });

  test('deduplicates when current === fallback', async () => {
    _i18n._locale = 'en';
    _config.i18n.fallbackLocale = 'en';
    await _loadI18nNamespace('dashboard');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('no-ops when loadPath is null', async () => {
    _config.i18n.loadPath = null;
    await _loadI18nNamespace('dashboard');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('merges into existing locales', async () => {
    _i18n.locales.es = { greeting: 'Hola' };
    await _loadI18nNamespace('dashboard');
    expect(_i18n.locales.es.greeting).toBe('Hola');
    expect(_i18n.locales.es.title).toBe('Title');
  });
});

describe('locale setter with loadPath', () => {
  const originalFetch = global.fetch;
  let fetchMock;

  beforeEach(() => {
    _i18n._locale = 'en';
    _i18n.locales = {};
    _i18nCache.clear();
    _i18nListeners.clear();
    _config.i18n.cache = false;

    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ welcome: 'Bienvenido' }),
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    _i18n._locale = 'en';
    _i18n.locales = {};
    _i18nCache.clear();
    _i18nListeners.clear();
    _config.i18n.loadPath = null;
    _config.i18n.ns = [];
    _config.i18n.cache = true;
    global.fetch = originalFetch;
  });

  test('fetches before notifying listeners', async () => {
    _config.i18n.loadPath = '/locales/{locale}.json';
    const calls = [];
    const listener = () => calls.push('notified');
    _i18nListeners.add(listener);

    _i18n.locale = 'es';
    // Listener is not called synchronously
    expect(calls).toEqual([]);
    // Wait for promise to resolve
    await new Promise((r) => setTimeout(r, 10));
    expect(calls).toEqual(['notified']);
  });

  test('notifies synchronously when no loadPath', () => {
    _config.i18n.loadPath = null;
    const calls = [];
    _i18nListeners.add(() => calls.push('notified'));
    _i18n.locale = 'es';
    expect(calls).toEqual(['notified']);
  });

  test('does not notify when locale unchanged', () => {
    _config.i18n.loadPath = null;
    const calls = [];
    _i18nListeners.add(() => calls.push('notified'));
    _i18n.locale = 'en'; // same as current
    expect(calls).toEqual([]);
  });

  test('cleans disconnected listeners', () => {
    _config.i18n.loadPath = null;
    const fn = jest.fn();
    fn._el = { isConnected: false };
    _i18nListeners.add(fn);
    _i18n.locale = 'fr';
    expect(fn).not.toHaveBeenCalled();
    expect(_i18nListeners.has(fn)).toBe(false);
  });
});

describe('NoJS.i18n() — external options', () => {
  beforeEach(() => {
    _config.i18n.loadPath = null;
    _config.i18n.ns = [];
    _config.i18n.cache = true;
  });

  afterEach(() => {
    _config.i18n.loadPath = null;
    _config.i18n.ns = [];
    _config.i18n.cache = true;
    _i18n.locales = {};
  });

  test('sets loadPath in config', async () => {
    const { default: No } = await import('../src/index.js');
    No.i18n({ loadPath: '/l/{locale}.json' });
    expect(_config.i18n.loadPath).toBe('/l/{locale}.json');
  });

  test('sets ns in config', async () => {
    const { default: No } = await import('../src/index.js');
    No.i18n({ ns: ['common', 'page'] });
    expect(_config.i18n.ns).toEqual(['common', 'page']);
  });

  test('sets cache in config', async () => {
    const { default: No } = await import('../src/index.js');
    No.i18n({ cache: false });
    expect(_config.i18n.cache).toBe(false);
  });

  test('preserves existing locale data', async () => {
    const { default: No } = await import('../src/index.js');
    _i18n.locales = { en: { hello: 'Hello' } };
    No.i18n({ loadPath: '/l/{locale}.json' });
    expect(_i18n.locales.en.hello).toBe('Hello');
  });
});

describe('_notifyI18n', () => {
  beforeEach(() => {
    _i18nListeners.clear();
  });

  afterEach(() => {
    _i18nListeners.clear();
  });

  test('calls all listeners', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();
    _i18nListeners.add(fn1);
    _i18nListeners.add(fn2);
    _i18nListeners.add(fn3);
    _notifyI18n();
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn3).toHaveBeenCalledTimes(1);
  });

  test('removes disconnected listeners', () => {
    const fn = jest.fn();
    fn._el = { isConnected: false };
    _i18nListeners.add(fn);
    _notifyI18n();
    expect(fn).not.toHaveBeenCalled();
    expect(_i18nListeners.has(fn)).toBe(false);
  });
});