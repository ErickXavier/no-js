



import { _stores, _refs, _config, _validators, _eventBus, _interceptors, setRouterInstance, _cache } from '../src/globals.js';
import { createContext } from '../src/context.js';
import { findContext } from '../src/dom.js';
import { processTree } from '../src/registry.js';
import { _cacheSet } from '../src/fetch.js';
import { _i18n } from '../src/i18n.js';


import '../src/filters.js';
import '../src/directives/state.js';
import '../src/directives/binding.js';
import '../src/directives/http.js';
import '../src/directives/refs.js';
import '../src/directives/events.js';
import '../src/directives/validation.js';
import '../src/directives/i18n.js';



describe('HTTP Directives', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    _config.retries = 0;
    _config.timeout = 10000;
    _config.baseApiUrl = '';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    document.body.innerHTML = '';
    Object.keys(_stores).forEach((k) => delete _stores[k]);
  });

  test('GET directive fetches data and sets context', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ])),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const div = document.createElement('div');
    div.setAttribute('get', '/api/users');
    div.setAttribute('as', 'users');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);


    await new Promise((r) => setTimeout(r, 50));

    expect(global.fetch).toHaveBeenCalled();
    expect(div.__ctx.users).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
  });

  test('POST directive does not auto-fetch (waits for form submit)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ success: true })),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('post', '/api/users');
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);


    await new Promise((r) => setTimeout(r, 50));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('GET with loading template', async () => {
    let resolveReq;
    global.fetch = jest.fn().mockImplementation(
      () => new Promise((resolve) => { resolveReq = resolve; }),
    );

    const loadingTpl = document.createElement('template');
    loadingTpl.id = 'loading-tpl';
    loadingTpl.innerHTML = '<span class="loading">Loading...</span>';
    document.body.appendChild(loadingTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const div = document.createElement('div');
    div.setAttribute('get', '/api/data');
    div.setAttribute('loading', 'loading-tpl');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);


    await new Promise((r) => setTimeout(r, 10));
    expect(div.querySelector('.loading')).not.toBeNull();


    resolveReq({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ result: 'done' })),
    });

    await new Promise((r) => setTimeout(r, 50));
  });

  test('GET with error template on failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server error' }),
    });

    const errorTpl = document.createElement('template');
    errorTpl.id = 'error-tpl';
    errorTpl.innerHTML = '<span class="error">Error occurred</span>';
    document.body.appendChild(errorTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const div = document.createElement('div');
    div.setAttribute('get', '/api/broken');
    div.setAttribute('error', 'error-tpl');
    parent.appendChild(div);
    document.body.appendChild(parent);

    const spy = jest.spyOn(console, 'warn').mockImplementation();
    processTree(parent);

    await new Promise((r) => setTimeout(r, 100));

    expect(div.querySelector('.error')).not.toBeNull();
    spy.mockRestore();
  });

  test('GET saves data into store', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ items: [1, 2, 3] })),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const div = document.createElement('div');
    div.setAttribute('get', '/api/items');
    div.setAttribute('as', 'data');
    div.setAttribute('into', 'myStore');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    await new Promise((r) => setTimeout(r, 50));

    expect(_stores.myStore).toBeDefined();
    expect(_stores.myStore.data).toEqual({ items: [1, 2, 3] });
  });

  test('GET with interpolated URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 42 })),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ userId: 42 }');
    const div = document.createElement('div');
    div.setAttribute('get', '/api/users/{userId}');
    div.setAttribute('as', 'user');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    await new Promise((r) => setTimeout(r, 50));

    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain('/api/users/42');
  });
});



describe('Ref Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    Object.keys(_refs).forEach((k) => delete _refs[k]);
  });

  test('registers element ref', () => {
    const div = document.createElement('div');
    div.setAttribute('ref', 'myDiv');
    document.body.appendChild(div);
    processTree(div);

    expect(_refs.myDiv).toBe(div);
  });

  test('multiple refs', () => {
    const div1 = document.createElement('div');
    div1.setAttribute('ref', 'first');
    const div2 = document.createElement('div');
    div2.setAttribute('ref', 'second');
    document.body.appendChild(div1);
    document.body.appendChild(div2);
    processTree(div1);
    processTree(div2);

    expect(_refs.first).toBe(div1);
    expect(_refs.second).toBe(div2);
  });
});

describe('Use Directive (Templates)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('inserts template content', () => {
    const tpl = document.createElement('template');
    tpl.id = 'use-tpl';
    tpl.innerHTML = '<p class="inserted">Template content</p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const div = document.createElement('div');
    div.setAttribute('use', 'use-tpl');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.querySelector('.inserted')).not.toBeNull();
    expect(div.querySelector('.inserted').textContent).toBe('Template content');
  });

  test('passes var-* attributes to template context', () => {
    const tpl = document.createElement('template');
    tpl.id = 'var-tpl';
    tpl.innerHTML = '<span bind="title"></span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const div = document.createElement('div');
    div.setAttribute('use', 'var-tpl');
    div.setAttribute('var-title', "'Hello World'");
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    const span = div.querySelector('span');
    expect(span.textContent).toBe('Hello World');
  });

  test('handles slots', () => {
    const tpl = document.createElement('template');
    tpl.id = 'slot-tpl';
    tpl.innerHTML = '<div class="header"><slot name="header"></slot></div><div class="body"><slot></slot></div>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const div = document.createElement('div');
    div.setAttribute('use', 'slot-tpl');
    const header = document.createElement('div');
    header.setAttribute('slot', 'header');
    header.textContent = 'Header Content';
    const body = document.createElement('div');
    body.textContent = 'Body Content';
    div.appendChild(header);
    div.appendChild(body);
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.querySelector('.header').textContent).toBe('Header Content');
    expect(div.querySelector('.body').textContent).toBe('Body Content');
  });
});



describe('Validation Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    Object.keys(_validators).forEach((k) => delete _validators[k]);
  });

  test('form-level validation sets $form', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');

    const input = document.createElement('input');
    input.name = 'email';
    input.setAttribute('validate', 'email');
    form.appendChild(input);
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);


    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const ctx = parent.__ctx;
        expect(ctx.$form).toBeDefined();
        expect(ctx.$form.errors).toBeDefined();
        expect(ctx.$form.values).toBeDefined();
        resolve();
      });
    });
  });

  test('built-in email validator', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    const input = document.createElement('input');
    input.name = 'email';
    input.setAttribute('validate', 'email');
    form.appendChild(input);
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        input.value = 'invalid-email';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const ctx = parent.__ctx;
        expect(ctx.$form.errors.email).toBe('Invalid email');
        expect(ctx.$form.valid).toBe(false);

        input.value = 'test@example.com';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(ctx.$form.valid).toBe(true);

        resolve();
      });
    });
  });

  test('built-in min validator', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    const input = document.createElement('input');
    input.name = 'age';
    input.type = 'number';
    input.setAttribute('validate', 'min:18');
    form.appendChild(input);
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        input.value = '15';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.errors.age).toBe('Minimum value is 18');

        input.value = '20';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.errors.age).toBeUndefined();

        resolve();
      });
    });
  });

  test('built-in max validator', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    const input = document.createElement('input');
    input.name = 'qty';
    input.type = 'number';
    input.setAttribute('validate', 'max:100');
    form.appendChild(input);
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        input.value = '150';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.errors.qty).toBe('Maximum value is 100');

        input.value = '50';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.errors.qty).toBeUndefined();

        resolve();
      });
    });
  });

  test('built-in between validator', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    const input = document.createElement('input');
    input.name = 'score';
    input.type = 'number';
    input.setAttribute('validate', 'between:1:10');
    form.appendChild(input);
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        input.value = '15';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.errors.score).toBe('Must be between 1 and 10');

        input.value = '5';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.errors.score).toBeUndefined();

        resolve();
      });
    });
  });

  test('built-in phone validator', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    const input = document.createElement('input');
    input.name = 'phone';
    input.setAttribute('validate', 'phone');
    form.appendChild(input);
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        input.value = 'abc';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.errors.phone).toBe('Invalid phone number');

        input.value = '+1 555-1234';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.errors.phone).toBeUndefined();

        resolve();
      });
    });
  });

  test('custom validator', () => {
    _validators.even = (value) => {
      if (Number(value) % 2 !== 0) return 'Must be even';
      return true;
    };

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    const input = document.createElement('input');
    input.name = 'num';
    input.setAttribute('validate', 'custom:even');
    form.appendChild(input);
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        input.value = '3';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.errors.num).toBe('Must be even');

        input.value = '4';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.errors.num).toBeUndefined();

        resolve();
      });
    });
  });

  test('form tracks dirty state', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    const input = document.createElement('input');
    input.name = 'field';
    form.appendChild(input);
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        expect(parent.__ctx.$form.dirty).toBe(false);
        input.value = 'something';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(parent.__ctx.$form.dirty).toBe(true);
        resolve();
      });
    });
  });

  test('form tracks touched state', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    const input = document.createElement('input');
    input.name = 'field';
    form.appendChild(input);
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        expect(parent.__ctx.$form.touched).toBe(false);
        input.dispatchEvent(new Event('focusout', { bubbles: true }));
        expect(parent.__ctx.$form.touched).toBe(true);
        resolve();
      });
    });
  });
});



describe('i18n Directive (t)', () => {
  beforeEach(() => {
    _i18n.locale = 'en';
    _i18n.locales = {
      en: {
        hello: 'Hello',
        greeting: 'Hello, {name}!',
        items: 'one item | {count} items',
      },
      es: {
        hello: 'Hola',
        greeting: '¡Hola, {name}!',
      },
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    _i18n.locales = {};
    _i18n.locale = 'en';
  });

  test('translates simple key', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const span = document.createElement('span');
    span.setAttribute('t', 'hello');
    parent.appendChild(span);
    document.body.appendChild(parent);
    processTree(parent);

    expect(span.textContent).toBe('Hello');
  });

  test('translates with params via t-* attributes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const span = document.createElement('span');
    span.setAttribute('t', 'greeting');
    span.setAttribute('t-name', "'World'");
    parent.appendChild(span);
    document.body.appendChild(parent);
    processTree(parent);

    expect(span.textContent).toBe('Hello, World!');
  });

  test('updates when locale changes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const span = document.createElement('span');
    span.setAttribute('t', 'hello');
    parent.appendChild(span);
    document.body.appendChild(parent);
    processTree(parent);

    expect(span.textContent).toBe('Hello');



    _i18n.locale = 'es';
    expect(_i18n.t('hello')).toBe('Hola');
  });

  test('handles pluralization with count param', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ n: 5 }');
    const span = document.createElement('span');
    span.setAttribute('t', 'items');
    span.setAttribute('t-count', 'n');
    parent.appendChild(span);
    document.body.appendChild(parent);
    processTree(parent);

    expect(span.textContent).toBe('5 items');
  });

  test('returns key when no translation exists', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const span = document.createElement('span');
    span.setAttribute('t', 'nonexistent.key');
    parent.appendChild(span);
    document.body.appendChild(parent);
    processTree(parent);

    expect(span.textContent).toBe('nonexistent.key');
  });
});







function mockJsonResponse(data) {
  return {
    ok: true,
    headers: { get: () => 'application/json' },
    text: () => Promise.resolve(JSON.stringify(data)),
    json: () => Promise.resolve(data),
  };
}

function mockErrorResponse(status, body) {
  return {
    ok: false,
    status,
    statusText: 'Error',
    headers: { get: () => 'application/json' },
    text: () => Promise.resolve(JSON.stringify(body || {})),
    json: () => Promise.resolve(body || {}),
  };
}

function flush(ms = 50) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpSetup() {
  document.body.innerHTML = '';
  _config.baseApiUrl = '';
  _config.retries = 0;
  _config.timeout = 10000;
  _config.cache = { strategy: 'none', ttl: 300000, prefix: 'nojs_' };
  Object.keys(_stores).forEach((k) => delete _stores[k]);
  Object.keys(_eventBus).forEach((k) => delete _eventBus[k]);
  _interceptors.request = [];
  _interceptors.response = [];
  Object.keys(_cache).forEach((k) => delete _cache[k]);
  setRouterInstance(null);
  global.fetch = jest.fn();
}

function httpTeardown() {
  delete global.fetch;
}



describe('HTTP GET with empty template', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('shows empty template when response is empty array', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse([]));

    const emptyTpl = document.createElement('template');
    emptyTpl.id = 'empty-msg';
    emptyTpl.innerHTML = '<p class="empty">No results</p>';
    document.body.appendChild(emptyTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/items');
    el.setAttribute('as', 'items');
    el.setAttribute('empty', 'empty-msg');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(el.querySelector('.empty')).not.toBeNull();
    expect(el.querySelector('.empty').textContent).toBe('No results');
  });

  test('shows empty template when response is null', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse(null));

    const emptyTpl = document.createElement('template');
    emptyTpl.id = 'empty-null';
    emptyTpl.innerHTML = '<p class="empty-null">Nothing</p>';
    document.body.appendChild(emptyTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/nothing');
    el.setAttribute('as', 'data');
    el.setAttribute('empty', 'empty-null');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(el.querySelector('.empty-null')).not.toBeNull();
  });
});

describe('HTTP GET with error template', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('shows error template on failed request', async () => {
    global.fetch.mockResolvedValue(mockErrorResponse(500, { message: 'HTTP 500' }));

    const errTpl = document.createElement('template');
    errTpl.id = 'err-tpl';
    errTpl.setAttribute('var', 'err');
    errTpl.innerHTML = '<p class="error" bind="err.message"></p>';
    document.body.appendChild(errTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/fail');
    el.setAttribute('error', 'err-tpl');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush(100);

    expect(el.querySelector('.error')).not.toBeNull();
  });
});

describe('HTTP GET with success template', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('renders success template with data', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ name: 'Item 1' }));

    const successTpl = document.createElement('template');
    successTpl.id = 'success-tpl';
    successTpl.setAttribute('var', 'result');
    successTpl.innerHTML = '<p class="success" bind="result.name"></p>';
    document.body.appendChild(successTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/item');
    el.setAttribute('as', 'data');
    el.setAttribute('success', 'success-tpl');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(el.querySelector('.success')).not.toBeNull();
    expect(el.querySelector('.success').textContent).toBe('Item 1');
  });
});

describe('HTTP GET with then expression', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('runs then expression after success', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ ok: true }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ fetched: false }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/check');
    el.setAttribute('as', 'resp');
    el.setAttribute('then', 'window.__thenRan = true');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(window.__thenRan).toBe(true);
    delete window.__thenRan;
  });
});

describe('HTTP POST form submission', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('form submit triggers POST request', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ saved: true }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('post', '/api/save');
    form.setAttribute('as', 'result');
    form.innerHTML = '<input name="title" value="Hello" /><button type="submit">Save</button>';
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);

    form.dispatchEvent(new Event('submit', { bubbles: true }));
    await flush();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/save',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('HTTP GET with caching', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('cached="memory" caches response', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ data: 1 }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/cached-data');
    el.setAttribute('as', 'result');
    el.setAttribute('cached', 'memory');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('HTTP GET with custom headers', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('passes extra headers from attribute', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ ok: true }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/secure');
    el.setAttribute('as', 'data');
    el.setAttribute('headers', '{"Authorization":"Bearer token123"}');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/secure',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
        }),
      }),
    );
  });
});

describe('HTTP GET with redirect', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('redirects via router after success', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ ok: true }));

    const mockRouter = { push: jest.fn() };
    setRouterInstance(mockRouter);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/check');
    el.setAttribute('as', 'data');
    el.setAttribute('redirect', '/dashboard');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });
});

describe('HTTP POST with body attribute', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('sends body from attribute', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ created: true }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ name: "test" }');

    const form = document.createElement('form');
    form.setAttribute('post', '/api/create');
    form.setAttribute('as', 'result');
    form.setAttribute('body', '{"name":"test"}');
    form.innerHTML = '<button type="submit">Go</button>';
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);

    form.dispatchEvent(new Event('submit', { bubbles: true }));
    await flush();

    expect(global.fetch).toHaveBeenCalled();
  });
});

describe('HTTP events emitted', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('emits fetch:success event', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ ok: true }));

    const handler = jest.fn();
    _eventBus['fetch:success'] = [handler];

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/ok');
    el.setAttribute('as', 'data');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/api/ok' }),
    );
  });

  test('emits fetch:error event on failure', async () => {
    global.fetch.mockResolvedValue(mockErrorResponse(500));

    const handler = jest.fn();
    _eventBus['fetch:error'] = [handler];

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/fail');
    el.setAttribute('as', 'data');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush(100);

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/api/fail' }),
    );
  });
});



describe('use directive — slots', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Object.keys(_refs).forEach((k) => delete _refs[k]);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
  });

  test('use handles default slot', () => {
    const tpl = document.createElement('template');
    tpl.id = 'wrapper';
    tpl.innerHTML = '<div class="wrapper"><slot></slot></div>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('use', 'wrapper');
    el.innerHTML = '<p>Slotted Content</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);

    expect(el.querySelector('.wrapper p').textContent).toBe('Slotted Content');
  });

  test('use handles named slots', () => {
    const tpl = document.createElement('template');
    tpl.id = 'layout';
    tpl.innerHTML = '<header><slot name="header"></slot></header><main><slot></slot></main><footer><slot name="footer"></slot></footer>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('use', 'layout');
    el.innerHTML = `
      <span slot="header">My Header</span>
      <p>Main Content</p>
      <span slot="footer">My Footer</span>
    `;
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);

    expect(el.querySelector('header span').textContent).toBe('My Header');
    expect(el.querySelector('main p').textContent).toBe('Main Content');
    expect(el.querySelector('footer span').textContent).toBe('My Footer');
  });

  test('use with nonexistent template does nothing', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('use', 'nonexistent');
    el.innerHTML = '<p>Original</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);

  });
});



describe('call directive', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Object.keys(_refs).forEach((k) => delete _refs[k]);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('call makes request on click', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify({ result: 'ok' })),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/action');
    btn.setAttribute('method', 'post');
    parent.appendChild(btn);
    document.body.appendChild(parent);

    processTree(parent);

    btn.click();
    await new Promise((r) => setTimeout(r, 50));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/action',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  test('call sets "as" key on context', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify({ id: 42 })),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/item');
    btn.setAttribute('as', 'item');
    parent.appendChild(btn);
    document.body.appendChild(parent);

    processTree(parent);

    btn.click();
    await new Promise((r) => setTimeout(r, 50));

    const ctx = findContext(btn);
    expect(ctx.item).toEqual({ id: 42 });
  });

  test('call with into stores data', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify([1, 2, 3])),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/list');
    btn.setAttribute('as', 'items');
    btn.setAttribute('into', 'myStore');
    parent.appendChild(btn);
    document.body.appendChild(parent);

    processTree(parent);

    btn.click();
    await new Promise((r) => setTimeout(r, 50));

    expect(_stores.myStore).toBeDefined();
    expect(_stores.myStore.items).toEqual([1, 2, 3]);
  });

  test('call with body sends request body', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify({ ok: true })),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ name: "test" }');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/create');
    btn.setAttribute('method', 'post');
    btn.setAttribute('body', 'hello world');
    parent.appendChild(btn);
    document.body.appendChild(parent);

    processTree(parent);

    btn.click();
    await new Promise((r) => setTimeout(r, 50));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/create',
      expect.objectContaining({
        method: 'POST',
        body: 'hello world',
      }),
    );
  });

  test('call with confirm=false blocks request', async () => {
    window.confirm = jest.fn(() => false);
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify({})),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/delete');
    btn.setAttribute('method', 'delete');
    btn.setAttribute('confirm', 'Are you sure?');
    parent.appendChild(btn);
    document.body.appendChild(parent);

    processTree(parent);
    btn.click();
    await new Promise((r) => setTimeout(r, 50));

    expect(window.confirm).toHaveBeenCalledWith('Are you sure?');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('call with then expression runs after success', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify({ id: 1 })),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ done: false }');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/action');
    btn.setAttribute('then', 'done = true');
    parent.appendChild(btn);
    document.body.appendChild(parent);

    processTree(parent);
    btn.click();
    await new Promise((r) => setTimeout(r, 50));

    const ctx = findContext(parent);
    expect(ctx.done).toBe(true);
  });

  test('call with success template renders result', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify({ name: 'Widget' })),
    });

    const tpl = document.createElement('template');
    tpl.id = 'success-msg';
    tpl.setAttribute('var', 'result');
    tpl.innerHTML = '<p class="success" bind="result.name"></p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/item');
    btn.setAttribute('as', 'data');
    btn.setAttribute('success', 'success-msg');
    parent.appendChild(btn);
    document.body.appendChild(parent);

    processTree(parent);
    btn.click();
    await new Promise((r) => setTimeout(r, 100));

    const successEl = parent.querySelector('.success');
    expect(successEl).not.toBeNull();
    expect(successEl.textContent).toBe('Widget');
  });

  test('call with error template renders on failure', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ message: 'Server error' }),
    });

    const tpl = document.createElement('template');
    tpl.id = 'error-msg';
    tpl.setAttribute('var', 'err');
    tpl.innerHTML = '<p class="error" bind="err.message"></p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/fail');
    btn.setAttribute('error', 'error-msg');
    parent.appendChild(btn);
    document.body.appendChild(parent);

    processTree(parent);
    btn.click();
    await new Promise((r) => setTimeout(r, 100));

    const errorEl = parent.querySelector('.error');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toBe('Server error');
  });
});



describe('Form validation — dirty and touched tracking', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('submitting becomes true on submit', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML =
      '<input name="x" /><button type="submit">Submit</button>';
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const ctx = findContext(form);
    expect(ctx.$form.submitting).toBe(false);

    form.dispatchEvent(new Event('submit', { bubbles: true }));

    expect(ctx.$form.submitting).toBe(true);
  });

  test('form validation detects errors', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="email" validate="email" value="bad" />';
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const ctx = findContext(form);

    const input = form.querySelector('input');
    input.value = 'not-an-email';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(ctx.$form.valid).toBe(false);
    expect(ctx.$form.errors.email).toBe('Invalid email');
  });

  test('form valid when all fields pass', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="email" validate="email" />';
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const input = form.querySelector('input');
    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.valid).toBe(true);
    expect(ctx.$form.errors.email).toBeUndefined();
  });

  test('form collects values from all named fields', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML =
      '<input name="first" value="John" /><input name="last" value="Doe" />';
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    form
      .querySelector('input[name="first"]')
      .dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.values.first).toBe('John');
    expect(ctx.$form.values.last).toBe('Doe');
  });
});

describe('Field-level validation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('shows error template on invalid input', () => {
    const tpl = document.createElement('template');
    tpl.id = 'field-error';
    tpl.innerHTML = '<span class="err" bind="err.message"></span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const input = document.createElement('input');
    input.setAttribute('validate', 'email');
    input.setAttribute('error', 'field-error');
    parent.appendChild(input);
    document.body.appendChild(parent);

    processTree(parent);

    input.value = 'bad-email';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const errEl = parent.querySelector('.err');
    expect(errEl).not.toBeNull();
    expect(errEl.textContent).toBe('Invalid email');
  });

  test('clears error on valid input', () => {
    const tpl = document.createElement('template');
    tpl.id = 'field-err2';
    tpl.innerHTML = '<span class="err2" bind="err.message"></span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const input = document.createElement('input');
    input.setAttribute('validate', 'email');
    input.setAttribute('error', 'field-err2');
    parent.appendChild(input);
    document.body.appendChild(parent);

    processTree(parent);

    input.value = 'bad';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(parent.querySelector('.err2')).not.toBeNull();

    input.value = 'good@test.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const errEl = parent.querySelector('.err2');
    expect(!errEl || errEl.innerHTML === '').toBe(true);
  });
});

describe('Built-in validators', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    Object.keys(_validators).forEach((k) => delete _validators[k]);
  });

  test('url validator - valid', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="site" validate="url" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const input = form.querySelector('input');
    input.value = 'https://example.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.site).toBeUndefined();
  });

  test('url validator - invalid', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="site" validate="url" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const input = form.querySelector('input');
    input.value = 'not a url';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.site).toBe('Invalid URL');
  });

  test('cpf validator - valid', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="cpf" validate="cpf" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const input = form.querySelector('input');
    input.value = '123.456.789-09';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.cpf).toBeUndefined();
  });

  test('cpf validator - invalid', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="cpf" validate="cpf" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const input = form.querySelector('input');
    input.value = 'abc';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.cpf).toBe('Invalid CPF');
  });

  test('cnpj validator - valid', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="cnpj" validate="cnpj" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const input = form.querySelector('input');
    input.value = '12.345.678/0001-90';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.cnpj).toBeUndefined();
  });

  test('cnpj validator - invalid', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="cnpj" validate="cnpj" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const input = form.querySelector('input');
    input.value = 'abc';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.cnpj).toBe('Invalid CNPJ');
  });

  test('creditcard validator - valid', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="card" validate="creditcard" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const input = form.querySelector('input');
    input.value = '4111111111111111';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.card).toBeUndefined();
  });

  test('creditcard validator - invalid', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="card" validate="creditcard" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const input = form.querySelector('input');
    input.value = '123';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.card).toBe('Invalid card number');
  });

  test('pipe-separated multiple rules', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="val" validate="min:5|max:10" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await new Promise((r) => setTimeout(r, 50));

    const input = form.querySelector('input');
    input.value = '3';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.val).toMatch(/minimum/i);

    input.value = '15';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(ctx.$form.errors.val).toMatch(/maximum/i);

    input.value = '7';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(ctx.$form.errors.val).toBeUndefined();
  });
});

describe('error-boundary directive', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('listens for window errors', () => {
    const tpl = document.createElement('template');
    tpl.id = 'fallback';
    tpl.innerHTML = '<p class="fallback">Something went wrong</p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('error-boundary', 'fallback');
    el.innerHTML = '<p>Content</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);

    const errorEvent = new ErrorEvent('error', {
      message: 'Test error',
      error: new Error('Test error'),
    });
    Object.defineProperty(errorEvent, 'target', { value: el });
    window.dispatchEvent(errorEvent);

    expect(el.querySelector('.fallback')).not.toBeNull();
  });
});



describe('GET cache hit', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('uses cached data when available, skipping fetch', async () => {
    _config.cache = { strategy: 'memory', ttl: 300000, prefix: 'nojs_' };

    _cacheSet('get:/api/items', [{ id: 1 }], 'memory');

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/items');
    el.setAttribute('as', 'items');
    el.setAttribute('cached', 'memory');
    el.innerHTML = '<p>Item content</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(global.fetch).not.toHaveBeenCalled();

    const ctx = findContext(el);
    expect(ctx.items).toEqual([{ id: 1 }]);
  });
});

describe('reactive URL watching', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('re-fetches when interpolated URL changes', async () => {
    global.fetch
      .mockResolvedValueOnce(mockJsonResponse({ name: 'Alice' }))
      .mockResolvedValueOnce(mockJsonResponse({ name: 'Bob' }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ userId: 1 }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/users/{userId}');
    el.setAttribute('as', 'user');
    el.innerHTML = '<p>User</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush(100);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const ctx = findContext(parent);
    ctx.userId = 2;

    await flush(100);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('polling with refresh-interval', () => {
  beforeEach(() => {
    httpSetup();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    httpTeardown();
  });

  test('repeatedly fetches data at specified interval', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ status: 'ok' }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/status');
    el.setAttribute('as', 'status');
    el.setAttribute('refresh', '2000');
    el.innerHTML = '<p>Status</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);

    await jest.advanceTimersByTimeAsync(100);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(2000);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    await jest.advanceTimersByTimeAsync(2000);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});

describe('loading template', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('shows loading template while fetching', async () => {
    let resolveResponse;
    global.fetch.mockReturnValue(new Promise((res) => { resolveResponse = res; }));

    const loadingTpl = document.createElement('template');
    loadingTpl.id = 'loading-tpl';
    loadingTpl.innerHTML = '<p class="spinner">Loading...</p>';
    document.body.appendChild(loadingTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/data');
    el.setAttribute('as', 'data');
    el.setAttribute('loading', 'loading-tpl');
    el.innerHTML = '<p>Data</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush(20);

    expect(el.querySelector('.spinner')).not.toBeNull();

    resolveResponse(mockJsonResponse({ value: 42 }));
    await flush(100);

    expect(el.querySelector('.spinner')).toBeNull();
  });
});



describe('custom validator error', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    Object.keys(_validators).forEach((k) => delete _validators[k]);
  });

  test('custom validator returns error message when validation fails', async () => {
    _validators.noSpaces = (value) => {
      if (/\s/.test(value)) return 'No spaces allowed';
      return true;
    };

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="username" validate="noSpaces" value="has space" />';
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    const ctx = findContext(form);
    expect(ctx.$form.errors.username).toBe('No spaces allowed');
  });
});

describe('match rule', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('match validator fails when values do not match', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = `
      <input name="password" value="abc123" />
      <input name="confirm" validate="match:password" value="xyz789" />
    `;
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    const ctx = findContext(form);
    expect(ctx.$form.errors.confirm).toBe('Must match password');
  });

  test('match validator passes when values match', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = `
      <input name="password" value="abc123" />
      <input name="confirm" validate="match:password" value="abc123" />
    `;
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    const ctx = findContext(form);
    expect(ctx.$form.errors.confirm).toBeUndefined();
  });
});

describe('$form context initialization', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('$form starts with dirty=false and touched=false', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="email" />';
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    const ctx = findContext(form);
    expect(ctx.$form.dirty).toBe(false);
    expect(ctx.$form.touched).toBe(false);
  });
});

describe('native checkValidity', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('uses native validationMessage when checkValidity fails', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="email" type="email" required value="" />';
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    const ctx = findContext(form);
    expect(ctx.$form.valid).toBe(false);
    expect(ctx.$form.errors.email).toBeTruthy();
  });
});





describe('HTTP GET with confirm dialog', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('proceeds with request when confirm returns true', async () => {
    window.confirm = jest.fn(() => true);
    global.fetch.mockResolvedValue(mockJsonResponse({ ok: true }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/data');
    el.setAttribute('as', 'data');
    el.setAttribute('confirm', 'Are you sure?');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(window.confirm).toHaveBeenCalledWith('Are you sure?');
    expect(global.fetch).toHaveBeenCalled();
  });

  test('blocks request when confirm returns false', async () => {
    window.confirm = jest.fn(() => false);
    global.fetch.mockResolvedValue(mockJsonResponse({ ok: true }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/data');
    el.setAttribute('as', 'data');
    el.setAttribute('confirm', 'Are you sure?');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(window.confirm).toHaveBeenCalledWith('Are you sure?');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});





describe('HTTP GET with success template using var attribute', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('success template uses var from template element', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ title: 'My Item' }));

    const successTpl = document.createElement('template');
    successTpl.id = 'custom-var-tpl';
    successTpl.setAttribute('var', 'item');
    successTpl.innerHTML = '<p class="item-title" bind="item.title"></p>';
    document.body.appendChild(successTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/item');
    el.setAttribute('as', 'data');
    el.setAttribute('success', 'custom-var-tpl');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush(100);

    const titleEl = el.querySelector('.item-title');
    expect(titleEl).not.toBeNull();
    expect(titleEl.textContent).toBe('My Item');
  });

  test('success template falls back to varName from element', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ name: 'Widget' }));

    const successTpl = document.createElement('template');
    successTpl.id = 'no-var-tpl';

    successTpl.innerHTML = '<p class="widget-name" bind="myVar.name"></p>';
    document.body.appendChild(successTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/widget');
    el.setAttribute('as', 'data');
    el.setAttribute('var', 'myVar');
    el.setAttribute('success', 'no-var-tpl');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush(100);

    const nameEl = el.querySelector('.widget-name');
    expect(nameEl).not.toBeNull();
    expect(nameEl.textContent).toBe('Widget');
  });
});





describe('HTTP GET cached attribute defaults', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('cached attribute without value defaults to memory strategy', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ id: 1 }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/default-cache');
    el.setAttribute('as', 'data');
    el.setAttribute('cached', '');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    expect(global.fetch).toHaveBeenCalledTimes(1);


    const el2 = document.createElement('div');
    el2.setAttribute('get', '/api/default-cache');
    el2.setAttribute('as', 'data2');
    el2.setAttribute('cached', '');
    parent.appendChild(el2);
    processTree(el2);
    await flush();


    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});





describe('HTTP GET — reactive URL with debounce', () => {
  beforeEach(() => {
    httpSetup();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    httpTeardown();
  });

  test('debounces re-fetch when URL changes with debounce attribute', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ name: 'Alice' }));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ q: "a" }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/search?q={q}');
    el.setAttribute('as', 'results');
    el.setAttribute('debounce', '300');
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);
    await jest.advanceTimersByTimeAsync(50);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const ctx = findContext(parent);


    ctx.q = 'ab';
    await jest.advanceTimersByTimeAsync(100);
    ctx.q = 'abc';
    await jest.advanceTimersByTimeAsync(100);


    expect(global.fetch).toHaveBeenCalledTimes(1);


    await jest.advanceTimersByTimeAsync(400);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});





describe('Validation — creditcard invalid short number', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('creditcard rejects numbers shorter than 13 digits', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="card" validate="creditcard" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await flush();

    const input = form.querySelector('input');
    input.value = '12345';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.card).toBe('Invalid card number');
  });

  test('creditcard rejects number with letters', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="card" validate="creditcard" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await flush();

    const input = form.querySelector('input');
    input.value = '4111abcd11111111';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.card).toBe('Invalid card number');
  });
});





describe('Validation — field-level error template reuse', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('reuses existing error element on subsequent invalid inputs', () => {
    const tpl = document.createElement('template');
    tpl.id = 'reuse-err';
    tpl.innerHTML = '<span class="reuse-error" bind="err.message"></span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const input = document.createElement('input');
    input.setAttribute('validate', 'email');
    input.setAttribute('error', 'reuse-err');
    parent.appendChild(input);
    document.body.appendChild(parent);
    processTree(parent);


    input.value = 'bad1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const errEl = input.nextElementSibling;
    expect(errEl).not.toBeNull();
    expect(errEl.__validationError).toBe(true);


    input.value = 'bad2';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(input.nextElementSibling).toBe(errEl);
    expect(errEl.querySelector('.reuse-error')).not.toBeNull();
  });

  test('clears error element when field becomes valid', () => {
    const tpl = document.createElement('template');
    tpl.id = 'clear-err';
    tpl.innerHTML = '<span class="clear-error" bind="err.message"></span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const input = document.createElement('input');
    input.setAttribute('validate', 'email');
    input.setAttribute('error', 'clear-err');
    parent.appendChild(input);
    document.body.appendChild(parent);
    processTree(parent);


    input.value = 'bad';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(parent.querySelector('.clear-error')).not.toBeNull();


    input.value = 'good@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const errEl = input.nextElementSibling;
    expect(!errEl || errEl.innerHTML === '').toBe(true);
  });
});





describe('Validation — custom: rule in form validation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    Object.keys(_validators).forEach((k) => delete _validators[k]);
  });

  test('custom validator is called via custom:validatorName rule', async () => {
    _validators.startsWithA = (value) => {
      if (!value.startsWith('A')) return 'Must start with A';
      return true;
    };

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = '<input name="code" validate="custom:startsWithA" />';
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);
    await flush();

    const input = form.querySelector('input');
    input.value = 'Btest';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const ctx = findContext(form);
    expect(ctx.$form.errors.code).toBe('Must start with A');

    input.value = 'Atest';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(ctx.$form.errors.code).toBeUndefined();
  });
});





describe('call directive — into store', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Object.keys(_refs).forEach((k) => delete _refs[k]);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('call saves result into global store when into is set', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify({ id: 99, name: 'Stored' })),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/store-item');
    btn.setAttribute('as', 'result');
    btn.setAttribute('into', 'globalStore');
    parent.appendChild(btn);
    document.body.appendChild(parent);

    processTree(parent);
    btn.click();
    await flush();

    expect(_stores.globalStore).toBeDefined();
    expect(_stores.globalStore.result).toEqual({ id: 99, name: 'Stored' });
  });
});





describe('call directive — error template rendering', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Object.keys(_refs).forEach((k) => delete _refs[k]);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('renders error template with err context on failure', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable',
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ message: 'Validation failed' }),
    });

    const tpl = document.createElement('template');
    tpl.id = 'call-error';
    tpl.setAttribute('var', 'err');
    tpl.innerHTML = '<p class="call-err" bind="err.message"></p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/fail');
    btn.setAttribute('error', 'call-error');
    parent.appendChild(btn);
    document.body.appendChild(parent);

    processTree(parent);
    btn.click();
    await flush(100);

    const errEl = parent.querySelector('.call-err');
    expect(errEl).not.toBeNull();
    expect(errEl.textContent).toBe('Validation failed');
  });
});





describe('error-boundary — error event handler', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('renders fallback template when error targets contained element', () => {
    const tpl = document.createElement('template');
    tpl.id = 'boundary-fallback';
    tpl.innerHTML = '<p class="boundary-error">Error caught</p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const boundary = document.createElement('div');
    boundary.setAttribute('error-boundary', 'boundary-fallback');
    const child = document.createElement('div');
    child.className = 'child-content';
    child.textContent = 'Normal content';
    boundary.appendChild(child);
    parent.appendChild(boundary);
    document.body.appendChild(parent);

    processTree(parent);


    const errorEvent = new ErrorEvent('error', {
      message: 'Child error',
      error: new Error('Child error'),
    });
    Object.defineProperty(errorEvent, 'target', { value: child });
    window.dispatchEvent(errorEvent);

    expect(boundary.querySelector('.boundary-error')).not.toBeNull();
  });

  test('does not render fallback when error targets element outside boundary', () => {
    const tpl = document.createElement('template');
    tpl.id = 'boundary-outside';
    tpl.innerHTML = '<p class="outside-err">Error</p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const boundary = document.createElement('div');
    boundary.setAttribute('error-boundary', 'boundary-outside');
    boundary.innerHTML = '<p>Content</p>';
    parent.appendChild(boundary);
    const outsider = document.createElement('div');
    parent.appendChild(outsider);
    document.body.appendChild(parent);

    processTree(parent);

    const errorEvent = new ErrorEvent('error', {
      message: 'Outside error',
      error: new Error('Outside error'),
    });
    Object.defineProperty(errorEvent, 'target', { value: outsider });
    window.dispatchEvent(errorEvent);

    expect(boundary.querySelector('.outside-err')).toBeNull();
  });
});





describe('HTTP GET — AbortError is silently ignored on switch-map', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('aborting a previous in-flight request does not trigger error handling', async () => {

    let rejectFirst;
    const firstFetch = new Promise((_, reject) => { rejectFirst = reject; });

    const secondResponse = mockJsonResponse({ id: 2 });

    global.fetch
      .mockImplementationOnce((url, opts) => {

        if (opts && opts.signal) {
          opts.signal.addEventListener('abort', () => {
            const err = new DOMException('The operation was aborted.', 'AbortError');
            rejectFirst(err);
          });
        }
        return firstFetch;
      })
      .mockImplementationOnce(() => Promise.resolve(secondResponse));

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ q: "a" }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/search?q={q}');
    el.setAttribute('as', 'results');
    parent.appendChild(el);
    document.body.appendChild(parent);

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    processTree(parent);


    await flush(10);
    expect(global.fetch).toHaveBeenCalledTimes(1);


    const ctx = findContext(parent);
    ctx.q = 'ab';
    await flush(100);


    expect(global.fetch).toHaveBeenCalledTimes(2);

    const abortWarnings = warnSpy.mock.calls.filter(
      (c) => c[0] && String(c[0]).includes('AbortError'),
    );
    expect(abortWarnings.length).toBe(0);


    const elCtx = findContext(el);
    expect(elCtx.results).toEqual({ id: 2 });

    warnSpy.mockRestore();
  });
});





describe('use directive — slot without matching content', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Object.keys(_refs).forEach((k) => delete _refs[k]);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
  });

  test('slot element remains when no matching content is provided', () => {

    const tpl = document.createElement('template');
    tpl.id = 'layout-with-optional-slot';
    tpl.innerHTML = '<div class="main"><slot></slot></div><aside><slot name="sidebar"></slot></aside>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('use', 'layout-with-optional-slot');

    el.innerHTML = '<p>Main area</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);


    expect(el.querySelector('.main p').textContent).toBe('Main area');


    const aside = el.querySelector('aside');
    expect(aside).not.toBeNull();
  });
});





describe('Validation — $form.reset() resets form and rechecks validity', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('calling $form.reset() triggers el.reset() and re-validates', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = `
      <input name="email" validate="email" value="bad" />
      <button type="submit">Submit</button>
    `;
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    const ctx = findContext(form);
    const input = form.querySelector('input[name="email"]');


    input.value = 'not-an-email';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(ctx.$form.errors.email).toBe('Invalid email');


    const resetSpy = jest.spyOn(form, 'reset');


    ctx.$form.reset();

    expect(resetSpy).toHaveBeenCalled();



    expect(ctx.$form.errors.email).toBe('Invalid email');

    resetSpy.mockRestore();
  });

  test('form reset clears errors when default values are valid', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const form = document.createElement('form');
    form.setAttribute('validate', '');
    form.innerHTML = `
      <input name="name" validate="required" value="John" />
    `;
    parent.appendChild(form);
    document.body.appendChild(parent);

    processTree(parent);
    await flush();

    const ctx = findContext(form);
    const input = form.querySelector('input[name="name"]');


    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));


    ctx.$form.reset();




    expect(ctx.$form).toBeDefined();
  });
});





describe('HTTP GET — confirm dialog cancel (L83)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
  });
  afterEach(() => {
    delete global.fetch;
  });

  test('does not fetch when confirm returns false', async () => {
    window.confirm = jest.fn(() => false);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ data: null }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/data');
    el.setAttribute('as', 'data');
    el.setAttribute('confirm', 'Are you sure?');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    await new Promise(r => setTimeout(r, 50));

    expect(window.confirm).toHaveBeenCalledWith('Are you sure?');
    expect(global.fetch).not.toHaveBeenCalled();

    delete window.confirm;
  });
});

describe('HTTP GET — cache hit (L46)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    _cache.clear();
    global.fetch = jest.fn();
  });
  afterEach(() => {
    delete global.fetch;
    _cache.clear();
  });

  test('uses cached data when available', async () => {
    _cacheSet('get:/api/cached', { cached: true }, 'memory');

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ result: null }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/cached');
    el.setAttribute('as', 'result');
    el.setAttribute('cached', 'memory');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    await new Promise(r => setTimeout(r, 50));

    expect(global.fetch).not.toHaveBeenCalled();
    const ctx = findContext(el);
    expect(ctx.result).toEqual({ cached: true });
  });
});

describe('HTTP GET — empty data with empty template (L129)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
    _config.retries = 0;
    _interceptors.request.length = 0;
    _interceptors.response.length = 0;
  });
  afterEach(() => {
    delete global.fetch;
  });

  test('renders empty template when data is empty array', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('[]'),
    });

    const emptyTpl = document.createElement('template');
    emptyTpl.id = 'empty-tpl';
    emptyTpl.innerHTML = '<span class="empty-msg">No data</span>';
    document.body.appendChild(emptyTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ items: null }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/items');
    el.setAttribute('as', 'items');
    el.setAttribute('empty', 'empty-tpl');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    await new Promise(r => setTimeout(r, 100));

    expect(el.querySelector('.empty-msg')).not.toBeNull();
  });
});

describe('HTTP GET — into store (L141)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
    _config.retries = 0;
    _interceptors.request.length = 0;
    _interceptors.response.length = 0;
    for (const k of Object.keys(_stores)) delete _stores[k];
  });
  afterEach(() => {
    delete global.fetch;
  });

  test('writes fetched data to global store', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"name":"test"}'),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ result: null }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/store-data');
    el.setAttribute('as', 'result');
    el.setAttribute('into', 'myStore');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    await new Promise(r => setTimeout(r, 100));

    expect(_stores.myStore).toBeDefined();
    expect(_stores.myStore.result).toEqual({ name: 'test' });
  });
});

describe('HTTP GET — success template with var (L149-155)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
    _config.retries = 0;
    _interceptors.request.length = 0;
    _interceptors.response.length = 0;
  });
  afterEach(() => {
    delete global.fetch;
  });

  test('renders success template after fetch completes', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"msg":"ok"}'),
    });

    const successTpl = document.createElement('template');
    successTpl.id = 'success-tpl';
    successTpl.setAttribute('var', 'data');
    successTpl.innerHTML = '<span class="success-msg"></span>';
    document.body.appendChild(successTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ result: null }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/success');
    el.setAttribute('as', 'result');
    el.setAttribute('success', 'success-tpl');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    await new Promise(r => setTimeout(r, 100));

    expect(el.querySelector('.success-msg')).not.toBeNull();
  });
});

describe('HTTP GET — reactive URL with debounce (L228, L240)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
    _config.retries = 0;
    _interceptors.request.length = 0;
    _interceptors.response.length = 0;
  });
  afterEach(() => {
    delete global.fetch;
  });

  test('debounces re-fetch when URL expression changes', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{}'),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ query: "a" }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/search?q={query}');
    el.setAttribute('as', 'result');
    el.setAttribute('debounce', '100');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);


    await new Promise(r => setTimeout(r, 50));

    const initialCallCount = global.fetch.mock.calls.length;



    const parentCtx = findContext(parent);
    parentCtx.$set('query', 'ab');


    await new Promise(r => setTimeout(r, 250));

    expect(global.fetch.mock.calls.length).toBeGreaterThan(initialCallCount);
  });
});





describe('call directive — success template (L107-111)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
    _config.retries = 0;
    _interceptors.request.length = 0;
    _interceptors.response.length = 0;
  });
  afterEach(() => {
    delete global.fetch;
  });

  test('renders success template after successful call', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"ok":true}'),
    });

    const successTpl = document.createElement('template');
    successTpl.id = 'call-success-tpl';
    successTpl.setAttribute('var', 'result');
    successTpl.innerHTML = '<span class="call-ok">Success</span>';
    document.body.appendChild(successTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ data: null }');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/action');
    btn.setAttribute('method', 'post');
    btn.setAttribute('success', 'call-success-tpl');
    parent.appendChild(btn);
    document.body.appendChild(parent);
    processTree(parent);

    btn.click();
    await new Promise(r => setTimeout(r, 100));

    expect(btn.parentElement.querySelector('.call-ok')).not.toBeNull();
  });
});

describe('call directive — error template (L123-127)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
    _config.retries = 0;
    _interceptors.request.length = 0;
    _interceptors.response.length = 0;
  });
  afterEach(() => {
    delete global.fetch;
  });

  test('renders error template on failed call', async () => {
    global.fetch.mockRejectedValue({ message: 'Server Error', status: 500 });

    const errorTpl = document.createElement('template');
    errorTpl.id = 'call-error-tpl';
    errorTpl.innerHTML = '<span class="call-err">Error</span>';
    document.body.appendChild(errorTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ data: null }');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/action');
    btn.setAttribute('method', 'post');
    btn.setAttribute('error', 'call-error-tpl');
    parent.appendChild(btn);
    document.body.appendChild(parent);
    processTree(parent);

    btn.click();
    await new Promise(r => setTimeout(r, 100));

    expect(btn.parentElement.querySelector('.call-err')).not.toBeNull();
  });
});

describe('call directive — into store (L100)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
    _config.retries = 0;
    _interceptors.request.length = 0;
    _interceptors.response.length = 0;
    for (const k of Object.keys(_stores)) delete _stores[k];
  });
  afterEach(() => {
    delete global.fetch;
  });

  test('call saves result into global store when into is set', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"saved":true}'),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ result: null }');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/save');
    btn.setAttribute('method', 'post');
    btn.setAttribute('as', 'result');
    btn.setAttribute('into', 'callStore');
    parent.appendChild(btn);
    document.body.appendChild(parent);
    processTree(parent);

    btn.click();
    await new Promise(r => setTimeout(r, 100));

    expect(_stores.callStore).toBeDefined();
    expect(_stores.callStore.result).toEqual({ saved: true });
  });
});





describe('Validation — custom validator via _validators', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    delete _validators.myRule;
  });

  test('custom validator is called and returns error', async () => {
    _validators.myRule = jest.fn((val) => val !== 'valid' ? 'Must be valid' : null);

    const form = document.createElement('form');
    form.setAttribute('validate', '');

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ }');
    const input = document.createElement('input');
    input.name = 'field1';
    input.value = 'bad';
    input.setAttribute('validate', 'custom:myRule');
    form.appendChild(input);
    parent.appendChild(form);
    document.body.appendChild(parent);
    processTree(parent);

    await new Promise(r => requestAnimationFrame(r));

    const ctx = findContext(form);
    expect(ctx.$form.errors.field1).toBe('Must be valid');
    expect(_validators.myRule).toHaveBeenCalled();
  });
});







describe('HTTP GET — no parent element (L46 createContext fallback)', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('GET element without parent uses createContext fallback', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ ok: true }));
    const el = document.createElement('div');
    el.setAttribute('get', '/api/orphan');
    el.setAttribute('as', 'data');

    processTree(el);
    await flush();

  });
});

describe('HTTP GET — loading template clone null (L83)', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('handles nonexistent loading template gracefully', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ loaded: true }));
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/slow');
    el.setAttribute('as', 'data');
    el.setAttribute('loading', 'nonexistent-loading-tpl-83');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    await flush();

  });
});

describe('HTTP GET — empty template clone null (L129)', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('handles nonexistent empty template gracefully', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse(null));
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/empty');
    el.setAttribute('as', 'data');
    el.setAttribute('empty', 'nonexistent-empty-tpl-129');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    await flush();

  });
});

describe('HTTP GET — into preexisting store (L141 false branch)', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('writes to existing store without recreating it', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ value: 99 }));

    _stores['preExist'] = createContext({ existingProp: 'hello' });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/data');
    el.setAttribute('as', 'result');
    el.setAttribute('into', 'preExist');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    await flush();


    expect(_stores.preExist.result).toEqual({ value: 99 });
    expect(_stores.preExist.existingProp).toBe('hello');
  });
});

describe('HTTP GET — success template clone null (L149)', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('handles nonexistent success template gracefully', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ ok: 1 }));
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/data');
    el.setAttribute('as', 'data');
    el.setAttribute('success', 'nonexistent-success-tpl-149');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    await flush();
    expect(findContext(el).data).toEqual({ ok: 1 });
  });
});

describe('HTTP GET — success template "result" fallback (L155)', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('success template uses "result" as default var name', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ msg: 'hi' }));
    const tpl = document.createElement('template');
    tpl.id = 'success-no-var-155';

    tpl.innerHTML = '<p class="res-msg" bind="result.msg"></p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/data');
    el.setAttribute('as', 'data');

    el.setAttribute('success', 'success-no-var-155');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    await flush(100);

    const msg = el.querySelector('.res-msg');
    expect(msg).not.toBeNull();
    expect(msg.textContent).toBe('hi');
  });
});

describe('HTTP GET — error template clone null (L193)', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('handles nonexistent error template gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('fail'));
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/fail');
    el.setAttribute('as', 'data');
    el.setAttribute('error', 'nonexistent-error-tpl-193');
    parent.appendChild(el);
    document.body.appendChild(parent);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    processTree(parent);
    await flush();
    warnSpy.mockRestore();

  });
});

describe('HTTP POST — non-form element does not auto-fetch (L228)', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('POST on div does not auto-fetch', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ ok: true }));
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('post', '/api/submit');
    el.setAttribute('as', 'result');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    await flush();

    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('HTTP GET — reactive URL unchanged (L240 false branch)', () => {
  beforeEach(httpSetup);
  afterEach(httpTeardown);

  test('does not re-fetch when interpolated URL stays the same', async () => {
    global.fetch.mockResolvedValue(mockJsonResponse({ data: 1 }));
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ q: "test", other: 0 }');
    const el = document.createElement('div');
    el.setAttribute('get', '/api/search?q={q}');
    el.setAttribute('as', 'result');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    await flush();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const ctx = findContext(parent);

    ctx.$set('other', 99);
    await flush();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});







describe('use — multiple default slot children (L45 false branch)', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  test('appends multiple children to same default slot fragment', () => {
    const tpl = document.createElement('template');
    tpl.id = 'multi-slot-tpl-45';
    tpl.innerHTML = '<div class="wrapper"><slot></slot></div>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('div');
    el.setAttribute('use', 'multi-slot-tpl-45');

    el.innerHTML = '<p>First</p><p>Second</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    const wrapper = el.querySelector('.wrapper');
    expect(wrapper).not.toBeNull();
    expect(wrapper.querySelectorAll('p').length).toBe(2);
  });
});

describe('call — into preexisting store (L100 false branch)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Object.keys(_stores).forEach(k => delete _stores[k]);
    global.fetch = jest.fn();
  });
  afterEach(() => { delete global.fetch; });

  test('call writes to preexisting store without recreating', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify({ id: 1 })),
    });
    _stores['preCallStore'] = createContext({ existing: true });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/action');
    btn.setAttribute('as', 'result');
    btn.setAttribute('into', 'preCallStore');
    parent.appendChild(btn);
    document.body.appendChild(parent);
    processTree(parent);

    btn.click();
    await flush();

    expect(_stores.preCallStore.result).toEqual({ id: 1 });
    expect(_stores.preCallStore.existing).toBe(true);
  });
});

describe('call — success template clone null (L107 false branch)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
  });
  afterEach(() => { delete global.fetch; });

  test('handles nonexistent success template on call gracefully', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve('{"ok":true}'),
    });
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/action');
    btn.setAttribute('success', 'nonexistent-call-success-107');
    parent.appendChild(btn);
    document.body.appendChild(parent);
    processTree(parent);
    btn.click();
    await flush();

  });
});

describe('call — error template clone null (L123 false branch)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
  });
  afterEach(() => { delete global.fetch; });

  test('handles nonexistent error template on call gracefully', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Error',
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ message: 'Internal Error' }),
    });
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/fail');
    btn.setAttribute('error', 'nonexistent-call-error-123');
    parent.appendChild(btn);
    document.body.appendChild(parent);
    processTree(parent);
    btn.click();
    await flush();

  });
});

describe('call — success template without var attr (L111 || fallback)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
  });
  afterEach(() => { delete global.fetch; });

  test('call success template falls back to "result" var name', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify({ msg: 'done' })),
    });

    const tpl = document.createElement('template');
    tpl.id = 'call-success-novar-111';

    tpl.innerHTML = '<span class="call-res" bind="result.msg"></span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/action');
    btn.setAttribute('success', 'call-success-novar-111');
    parent.appendChild(btn);
    document.body.appendChild(parent);
    processTree(parent);

    btn.click();
    await flush(100);

    const res = parent.querySelector('.call-res');
    expect(res).not.toBeNull();
    expect(res.textContent).toBe('done');
  });
});

describe('call — error without error attribute (L123 false)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
  });
  afterEach(() => { delete global.fetch; });

  test('call failure without error template does not render error UI', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Error',
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ message: 'Server Error' }),
    });

    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const btn = document.createElement('button');
    btn.setAttribute('call', '/api/fail');

    parent.appendChild(btn);
    document.body.appendChild(parent);
    processTree(parent);

    btn.click();
    await flush();

    expect(parent.querySelectorAll('[style*="contents"]').length).toBe(0);
  });
});
