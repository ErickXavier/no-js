



import { _config, _stores, setRouterInstance } from '../src/globals.js';
import { _createRouter } from '../src/router.js';

describe('Router', () => {
  let router;

  beforeEach(() => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    document.body.innerHTML = '';
    window.location.hash = '';

    
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    setRouterInstance(null);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  test('creates router with correct API', () => {
    router = _createRouter();
    expect(router.current).toBeDefined();
    expect(typeof router.push).toBe('function');
    expect(typeof router.replace).toBe('function');
    expect(typeof router.back).toBe('function');
    expect(typeof router.forward).toBe('function');
    expect(typeof router.on).toBe('function');
    expect(typeof router.register).toBe('function');
    expect(typeof router.init).toBe('function');
  });

  test('current starts with empty path', () => {
    router = _createRouter();
    expect(router.current.path).toBe('');
    expect(router.current.params).toEqual({});
    expect(router.current.query).toEqual({});
    expect(router.current.hash).toBe('');
  });

  test('register adds routes', () => {
    router = _createRouter();
    const tpl = document.createElement('template');
    router.register('/home', tpl);
    router.register('/about', tpl);
    
  });

  test('push navigates to new route (hash mode)', () => {
    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<div>Home Page</div>';
    router.register('/home', tpl);

    router.push('/home');
    expect(router.current.path).toBe('/home');
    expect(window.location.hash).toBe('#/home');
  });

  test('replace navigates without history entry', () => {
    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<div>About</div>';
    router.register('/about', tpl);

    router.replace('/about');
    expect(router.current.path).toBe('/about');
  });

  test('parses query parameters', () => {
    router = _createRouter();
    router.push('/search?q=hello&page=2');
    expect(router.current.query.q).toBe('hello');
    expect(router.current.query.page).toBe('2');
  });

  test('parses query parameters and hash together', () => {
    router = _createRouter();
    router.push('/search?q=hello&page=2#section');
    expect(router.current.path).toBe('/search');
    expect(router.current.query.q).toBe('hello');
    expect(router.current.query.page).toBe('2');
    expect(router.current.hash).toBe('#section');
  });

  test('parses hash without query', () => {
    router = _createRouter();
    router.push('/about#team');
    expect(router.current.path).toBe('/about');
    expect(router.current.query).toEqual({});
    expect(router.current.hash).toBe('#team');
  });

  test('matches route params', () => {
    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<div>User</div>';
    router.register('/users/:id', tpl);

    router.push('/users/42');
    expect(router.current.params.id).toBe('42');
  });

  test('matches route with multiple params', () => {
    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<div>Post</div>';
    router.register('/users/:userId/posts/:postId', tpl);

    router.push('/users/1/posts/99');
    expect(router.current.params.userId).toBe('1');
    expect(router.current.params.postId).toBe('99');
  });

  test('on() listener receives navigation events', async () => {
    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<div>Page</div>';
    router.register('/page', tpl);

    const listener = jest.fn();
    router.on(listener);
    await router.push('/page');

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/page' }),
    );
  });

  test('on() returns unsubscriber', async () => {
    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<div>Page</div>';
    router.register('/page', tpl);
    router.register('/other', tpl);

    const listener = jest.fn();
    const unsub = router.on(listener);
    await router.push('/page');
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
    await router.push('/other');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('renders into route-view outlet', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p class="routed">Route Content</p>';
    router.register('/page', tpl);

    await router.push('/page');
    expect(outlet.querySelector('.routed')).not.toBeNull();
    expect(outlet.querySelector('.routed').textContent).toBe('Route Content');
  });

  test('clears outlet when navigating to unmatched route', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Content</p>';
    router.register('/valid', tpl);

    await router.push('/valid');
    expect(outlet.querySelector('p')).not.toBeNull();

    await router.push('/unknown');
    expect(outlet.querySelector('p')).toBeNull();
  });

  test('init collects route templates from DOM', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/dashboard');
    tpl.innerHTML = '<p class="dash">Dashboard</p>';
    document.body.appendChild(tpl);

    router = _createRouter();
    setRouterInstance(router);
    window.location.hash = '#/dashboard';
    await router.init();

    expect(outlet.querySelector('.dash')).not.toBeNull();
  });

  test('scrolls to top on navigation', () => {
    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<div>Content</div>';
    router.register('/scroll-test', tpl);

    router.push('/scroll-test');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('route guard blocks navigation and redirects', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    router = _createRouter();

    const protectedTpl = document.createElement('template');
    protectedTpl.setAttribute('guard', 'false');
    protectedTpl.setAttribute('redirect', '/login');
    protectedTpl.innerHTML = '<p>Protected</p>';
    router.register('/admin', protectedTpl);

    const loginTpl = document.createElement('template');
    loginTpl.innerHTML = '<p class="login">Login</p>';
    router.register('/login', loginTpl);

    await router.push('/admin');
    
    expect(router.current.path).toBe('/login');
    expect(outlet.querySelector('.login')).not.toBeNull();
  });

  test('active class on route links', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const link = document.createElement('a');
    link.setAttribute('route', '/page');
    link.textContent = 'Go';
    document.body.appendChild(link);

    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Page</p>';
    router.register('/page', tpl);

    await router.push('/page');
    expect(link.classList.contains('active')).toBe(true);
  });

  test('nested templates in route content are loaded after outlet insertion', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    let outletHadContentDuringNestedFetch = false;

    global.fetch = jest.fn()
      
      .mockResolvedValueOnce({
        text: () => Promise.resolve('<div id="section-wrap"><template src="./section.tpl"></template></div>'),
      })
      
      .mockImplementationOnce(() => {
        
        outletHadContentDuringNestedFetch = outlet.querySelector('#section-wrap') !== null;
        return Promise.resolve({ text: () => Promise.resolve('<p class="section-loaded">Done</p>') });
      });

    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/nested-test');
    tpl.setAttribute('src', '/nested-page.tpl');
    document.body.appendChild(tpl);
    router.register('/nested-test', tpl);

    await router.push('/nested-test');

    expect(outletHadContentDuringNestedFetch).toBe(true);
    expect(outlet.querySelector('.section-loaded')).not.toBeNull();
    expect(outlet.querySelector('.section-loaded').textContent).toBe('Done');
  });

  test('__srcBase from route template is preserved to wrapper so ./ nested paths resolve correctly', async () => {
    
    
    
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    global.fetch = jest.fn()
      
      .mockResolvedValueOnce({
        text: () => Promise.resolve('<template src="./section.tpl"></template>'),
      })
      
      .mockResolvedValueOnce({
        text: () => Promise.resolve('<p class="ok">ok</p>'),
      });

    router = _createRouter();
    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/srcbase-test');
    tpl.setAttribute('src', 'templates/page.tpl');
    document.body.appendChild(tpl);
    router.register('/srcbase-test', tpl);

    await router.push('/srcbase-test');

    
    expect(global.fetch).toHaveBeenCalledWith('templates/section.tpl');
    expect(outlet.querySelector('.ok')).not.toBeNull();
  });
});





describe('router.js — hash mode hashchange', () => {
  test('navigates on hashchange event in hash mode', () => {
    _config.router = { mode: 'hash', base: '' };

    const routeView = document.createElement('div');
    routeView.setAttribute('route-view', '');
    document.body.appendChild(routeView);

    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/about');
    tpl.innerHTML = '<p>About page</p>';
    document.body.appendChild(tpl);

    const router = _createRouter();
    setRouterInstance(router);
    router.init();

    window.location.hash = '#/about';
    window.dispatchEvent(new Event('hashchange'));

    expect(router.current.path).toBe('/about');
  });
});





describe('router.js — history mode popstate', () => {
  test('navigates on popstate event in history mode', () => {
    _config.router = { mode: 'history', base: '' };

    const routeView = document.createElement('div');
    routeView.setAttribute('route-view', '');
    document.body.appendChild(routeView);

    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/contact');
    tpl.innerHTML = '<p>Contact page</p>';
    document.body.appendChild(tpl);

    const router = _createRouter();
    setRouterInstance(router);
    router.init();

    window.history.pushState({}, '', '/contact');
    window.dispatchEvent(new Event('popstate'));

    expect(router.current.path).toBe('/contact');
  });
});





describe('Router — history mode', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    _config.router = { mode: 'history', base: '/', scrollBehavior: 'top' };
    window.scrollTo = jest.fn();
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    setRouterInstance(null);
  });

  test('push uses history.pushState in history mode', () => {
    const pushSpy = jest.spyOn(window.history, 'pushState');
    const router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Page</p>';
    router.register('/page', tpl);

    router.push('/page');

    expect(pushSpy).toHaveBeenCalledWith({}, '', '/page');
    expect(router.current.path).toBe('/page');
    pushSpy.mockRestore();
  });

  test('replace uses history.replaceState in history mode', () => {
    const replaceSpy = jest.spyOn(window.history, 'replaceState');
    const router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Page</p>';
    router.register('/page', tpl);

    router.replace('/page');

    expect(replaceSpy).toHaveBeenCalledWith({}, '', '/page');
    replaceSpy.mockRestore();
  });
});





describe('Router — back and forward', () => {
  test('back calls history.back', () => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    const backSpy = jest.spyOn(window.history, 'back');
    const router = _createRouter();
    router.back();
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  test('forward calls history.forward', () => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    const forwardSpy = jest.spyOn(window.history, 'forward');
    const router = _createRouter();
    router.forward();
    expect(forwardSpy).toHaveBeenCalled();
    forwardSpy.mockRestore();
  });
});





describe('Router — route-active-exact', () => {
  beforeEach(() => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    window.scrollTo = jest.fn();
    setRouterInstance(null);
  });

  test('exact active class only on exact match', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const link = document.createElement('a');
    link.setAttribute('route', '/users');
    link.setAttribute('route-active-exact', 'exact-active');
    document.body.appendChild(link);

    const router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Users</p>';
    router.register('/users', tpl);
    router.register('/users/1', tpl);

    await router.push('/users');
    expect(link.classList.contains('exact-active')).toBe(true);

    await router.push('/users/1');
    expect(link.classList.contains('exact-active')).toBe(false);
  });
});





describe('Router — route link click delegation', () => {
  beforeEach(() => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    window.scrollTo = jest.fn();
    window.location.hash = '';
    document.body.innerHTML = '';
    setRouterInstance(null);
  });

  test('clicking route link navigates', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const router = _createRouter();
    setRouterInstance(router);
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p class="about-page">About</p>';
    router.register('/', tpl);
    router.register('/about', tpl);

    await router.init();

    
    await router.push('/about');

    expect(router.current.path).toBe('/about');
    expect(outlet.querySelector('.about-page')).not.toBeNull();
  });
});





describe('Router — transition on outlet', () => {
  beforeEach(() => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    window.scrollTo = jest.fn();
    setRouterInstance(null);
  });

  test('applies transition class from route-view', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    outlet.setAttribute('transition', 'page');
    document.body.appendChild(outlet);

    const router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Page</p>';
    router.register('/animated', tpl);

    await router.push('/animated');

    const wrapper = outlet.firstElementChild;
    expect(wrapper).not.toBeNull();
  });
});





describe('Router — scroll behavior none', () => {
  test('does not scroll when scrollBehavior is not "top"', () => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'none' };
    window.scrollTo = jest.fn();

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>No scroll</p>';
    router.register('/no-scroll', tpl);

    router.push('/no-scroll');

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});





describe('Router — init with history mode', () => {
  test('init reads pathname in history mode', () => {
    _config.router = { mode: 'history', base: '/', scrollBehavior: 'top' };
    window.scrollTo = jest.fn();

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const router = _createRouter();
    setRouterInstance(router);

    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/');
    tpl.innerHTML = '<p class="home">Home</p>';
    document.body.appendChild(tpl);

    router.init();

    expect(router.current).toBeDefined();
  });
});





describe('Router — guard with null templateEl', () => {
  beforeEach(() => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    window.scrollTo = jest.fn();
    setRouterInstance(null);
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  test('navigates without error when templateEl is null', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const router = _createRouter();
    router.register('/ghost', null);

    await router.push('/ghost');

    expect(router.current.path).toBe('/ghost');
    
    expect(outlet.innerHTML).toBe('');
  });
});





describe('Router — popstate handler with base stripping', () => {
  beforeEach(() => {
    _config.router = { mode: 'history', base: '/app', scrollBehavior: 'top' };
    window.scrollTo = jest.fn();
    setRouterInstance(null);
    document.body.innerHTML = '';
  });

  test('popstate handler strips base from pathname', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/settings');
    tpl.innerHTML = '<p class="settings">Settings</p>';
    document.body.appendChild(tpl);

    
    window.history.pushState({}, '', '/app/');

    
    let popstateHandler;
    const origAdd = window.addEventListener;
    window.addEventListener = function (event, handler, ...rest) {
      if (event === 'popstate') popstateHandler = handler;
      return origAdd.call(this, event, handler, ...rest);
    };

    const router = _createRouter();
    setRouterInstance(router);
    await router.init();

    
    window.addEventListener = origAdd;

    
    window.history.pushState({}, '', '/app/settings');

    
    popstateHandler();

    expect(router.current.path).toBe('/settings');
  });
});





describe('Router — init collects routes and reads initial path', () => {
  afterEach(() => {
    setRouterInstance(null);
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  test('hash mode init reads current hash and renders matching route (L184/L193)', async () => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    window.scrollTo = jest.fn();

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/welcome');
    tpl.innerHTML = '<p class="welcome">Welcome</p>';
    document.body.appendChild(tpl);

    window.location.hash = '#/welcome';

    const router = _createRouter();
    setRouterInstance(router);
    await router.init();

    expect(router.current.path).toBe('/welcome');
    expect(outlet.querySelector('.welcome')).not.toBeNull();
  });

  test('hash mode init defaults to / when hash is empty', async () => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    window.scrollTo = jest.fn();

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    window.location.hash = '';

    const router = _createRouter();
    setRouterInstance(router);
    await router.init();

    expect(router.current.path).toBe('/');
  });

  test('history mode init reads pathname and strips base (L197)', async () => {
    _config.router = { mode: 'history', base: '/', scrollBehavior: 'top' };
    window.scrollTo = jest.fn();

    
    window.history.pushState({}, '', '/');

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/');
    tpl.innerHTML = '<p class="root">Root</p>';
    document.body.appendChild(tpl);

    const router = _createRouter();
    setRouterInstance(router);
    await router.init();

    expect(router.current.path).toBe('/');
    expect(outlet.querySelector('.root')).not.toBeNull();
  });
});





describe('Router — popstate handler in history mode (L173-177)', () => {
  beforeEach(() => {
    _config.router = { mode: 'history', base: '/', scrollBehavior: 'top' };
    document.body.innerHTML = '';
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    setRouterInstance(null);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    document.body.innerHTML = '';
  });

  test('popstate event triggers navigate in history mode', async () => {
    _config.router = { mode: 'history', base: '', scrollBehavior: 'top' };

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tplHome = document.createElement('template');
    tplHome.setAttribute('route', '/');
    tplHome.innerHTML = '<p class="home">Home</p>';
    document.body.appendChild(tplHome);

    const tplAbout = document.createElement('template');
    tplAbout.setAttribute('route', '/about');
    tplAbout.innerHTML = '<p class="about">About</p>';
    document.body.appendChild(tplAbout);

    const router = _createRouter();
    setRouterInstance(router);
    
    router.init();

    
    window.history.pushState({}, '', '/about');
    window.dispatchEvent(new Event('popstate'));

    expect(router.current.path).toBe('/about');
  });

  test('popstate with non-empty base path strips base correctly', async () => {
    _config.router = { mode: 'history', base: '/myapp', scrollBehavior: 'top' };

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tplRoot = document.createElement('template');
    tplRoot.setAttribute('route', '/');
    tplRoot.innerHTML = '<p class="root">Root</p>';
    document.body.appendChild(tplRoot);

    const tplSettings = document.createElement('template');
    tplSettings.setAttribute('route', '/settings');
    tplSettings.innerHTML = '<p class="settings">Settings</p>';
    document.body.appendChild(tplSettings);

    
    let popstateHandler;
    const origAdd = window.addEventListener;
    window.addEventListener = function (event, handler, ...rest) {
      if (event === 'popstate') popstateHandler = handler;
      return origAdd.call(this, event, handler, ...rest);
    };

    const router = _createRouter();
    setRouterInstance(router);
    
    router.init();

    window.addEventListener = origAdd;

    
    window.history.pushState({}, '', '/myapp/settings');
    popstateHandler();

    
    expect(router.current.path).toBe('/settings');
  });
});





describe('Router — scrollBehavior smooth', () => {
  beforeEach(() => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'smooth' };
    window.scrollTo = jest.fn();
    setRouterInstance(null);
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  afterEach(() => {
    setRouterInstance(null);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  test('smooth scrollBehavior calls scrollTo with smooth behavior', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Smooth Page</p>';
    router.register('/smooth', tpl);

    await router.push('/smooth');

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});

describe('Router — scrollBehavior preserve', () => {
  beforeEach(() => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'preserve' };
    window.scrollTo = jest.fn();
    setRouterInstance(null);
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  afterEach(() => {
    setRouterInstance(null);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  test('preserve scrollBehavior does NOT call scrollTo', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const router = _createRouter();
    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Preserve Page</p>';
    router.register('/preserve', tpl);

    await router.push('/preserve');

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});





describe('on-demand template loading', () => {
  beforeEach(() => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    document.body.innerHTML = '';
    window.location.hash = '';
    window.scrollTo = jest.fn();
    setRouterInstance(null);
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<p class="about-content">About</p>'),
    });
  });

  afterEach(() => {
    setRouterInstance(null);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    document.body.innerHTML = '';
    window.location.hash = '';
    delete global.fetch;
  });

  test('loads route template on-demand when navigating if not yet fetched', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/about');
    tpl.setAttribute('src', '/about.tpl');
    document.body.appendChild(tpl);

    const router = _createRouter();
    setRouterInstance(router);
    router.register('/about', tpl);

    await router.push('/about');

    expect(global.fetch).toHaveBeenCalledWith('/about.tpl');
  });

  test('does not re-fetch already loaded route template', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.setAttribute('route', '/about');
    tpl.setAttribute('src', '/about.tpl');
    tpl.__srcLoaded = true;
    tpl.innerHTML = '<p>About</p>';
    document.body.appendChild(tpl);

    const router = _createRouter();
    setRouterInstance(router);
    router.register('/about', tpl);

    await router.push('/about');

    expect(global.fetch).not.toHaveBeenCalled();
  });
});





describe('Router — Named Outlets', () => {
  beforeEach(() => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    document.body.innerHTML = '';
    window.location.hash = '';
    window.scrollTo = jest.fn();
    setRouterInstance(null);
  });

  afterEach(() => {
    setRouterInstance(null);
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  

  test('register() with 2 args registers to "default" outlet', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Main content</p>';

    const router = _createRouter();
    router.register('/page', tpl);
    await router.push('/page');

    expect(outlet.innerHTML).toContain('Main content');
  });

  test('register() with 3rd arg targets named outlet', async () => {
    const mainOutlet = document.createElement('div');
    mainOutlet.setAttribute('route-view', '');
    document.body.appendChild(mainOutlet);

    const sidebarOutlet = document.createElement('div');
    sidebarOutlet.setAttribute('route-view', 'sidebar');
    document.body.appendChild(sidebarOutlet);

    const mainTpl = document.createElement('template');
    mainTpl.innerHTML = '<p>Main</p>';

    const sidebarTpl = document.createElement('template');
    sidebarTpl.innerHTML = '<nav>Sidebar</nav>';

    const router = _createRouter();
    router.register('/page', mainTpl);
    router.register('/page', sidebarTpl, 'sidebar');
    await router.push('/page');

    expect(mainOutlet.innerHTML).toContain('Main');
    expect(sidebarOutlet.innerHTML).toContain('Sidebar');
  });

  

  test('route-view with empty value treated as default outlet', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Default content</p>';

    const router = _createRouter();
    router.register('/test', tpl);  
    await router.push('/test');

    expect(outlet.innerHTML).toContain('Default content');
  });

  

  test('template outlet attr registers to named outlet via init()', async () => {
    const mainOutlet = document.createElement('div');
    mainOutlet.setAttribute('route-view', '');
    document.body.appendChild(mainOutlet);

    const sidebarOutlet = document.createElement('div');
    sidebarOutlet.setAttribute('route-view', 'sidebar');
    document.body.appendChild(sidebarOutlet);

    
    const mainTpl = document.createElement('template');
    mainTpl.setAttribute('route', '/dash');
    mainTpl.innerHTML = '<h1>Dashboard</h1>';
    document.body.appendChild(mainTpl);

    const sidebarTpl = document.createElement('template');
    sidebarTpl.setAttribute('route', '/dash');
    sidebarTpl.setAttribute('outlet', 'sidebar');
    sidebarTpl.innerHTML = '<nav>Dashboard nav</nav>';
    document.body.appendChild(sidebarTpl);

    window.location.hash = '#/dash';
    const router = _createRouter();
    setRouterInstance(router);
    await router.init();

    expect(mainOutlet.innerHTML).toContain('Dashboard');
    expect(sidebarOutlet.innerHTML).toContain('Dashboard nav');
  });

  

  test('named outlet is cleared when route has no template for that outlet', async () => {
    const mainOutlet = document.createElement('div');
    mainOutlet.setAttribute('route-view', '');
    document.body.appendChild(mainOutlet);

    const sidebarOutlet = document.createElement('div');
    sidebarOutlet.setAttribute('route-view', 'sidebar');
    sidebarOutlet.innerHTML = '<p>stale sidebar</p>';
    document.body.appendChild(sidebarOutlet);

    const mainTpl = document.createElement('template');
    mainTpl.innerHTML = '<p>About</p>';

    const router = _createRouter();
    router.register('/about', mainTpl); 
    await router.push('/about');

    expect(mainOutlet.innerHTML).toContain('About');
    
    expect(sidebarOutlet.innerHTML).toBe('');
  });

  

  test('renders three different outlets for same route', async () => {
    const mainOutlet = document.createElement('div');
    mainOutlet.setAttribute('route-view', '');
    document.body.appendChild(mainOutlet);

    const sidebarOutlet = document.createElement('div');
    sidebarOutlet.setAttribute('route-view', 'sidebar');
    document.body.appendChild(sidebarOutlet);

    const topbarOutlet = document.createElement('div');
    topbarOutlet.setAttribute('route-view', 'topbar');
    document.body.appendChild(topbarOutlet);

    const mainTpl = document.createElement('template');
    mainTpl.innerHTML = '<main>Main body</main>';

    const sidebarTpl = document.createElement('template');
    sidebarTpl.innerHTML = '<aside>Side panel</aside>';

    const topbarTpl = document.createElement('template');
    topbarTpl.innerHTML = '<header>Top bar</header>';

    const router = _createRouter();
    router.register('/app', mainTpl);
    router.register('/app', sidebarTpl, 'sidebar');
    router.register('/app', topbarTpl, 'topbar');
    await router.push('/app');

    expect(mainOutlet.innerHTML).toContain('Main body');
    expect(sidebarOutlet.innerHTML).toContain('Side panel');
    expect(topbarOutlet.innerHTML).toContain('Top bar');
  });

  

  test('navigating clears named outlet when new route has no template for it', async () => {
    const mainOutlet = document.createElement('div');
    mainOutlet.setAttribute('route-view', '');
    document.body.appendChild(mainOutlet);

    const sidebarOutlet = document.createElement('div');
    sidebarOutlet.setAttribute('route-view', 'sidebar');
    document.body.appendChild(sidebarOutlet);

    const homeTpl = document.createElement('template');
    homeTpl.innerHTML = '<p>Home</p>';

    const homeSidebarTpl = document.createElement('template');
    homeSidebarTpl.innerHTML = '<nav>Home sidebar</nav>';

    const aboutTpl = document.createElement('template');
    aboutTpl.innerHTML = '<p>About</p>';
    

    const router = _createRouter();
    router.register('/home', homeTpl);
    router.register('/home', homeSidebarTpl, 'sidebar');
    router.register('/about', aboutTpl);

    
    await router.push('/home');
    expect(mainOutlet.innerHTML).toContain('Home');
    expect(sidebarOutlet.innerHTML).toContain('Home sidebar');

    
    await router.push('/about');
    expect(mainOutlet.innerHTML).toContain('About');
    expect(sidebarOutlet.innerHTML).toBe('');
  });

  

  test('guard check still works with named outlets', async () => {
    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const protectedTpl = document.createElement('template');
    protectedTpl.setAttribute('guard', 'false');
    protectedTpl.setAttribute('redirect', '/login');
    protectedTpl.innerHTML = '<p>Protected</p>';

    const loginTpl = document.createElement('template');
    loginTpl.innerHTML = '<p>Login page</p>';

    const router = _createRouter();
    router.register('/protected', protectedTpl);
    router.register('/login', loginTpl);
    await router.push('/protected');

    
    expect(router.current.path).toBe('/login');
    expect(outlet.innerHTML).toContain('Login page');
  });
});

describe('Router — anchor links in hash mode', () => {
  let router;

  beforeEach(() => {
    _config.router = { mode: 'hash', base: '/', scrollBehavior: 'top' };
    document.body.innerHTML = '';
    window.location.hash = '';
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    setRouterInstance(null);
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  test('click on href="#id" scrolls to element and prevents route navigation', async () => {
    const section = document.createElement('div');
    section.id = 'my-section';
    section.scrollIntoView = jest.fn();
    document.body.appendChild(section);

    const link = document.createElement('a');
    link.setAttribute('href', '#my-section');
    document.body.appendChild(link);

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Home</p>';
    router = _createRouter();
    router.register('/', tpl);
    await router.init();

    expect(router.current.path).toBe('/');

    link.click();

    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(router.current.path).toBe('/');
  });

  test('click on href="#id" adds active class to matching anchor links', async () => {
    const section1 = document.createElement('div');
    section1.id = 'section-a';
    section1.scrollIntoView = jest.fn();
    document.body.appendChild(section1);

    const section2 = document.createElement('div');
    section2.id = 'section-b';
    section2.scrollIntoView = jest.fn();
    document.body.appendChild(section2);

    const linkA = document.createElement('a');
    linkA.setAttribute('href', '#section-a');
    linkA.className = 'sidebar-link';
    document.body.appendChild(linkA);

    const linkB = document.createElement('a');
    linkB.setAttribute('href', '#section-b');
    linkB.className = 'sidebar-link';
    document.body.appendChild(linkB);

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Home</p>';
    router = _createRouter();
    router.register('/', tpl);
    await router.init();

    linkA.click();
    expect(linkA.classList.contains('active')).toBe(true);
    expect(linkB.classList.contains('active')).toBe(false);

    linkB.click();
    expect(linkA.classList.contains('active')).toBe(false);
    expect(linkB.classList.contains('active')).toBe(true);
  });

  test('click on href="#id" is ignored when target element does not exist', async () => {
    const link = document.createElement('a');
    link.setAttribute('href', '#nonexistent');
    document.body.appendChild(link);

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Home</p>';
    router = _createRouter();
    router.register('/', tpl);
    await router.init();

    link.click();
    expect(router.current.path).toBe('/');
  });

  test('anchor links with route attribute are handled as route navigation, not anchors', async () => {
    const link = document.createElement('a');
    link.setAttribute('route', '/about');
    link.setAttribute('href', '#about');
    document.body.appendChild(link);

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const homeTpl = document.createElement('template');
    homeTpl.innerHTML = '<p>Home</p>';
    const aboutTpl = document.createElement('template');
    aboutTpl.innerHTML = '<p>About</p>';

    router = _createRouter();
    router.register('/', homeTpl);
    router.register('/about', aboutTpl);
    await router.init();

    link.click();
    expect(router.current.path).toBe('/about');
  });

  test('href="#/route" starting with slash is not treated as anchor', async () => {
    const link = document.createElement('a');
    link.setAttribute('href', '#/docs');
    document.body.appendChild(link);

    const outlet = document.createElement('div');
    outlet.setAttribute('route-view', '');
    document.body.appendChild(outlet);

    const tpl = document.createElement('template');
    tpl.innerHTML = '<p>Home</p>';
    router = _createRouter();
    router.register('/', tpl);
    await router.init();

    link.click();
    expect(router.current.path).toBe('/');
  });
});

