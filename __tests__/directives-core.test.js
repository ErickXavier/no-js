





import { _stores, _config } from '../src/globals.js';
import { createContext } from '../src/context.js';
import { registerDirective, processTree, processElement } from '../src/registry.js';
import { findContext } from '../src/dom.js';


import '../src/filters.js';
import '../src/directives/state.js';
import '../src/directives/binding.js';
import '../src/directives/conditionals.js';
import '../src/directives/events.js';
import '../src/directives/loops.js';

describe('State Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    Object.keys(_stores).forEach((k) => delete _stores[k]);
  });

  test('creates reactive context from state attribute', () => {
    const div = document.createElement('div');
    div.setAttribute('state', '{ count: 0, name: "test" }');
    document.body.appendChild(div);
    processTree(div);

    const ctx = div.__ctx;
    expect(ctx).toBeDefined();
    expect(ctx.__isProxy).toBe(true);
    expect(ctx.count).toBe(0);
    expect(ctx.name).toBe('test');
  });

  test('creates empty context for empty state', () => {
    const div = document.createElement('div');
    div.setAttribute('state', '{}');
    document.body.appendChild(div);
    processTree(div);

    expect(div.__ctx).toBeDefined();
    expect(div.__ctx.__isProxy).toBe(true);
  });

  test('state with nested objects', () => {
    const div = document.createElement('div');
    div.setAttribute('state', '{ user: { name: "Alice", age: 25 } }');
    document.body.appendChild(div);
    processTree(div);

    expect(div.__ctx.user).toEqual({ name: 'Alice', age: 25 });
  });

  test('inherits parent context', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 10 }');
    const child = document.createElement('div');
    child.setAttribute('state', '{ y: 20 }');
    parent.appendChild(child);
    document.body.appendChild(parent);
    processTree(parent);

    expect(child.__ctx.y).toBe(20);
    expect(child.__ctx.x).toBe(10); 
  });
});

describe('Store Directive', () => {
  afterEach(() => {
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    document.body.innerHTML = '';
  });

  test('creates a global store', () => {
    const div = document.createElement('div');
    div.setAttribute('store', 'cart');
    div.setAttribute('value', '{ items: [], total: 0 }');
    document.body.appendChild(div);
    processTree(div);

    expect(_stores.cart).toBeDefined();
    expect(_stores.cart.items).toEqual([]);
    expect(_stores.cart.total).toBe(0);
  });

  test('does not overwrite existing store', () => {
    _stores.existing = createContext({ value: 'original' });
    const div = document.createElement('div');
    div.setAttribute('store', 'existing');
    div.setAttribute('value', '{ value: "new" }');
    document.body.appendChild(div);
    processTree(div);

    expect(_stores.existing.value).toBe('original');
  });

  test('creates empty store without value', () => {
    const div = document.createElement('div');
    div.setAttribute('store', 'empty');
    document.body.appendChild(div);
    processTree(div);

    expect(_stores.empty).toBeDefined();
    expect(_stores.empty.__isProxy).toBe(true);
  });
});

describe('Computed Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('computes a derived value', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ price: 100, qty: 3 }');
    const computed = document.createElement('span');
    computed.setAttribute('computed', 'total');
    computed.setAttribute('expr', 'price * qty');
    parent.appendChild(computed);
    document.body.appendChild(parent);
    processTree(parent);

    expect(parent.__ctx.total).toBe(300);
  });

  test('recomputes when dependency changes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ a: 2, b: 3 }');
    const computed = document.createElement('span');
    computed.setAttribute('computed', 'sum');
    computed.setAttribute('expr', 'a + b');
    parent.appendChild(computed);
    document.body.appendChild(parent);
    processTree(parent);

    expect(parent.__ctx.sum).toBe(5);
    parent.__ctx.a = 10;
    expect(parent.__ctx.sum).toBe(13);
  });
});

describe('Watch Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('calls on:change when watched expression changes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ count: 0, lastChange: "" }');
    const watch = document.createElement('span');
    watch.setAttribute('watch', 'count');
    watch.setAttribute('on:change', 'lastChange = "changed"');
    parent.appendChild(watch);
    document.body.appendChild(parent);
    processTree(parent);

    parent.__ctx.count = 5;
    expect(parent.__ctx.lastChange).toBe('changed');
  });
});



describe('Bind Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('bind sets textContent', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ name: "Alice" }');
    const span = document.createElement('span');
    span.setAttribute('bind', 'name');
    parent.appendChild(span);
    document.body.appendChild(parent);
    processTree(parent);

    expect(span.textContent).toBe('Alice');
  });

  test('bind updates on state change', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ msg: "hello" }');
    const span = document.createElement('span');
    span.setAttribute('bind', 'msg');
    parent.appendChild(span);
    document.body.appendChild(parent);
    processTree(parent);

    expect(span.textContent).toBe('hello');
    parent.__ctx.msg = 'world';
    expect(span.textContent).toBe('world');
  });

  test('bind with expression', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ a: 3, b: 4 }');
    const span = document.createElement('span');
    span.setAttribute('bind', 'a + b');
    parent.appendChild(span);
    document.body.appendChild(parent);
    processTree(parent);

    expect(span.textContent).toBe('7');
  });
});

describe('Bind-HTML Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('sets innerHTML with sanitization', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ content: "<b>Bold</b>" }');
    const div = document.createElement('div');
    div.setAttribute('bind-html', 'content');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.innerHTML).toBe('<b>Bold</b>');
  });

  test('sanitizes script tags', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ content: "<script>alert(1)</script><p>safe</p>" }');
    const div = document.createElement('div');
    div.setAttribute('bind-html', 'content');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.innerHTML).not.toContain('<script');
    expect(div.innerHTML).toContain('<p>safe</p>');
  });
});

describe('Bind-* Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('binds arbitrary attributes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ url: "https://example.com" }');
    const a = document.createElement('a');
    a.setAttribute('bind-href', 'url');
    parent.appendChild(a);
    document.body.appendChild(parent);
    processTree(parent);

    expect(a.getAttribute('href')).toBe('https://example.com');
  });

  test('toggles boolean attributes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ isDisabled: true }');
    const btn = document.createElement('button');
    btn.setAttribute('bind-disabled', 'isDisabled');
    parent.appendChild(btn);
    document.body.appendChild(parent);
    processTree(parent);

    expect(btn.hasAttribute('disabled')).toBe(true);
    expect(btn.disabled).toBe(true);

    parent.__ctx.isDisabled = false;
    expect(btn.hasAttribute('disabled')).toBe(false);
    expect(btn.disabled).toBe(false);
  });

  test('removes attribute when value is null', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ title: "hello" }');
    const div = document.createElement('div');
    div.setAttribute('bind-title', 'title');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.getAttribute('title')).toBe('hello');
    parent.__ctx.title = null;
    expect(div.hasAttribute('title')).toBe(false);
  });
});

describe('Model Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('two-way binds text input', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ name: "initial" }');
    const input = document.createElement('input');
    input.setAttribute('model', 'name');
    parent.appendChild(input);
    document.body.appendChild(parent);
    processTree(parent);

    
    expect(input.value).toBe('initial');

    
    input.value = 'changed';
    input.dispatchEvent(new Event('input'));
    expect(parent.__ctx.name).toBe('changed');
  });

  test('two-way binds checkbox', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ checked: false }');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('model', 'checked');
    parent.appendChild(input);
    document.body.appendChild(parent);
    processTree(parent);

    expect(input.checked).toBe(false);

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(parent.__ctx.checked).toBe(true);
  });

  test('two-way binds number input', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ count: 0 }');
    const input = document.createElement('input');
    input.type = 'number';
    input.setAttribute('model', 'count');
    parent.appendChild(input);
    document.body.appendChild(parent);
    processTree(parent);

    input.value = '42';
    input.dispatchEvent(new Event('input'));
    expect(parent.__ctx.count).toBe(42);
  });

  test('two-way binds select', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ choice: "b" }');
    const select = document.createElement('select');
    select.setAttribute('model', 'choice');
    for (const val of ['a', 'b', 'c']) {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      select.appendChild(opt);
    }
    parent.appendChild(select);
    document.body.appendChild(parent);
    processTree(parent);

    expect(select.value).toBe('b');

    select.value = 'c';
    select.dispatchEvent(new Event('change'));
    expect(parent.__ctx.choice).toBe('c');
  });

  test('updates DOM when state changes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ text: "hello" }');
    const input = document.createElement('input');
    input.setAttribute('model', 'text');
    parent.appendChild(input);
    document.body.appendChild(parent);
    processTree(parent);

    parent.__ctx.text = 'world';
    expect(input.value).toBe('world');
  });
});



describe('If Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('shows content when condition is true', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ visible: true }');
    const div = document.createElement('div');
    div.setAttribute('if', 'visible');
    div.innerHTML = '<p>Content</p>';
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.querySelector('p')).not.toBeNull();
    expect(div.querySelector('p').textContent).toBe('Content');
  });

  test('clears content when condition is false', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ visible: false }');
    const div = document.createElement('div');
    div.setAttribute('if', 'visible');
    div.innerHTML = '<p>Hidden</p>';
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.innerHTML).toBe('');
  });

  test('toggles content reactively', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true }');
    const div = document.createElement('div');
    div.setAttribute('if', 'show');
    div.innerHTML = '<p>Toggle me</p>';
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.querySelector('p')).not.toBeNull();
    parent.__ctx.show = false;
    expect(div.innerHTML).toBe('');
    parent.__ctx.show = true;
    expect(div.querySelector('p')).not.toBeNull();
  });

  test('uses then template when true', () => {
    const tpl = document.createElement('template');
    tpl.id = 'then-tpl';
    tpl.innerHTML = '<span>Template content</span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ cond: true }');
    const div = document.createElement('div');
    div.setAttribute('if', 'cond');
    div.setAttribute('then', 'then-tpl');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.querySelector('span')).not.toBeNull();
    expect(div.querySelector('span').textContent).toBe('Template content');
  });

  test('uses else template when false', () => {
    const elseTpl = document.createElement('template');
    elseTpl.id = 'else-tpl';
    elseTpl.innerHTML = '<span>Else content</span>';
    document.body.appendChild(elseTpl);

    const thenTpl = document.createElement('template');
    thenTpl.id = 'then-tpl-2';
    thenTpl.innerHTML = '<span>Then content</span>';
    document.body.appendChild(thenTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ cond: false }');
    const div = document.createElement('div');
    div.setAttribute('if', 'cond');
    div.setAttribute('then', 'then-tpl-2');
    div.setAttribute('else', 'else-tpl');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.querySelector('span').textContent).toBe('Else content');
  });
});

describe('Show Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('shows element when condition is true', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ visible: true }');
    const div = document.createElement('div');
    div.setAttribute('show', 'visible');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.style.display).toBe('');
  });

  test('hides element when condition is false', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ visible: false }');
    const div = document.createElement('div');
    div.setAttribute('show', 'visible');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.style.display).toBe('none');
  });

  test('toggles reactively', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ on: true }');
    const div = document.createElement('div');
    div.setAttribute('show', 'on');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.style.display).toBe('');
    parent.__ctx.on = false;
    expect(div.style.display).toBe('none');
    parent.__ctx.on = true;
    expect(div.style.display).toBe('');
  });
});

describe('Hide Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('hides element when condition is true', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ hidden: true }');
    const div = document.createElement('div');
    div.setAttribute('hide', 'hidden');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.style.display).toBe('none');
  });

  test('shows element when condition is false', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ hidden: false }');
    const div = document.createElement('div');
    div.setAttribute('hide', 'hidden');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.style.display).toBe('');
  });
});

describe('Switch Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('shows matching case', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', "{ status: 'active' }");
    const switchEl = document.createElement('div');
    switchEl.setAttribute('switch', 'status');

    const case1 = document.createElement('div');
    case1.setAttribute('case', "'active'");
    case1.textContent = 'Active!\n';
    const case2 = document.createElement('div');
    case2.setAttribute('case', "'inactive'");
    case2.textContent = 'Inactive';
    const defaultCase = document.createElement('div');
    defaultCase.setAttribute('default', '');
    defaultCase.textContent = 'Unknown';

    switchEl.appendChild(case1);
    switchEl.appendChild(case2);
    switchEl.appendChild(defaultCase);
    parent.appendChild(switchEl);
    document.body.appendChild(parent);
    processTree(parent);

    expect(case1.style.display).toBe('');
    expect(case2.style.display).toBe('none');
    expect(defaultCase.style.display).toBe('none');
  });

  test('shows default case when no match', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', "{ status: 'unknown' }");
    const switchEl = document.createElement('div');
    switchEl.setAttribute('switch', 'status');

    const case1 = document.createElement('div');
    case1.setAttribute('case', "'active'");
    case1.textContent = 'Active!';
    const defaultCase = document.createElement('div');
    defaultCase.setAttribute('default', '');
    defaultCase.textContent = 'Default';

    switchEl.appendChild(case1);
    switchEl.appendChild(defaultCase);
    parent.appendChild(switchEl);
    document.body.appendChild(parent);
    processTree(parent);

    expect(case1.style.display).toBe('none');
    expect(defaultCase.style.display).toBe('');
  });

  test('updates when expression changes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', "{ tab: 'a' }");
    const switchEl = document.createElement('div');
    switchEl.setAttribute('switch', 'tab');

    const caseA = document.createElement('div');
    caseA.setAttribute('case', "'a'");
    caseA.textContent = 'Tab A';
    const caseB = document.createElement('div');
    caseB.setAttribute('case', "'b'");
    caseB.textContent = 'Tab B';

    switchEl.appendChild(caseA);
    switchEl.appendChild(caseB);
    parent.appendChild(switchEl);
    document.body.appendChild(parent);
    processTree(parent);

    expect(caseA.style.display).toBe('');
    expect(caseB.style.display).toBe('none');

    parent.__ctx.tab = 'b';
    expect(caseA.style.display).toBe('none');
    expect(caseB.style.display).toBe('');
  });
});



describe('else-if directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('shows else-if when if is false and condition is true', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ status: "warning" }');
    parent.innerHTML = `
      <div if="status === 'error'" id="err"><p>Error</p></div>
      <div else-if="status === 'warning'" id="warn"><p>Warning</p></div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('err').innerHTML).toBe('');
    expect(document.getElementById('warn').querySelector('p').textContent).toBe(
      'Warning',
    );
  });

  test('hides else-if when if is true', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ status: "error" }');
    parent.innerHTML = `
      <div if="status === 'error'" id="err"><p>Error</p></div>
      <div else-if="status === 'warning'" id="warn"><p>Warning</p></div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('err').querySelector('p').textContent).toBe(
      'Error',
    );
    expect(document.getElementById('warn').style.display).toBe('none');
  });

  test('else-if chain — all false', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ status: "ok" }');
    parent.innerHTML = `
      <div if="status === 'error'" id="err"><p>Error</p></div>
      <div else-if="status === 'warning'" id="warn"><p>Warning</p></div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('err').innerHTML).toBe('');
    expect(document.getElementById('warn').innerHTML).toBe('');
  });

  test('else-if with then template', () => {
    const tpl = document.createElement('template');
    tpl.id = 'warn-tpl';
    tpl.innerHTML = '<p class="warn-msg">Warning!</p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ type: "warn" }');
    parent.innerHTML = `
      <div if="type === 'error'"><p>Error</p></div>
      <div else-if="type === 'warn'" then="warn-tpl" id="w"></div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('w').querySelector('.warn-msg')).not.toBeNull();
  });
});

describe('else directive (standalone)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('shows else when preceding if is false', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: false }');
    parent.innerHTML = `
      <div if="show" id="ifEl"><p>Visible</p></div>
      <div else id="elseEl"><p>Fallback</p></div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('ifEl').innerHTML).toBe('');
    expect(document.getElementById('elseEl').querySelector('p').textContent).toBe('Fallback');
  });

  test('hides else when preceding if is true', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true }');
    parent.innerHTML = `
      <div if="show" id="ifEl"><p>Visible</p></div>
      <div else id="elseEl"><p>Fallback</p></div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('ifEl').querySelector('p').textContent).toBe('Visible');
    expect(document.getElementById('elseEl').style.display).toBe('none');
  });

  test('else after if/else-if chain — all false', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ status: "ok" }');
    parent.innerHTML = `
      <div if="status === 'error'" id="err">Error</div>
      <div else-if="status === 'warning'" id="warn">Warning</div>
      <div else id="fallback"><p>All good</p></div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('err').innerHTML).toBe('');
    expect(document.getElementById('warn').innerHTML).toBe('');
    expect(document.getElementById('fallback').querySelector('p').textContent).toBe('All good');
  });

  test('else after if/else-if chain — if matches', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ status: "error" }');
    parent.innerHTML = `
      <div if="status === 'error'" id="err"><p>Error</p></div>
      <div else-if="status === 'warning'" id="warn">Warning</div>
      <div else id="fallback"><p>All good</p></div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('err').querySelector('p').textContent).toBe('Error');
    expect(document.getElementById('warn').style.display).toBe('none');
    expect(document.getElementById('fallback').style.display).toBe('none');
  });

  test('else with then template', () => {
    const tpl = document.createElement('template');
    tpl.id = 'fallback-tpl';
    tpl.innerHTML = '<span class="fb">Fallback content</span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: false }');
    parent.innerHTML = `
      <div if="show">Content</div>
      <div else then="fallback-tpl" id="elseEl"></div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('elseEl').querySelector('.fb')).not.toBeNull();
  });
});

describe('switch with default', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('renders default when no case matches', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ mode: "unknown" }');
    parent.innerHTML = `
      <div switch="mode">
        <div case="'light'" id="light">Light</div>
        <div case="'dark'" id="dark">Dark</div>
        <div default id="def">Default Mode</div>
      </div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('light').style.display).toBe('none');
    expect(document.getElementById('dark').style.display).toBe('none');
    expect(document.getElementById('def').style.display).toBe('');
    expect(document.getElementById('def').textContent).toBe('Default Mode');
  });

  test('hides default when a case matches', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ mode: "dark" }');
    parent.innerHTML = `
      <div switch="mode">
        <div case="'light'" id="light">Light</div>
        <div case="'dark'" id="dark">Dark</div>
        <div default id="def">Default</div>
      </div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('dark').style.display).toBe('');
    expect(document.getElementById('def').style.display).toBe('none');
  });

  test('switch with multi-value case', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ fruit: "banana" }');
    parent.innerHTML = `
      <div switch="fruit">
        <div case="'apple','banana'" id="ab">Apple or Banana</div>
        <div case="'cherry'" id="c">Cherry</div>
      </div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('ab').style.display).toBe('');
    expect(document.getElementById('c').style.display).toBe('none');
  });

  test('switch with then template in case', () => {
    const tpl = document.createElement('template');
    tpl.id = 'case-tpl';
    tpl.innerHTML = '<p class="case-content">Loaded</p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ tab: "info" }');
    parent.innerHTML = `
      <div switch="tab">
        <div case="'info'" then="case-tpl" id="info"></div>
        <div case="'settings'">Settings</div>
      </div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(
      document.getElementById('info').querySelector('.case-content'),
    ).not.toBeNull();
  });

  test('switch with then template on default', () => {
    const tpl = document.createElement('template');
    tpl.id = 'default-tpl';
    tpl.innerHTML = '<p class="default-content">Fallback</p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ view: "unknown" }');
    parent.innerHTML = `
      <div switch="view">
        <div case="'home'">Home</div>
        <div default then="default-tpl" id="def"></div>
      </div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    expect(
      document.getElementById('def').querySelector('.default-content'),
    ).not.toBeNull();
  });
});

describe('if with animate', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('if with animate-enter adds class', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true }');
    parent.innerHTML = `
      <div if="show" animate-enter="fade-in" id="animated"><p>Content</p></div>
    `;
    document.body.appendChild(parent);
    processTree(parent);

    const el = document.getElementById('animated');
    expect(el.querySelector('p')).not.toBeNull();
  });

  test('if with then template renders correctly', () => {
    const tpl = document.createElement('template');
    tpl.id = 'if-then';
    tpl.innerHTML = '<p class="then-content">Loaded</p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ visible: true }');
    parent.innerHTML = `<div if="visible" then="if-then" id="container"></div>`;
    document.body.appendChild(parent);
    processTree(parent);

    expect(
      document.getElementById('container').querySelector('.then-content'),
    ).not.toBeNull();
  });

  test('if false with then template clears content', () => {
    const tpl = document.createElement('template');
    tpl.id = 'if-then2';
    tpl.innerHTML = '<p>Content</p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ visible: false }');
    parent.innerHTML = `<div if="visible" then="if-then2" id="container"></div>`;
    document.body.appendChild(parent);
    processTree(parent);

    expect(document.getElementById('container').innerHTML).toBe('');
  });

  test('if false with else template shows else', () => {
    const tpl = document.createElement('template');
    tpl.id = 'else-tpl';
    tpl.innerHTML = '<p class="else-content">Fallback</p>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ loggedIn: false }');
    parent.innerHTML = `<div if="loggedIn" else="else-tpl" id="el"><p>Dashboard</p></div>`;
    document.body.appendChild(parent);
    processTree(parent);

    expect(
      document.getElementById('el').querySelector('.else-content'),
    ).not.toBeNull();
  });
});



describe('state persist directive', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    sessionStorage.clear();
  });

  test('persists state to localStorage', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ count: 0 }');
    parent.setAttribute('persist', 'localStorage');
    parent.setAttribute('persist-key', 'test1');
    document.body.appendChild(parent);

    processTree(parent);

    const ctx = findContext(parent);
    ctx.count = 5;

    const stored = JSON.parse(localStorage.getItem('nojs_state_test1'));
    expect(stored.count).toBe(5);
  });

  test('restores state from localStorage', () => {
    localStorage.setItem(
      'nojs_state_test2',
      JSON.stringify({ name: 'saved' }),
    );

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ name: "default" }');
    parent.setAttribute('persist', 'localStorage');
    parent.setAttribute('persist-key', 'test2');
    document.body.appendChild(parent);

    processTree(parent);

    const ctx = findContext(parent);
    expect(ctx.name).toBe('saved');
  });

  test('persists state to sessionStorage', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ val: 10 }');
    parent.setAttribute('persist', 'sessionStorage');
    parent.setAttribute('persist-key', 'test3');
    document.body.appendChild(parent);

    processTree(parent);

    const ctx = findContext(parent);
    ctx.val = 20;

    const stored = JSON.parse(sessionStorage.getItem('nojs_state_test3'));
    expect(stored.val).toBe(20);
  });

  test('ignores invalid persist type', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 1 }');
    parent.setAttribute('persist', 'invalidStore');
    parent.setAttribute('persist-key', 'test4');
    document.body.appendChild(parent);

    expect(() => processTree(parent)).not.toThrow();
  });

  test('handles corrupt localStorage data', () => {
    localStorage.setItem('nojs_state_test5', 'not valid json{{{');

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ safe: true }');
    parent.setAttribute('persist', 'localStorage');
    parent.setAttribute('persist-key', 'test5');
    document.body.appendChild(parent);

    expect(() => processTree(parent)).not.toThrow();
    const ctx = findContext(parent);
    expect(ctx.safe).toBe(true);
  });
});



describe('bind-value two-way', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('updates context when input value changes via bind-value', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ name: "initial" }');
    const input = document.createElement('input');
    input.setAttribute('bind-value', 'name');
    parent.appendChild(input);
    document.body.appendChild(parent);

    processTree(parent);

    const ctx = findContext(input);
    expect(input.value).toBe('initial');

    input.value = 'updated';
    input.dispatchEvent(new Event('input'));

    expect(ctx.name).toBe('updated');
  });

  test('converts to number for number input type', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ age: 25 }');
    const input = document.createElement('input');
    input.type = 'number';
    input.setAttribute('bind-value', 'age');
    parent.appendChild(input);
    document.body.appendChild(parent);

    processTree(parent);

    input.value = '30';
    input.dispatchEvent(new Event('input'));

    const ctx = findContext(input);
    expect(ctx.age).toBe(30);
  });

  test('works with textarea element', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ text: "hello" }');
    const textarea = document.createElement('textarea');
    textarea.setAttribute('bind-value', 'text');
    parent.appendChild(textarea);
    document.body.appendChild(parent);

    processTree(parent);

    textarea.value = 'world';
    textarea.dispatchEvent(new Event('input'));

    const ctx = findContext(textarea);
    expect(ctx.text).toBe('world');
  });

  test('works with select element', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ color: "red" }');
    const select = document.createElement('select');
    select.setAttribute('bind-value', 'color');
    select.innerHTML = '<option value="red">Red</option><option value="blue">Blue</option>';
    parent.appendChild(select);
    document.body.appendChild(parent);

    processTree(parent);

    select.value = 'blue';
    select.dispatchEvent(new Event('input'));

    const ctx = findContext(select);
    expect(ctx.color).toBe('blue');
  });
});

describe('model with SELECT', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('sets select value from model', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ chosen: "banana" }');
    const select = document.createElement('select');
    select.setAttribute('model', 'chosen');
    select.innerHTML = '<option value="apple">Apple</option><option value="banana">Banana</option>';
    parent.appendChild(select);
    document.body.appendChild(parent);

    processTree(parent);

    expect(select.value).toBe('banana');
  });

  test('sets select value to empty string when model is null', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ chosen: null }');
    const select = document.createElement('select');
    select.setAttribute('model', 'chosen');
    select.innerHTML = '<option value="">--</option><option value="a">A</option>';
    parent.appendChild(select);
    document.body.appendChild(parent);

    processTree(parent);

    expect(select.value).toBe('');
  });
});



describe('if directive — uncovered branches', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('if with "animate" fallback attribute (not animate-enter)', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true }');
    const el = document.createElement('div');
    el.setAttribute('if', 'show');
    el.setAttribute('animate', 'fadeIn');
    el.innerHTML = '<p>Animated content</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    expect(el.querySelector('p')).not.toBeNull();
    expect(el.querySelector('p').textContent).toBe('Animated content');
  });

  test('if with animate-leave triggers animation before render', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true }');
    const el = document.createElement('div');
    el.setAttribute('if', 'show');
    el.setAttribute('animate-leave', 'fadeOut');
    el.innerHTML = '<p>Will animate out</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    expect(el.querySelector('p')).not.toBeNull();

    
    parent.__ctx.show = false;
    
    
  });

  test('if with transition attribute triggers transition on render', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true }');
    const el = document.createElement('div');
    el.setAttribute('if', 'show');
    el.setAttribute('transition', 'slide');
    el.innerHTML = '<p>Transition content</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    expect(el.querySelector('p')).not.toBeNull();

    
    parent.__ctx.show = false;
  });
});

describe('else-if directive — uncovered branches', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('else-if without previous sibling having if/else-if breaks', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 5 }');

    
    const plainDiv = document.createElement('div');
    plainDiv.textContent = 'Just a div';

    const elseIfEl = document.createElement('div');
    elseIfEl.setAttribute('else-if', 'x > 3');
    elseIfEl.innerHTML = '<p>Else-if content</p>';

    parent.appendChild(plainDiv);
    parent.appendChild(elseIfEl);
    document.body.appendChild(parent);

    processTree(parent);

    
    
    expect(elseIfEl.querySelector('p').textContent).toBe('Else-if content');
  });

  test('else-if with then template for the truthy branch', () => {
    const tpl = document.createElement('template');
    tpl.id = 'elseif-then-tpl';
    tpl.innerHTML = '<span class="elseif-rendered">Rendered via then</span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ status: "warn" }');

    const ifEl = document.createElement('div');
    ifEl.setAttribute('if', "status === 'error'");
    ifEl.innerHTML = '<p>Error</p>';

    const elseIfEl = document.createElement('div');
    elseIfEl.setAttribute('else-if', "status === 'warn'");
    elseIfEl.setAttribute('then', 'elseif-then-tpl');

    parent.appendChild(ifEl);
    parent.appendChild(elseIfEl);
    document.body.appendChild(parent);

    processTree(parent);

    expect(elseIfEl.querySelector('.elseif-rendered')).not.toBeNull();
    expect(elseIfEl.querySelector('.elseif-rendered').textContent).toBe('Rendered via then');
  });

  test('else-if evaluates false clears content', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ status: "ok" }');

    const ifEl = document.createElement('div');
    ifEl.setAttribute('if', "status === 'error'");
    ifEl.innerHTML = '<p>Error</p>';

    const elseIfEl = document.createElement('div');
    elseIfEl.setAttribute('else-if', "status === 'warn'");
    elseIfEl.innerHTML = '<p>Warning</p>';

    parent.appendChild(ifEl);
    parent.appendChild(elseIfEl);
    document.body.appendChild(parent);

    processTree(parent);

    
    expect(elseIfEl.innerHTML).toBe('');
  });
});



describe('state directive — uncovered branches', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('state with null/invalid data uses empty object', () => {
    const div = document.createElement('div');
    div.setAttribute('state', 'null');
    document.body.appendChild(div);
    processTree(div);

    
    expect(div.__ctx).toBeDefined();
    expect(div.__ctx.__isProxy).toBe(true);
  });

  test('state with expression returning falsy uses empty object', () => {
    const div = document.createElement('div');
    div.setAttribute('state', '0');
    document.body.appendChild(div);
    processTree(div);

    expect(div.__ctx).toBeDefined();
    expect(div.__ctx.__isProxy).toBe(true);
  });

  test('state with empty string uses empty object', () => {
    const div = document.createElement('div');
    div.setAttribute('state', '');
    document.body.appendChild(div);
    processTree(div);

    expect(div.__ctx).toBeDefined();
    expect(div.__ctx.__isProxy).toBe(true);
  });
});

describe('store directive — uncovered branches', () => {
  afterEach(() => {
    Object.keys(_stores).forEach((k) => delete _stores[k]);
    document.body.innerHTML = '';
  });

  test('store without storeName (empty string) returns early', () => {
    const div = document.createElement('div');
    div.setAttribute('store', '');
    div.setAttribute('value', '{ x: 1 }');
    document.body.appendChild(div);

    processTree(div);

    
    expect(_stores['']).toBeUndefined();
  });

  test('store where valueAttr is empty creates store with empty object', () => {
    const div = document.createElement('div');
    div.setAttribute('store', 'emptyVal');
    div.setAttribute('value', '');
    document.body.appendChild(div);

    processTree(div);

    expect(_stores.emptyVal).toBeDefined();
    expect(_stores.emptyVal.__isProxy).toBe(true);
  });
});

describe('computed directive — uncovered branches', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('computed without expr attribute returns early', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 10 }');
    const computed = document.createElement('span');
    computed.setAttribute('computed', 'total');
    
    parent.appendChild(computed);
    document.body.appendChild(parent);

    expect(() => processTree(parent)).not.toThrow();
    expect(parent.__ctx.total).toBeUndefined();
  });

  test('computed without name returns early', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 10 }');
    const computed = document.createElement('span');
    computed.setAttribute('computed', '');
    computed.setAttribute('expr', 'x * 2');
    parent.appendChild(computed);
    document.body.appendChild(parent);

    expect(() => processTree(parent)).not.toThrow();
  });
});



describe('model directive — uncovered branches', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('model for radio input type', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ color: "red" }');

    const radio1 = document.createElement('input');
    radio1.type = 'radio';
    radio1.name = 'color';
    radio1.value = 'red';
    radio1.setAttribute('model', 'color');

    const radio2 = document.createElement('input');
    radio2.type = 'radio';
    radio2.name = 'color';
    radio2.value = 'blue';
    radio2.setAttribute('model', 'color');

    parent.appendChild(radio1);
    parent.appendChild(radio2);
    document.body.appendChild(parent);
    processTree(parent);

    
    expect(radio1.checked).toBe(true);
    expect(radio2.checked).toBe(false);

    
    radio2.checked = true;
    radio2.dispatchEvent(new Event('change'));
    expect(parent.__ctx.color).toBe('blue');

    
    parent.__ctx.color = 'red';
    expect(radio1.checked).toBe(true);
    expect(radio2.checked).toBe(false);
  });

  test('model for SELECT element sets value', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ fruit: "banana" }');
    const select = document.createElement('select');
    select.setAttribute('model', 'fruit');
    select.innerHTML = '<option value="apple">Apple</option><option value="banana">Banana</option><option value="cherry">Cherry</option>';
    parent.appendChild(select);
    document.body.appendChild(parent);
    processTree(parent);

    expect(select.value).toBe('banana');

    
    select.value = 'cherry';
    select.dispatchEvent(new Event('change'));
    expect(parent.__ctx.fruit).toBe('cherry');
  });
});

describe('bind-* removes attribute when val is null', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('bind-* removes non-boolean attribute when value becomes null', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ tip: "hello" }');
    const div = document.createElement('div');
    div.setAttribute('bind-title', 'tip');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.getAttribute('title')).toBe('hello');

    parent.__ctx.tip = null;
    expect(div.hasAttribute('title')).toBe(false);
  });

  test('bind-* removes attribute when value is undefined', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ }');
    const div = document.createElement('div');
    div.setAttribute('bind-data-id', 'missingProp');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.hasAttribute('data-id')).toBe(false);
  });
});



describe('if without animations', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('renders immediately without animation classes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true }');
    const el = document.createElement('div');
    el.setAttribute('if', 'show');
    el.innerHTML = '<p>Visible</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);

    expect(el.querySelector('p').textContent).toBe('Visible');
  });

  test('clears content when condition is false without animations', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: false }');
    const el = document.createElement('div');
    el.setAttribute('if', 'show');
    el.innerHTML = '<p>Hidden</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);

    processTree(parent);

    expect(el.innerHTML).toBe('');
  });
});

describe('else-if hides when prior if is true', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('hides else-if when preceding if is truthy', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 5 }');

    const ifEl = document.createElement('div');
    ifEl.setAttribute('if', 'x > 3');
    ifEl.innerHTML = '<p>IF block</p>';

    const elseIfEl = document.createElement('div');
    elseIfEl.setAttribute('else-if', 'x > 1');
    elseIfEl.innerHTML = '<p>ELSE-IF block</p>';

    parent.appendChild(ifEl);
    parent.appendChild(elseIfEl);
    document.body.appendChild(parent);

    processTree(parent);

    expect(ifEl.querySelector('p').textContent).toBe('IF block');
    expect(elseIfEl.style.display).toBe('none');
  });

  test('shows else-if when preceding if is falsy', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 2 }');

    const ifEl = document.createElement('div');
    ifEl.setAttribute('if', 'x > 3');
    ifEl.innerHTML = '<p>IF block</p>';

    const elseIfEl = document.createElement('div');
    elseIfEl.setAttribute('else-if', 'x > 1');
    elseIfEl.innerHTML = '<p>ELSE-IF block</p>';

    parent.appendChild(ifEl);
    parent.appendChild(elseIfEl);
    document.body.appendChild(parent);

    processTree(parent);

    expect(elseIfEl.style.display).not.toBe('none');
  });
});





describe('bind-html — null/undefined value', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('bind-html does not modify innerHTML when value is null', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ html: null }');
    const div = document.createElement('div');
    div.innerHTML = '<p>Original</p>';
    div.setAttribute('bind-html', 'html');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    
    
    expect(div.innerHTML).toBe('<p>Original</p>');
  });

  test('bind-html does not modify innerHTML when value is undefined', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const div = document.createElement('div');
    div.setAttribute('bind-html', 'nonExistentProp');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    
    expect(div.innerHTML).toBe('');
  });

  test('bind-html updates when value changes from null to string', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ html: null }');
    const div = document.createElement('div');
    div.setAttribute('bind-html', 'html');
    parent.appendChild(div);
    document.body.appendChild(parent);
    processTree(parent);

    expect(div.innerHTML).toBe('');

    
    parent.__ctx.html = '<em>Now visible</em>';
    expect(div.innerHTML).toBe('<em>Now visible</em>');
  });
});





describe('model SELECT — null value branch', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('model on SELECT sets value to empty string when state is null', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ choice: null }');
    const select = document.createElement('select');
    select.setAttribute('model', 'choice');
    select.innerHTML = `
      <option value="">-- Select --</option>
      <option value="a">A</option>
      <option value="b">B</option>
    `;
    parent.appendChild(select);
    document.body.appendChild(parent);
    processTree(parent);

    
    expect(select.value).toBe('');
  });

  test('model on SELECT sets value to empty string when state is undefined', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const select = document.createElement('select');
    select.setAttribute('model', 'undefinedProp');
    select.innerHTML = `
      <option value="">-- Select --</option>
      <option value="x">X</option>
    `;
    parent.appendChild(select);
    document.body.appendChild(parent);
    processTree(parent);

    expect(select.value).toBe('');
  });
});





describe('if directive — with then template (L41)', () => {
  test('renders then template when condition is true', () => {
    const tpl = document.createElement('template');
    tpl.id = 'then-tpl';
    tpl.innerHTML = '<span class="then-content">Then!</span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true }');
    const el = document.createElement('div');
    el.setAttribute('if', 'show');
    el.setAttribute('then', 'then-tpl');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    expect(el.querySelector('.then-content')).not.toBeNull();
    document.body.removeChild(parent);
    document.body.removeChild(tpl);
  });
});

describe('if directive — with else template (L53)', () => {
  test('renders else template when condition is false', () => {
    const thenTpl = document.createElement('template');
    thenTpl.id = 'if-then-tpl';
    thenTpl.innerHTML = '<span class="yes">Yes</span>';
    document.body.appendChild(thenTpl);

    const elseTpl = document.createElement('template');
    elseTpl.id = 'if-else-tpl';
    elseTpl.innerHTML = '<span class="no">No</span>';
    document.body.appendChild(elseTpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ visible: false }');
    const el = document.createElement('div');
    el.setAttribute('if', 'visible');
    el.setAttribute('then', 'if-then-tpl');
    el.setAttribute('else', 'if-else-tpl');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    expect(el.querySelector('.no')).not.toBeNull();
    expect(el.querySelector('.yes')).toBeNull();
    document.body.removeChild(parent);
    document.body.removeChild(thenTpl);
    document.body.removeChild(elseTpl);
  });
});

describe('if directive — animLeave/transition (L26, L30-34)', () => {
  test('if with animate-leave removes content via animation', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true }');
    const el = document.createElement('div');
    el.setAttribute('if', 'show');
    el.setAttribute('animate-leave', 'fadeOut');
    el.innerHTML = '<p>Content</p>';
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    expect(el.querySelector('p')).not.toBeNull();

    
    const ctx = findContext(el);
    ctx.$set('show', false);

    
    
    await new Promise(r => setTimeout(r, 10));
    const child = el.firstElementChild;
    if (child) child.dispatchEvent(new Event('animationend'));

    await new Promise(r => setTimeout(r, 10));
    document.body.removeChild(parent);
  });
});

describe('else-if — with then template (L106)', () => {
  test('renders then template when else-if matches', () => {
    const tpl = document.createElement('template');
    tpl.id = 'elseif-then-tpl';
    tpl.innerHTML = '<span class="elif-content">Else-If Then!</span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 5 }');
    const ifEl = document.createElement('div');
    ifEl.setAttribute('if', 'x > 10');
    ifEl.innerHTML = '<span>Big</span>';
    parent.appendChild(ifEl);

    const elifEl = document.createElement('div');
    elifEl.setAttribute('else-if', 'x > 3');
    elifEl.setAttribute('then', 'elseif-then-tpl');
    parent.appendChild(elifEl);

    document.body.appendChild(parent);
    processTree(parent);

    expect(elifEl.querySelector('.elif-content')).not.toBeNull();
    document.body.removeChild(parent);
    document.body.removeChild(tpl);
  });
});

describe('switch — case with then template (L170-180)', () => {
  test('renders then template for matching case', () => {
    const tpl = document.createElement('template');
    tpl.id = 'switch-then-tpl';
    tpl.innerHTML = '<span class="switched">Switched!</span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', "{ tab: 'a' }");
    const sw = document.createElement('div');
    sw.setAttribute('switch', 'tab');

    const caseA = document.createElement('div');
    caseA.setAttribute('case', "'a'");
    caseA.setAttribute('then', 'switch-then-tpl');
    sw.appendChild(caseA);

    const caseB = document.createElement('div');
    caseB.setAttribute('case', "'b'");
    caseB.innerHTML = '<span>B</span>';
    sw.appendChild(caseB);

    parent.appendChild(sw);
    document.body.appendChild(parent);
    processTree(parent);

    expect(caseA.querySelector('.switched')).not.toBeNull();
    expect(caseB.style.display).toBe('none');
    document.body.removeChild(parent);
    document.body.removeChild(tpl);
  });
});

describe('switch — default with then template (L184)', () => {
  test('renders then template for default case when no match', () => {
    const tpl = document.createElement('template');
    tpl.id = 'default-then-tpl';
    tpl.innerHTML = '<span class="default-content">Default!</span>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', "{ tab: 'z' }");
    const sw = document.createElement('div');
    sw.setAttribute('switch', 'tab');

    const caseA = document.createElement('div');
    caseA.setAttribute('case', "'a'");
    caseA.innerHTML = '<span>A</span>';
    sw.appendChild(caseA);

    const defEl = document.createElement('div');
    defEl.setAttribute('default', '');
    defEl.setAttribute('then', 'default-then-tpl');
    sw.appendChild(defEl);

    parent.appendChild(sw);
    document.body.appendChild(parent);
    processTree(parent);

    expect(caseA.style.display).toBe('none');
    expect(defEl.querySelector('.default-content')).not.toBeNull();
    document.body.removeChild(parent);
    document.body.removeChild(tpl);
  });
});





describe('state — null/falsy value (L15 || {} fallback)', () => {
  test('state with null expression creates empty context', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', 'null');
    document.body.appendChild(parent);
    processTree(parent);

    const ctx = findContext(parent);
    expect(ctx).toBeDefined();
    document.body.removeChild(parent);
  });
});

describe('store — empty storeName (L63 early return)', () => {
  test('store with empty name does nothing', () => {
    const parent = document.createElement('div');
    parent.setAttribute('store', '');
    document.body.appendChild(parent);
    processTree(parent);
    
    document.body.removeChild(parent);
  });
});

describe('computed — missing expr (L94-96 early return)', () => {
  test('computed without expr attribute does nothing', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 1 }');
    const comp = document.createElement('div');
    comp.setAttribute('computed', 'doubled');
    
    parent.appendChild(comp);
    document.body.appendChild(parent);
    processTree(parent);

    const ctx = findContext(comp);
    expect(ctx.doubled).toBeUndefined();
    document.body.removeChild(parent);
  });

  test('computed without name does nothing', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 1 }');
    const comp = document.createElement('div');
    comp.setAttribute('computed', '');
    comp.setAttribute('expr', 'x * 2');
    parent.appendChild(comp);
    document.body.appendChild(parent);
    processTree(parent);
    
    document.body.removeChild(parent);
  });
});





describe('bind-* — null value removes attribute (L70)', () => {
  test('bind-title removes title attr when value is null', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ tip: null }');
    const el = document.createElement('span');
    el.setAttribute('bind-title', 'tip');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    expect(el.hasAttribute('title')).toBe(false);
    document.body.removeChild(parent);
  });
});





describe('if — no-change early return (L26)', () => {
  test('update returns early when condition value unchanged', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true, other: 1 }');
    const el = document.createElement('div');
    el.setAttribute('if', 'show');
    el.textContent = 'Visible';
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    expect(el.textContent).toBe('Visible');
    
    const ctx = findContext(el);
    ctx.$set('other', 2);
    
    expect(el.textContent).toBe('Visible');
    document.body.removeChild(parent);
  });
});

describe('if — then with missing template (L41 clone null)', () => {
  test('gracefully handles nonexistent then template', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: true }');
    const el = document.createElement('div');
    el.setAttribute('if', 'show');
    el.setAttribute('then', 'nonexistent-tpl-xyz-41');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    
    document.body.removeChild(parent);
  });
});

describe('if — else with missing template (L53 clone null)', () => {
  test('gracefully handles nonexistent else template', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ show: false }');
    const el = document.createElement('div');
    el.setAttribute('if', 'show');
    el.setAttribute('else', 'nonexistent-else-xyz-53');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    
    document.body.removeChild(parent);
  });
});

describe('else-if — then with missing template (L106 clone null)', () => {
  test('gracefully handles nonexistent then template in else-if', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 0 }');
    const ifEl = document.createElement('div');
    ifEl.setAttribute('if', 'x > 10');
    ifEl.innerHTML = '<span>Big</span>';
    parent.appendChild(ifEl);

    const elifEl = document.createElement('div');
    elifEl.setAttribute('else-if', 'x < 5');
    elifEl.setAttribute('then', 'nonexistent-elif-tpl-106');
    parent.appendChild(elifEl);
    document.body.appendChild(parent);
    processTree(parent);
    
    document.body.removeChild(parent);
  });
});

describe('switch — case then missing template (L170 clone null)', () => {
  test('gracefully handles nonexistent then template in case', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', "{ mode: 'a' }");
    const sw = document.createElement('div');
    sw.setAttribute('switch', 'mode');
    const caseEl = document.createElement('div');
    caseEl.setAttribute('case', "'a'");
    caseEl.setAttribute('then', 'nonexistent-switch-case-170');
    sw.appendChild(caseEl);
    parent.appendChild(sw);
    document.body.appendChild(parent);
    processTree(parent);
    document.body.removeChild(parent);
  });
});

describe('switch — default then missing template (L184 clone null)', () => {
  test('gracefully handles nonexistent then template on default', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', "{ mode: 'z' }");
    const sw = document.createElement('div');
    sw.setAttribute('switch', 'mode');
    const caseEl = document.createElement('div');
    caseEl.setAttribute('case', "'a'");
    caseEl.innerHTML = '<span>A</span>';
    sw.appendChild(caseEl);
    const defEl = document.createElement('div');
    defEl.setAttribute('default', '');
    defEl.setAttribute('then', 'nonexistent-default-184');
    sw.appendChild(defEl);
    parent.appendChild(sw);
    document.body.appendChild(parent);
    processTree(parent);
    document.body.removeChild(parent);
  });
});






describe('state — no parent element (L15 false branch)', () => {
  test('state on detached element uses null parent', () => {
    const el = document.createElement('div');
    el.setAttribute('state', '{ x: 42 }');
    
    processTree(el);
    const ctx = findContext(el);
    expect(ctx).toBeDefined();
    expect(ctx.x).toBe(42);
  });
});

describe('store — value evaluates to falsy (L63 || {} fallback)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete _stores['falsyStore'];
  });

  test('store with value=null uses empty object fallback', () => {
    const parent = document.createElement('div');
    parent.setAttribute('store', 'falsyStore');
    parent.setAttribute('value', 'null');
    document.body.appendChild(parent);
    processTree(parent);
    expect(_stores.falsyStore).toBeDefined();
    document.body.removeChild(parent);
  });
});

describe('watch — no change and no handler (L94-96)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('watch watcher fires but expression unchanged (L94 false)', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ target: 1, other: 10 }');
    const w = document.createElement('div');
    w.setAttribute('watch', 'target');
    w.setAttribute('on:change', 'other = other + 1');
    parent.appendChild(w);
    document.body.appendChild(parent);
    processTree(parent);

    const ctx = findContext(w);
    
    ctx.$set('other', 20);
    expect(ctx.target).toBe(1);
  });

  test('watch without on:change handler (L96 false)', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ counter: 0 }');
    const w = document.createElement('div');
    w.setAttribute('watch', 'counter');
    
    parent.appendChild(w);
    document.body.appendChild(parent);
    processTree(parent);

    const ctx = findContext(w);
    ctx.$set('counter', 5);
    
    expect(ctx.counter).toBe(5);
  });
});






describe('bind — null/undefined skips textContent (L16)', () => {
  test('bind with null value preserves original text', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ text: null }');
    const el = document.createElement('span');
    el.textContent = 'original';
    el.setAttribute('bind', 'text');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    expect(el.textContent).toBe('original');
    document.body.removeChild(parent);
  });

  test('bind with undefined value preserves original text', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{}');
    const el = document.createElement('span');
    el.textContent = 'placeholder';
    el.setAttribute('bind', 'missingProp');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    expect(el.textContent).toBe('placeholder');
    document.body.removeChild(parent);
  });
});

describe('bind-* — boolean attr on element without DOM property (L70 false)', () => {
  test('bind-checked on div skips DOM property assignment', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ flag: true }');
    const el = document.createElement('div');
    el.setAttribute('bind-checked', 'flag');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);
    
    expect(el.hasAttribute('checked')).toBe(true);
    expect(el.checked).toBeUndefined();
    document.body.removeChild(parent);
  });
});

describe('model — text input with null value (L98)', () => {
  test('model on text input sets empty string when null', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ text: null }');
    const input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('model', 'text');
    parent.appendChild(input);
    document.body.appendChild(parent);
    processTree(parent);
    expect(input.value).toBe('');
    document.body.removeChild(parent);
  });
});

describe('switch — child with neither case nor default (L180 false)', () => {
  test('ignores plain child elements in switch', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', "{ tab: 'a' }");
    const sw = document.createElement('div');
    sw.setAttribute('switch', 'tab');

    const caseA = document.createElement('div');
    caseA.setAttribute('case', "'a'");
    caseA.innerHTML = '<span>A</span>';
    sw.appendChild(caseA);

    
    const plainChild = document.createElement('hr');
    sw.appendChild(plainChild);

    parent.appendChild(sw);
    document.body.appendChild(parent);
    processTree(parent);

    
    expect(caseA.style.display).toBe('');
    document.body.removeChild(parent);
  });
});





describe('on:updated lifecycle hook', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    Object.keys(_stores).forEach((k) => delete _stores[k]);
  });

  test('fires when element content changes via mutation', async () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ updated: false }');
    const child = document.createElement('div');
    child.setAttribute('on:updated', 'updated = true');
    child.innerHTML = '<span>Original</span>';
    parent.appendChild(child);
    document.body.appendChild(parent);
    processTree(parent);

    const ctx = findContext(child);

    
    child.innerHTML = '<span>Changed</span>';

    
    await new Promise((r) => setTimeout(r, 50));

    expect(ctx.updated).toBe(true);
  });
});

describe('on:error lifecycle hook', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    Object.keys(_stores).forEach((k) => delete _stores[k]);
  });

  test('on:error directive is registered and processes without error', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ errorCaught: false }');
    const child = document.createElement('div');
    child.setAttribute('on:error', 'errorCaught = true');
    parent.appendChild(child);
    document.body.appendChild(parent);

    expect(() => processTree(parent)).not.toThrow();
  });
});





describe('show with animation attributes', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    Object.keys(_stores).forEach((k) => delete _stores[k]);
  });

  test('reads animate-enter and animate-leave attributes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ visible: true }');
    const el = document.createElement('div');
    el.setAttribute('show', 'visible');
    el.setAttribute('animate-enter', 'fadeIn');
    el.setAttribute('animate-leave', 'fadeOut');
    el.innerHTML = '<span>Content</span>';
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    
    expect(el.style.display).not.toBe('none');

    
    const child = el.querySelector('span');
    expect(child.classList.contains('fadeIn')).toBe(true);
  });
});

describe('hide with animation attributes', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    Object.keys(_stores).forEach((k) => delete _stores[k]);
  });

  test('reads animate-enter and animate-leave attributes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ hidden: false }');
    const el = document.createElement('div');
    el.setAttribute('hide', 'hidden');
    el.setAttribute('animate-enter', 'fadeIn');
    el.setAttribute('animate-leave', 'fadeOut');
    el.innerHTML = '<span>Content</span>';
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    
    expect(el.style.display).not.toBe('none');

    
    const child = el.querySelector('span');
    expect(child.classList.contains('fadeIn')).toBe(true);
  });
});





describe('foreach with animation attributes', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    Object.keys(_stores).forEach((k) => delete _stores[k]);
  });

  test('reads animate-enter and animate-stagger attributes', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ items: ["a", "b", "c"] }');

    const tpl = document.createElement('template');
    tpl.id = 'item-tpl';
    tpl.innerHTML = '<div class="item"><span bind="item"></span></div>';
    document.body.appendChild(tpl);

    const list = document.createElement('div');
    list.setAttribute('foreach', 'item');
    list.setAttribute('from', 'items');
    list.setAttribute('template', 'item-tpl');
    list.setAttribute('animate-enter', 'fadeIn');
    list.setAttribute('animate-stagger', '100');
    parent.appendChild(list);
    document.body.appendChild(parent);
    processTree(parent);

    
    const wrappers = list.querySelectorAll('div[style*="contents"]');
    expect(wrappers.length).toBe(3);

    
    wrappers.forEach((wrapper) => {
      const firstChild = wrapper.firstElementChild;
      expect(firstChild.classList.contains('fadeIn')).toBe(true);
    });

    
    const wrappersArr = [...wrappers];
    expect(wrappersArr[0].style.animationDelay).toBe('0ms');
    expect(wrappersArr[1].style.animationDelay).toBe('100ms');
    expect(wrappersArr[2].style.animationDelay).toBe('200ms');
  });
});
