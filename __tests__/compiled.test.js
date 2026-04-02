import { _hasCompiled, _getCompiledIndex, _hasSSR, _getSSRType } from '../src/compiled.js';

describe('compiled.js', () => {
  // ── _hasCompiled ──────────────────────────────────────────────────

  describe('_hasCompiled', () => {
    test('returns true when data-nojs-e is present', () => {
      const el = document.createElement('div');
      el.setAttribute('data-nojs-e', '{"bind":0}');
      expect(_hasCompiled(el)).toBe(true);
    });

    test('returns false when data-nojs-e is absent', () => {
      const el = document.createElement('div');
      expect(_hasCompiled(el)).toBe(false);
    });

    test('returns false for null / undefined', () => {
      expect(_hasCompiled(null)).toBe(false);
      expect(_hasCompiled(undefined)).toBe(false);
    });
  });

  // ── _getCompiledIndex ─────────────────────────────────────────────

  describe('_getCompiledIndex', () => {
    test('returns the correct index for a known directive', () => {
      const el = document.createElement('div');
      el.setAttribute('data-nojs-e', '{"bind":0,"on:click":1}');
      expect(_getCompiledIndex(el, 'bind')).toBe(0);
      expect(_getCompiledIndex(el, 'on:click')).toBe(1);
    });

    test('returns null for an unknown directive', () => {
      const el = document.createElement('div');
      el.setAttribute('data-nojs-e', '{"bind":0}');
      expect(_getCompiledIndex(el, 'if')).toBeNull();
    });

    test('returns null when the element has no compiled attribute', () => {
      const el = document.createElement('div');
      expect(_getCompiledIndex(el, 'bind')).toBeNull();
    });

    test('caches the parsed map on the element', () => {
      const el = document.createElement('div');
      el.setAttribute('data-nojs-e', '{"bind":0,"show":2}');

      // First call — parses
      _getCompiledIndex(el, 'bind');

      // Verify cache was set
      expect(el.__nojs_compiled_map).toEqual({ bind: 0, show: 2 });

      // Mutate the attribute — cached value should still be used
      el.setAttribute('data-nojs-e', '{"bind":99}');
      expect(_getCompiledIndex(el, 'bind')).toBe(0); // from cache, not re-parsed
    });

    test('returns null for malformed JSON', () => {
      const el = document.createElement('div');
      el.setAttribute('data-nojs-e', '{not valid json}');
      expect(_getCompiledIndex(el, 'bind')).toBeNull();
    });

    test('returns null for non-numeric values in the map', () => {
      const el = document.createElement('div');
      el.setAttribute('data-nojs-e', '{"bind":"hello"}');
      expect(_getCompiledIndex(el, 'bind')).toBeNull();
    });
  });

  // ── _hasSSR ───────────────────────────────────────────────────────

  describe('_hasSSR', () => {
    test('returns true when data-nojs-ssr is present', () => {
      const el = document.createElement('span');
      el.setAttribute('data-nojs-ssr', 'bind');
      expect(_hasSSR(el)).toBe(true);
    });

    test('returns false when data-nojs-ssr is absent', () => {
      const el = document.createElement('span');
      expect(_hasSSR(el)).toBe(false);
    });

    test('returns true for empty attribute value', () => {
      const el = document.createElement('span');
      el.setAttribute('data-nojs-ssr', '');
      expect(_hasSSR(el)).toBe(true);
    });

    test('returns false for null', () => {
      expect(_hasSSR(null)).toBe(false);
    });

    test('returns false for undefined', () => {
      expect(_hasSSR(undefined)).toBe(false);
    });

    test('returns false for non-element objects', () => {
      expect(_hasSSR({})).toBe(false);
      expect(_hasSSR('string')).toBe(false);
    });
  });

  // ── _getSSRType ─────────────────────────────────────────────────

  describe('_getSSRType', () => {
    test('returns "bind" for bind marker', () => {
      const el = document.createElement('span');
      el.setAttribute('data-nojs-ssr', 'bind');
      expect(_getSSRType(el)).toBe('bind');
    });

    test('returns "class" for class marker', () => {
      const el = document.createElement('div');
      el.setAttribute('data-nojs-ssr', 'class');
      expect(_getSSRType(el)).toBe('class');
    });

    test('returns "style" for style marker', () => {
      const el = document.createElement('div');
      el.setAttribute('data-nojs-ssr', 'style');
      expect(_getSSRType(el)).toBe('style');
    });

    test('returns "show" for show marker', () => {
      const el = document.createElement('p');
      el.setAttribute('data-nojs-ssr', 'show');
      expect(_getSSRType(el)).toBe('show');
    });

    test('returns "loop" for loop marker', () => {
      const el = document.createElement('ul');
      el.setAttribute('data-nojs-ssr', 'loop');
      expect(_getSSRType(el)).toBe('loop');
    });

    test('returns "if" for if marker', () => {
      const el = document.createElement('div');
      el.setAttribute('data-nojs-ssr', 'if');
      expect(_getSSRType(el)).toBe('if');
    });

    test('returns null for element without ssr attribute', () => {
      const el = document.createElement('div');
      expect(_getSSRType(el)).toBeNull();
    });

    test('returns empty string for empty attribute value', () => {
      const el = document.createElement('div');
      el.setAttribute('data-nojs-ssr', '');
      expect(_getSSRType(el)).toBe('');
    });

    test('returns null for null input', () => {
      expect(_getSSRType(null)).toBeNull();
    });

    test('returns null for object without getAttribute', () => {
      expect(_getSSRType({})).toBeNull();
    });
  });
});
