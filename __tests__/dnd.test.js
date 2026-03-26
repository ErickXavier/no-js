import { createContext } from '../src/context.js';
import { findContext } from '../src/dom.js';
import { processTree } from '../src/registry.js';
import { evaluate } from '../src/evaluate.js';

import '../src/filters.js';
import '../src/directives/state.js';
import '../src/directives/binding.js';
import '../src/directives/loops.js';
import '../src/directives/events.js';
import '../src/directives/styling.js';
import '../src/directives/dnd.js';

// ─── Test helper: create a mock DragEvent with DataTransfer ────────────
function createDragEvent(type, opts = {}) {
  const dt = {
    effectAllowed: 'move',
    dropEffect: 'move',
    setDragImage: jest.fn(),
    getData: jest.fn(() => ''),
    setData: jest.fn(),
  };
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: dt, writable: false });
  Object.defineProperty(event, 'clientX', { value: opts.clientX || 0, writable: false });
  Object.defineProperty(event, 'clientY', { value: opts.clientY || 0, writable: false });
  if (opts.ctrlKey) Object.defineProperty(event, 'ctrlKey', { value: true });
  if (opts.metaKey) Object.defineProperty(event, 'metaKey', { value: true });
  return event;
}

// ─── Helper: build a basic draggable element in a state context ────────
function setupDrag(dragExpr, attrs = {}) {
  const parent = document.createElement('div');
  parent.setAttribute('state', attrs.state || '{ item: "hello" }');
  const el = document.createElement('div');
  el.setAttribute('drag', dragExpr);
  for (const [k, v] of Object.entries(attrs)) {
    if (k !== 'state') el.setAttribute(k, v);
  }
  parent.appendChild(el);
  document.body.appendChild(parent);
  processTree(parent);
  return { parent, el };
}

// ─── Helper: build a drop zone ────────────────────────────────────────
function setupDrop(dropExpr, attrs = {}) {
  const parent = document.createElement('div');
  parent.setAttribute('state', attrs.state || '{ items: [] }');
  const el = document.createElement('div');
  el.setAttribute('drop', dropExpr);
  for (const [k, v] of Object.entries(attrs)) {
    if (k !== 'state') el.setAttribute(k, v);
  }
  parent.appendChild(el);
  document.body.appendChild(parent);
  processTree(parent);
  return { parent, el };
}

// ─── Helper: build a drag-list ───────────────────────────────────────
function setupDragList(listPath, items, attrs = {}) {
  const tpl = document.createElement('template');
  tpl.id = attrs.templateId || 'dl-tpl';
  tpl.innerHTML = attrs.templateHtml || '<div class="dl-item"><span bind="item.name || item"></span></div>';
  document.body.appendChild(tpl);

  const parent = document.createElement('div');
  parent.setAttribute('state', `{ ${listPath}: ${JSON.stringify(items)} }`);
  const el = document.createElement('div');
  el.setAttribute('drag-list', listPath);
  el.setAttribute('template', attrs.templateId || 'dl-tpl');
  for (const [k, v] of Object.entries(attrs)) {
    if (k !== 'state' && k !== 'templateId' && k !== 'templateHtml') {
      el.setAttribute(k, v);
    }
  }
  parent.appendChild(el);
  document.body.appendChild(parent);
  processTree(parent);
  return { parent, el, ctx: parent.__ctx };
}

// =======================================================================
//  DRAG DIRECTIVE TESTS
// =======================================================================

describe('Drag Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    // Clean up injected styles
    document.querySelectorAll('style[data-nojs-dnd]').forEach(s => s.remove());
  });

  test('1 — sets draggable attribute', () => {
    const { el } = setupDrag('item');
    expect(el.draggable).toBe(true);
    expect(el.getAttribute('draggable')).toBeTruthy();
  });

  test('2 — applies drag-class on dragstart', () => {
    const { el } = setupDrag('item');
    el.dispatchEvent(createDragEvent('dragstart'));
    expect(el.classList.contains('nojs-dragging')).toBe(true);
  });

  test('3 — removes drag-class on dragend', () => {
    const { el } = setupDrag('item');
    el.dispatchEvent(createDragEvent('dragstart'));
    expect(el.classList.contains('nojs-dragging')).toBe(true);
    el.dispatchEvent(createDragEvent('dragend'));
    expect(el.classList.contains('nojs-dragging')).toBe(false);
  });

  test('4 — sets effectAllowed from drag-effect', () => {
    const { el } = setupDrag('item', { 'drag-effect': 'copy' });
    const event = createDragEvent('dragstart');
    el.dispatchEvent(event);
    expect(event.dataTransfer.effectAllowed).toBe('copy');
  });

  test('5 — evaluates drag expression from context', () => {
    const { parent, el } = setupDrag('item', { state: '{ item: { id: 1, name: "Alpha" } }' });
    let capturedDetail = null;
    el.addEventListener('drag-start', (e) => { capturedDetail = e.detail; });
    el.dispatchEvent(createDragEvent('dragstart'));
    expect(capturedDetail).not.toBeNull();
    expect(capturedDetail.item).toEqual({ id: 1, name: 'Alpha' });
  });

  test('6 — respects drag-handle selector', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ item: "hello" }');
    const el = document.createElement('div');
    el.setAttribute('drag', 'item');
    el.setAttribute('drag-handle', '.grip');
    el.innerHTML = '<span class="grip">G</span><span class="content">C</span>';
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    // Mousedown on non-handle area
    const contentEl = el.querySelector('.content');
    contentEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    const evt = createDragEvent('dragstart');
    // With jsdom, we check if preventDefault would be called
    const spy = jest.spyOn(evt, 'preventDefault');
    el.dispatchEvent(evt);
    expect(spy).toHaveBeenCalled();

    // Mousedown on handle area
    const gripEl = el.querySelector('.grip');
    gripEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    const evt2 = createDragEvent('dragstart');
    const spy2 = jest.spyOn(evt2, 'preventDefault');
    el.dispatchEvent(evt2);
    expect(spy2).not.toHaveBeenCalled();
  });

  test('7 — drag-disabled prevents dragging', () => {
    const { el } = setupDrag('item', { 'drag-disabled': 'true', state: '{ item: "hello" }' });
    const evt = createDragEvent('dragstart');
    const spy = jest.spyOn(evt, 'preventDefault');
    el.dispatchEvent(evt);
    expect(spy).toHaveBeenCalled();
  });

  test('8 — drag-disabled reactively toggles', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ item: "hello", locked: false }');
    const el = document.createElement('div');
    el.setAttribute('drag', 'item');
    el.setAttribute('drag-disabled', 'locked');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    expect(el.draggable).toBe(true);

    // Toggle disabled via context
    parent.__ctx.$set('locked', true);
    expect(el.draggable).toBe(false);

    parent.__ctx.$set('locked', false);
    expect(el.draggable).toBe(true);
  });

  test('9 — custom drag-image calls setDragImage', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ item: "hello" }');
    const el = document.createElement('div');
    el.setAttribute('drag', 'item');
    el.setAttribute('drag-image', '.ghost');
    el.setAttribute('drag-image-offset', '10,20');
    el.innerHTML = '<div class="ghost">Ghost</div>';
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    const evt = createDragEvent('dragstart');
    el.dispatchEvent(evt);
    expect(evt.dataTransfer.setDragImage).toHaveBeenCalledWith(
      el.querySelector('.ghost'), 10, 20
    );
  });

  test('10 — dispatches drag-start CustomEvent', () => {
    const { el } = setupDrag('item');
    let detail = null;
    el.addEventListener('drag-start', (e) => { detail = e.detail; });
    el.dispatchEvent(createDragEvent('dragstart'));
    expect(detail).not.toBeNull();
    expect(detail.item).toBe('hello');
    expect(detail.el).toBe(el);
  });

  test('11 — dispatches drag-end CustomEvent', () => {
    const { el } = setupDrag('item');
    let detail = null;
    el.addEventListener('drag-end', (e) => { detail = e.detail; });
    el.dispatchEvent(createDragEvent('dragstart'));
    el.dispatchEvent(createDragEvent('dragend'));
    expect(detail).not.toBeNull();
    expect(detail.item).toBe('hello');
  });

  test('12 — custom drag-class attribute', () => {
    const { el } = setupDrag('item', { 'drag-class': 'opacity-50 scale-95' });
    el.dispatchEvent(createDragEvent('dragstart'));
    expect(el.classList.contains('opacity-50')).toBe(true);
    expect(el.classList.contains('scale-95')).toBe(true);
    el.dispatchEvent(createDragEvent('dragend'));
    expect(el.classList.contains('opacity-50')).toBe(false);
    expect(el.classList.contains('scale-95')).toBe(false);
  });

  test('13 — sets aria-grabbed on drag', () => {
    const { el } = setupDrag('item');
    expect(el.getAttribute('aria-grabbed')).toBe('false');
    el.dispatchEvent(createDragEvent('dragstart'));
    expect(el.getAttribute('aria-grabbed')).toBe('true');
    el.dispatchEvent(createDragEvent('dragend'));
    expect(el.getAttribute('aria-grabbed')).toBe('false');
  });

  test('14 — sets tabindex for accessibility', () => {
    const { el } = setupDrag('item');
    expect(el.getAttribute('tabindex')).toBe('0');
  });

  test('15 — injects DnD styles once', () => {
    setupDrag('item');
    const styles = document.querySelectorAll('style[data-nojs-dnd]');
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).toContain('.nojs-dragging');
    expect(styles[0].textContent).toContain('.nojs-drag-over');
    expect(styles[0].textContent).toContain('.nojs-drop-placeholder');

    // Creating another drag doesn't inject again
    setupDrag('item');
    expect(document.querySelectorAll('style[data-nojs-dnd]').length).toBe(1);
  });
});

// =======================================================================
//  DROP DIRECTIVE TESTS
// =======================================================================

describe('Drop Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.querySelectorAll('style[data-nojs-dnd]').forEach(s => s.remove());
  });

  // Helper: simulate a drag session by setting _dndState.dragging directly
  // We access it indirectly by triggering a real dragstart first
  function startDrag(dragEl) {
    dragEl.dispatchEvent(createDragEvent('dragstart'));
  }

  test('11 — prevents default on dragover for accepted type', () => {
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'task' });
    const { el: dropEl } = setupDrop('items = [...items, $drag]', { 'drop-accept': 'task' });

    startDrag(dragEl);
    const evt = createDragEvent('dragover');
    const spy = jest.spyOn(evt, 'preventDefault');
    dropEl.dispatchEvent(evt);
    expect(spy).toHaveBeenCalled();
  });

  test('12 — rejects dragover for mismatched type', () => {
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'file' });
    const { el: dropEl } = setupDrop('items = [...items, $drag]', { 'drop-accept': 'task' });

    startDrag(dragEl);
    const evt = createDragEvent('dragover');
    const spy = jest.spyOn(evt, 'preventDefault');
    dropEl.dispatchEvent(evt);
    expect(spy).not.toHaveBeenCalled();
  });

  test('13 — applies drop-class on dragenter', () => {
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'task' });
    const { el: dropEl } = setupDrop('items = [...items, $drag]', { 'drop-accept': 'task' });

    startDrag(dragEl);
    dropEl.dispatchEvent(createDragEvent('dragenter'));
    expect(dropEl.classList.contains('nojs-drag-over')).toBe(true);
  });

  test('14 — removes drop-class on dragleave', () => {
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'task' });
    const { el: dropEl } = setupDrop('items = [...items, $drag]', { 'drop-accept': 'task' });

    startDrag(dragEl);
    dropEl.dispatchEvent(createDragEvent('dragenter'));
    expect(dropEl.classList.contains('nojs-drag-over')).toBe(true);
    dropEl.dispatchEvent(createDragEvent('dragleave'));
    expect(dropEl.classList.contains('nojs-drag-over')).toBe(false);
  });

  test('15 — executes drop expression on drop event', () => {
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'default', state: '{ item: "test-item" }' });
    const { parent: dropParent, el: dropEl } = setupDrop('items = [...items, $drag]', { state: '{ items: ["a"] }' });

    startDrag(dragEl);
    dropEl.dispatchEvent(createDragEvent('drop'));

    const ctx = dropParent.__ctx;
    expect(ctx.items).toEqual(['a', 'test-item']);
  });

  test('16 — accepts multiple types via comma-separated drop-accept', () => {
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'file' });
    const { el: dropEl } = setupDrop('items = [...items, $drag]', { 'drop-accept': 'task,file' });

    startDrag(dragEl);
    const evt = createDragEvent('dragover');
    const spy = jest.spyOn(evt, 'preventDefault');
    dropEl.dispatchEvent(evt);
    expect(spy).toHaveBeenCalled();
  });

  test('17 — wildcard accepts all types', () => {
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'anything' });
    const { el: dropEl } = setupDrop('items = [...items, $drag]', { 'drop-accept': '*' });

    startDrag(dragEl);
    const evt = createDragEvent('dragover');
    const spy = jest.spyOn(evt, 'preventDefault');
    dropEl.dispatchEvent(evt);
    expect(spy).toHaveBeenCalled();
  });

  test('18 — respects drop-max capacity', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ items: [] }');
    const dropEl = document.createElement('div');
    dropEl.setAttribute('drop', 'items = [...items, $drag]');
    dropEl.setAttribute('drop-accept', 'default');
    dropEl.setAttribute('drop-max', '2');
    // Add 2 children to simulate full capacity
    dropEl.appendChild(document.createElement('div'));
    dropEl.appendChild(document.createElement('div'));
    parent.appendChild(dropEl);
    document.body.appendChild(parent);
    processTree(parent);

    const { el: dragEl } = setupDrag('item');
    startDrag(dragEl);

    const evt = createDragEvent('dragover');
    const spy = jest.spyOn(evt, 'preventDefault');
    dropEl.dispatchEvent(evt);
    expect(spy).not.toHaveBeenCalled();
  });

  test('19 — drop-disabled prevents dropping', () => {
    const { el: dragEl } = setupDrag('item');
    const { el: dropEl } = setupDrop('items = [...items, $drag]', { 'drop-disabled': 'true' });

    startDrag(dragEl);
    const evt = createDragEvent('dragover');
    const spy = jest.spyOn(evt, 'preventDefault');
    dropEl.dispatchEvent(evt);
    expect(spy).not.toHaveBeenCalled();
  });

  test('20 — dispatches drop CustomEvent', () => {
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'default', state: '{ item: "val" }' });
    const { el: dropEl } = setupDrop('items = [...items, $drag]', { state: '{ items: [] }' });

    let detail = null;
    dropEl.addEventListener('drop', (e) => { if (e.detail) detail = e.detail; });

    startDrag(dragEl);
    dropEl.dispatchEvent(createDragEvent('drop'));

    expect(detail).not.toBeNull();
    expect(detail.item).toBe('val');
    expect(typeof detail.index).toBe('number');
  });

  test('21 — sets aria-dropeffect on drop zone', () => {
    const { el } = setupDrop('items = [...items, $drag]', { 'drop-effect': 'copy' });
    expect(el.getAttribute('aria-dropeffect')).toBe('copy');
  });

  test('22 — custom drop-class attribute', () => {
    const { el: dragEl } = setupDrag('item');
    const { el: dropEl } = setupDrop('items = [...items, $drag]', { 'drop-class': 'border-dashed ring-2' });

    startDrag(dragEl);
    dropEl.dispatchEvent(createDragEvent('dragenter'));
    expect(dropEl.classList.contains('border-dashed')).toBe(true);
    expect(dropEl.classList.contains('ring-2')).toBe(true);
    dropEl.dispatchEvent(createDragEvent('dragleave'));
    expect(dropEl.classList.contains('border-dashed')).toBe(false);
  });

  test('23 — dispatches drag-enter CustomEvent', () => {
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'task' });
    const { el: dropEl } = setupDrop('items = [...items, $drag]', { 'drop-accept': 'task' });

    let detail = null;
    dropEl.addEventListener('drag-enter', (e) => { detail = e.detail; });

    startDrag(dragEl);
    dropEl.dispatchEvent(createDragEvent('dragenter'));
    expect(detail).not.toBeNull();
    expect(detail.type).toBe('task');
  });

  test('24 — dispatches drag-leave CustomEvent', () => {
    const { el: dragEl } = setupDrag('item');
    const { el: dropEl } = setupDrop('items = [...items, $drag]');

    let detail = null;
    dropEl.addEventListener('drag-leave', (e) => { detail = e.detail; });

    startDrag(dragEl);
    dropEl.dispatchEvent(createDragEvent('dragenter'));
    dropEl.dispatchEvent(createDragEvent('dragleave'));
    expect(detail).not.toBeNull();
    expect(detail.item).toBe('hello');
  });
});

// =======================================================================
//  DRAG-LIST DIRECTIVE TESTS
// =======================================================================

describe('Drag-List Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.querySelectorAll('style[data-nojs-dnd]').forEach(s => s.remove());
  });

  test('26 — renders items like each', () => {
    const { el } = setupDragList('tasks', ['Alpha', 'Beta', 'Gamma']);
    const items = el.querySelectorAll('.dl-item');
    expect(items.length).toBe(3);
  });

  test('27 — items are draggable', () => {
    const { el } = setupDragList('tasks', ['A', 'B']);
    const wrappers = el.querySelectorAll('[draggable="true"]');
    expect(wrappers.length).toBe(2);
  });

  test('28 — sets role=listbox on container', () => {
    const { el } = setupDragList('tasks', ['A']);
    expect(el.getAttribute('role')).toBe('listbox');
  });

  test('29 — sets role=option on items', () => {
    const { el } = setupDragList('tasks', ['A', 'B']);
    const options = el.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
  });

  test('30 — custom drag-list-item variable name', () => {
    const tpl = document.createElement('template');
    tpl.id = 'custom-tpl';
    tpl.innerHTML = '<div class="ci"><span bind="task"></span></div>';
    document.body.appendChild(tpl);

    const parent = document.createElement('div');
    parent.setAttribute('state', '{ tasks: ["Do laundry", "Cook"] }');
    const el = document.createElement('div');
    el.setAttribute('drag-list', 'tasks');
    el.setAttribute('template', 'custom-tpl');
    el.setAttribute('drag-list-item', 'task');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    const items = el.querySelectorAll('.ci');
    expect(items.length).toBe(2);
    // Check that the child context has the correct variable name
    const wrapper = el.children[0];
    expect(wrapper.__ctx.task).toBe('Do laundry');
  });

  test('31 — provides loop variables ($index, $count)', () => {
    const { el } = setupDragList('tasks', ['A', 'B', 'C']);
    const wrappers = el.querySelectorAll('[role="option"]');
    expect(wrappers[0].__ctx.$index).toBe(0);
    expect(wrappers[0].__ctx.$count).toBe(3);
    expect(wrappers[0].__ctx.$first).toBe(true);
    expect(wrappers[2].__ctx.$last).toBe(true);
  });

  test('32 — re-renders when state changes', () => {
    const { el, ctx } = setupDragList('tasks', ['A', 'B']);
    expect(el.querySelectorAll('.dl-item').length).toBe(2);

    ctx.$set('tasks', ['A', 'B', 'C', 'D']);
    expect(el.querySelectorAll('.dl-item').length).toBe(4);
  });

  test('33 — respects drop-max', () => {
    const { el } = setupDragList('tasks', ['A', 'B'], { 'drop-max': '2' });
    // Simulate drag from external
    const { el: dragEl } = setupDrag('item', { 'drag-type': '__draglist_tasks' });
    dragEl.dispatchEvent(createDragEvent('dragstart'));

    const evt = createDragEvent('dragover');
    const spy = jest.spyOn(evt, 'preventDefault');
    el.dispatchEvent(evt);
    // list already has 2 items, max is 2
    expect(spy).not.toHaveBeenCalled();
  });

  test('34 — applies drop-class on dragenter', () => {
    const { el } = setupDragList('tasks', ['A'], { 'drop-accept': 'task' });
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'task' });

    dragEl.dispatchEvent(createDragEvent('dragstart'));
    el.dispatchEvent(createDragEvent('dragenter'));
    expect(el.classList.contains('nojs-drag-over')).toBe(true);
  });

  test('35 — sets aria-dropeffect on container', () => {
    const { el } = setupDragList('tasks', ['A']);
    expect(el.getAttribute('aria-dropeffect')).toBe('move');
  });

  test('36 — copy mode sets aria-dropeffect to copy', () => {
    const { el } = setupDragList('tasks', ['A'], { 'drag-list-copy': '' });
    expect(el.getAttribute('aria-dropeffect')).toBe('copy');
  });

  test('37 — items have tabindex for keyboard access', () => {
    const { el } = setupDragList('tasks', ['A', 'B']);
    const wrappers = el.querySelectorAll('[tabindex="0"]');
    expect(wrappers.length).toBe(2);
  });

  test('38 — dispatches drag-start event on item drag', () => {
    const { el } = setupDragList('tasks', ['Alpha', 'Beta']);
    let detail = null;
    el.addEventListener('drag-start', (e) => { detail = e.detail; });

    const firstWrapper = el.children[0];
    firstWrapper.dispatchEvent(createDragEvent('dragstart'));
    expect(detail).not.toBeNull();
    expect(detail.item).toBe('Alpha');
    expect(detail.index).toBe(0);
  });

  test('39 — dispatches drag-enter event on zone', () => {
    const { el } = setupDragList('tasks', ['A'], { 'drop-accept': 'task' });
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'task' });

    let detail = null;
    el.addEventListener('drag-enter', (e) => { detail = e.detail; });

    dragEl.dispatchEvent(createDragEvent('dragstart'));
    el.dispatchEvent(createDragEvent('dragenter'));
    expect(detail).not.toBeNull();
    expect(detail.type).toBe('task');
  });

  test('40 — dispatches drag-leave event', () => {
    const { el } = setupDragList('tasks', ['A'], { 'drop-accept': 'task' });
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'task' });

    let detail = null;
    el.addEventListener('drag-leave', (e) => { detail = e.detail; });

    dragEl.dispatchEvent(createDragEvent('dragstart'));
    el.dispatchEvent(createDragEvent('dragenter'));
    el.dispatchEvent(createDragEvent('dragleave'));
    expect(detail).not.toBeNull();
  });

  test('41 — drop on empty list works', () => {
    const { el, ctx } = setupDragList('tasks', [], { 'drop-accept': 'task' });
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'task', state: '{ item: "New" }' });

    dragEl.dispatchEvent(createDragEvent('dragstart'));
    el.dispatchEvent(createDragEvent('drop'));
    expect(ctx.tasks.length).toBe(1);
    expect(ctx.tasks[0]).toBe('New');
  });

  test('42 — disabled drag prevents item dragstart', () => {
    const { el } = setupDragList('tasks', ['A', 'B'], { 'drag-disabled': 'true' });

    const wrapper = el.children[0];
    const evt = createDragEvent('dragstart');
    const spy = jest.spyOn(evt, 'preventDefault');
    wrapper.dispatchEvent(evt);
    expect(spy).toHaveBeenCalled();
  });

  test('43 — disabled drop prevents dragover', () => {
    const { el } = setupDragList('tasks', ['A'], { 'drop-disabled': 'true', 'drop-accept': 'task' });
    const { el: dragEl } = setupDrag('item', { 'drag-type': 'task' });

    dragEl.dispatchEvent(createDragEvent('dragstart'));
    const evt = createDragEvent('dragover');
    const spy = jest.spyOn(evt, 'preventDefault');
    el.dispatchEvent(evt);
    expect(spy).not.toHaveBeenCalled();
  });

  test('44 — each drag-list item wrapper has __disposers registered', () => {
    const { el } = setupDragList('tasks', ['A', 'B', 'C']);
    const wrappers = el.querySelectorAll('[role="option"]');

    wrappers.forEach((wrapper) => {
      expect(wrapper.__disposers).toBeDefined();
      expect(Array.isArray(wrapper.__disposers)).toBe(true);
      // Should have at least 3 disposers: dragstart, dragend, keydown
      expect(wrapper.__disposers.length).toBeGreaterThanOrEqual(3);
      wrapper.__disposers.forEach((fn) => {
        expect(typeof fn).toBe('function');
      });
    });
  });

  test('45 — calling __disposers removes dragstart, dragend, and keydown listeners', () => {
    const { el } = setupDragList('tasks', ['A', 'B']);
    const wrapper = el.children[0];

    // Spy on removeEventListener to verify cleanup
    const removeSpy = jest.spyOn(wrapper, 'removeEventListener');

    // Run all disposers
    wrapper.__disposers.forEach((fn) => fn());

    // Should have removed dragstart, dragend, and keydown listeners
    const removedEvents = removeSpy.mock.calls.map((call) => call[0]);
    expect(removedEvents).toContain('dragstart');
    expect(removedEvents).toContain('dragend');
    expect(removedEvents).toContain('keydown');

    removeSpy.mockRestore();
  });

  test('46 — after disposal, keydown Space does not trigger drag behavior', () => {
    const { el } = setupDragList('tasks', ['A']);
    const wrapper = el.children[0];
    // dragEl is the first visible child (wrapper has display:contents)
    const dragEl = wrapper.firstElementChild || wrapper;

    // Clear any leftover drag state from prior tests by using dragstart/dragend cycle
    wrapper.dispatchEvent(createDragEvent('dragstart'));
    wrapper.dispatchEvent(createDragEvent('dragend'));
    expect(dragEl.getAttribute('aria-grabbed')).toBe('false');

    // Now verify keyboard drag works before disposal
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(dragEl.getAttribute('aria-grabbed')).toBe('true');

    // Reset via dragend to clear _dndState.dragging
    wrapper.dispatchEvent(createDragEvent('dragend'));
    expect(dragEl.getAttribute('aria-grabbed')).toBe('false');

    // Run disposers to clean up all listeners
    wrapper.__disposers.forEach((fn) => fn());

    // After disposal, pressing Space should NOT set aria-grabbed to true
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(dragEl.getAttribute('aria-grabbed')).toBe('false');
  });
});

// =======================================================================
//  DRAG-MULTIPLE DIRECTIVE TESTS
// =======================================================================

describe('Drag-Multiple Directive', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.querySelectorAll('style[data-nojs-dnd]').forEach(s => s.remove());
  });

  function setupSelectableItems() {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ items: ["A", "B", "C"] }');

    const tpl = document.createElement('template');
    tpl.id = 'sel-tpl';
    tpl.innerHTML = '<div class="sel-item" drag="item" drag-group="files" drag-multiple><span bind="item"></span></div>';
    document.body.appendChild(tpl);

    const list = document.createElement('div');
    list.setAttribute('each', 'item in items');
    list.setAttribute('template', 'sel-tpl');
    parent.appendChild(list);
    document.body.appendChild(parent);
    processTree(parent);

    return { parent, list };
  }

  test('44 — click selects item', () => {
    const { list } = setupSelectableItems();
    const items = list.querySelectorAll('.sel-item');
    items[0].click();
    expect(items[0].classList.contains('nojs-selected')).toBe(true);
  });

  test('45 — click without Ctrl replaces selection', () => {
    const { list } = setupSelectableItems();
    const items = list.querySelectorAll('.sel-item');
    items[0].click();
    expect(items[0].classList.contains('nojs-selected')).toBe(true);
    items[1].click();
    expect(items[1].classList.contains('nojs-selected')).toBe(true);
    expect(items[0].classList.contains('nojs-selected')).toBe(false);
  });

  test('46 — Ctrl+click adds to selection', () => {
    const { list } = setupSelectableItems();
    const items = list.querySelectorAll('.sel-item');
    items[0].click();
    items[1].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    expect(items[0].classList.contains('nojs-selected')).toBe(true);
    expect(items[1].classList.contains('nojs-selected')).toBe(true);
  });

  test('47 — custom select class', () => {
    const parent = document.createElement('div');
    parent.setAttribute('state', '{ x: 1 }');
    const el = document.createElement('div');
    el.setAttribute('drag', 'x');
    el.setAttribute('drag-group', 'g');
    el.setAttribute('drag-multiple', '');
    el.setAttribute('drag-multiple-class', 'ring-2 ring-sky-500');
    parent.appendChild(el);
    document.body.appendChild(parent);
    processTree(parent);

    el.click();
    expect(el.classList.contains('ring-2')).toBe(true);
    expect(el.classList.contains('ring-sky-500')).toBe(true);
  });

  test('48 — Escape clears selection', () => {
    const { list } = setupSelectableItems();
    const items = list.querySelectorAll('.sel-item');
    items[0].click();
    items[1].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    expect(items[0].classList.contains('nojs-selected')).toBe(true);
    expect(items[1].classList.contains('nojs-selected')).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(items[0].classList.contains('nojs-selected')).toBe(false);
    expect(items[1].classList.contains('nojs-selected')).toBe(false);
  });

  test('49 — Ctrl+click toggles off', () => {
    const { list } = setupSelectableItems();
    const items = list.querySelectorAll('.sel-item');
    items[0].click();
    expect(items[0].classList.contains('nojs-selected')).toBe(true);
    items[0].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    expect(items[0].classList.contains('nojs-selected')).toBe(false);
  });
});

// =======================================================================
//  ACCESSIBILITY TESTS
// =======================================================================

describe('DnD Accessibility', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.querySelectorAll('style[data-nojs-dnd]').forEach(s => s.remove());
  });

  test('50 — aria-grabbed set on dragstart/dragend', () => {
    const { el } = setupDrag('item');
    expect(el.getAttribute('aria-grabbed')).toBe('false');
    el.dispatchEvent(createDragEvent('dragstart'));
    expect(el.getAttribute('aria-grabbed')).toBe('true');
    el.dispatchEvent(createDragEvent('dragend'));
    expect(el.getAttribute('aria-grabbed')).toBe('false');
  });

  test('51 — aria-dropeffect on drop zones', () => {
    const { el } = setupDrop('items = [...items, $drag]', { 'drop-effect': 'copy' });
    expect(el.getAttribute('aria-dropeffect')).toBe('copy');
  });

  test('52 — keyboard Space grabs item (drag)', () => {
    const { el } = setupDrag('item');
    let detail = null;
    el.addEventListener('drag-start', (e) => { detail = e.detail; });
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(el.getAttribute('aria-grabbed')).toBe('true');
    expect(el.classList.contains('nojs-dragging')).toBe(true);
    expect(detail).not.toBeNull();
  });

  test('53 — keyboard Escape cancels drag', () => {
    const { el } = setupDrag('item');
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(el.getAttribute('aria-grabbed')).toBe('true');
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el.getAttribute('aria-grabbed')).toBe('false');
    expect(el.classList.contains('nojs-dragging')).toBe(false);
  });
});

// =======================================================================
//  EDGE CASE TESTS
// =======================================================================

describe('DnD Edge Cases', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.querySelectorAll('style[data-nojs-dnd]').forEach(s => s.remove());
  });

  test('54 — drop outside any zone resets drag class', () => {
    const { el } = setupDrag('item');
    el.dispatchEvent(createDragEvent('dragstart'));
    expect(el.classList.contains('nojs-dragging')).toBe(true);
    // No drop zone received it
    el.dispatchEvent(createDragEvent('dragend'));
    expect(el.classList.contains('nojs-dragging')).toBe(false);
  });

  test('55 — nested dragenter/dragleave depth tracking', () => {
    const { el: dragEl } = setupDrag('item');
    const { el: dropEl } = setupDrop('items = [...items, $drag]');

    dragEl.dispatchEvent(createDragEvent('dragstart'));

    // Enter parent, then child (nested enter)
    dropEl.dispatchEvent(createDragEvent('dragenter'));
    expect(dropEl.classList.contains('nojs-drag-over')).toBe(true);
    dropEl.dispatchEvent(createDragEvent('dragenter')); // child enter
    expect(dropEl.classList.contains('nojs-drag-over')).toBe(true);

    // Leave child (but still in parent)
    dropEl.dispatchEvent(createDragEvent('dragleave'));
    expect(dropEl.classList.contains('nojs-drag-over')).toBe(true); // still inside

    // Leave parent
    dropEl.dispatchEvent(createDragEvent('dragleave'));
    expect(dropEl.classList.contains('nojs-drag-over')).toBe(false);
  });

  test('56 — multiple independent DnD systems on same page', () => {
    // System 1: tasks
    const { el: taskDrag } = setupDrag('item', { 'drag-type': 'task', state: '{ item: "Task1" }' });
    const { el: taskDrop } = setupDrop('items = [...items, $drag]', {
      'drop-accept': 'task', state: '{ items: [] }'
    });

    // System 2: files (should not interfere)
    const { el: fileDrop } = setupDrop('items = [...items, $drag]', {
      'drop-accept': 'file', state: '{ items: [] }'
    });

    // Drag a task
    taskDrag.dispatchEvent(createDragEvent('dragstart'));

    // Try to drop on file zone — should be rejected
    const fileOverEvt = createDragEvent('dragover');
    const fileSpy = jest.spyOn(fileOverEvt, 'preventDefault');
    fileDrop.dispatchEvent(fileOverEvt);
    expect(fileSpy).not.toHaveBeenCalled();

    // Drop on task zone — should be accepted
    const taskOverEvt = createDragEvent('dragover');
    const taskSpy = jest.spyOn(taskOverEvt, 'preventDefault');
    taskDrop.dispatchEvent(taskOverEvt);
    expect(taskSpy).toHaveBeenCalled();
  });
});
