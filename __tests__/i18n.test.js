import { _i18n } from '../src/i18n.js';
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

describe('index.js — i18n detectBrowser', () => {
  test('sets locale when browser language matches available locale', async () => {
    const { default: No } = await import('../src/index.js');

    const originalLanguage = navigator.language;
    Object.defineProperty(navigator, 'language', { value: 'pt-BR', configurable: true });

    No.i18n({
      locales: { 'en': { hello: 'Hello' }, 'pt-BR': { hello: 'Olá' } },
      defaultLocale: 'en',
      detectBrowser: true,
    });

    expect(_i18n.locale).toBe('pt-BR');

    Object.defineProperty(navigator, 'language', { value: originalLanguage, configurable: true });
  });

  test('keeps default locale when browser language is not available', async () => {
    const { default: No } = await import('../src/index.js');

    const originalLanguage = navigator.language;
    Object.defineProperty(navigator, 'language', { value: 'ja-JP', configurable: true });

    No.i18n({
      locales: { 'en': { hello: 'Hello' }, 'fr': { hello: 'Bonjour' } },
      defaultLocale: 'en',
      detectBrowser: true,
    });

    expect(_i18n.locale).toBe('en');

    Object.defineProperty(navigator, 'language', { value: originalLanguage, configurable: true });
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
