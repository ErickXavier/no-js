import { _config } from '../src/globals.js';
import { createContext } from '../src/context.js';
import { findContext, _clearDeclared, _cloneTemplate, _sanitizeHtml, _loadRemoteTemplates, _loadTemplateElement, _loadRemoteTemplatesPhase1, _loadRemoteTemplatesPhase2, _processTemplateIncludes, _templateHtmlCache } from '../src/dom.js';

describe('DOM Helpers', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('findContext', () => {
    test('returns context from element', () => {
      const div = document.createElement('div');
      const ctx = createContext({ x: 1 });
      div.__ctx = ctx;
      expect(findContext(div)).toBe(ctx);
    });

    test('walks up to find parent context', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      const ctx = createContext({ x: 1 });
      parent.__ctx = ctx;
      expect(findContext(child)).toBe(ctx);
    });

    test('returns empty context if none found', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      const ctx = findContext(div);
      expect(ctx.__isProxy).toBe(true);
    });
  });

  describe('_clearDeclared', () => {
    test('clears __declared on descendant elements', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('span');
      const child2 = document.createElement('p');
      child1.__declared = true;
      child2.__declared = true;
      parent.appendChild(child1);
      parent.appendChild(child2);

      _clearDeclared(parent);
      expect(child1.__declared).toBe(false);
      expect(child2.__declared).toBe(false);
    });
  });

  describe('_cloneTemplate', () => {
    test('clones template by ID', () => {
      const tpl = document.createElement('template');
      tpl.id = 'my-tpl';
      tpl.innerHTML = '<p>Hello</p>';
      document.body.appendChild(tpl);

      const clone = _cloneTemplate('my-tpl');
      expect(clone).not.toBeNull();
      expect(clone.querySelector('p').textContent).toBe('Hello');
    });

    test('handles # prefix in ID', () => {
      const tpl = document.createElement('template');
      tpl.id = 'my-tpl2';
      tpl.innerHTML = '<span>World</span>';
      document.body.appendChild(tpl);

      const clone = _cloneTemplate('#my-tpl2');
      expect(clone).not.toBeNull();
      expect(clone.querySelector('span').textContent).toBe('World');
    });

    test('returns null for non-existent template', () => {
      expect(_cloneTemplate('nonexistent')).toBeNull();
    });

    test('returns null for empty id', () => {
      expect(_cloneTemplate('')).toBeNull();
    });

    test('returns null for null id', () => {
      expect(_cloneTemplate(null)).toBeNull();
    });
  });

  describe('_sanitizeHtml', () => {
    test('removes script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const result = _sanitizeHtml(html);
      expect(result).not.toContain('<script');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    test('removes event handlers', () => {
      const html = '<div onclick="alert(1)" onmouseover="hack()">content</div>';
      const result = _sanitizeHtml(html);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseover');
    });

    test('removes javascript: protocol', () => {
      const html = '<a href="javascript:alert(1)">Link</a>';
      const result = _sanitizeHtml(html);
      expect(result).not.toContain('javascript:');
    });

    test('passes through safe HTML', () => {
      const html = '<p class="safe">Hello <strong>World</strong></p>';
      expect(_sanitizeHtml(html)).toBe(html);
    });

    test('skips sanitization when disabled', () => {
      _config.sanitize = false;
      const html = '<script>alert(1)</script>';
      expect(_sanitizeHtml(html)).toBe(html);
      _config.sanitize = true;
    });
  });
});

describe('_loadRemoteTemplates', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
    _templateHtmlCache.clear();
  });

  test('loads HTML into template with src', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<p>Remote Content</p>'),
    });

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/partials/header.html');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadRemoteTemplates();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/partials/header.html'),
    );
    expect(wrapper.innerHTML).toBe('<p>Remote Content</p>');
  });

  test('handles fetch failure gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/partials/fail.html');
    document.body.appendChild(tpl);

    await expect(_loadRemoteTemplates()).resolves.not.toThrow();
  });

  test('loads multiple templates in parallel', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<p>A</p>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<p>B</p>'),
      });

    const wrapper = document.createElement('div');
    const tpl1 = document.createElement('template');
    tpl1.setAttribute('src', '/a.html');
    const tpl2 = document.createElement('template');
    tpl2.setAttribute('src', '/b.html');
    wrapper.appendChild(tpl1);
    wrapper.appendChild(tpl2);
    document.body.appendChild(wrapper);

    await _loadRemoteTemplates();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(wrapper.innerHTML).toBe('<p>A</p><p>B</p>');
  });

  test('resolves ./ paths relative to parent template folder', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<template src="./sidebar.tpl"></template>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<nav>Sidebar</nav>'),
      });

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', 'templates/docs.tpl');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadRemoteTemplates();

    expect(global.fetch).toHaveBeenCalledWith('templates/docs.tpl');
    expect(global.fetch).toHaveBeenCalledWith('templates/sidebar.tpl');
    expect(wrapper.innerHTML).toContain('<nav>Sidebar</nav>');
  });

  test('./ resolution works with nested levels', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<template src="./child.tpl"></template>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<p>child</p>'),
      });

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', 'a/b/parent.tpl');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadRemoteTemplates();

    expect(global.fetch).toHaveBeenCalledWith('a/b/parent.tpl');
    expect(global.fetch).toHaveBeenCalledWith('a/b/child.tpl');
    expect(wrapper.innerHTML).toContain('<p>child</p>');
  });
});

describe('_cloneTemplate — element without .content', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('returns null when element found by ID has no .content property', () => {
    const div = document.createElement('div');
    div.id = 'plain-div';
    document.body.appendChild(div);

    expect(_cloneTemplate('plain-div')).toBeNull();
  });
});

describe('_loadRemoteTemplates — uncovered branches', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('returns immediately when scope has no template[src] (L67)', async () => {
    const div = document.createElement('div');
    div.innerHTML = '<p>No templates</p>';
    document.body.appendChild(div);

    await _loadRemoteTemplates(div);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('./ path with no ancestor __srcBase strips prefix (L56)', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<p>Orphan</p>'),
    });

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', './orphan.tpl');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadRemoteTemplates();

    expect(global.fetch).toHaveBeenCalledWith('orphan.tpl');
    expect(wrapper.innerHTML).toContain('Orphan');
  });

  test('route template is NOT inlined into parent (route branch)', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<p>Route content</p>'),
    });

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/pages/home.html');
    tpl.setAttribute('route', '/home');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadRemoteTemplates();

    expect(wrapper.querySelector('template[route]')).not.toBeNull();
    expect(wrapper.querySelector('p')).toBeNull();
  });

  test('skips __srcBase when tpl.content is falsy (L83)', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<span>ok</span>'),
    });

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/frag.html');
    tpl.setAttribute('route', '/frag');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    Object.defineProperty(tpl, 'content', {
      value: null,
      writable: true,
      configurable: true,
    });

    await _loadRemoteTemplates();

    expect(global.fetch).toHaveBeenCalledWith('/frag.html');
    expect(wrapper.querySelector('template[route]')).not.toBeNull();
  });
});

describe('dom.js — _loadRemoteTemplates with scoped root parameter (L67)', () => {
  let origFetch;

  beforeEach(() => {
    origFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = origFetch;
    document.body.innerHTML = '';
  });

  test('loads templates scoped to a specific root element (not document)', async () => {
    global.fetch = jest.fn(() => ({
      ok: true,
      text: () => Promise.resolve('<p>scoped content</p>'),
    }));

    const root = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/scoped.html');
    root.appendChild(tpl);
    document.body.appendChild(root);

    await _loadRemoteTemplates(root);

    expect(global.fetch).toHaveBeenCalledWith('/scoped.html');
  });

  test('returns early when scoped root has no template[src] elements', async () => {
    global.fetch = jest.fn();

    const root = document.createElement('div');
    root.innerHTML = '<p>no templates here</p>';
    document.body.appendChild(root);

    await _loadRemoteTemplates(root);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('dom.js — non-route template inline expansion (L95)', () => {
  let origFetch;

  beforeEach(() => {
    origFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = origFetch;
    document.body.innerHTML = '';
  });

  test('non-route template is replaced with its content inline', async () => {
    global.fetch = jest.fn(() => ({
      ok: true,
      text: () => Promise.resolve('<span class="included">hello</span>'),
    }));

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/include.html');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadRemoteTemplates();

    expect(wrapper.querySelector('template[src]')).toBeNull();
    expect(wrapper.querySelector('.included')).not.toBeNull();
  });

  test('route template is NOT replaced inline', async () => {
    global.fetch = jest.fn(() => ({
      ok: true,
      text: () => Promise.resolve('<span class="route-content">page</span>'),
    }));

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/page.html');
    tpl.setAttribute('route', '/page');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadRemoteTemplates();

    expect(wrapper.querySelector('template[route]')).not.toBeNull();
  });
});

describe('_loadTemplateElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<p>content</p>'),
    });
  });

  afterEach(() => {
    delete global.fetch;
    document.body.innerHTML = '';
    _templateHtmlCache.clear();
  });

  test('skips already-loaded templates', async () => {
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/test.html');
    tpl.__srcLoaded = true;
    document.body.appendChild(tpl);

    await _loadTemplateElement(tpl);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('marks tpl.__srcLoaded before fetching', async () => {
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/test.html');
    tpl.setAttribute('route', '/test'); 
    document.body.appendChild(tpl);

    let flagDuringFetch = false;
    global.fetch = jest.fn().mockImplementation(() => {
      flagDuringFetch = tpl.__srcLoaded;
      return Promise.resolve({ text: () => Promise.resolve('<p>content</p>') });
    });

    await _loadTemplateElement(tpl);

    expect(flagDuringFetch).toBe(true);
    expect(tpl.__srcLoaded).toBe(true);
  });

  test('loads a template and populates content', async () => {
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/test.html');
    tpl.setAttribute('route', '/test'); 
    document.body.appendChild(tpl);

    await _loadTemplateElement(tpl);

    expect(global.fetch).toHaveBeenCalledWith('/test.html');
    expect(tpl.innerHTML).toBe('<p>content</p>');
  });

  test('injects non-route template content into DOM', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<p>Injected</p>'),
    });

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/include.html');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadTemplateElement(tpl);

    expect(wrapper.querySelector('template')).toBeNull();
    expect(wrapper.querySelector('p')).not.toBeNull();
    expect(wrapper.querySelector('p').textContent).toBe('Injected');
  });

  test('does not inject route templates', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<p>About</p>'),
    });

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/about.html');
    tpl.setAttribute('route', '/about');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadTemplateElement(tpl);

    expect(wrapper.querySelector('template[route]')).not.toBeNull();
    expect(wrapper.querySelector('p')).toBeNull();
  });

  test('loading: inserts placeholder synchronously before fetch and removes it after', async () => {
    let resolveText;
    global.fetch = jest.fn().mockReturnValue(
      new Promise(resolve => { resolveText = () => resolve({ text: () => Promise.resolve('<p>Real</p>') }); })
    );

    const skeleton = document.createElement('template');
    skeleton.id = 'skl';
    skeleton.innerHTML = '<div class="skeleton">Loading...</div>';
    document.body.appendChild(skeleton);

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/heavy.html');
    tpl.setAttribute('loading', '#skl');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    const loadPromise = _loadTemplateElement(tpl);

    expect(wrapper.querySelector('.skeleton')).not.toBeNull();

    resolveText();
    await loadPromise;

    expect(wrapper.querySelector('.skeleton')).toBeNull();
    expect(wrapper.querySelector('p').textContent).toBe('Real');
  });

  test('loading: removes placeholder even when fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const skeleton = document.createElement('template');
    skeleton.id = 'err-skl';
    skeleton.innerHTML = '<div class="err-skeleton">Loading...</div>';
    document.body.appendChild(skeleton);

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/fail.html');
    tpl.setAttribute('loading', 'err-skl');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadTemplateElement(tpl);

    expect(wrapper.querySelector('.err-skeleton')).toBeNull();
  });

  test('loading: no-op when referenced template does not exist', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<p>ok</p>'),
    });

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/ok.html');
    tpl.setAttribute('loading', '#ghost');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await expect(_loadTemplateElement(tpl)).resolves.not.toThrow();
    expect(wrapper.querySelector('p').textContent).toBe('ok');
  });

  test('route template does NOT recursively load nested <template src> in content', async () => {
    
    
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        text: () => Promise.resolve('<template src="./section.tpl"></template>'),
      });

    const wrapper = document.createElement('div');
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/page.tpl');
    tpl.setAttribute('route', '/page');
    wrapper.appendChild(tpl);
    document.body.appendChild(wrapper);

    await _loadTemplateElement(tpl);

    
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/page.tpl');
    
    expect(tpl.content.querySelector('template[src="./section.tpl"]')).not.toBeNull();
  });

  test('caches fetched HTML and skips re-fetch on second call (same URL, new element)', async () => {
    
    
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<p>Cached</p>'),
    });

    
    const wrapper1 = document.createElement('div');
    const tpl1 = document.createElement('template');
    tpl1.setAttribute('src', '/cached-page.tpl');
    tpl1.setAttribute('route', '/cached-page');
    wrapper1.appendChild(tpl1);
    document.body.appendChild(wrapper1);
    await _loadTemplateElement(tpl1);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    
    const wrapper2 = document.createElement('div');
    const tpl2 = document.createElement('template');
    tpl2.setAttribute('src', '/cached-page.tpl');
    tpl2.setAttribute('route', '/cached-page');
    wrapper2.appendChild(tpl2);
    document.body.appendChild(wrapper2);
    await _loadTemplateElement(tpl2);

    
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(tpl2.innerHTML).toBe('<p>Cached</p>');
  });

  test('re-fetches when _config.templates.cache is false', async () => {
    _config.templates.cache = false;
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<p>Fresh</p>'),
    });

    
    const wrapper1 = document.createElement('div');
    const tpl1 = document.createElement('template');
    tpl1.setAttribute('src', '/uncached.tpl');
    tpl1.setAttribute('route', '/uncached');
    wrapper1.appendChild(tpl1);
    document.body.appendChild(wrapper1);
    await _loadTemplateElement(tpl1);

    
    const wrapper2 = document.createElement('div');
    const tpl2 = document.createElement('template');
    tpl2.setAttribute('src', '/uncached.tpl');
    tpl2.setAttribute('route', '/uncached');
    wrapper2.appendChild(tpl2);
    document.body.appendChild(wrapper2);
    await _loadTemplateElement(tpl2);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    _config.templates.cache = true;
  });
});




describe('_processTemplateIncludes', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('replaces template[include] with a clone of the referenced template', () => {
    const source = document.createElement('template');
    source.id = 'my-skeleton';
    source.innerHTML = '<div class="skeleton">Loading...</div>';
    document.body.appendChild(source);

    const wrapper = document.createElement('div');
    const inc = document.createElement('template');
    inc.setAttribute('include', 'my-skeleton');
    wrapper.appendChild(inc);
    document.body.appendChild(wrapper);

    _processTemplateIncludes();

    expect(wrapper.querySelector('template[include]')).toBeNull();
    expect(wrapper.querySelector('.skeleton')).not.toBeNull();
    expect(wrapper.querySelector('.skeleton').textContent).toBe('Loading...');
  });

  test('supports # prefix on include id', () => {
    const source = document.createElement('template');
    source.id = 'hash-tpl';
    source.innerHTML = '<span class="hash-content">ok</span>';
    document.body.appendChild(source);

    const wrapper = document.createElement('div');
    const inc = document.createElement('template');
    inc.setAttribute('include', '#hash-tpl');
    wrapper.appendChild(inc);
    document.body.appendChild(wrapper);

    _processTemplateIncludes();

    expect(wrapper.querySelector('.hash-content')).not.toBeNull();
  });

  test('silently skips unknown include ids', () => {
    const wrapper = document.createElement('div');
    const inc = document.createElement('template');
    inc.setAttribute('include', 'nonexistent');
    wrapper.appendChild(inc);
    document.body.appendChild(wrapper);

    expect(() => _processTemplateIncludes()).not.toThrow();
    
    expect(wrapper.querySelector('template[include]')).not.toBeNull();
  });

  test('clones independently — multiple includes of same template are separate nodes', () => {
    const source = document.createElement('template');
    source.id = 'multi-tpl';
    source.innerHTML = '<p class="item">A</p>';
    document.body.appendChild(source);

    const wrapper = document.createElement('div');
    for (let i = 0; i < 3; i++) {
      const inc = document.createElement('template');
      inc.setAttribute('include', 'multi-tpl');
      wrapper.appendChild(inc);
    }
    document.body.appendChild(wrapper);

    _processTemplateIncludes();

    const items = wrapper.querySelectorAll('.item');
    expect(items).toHaveLength(3);
    items[0].textContent = 'modified';
    expect(items[1].textContent).toBe('A'); 
  });

  test('scoped to a root element when provided', () => {
    const source = document.createElement('template');
    source.id = 'scoped-tpl';
    source.innerHTML = '<b>scoped</b>';
    document.body.appendChild(source);

    const inside = document.createElement('div');
    const inc = document.createElement('template');
    inc.setAttribute('include', 'scoped-tpl');
    inside.appendChild(inc);

    const outside = document.createElement('div');
    const inc2 = document.createElement('template');
    inc2.setAttribute('include', 'scoped-tpl');
    outside.appendChild(inc2);

    document.body.appendChild(inside);
    document.body.appendChild(outside);

    _processTemplateIncludes(inside);

    expect(inside.querySelector('b')).not.toBeNull();
    expect(outside.querySelector('template[include]')).not.toBeNull(); 
  });
});





describe('_loadRemoteTemplatesPhase1', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<p>content</p>'),
    });
  });

  afterEach(() => {
    delete global.fetch;
    document.body.innerHTML = '';
  });

  test('loads priority templates first', async () => {
    
    const tplPriority = document.createElement('template');
    tplPriority.setAttribute('src', '/priority.html');
    tplPriority.setAttribute('lazy', 'priority');
    tplPriority.setAttribute('route', '/priority');
    document.body.appendChild(tplPriority);

    
    const wrapper = document.createElement('div');
    const tplNonRoute = document.createElement('template');
    tplNonRoute.setAttribute('src', '/header.html');
    wrapper.appendChild(tplNonRoute);
    document.body.appendChild(wrapper);

    await _loadRemoteTemplatesPhase1('/home');

    expect(global.fetch).toHaveBeenCalledWith('/priority.html');
    expect(global.fetch).toHaveBeenCalledWith('/header.html');
  });

  test('skips ondemand templates', async () => {
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/about.html');
    tpl.setAttribute('route', '/about');
    tpl.setAttribute('lazy', 'ondemand');
    document.body.appendChild(tpl);

    await _loadRemoteTemplatesPhase1('/home');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('loads default route template in phase 1', async () => {
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/home.html');
    tpl.setAttribute('route', '/home');
    document.body.appendChild(tpl);

    await _loadRemoteTemplatesPhase1('/home');

    expect(global.fetch).toHaveBeenCalledWith('/home.html');
  });

  test('skips non-default route templates in phase 1', async () => {
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/about.html');
    tpl.setAttribute('route', '/about');
    document.body.appendChild(tpl);

    await _loadRemoteTemplatesPhase1('/home');

    expect(global.fetch).not.toHaveBeenCalled();
  });
});





describe('_loadRemoteTemplatesPhase2', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<p>content</p>'),
    });
  });

  afterEach(() => {
    delete global.fetch;
    document.body.innerHTML = '';
  });

  test('loads non-default route templates', async () => {
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/about.html');
    tpl.setAttribute('route', '/about');
    document.body.appendChild(tpl);

    await _loadRemoteTemplatesPhase2();

    expect(global.fetch).toHaveBeenCalledWith('/about.html');
  });

  test('skips ondemand templates', async () => {
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/about.html');
    tpl.setAttribute('route', '/about');
    tpl.setAttribute('lazy', 'ondemand');
    document.body.appendChild(tpl);

    await _loadRemoteTemplatesPhase2();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('skips already-loaded templates', async () => {
    const tpl = document.createElement('template');
    tpl.setAttribute('src', '/about.html');
    tpl.setAttribute('route', '/about');
    tpl.__srcLoaded = true;
    document.body.appendChild(tpl);

    await _loadRemoteTemplatesPhase2();

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
