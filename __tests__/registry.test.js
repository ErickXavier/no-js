import { registerDirective, processElement, processTree } from '../src/registry.js';
import { createContext } from '../src/context.js';

describe('Directive Registry', () => {
  describe('registerDirective', () => {
    test('registers a directive and processes elements with it', () => {
      const initFn = jest.fn();
      registerDirective('test-dir', { priority: 50, init: initFn });

      const div = document.createElement('div');
      div.setAttribute('test-dir', 'hello');
      processElement(div);

      expect(initFn).toHaveBeenCalledWith(div, 'test-dir', 'hello');
    });

    test('respects directive priority', () => {
      const order = [];
      registerDirective('prio-low', {
        priority: 100,
        init: () => order.push('low'),
      });
      registerDirective('prio-high', {
        priority: 1,
        init: () => order.push('high'),
      });

      const div = document.createElement('div');
      div.setAttribute('prio-low', '');
      div.setAttribute('prio-high', '');
      processElement(div);

      expect(order).toEqual(['high', 'low']);
    });

    test('default priority is 50', () => {
      const initFn = jest.fn();
      registerDirective('default-prio', { init: initFn });

      const div = document.createElement('div');
      div.setAttribute('default-prio', 'val');
      processElement(div);

      expect(initFn).toHaveBeenCalled();
    });
  });

  describe('processElement', () => {
    test('marks element as __declared', () => {
      const div = document.createElement('div');
      expect(div.__declared).toBeFalsy();
      processElement(div);
      expect(div.__declared).toBe(true);
    });

    test('skips already declared elements', () => {
      const initFn = jest.fn();
      registerDirective('skip-test', { init: initFn });

      const div = document.createElement('div');
      div.setAttribute('skip-test', '');
      div.__declared = true;

      processElement(div);
      expect(initFn).not.toHaveBeenCalled();
    });

    test('matches pattern directives like class-*', () => {
      const initFn = jest.fn();
      registerDirective('class-*', { priority: 20, init: initFn });

      const div = document.createElement('div');
      div.setAttribute('class-active', 'true');
      processElement(div);

      expect(initFn).toHaveBeenCalledWith(div, 'class-active', 'true');
    });

    test('matches pattern directives like on:*', () => {
      const initFn = jest.fn();
      registerDirective('on:*', { priority: 20, init: initFn });

      const div = document.createElement('div');
      div.setAttribute('on:click', 'doSomething()');
      processElement(div);

      expect(initFn).toHaveBeenCalledWith(div, 'on:click', 'doSomething()');
    });
  });

  describe('processTree', () => {
    test('processes all elements in tree', () => {
      const initFn = jest.fn();
      registerDirective('tree-test', { init: initFn });

      const root = document.createElement('div');
      const child1 = document.createElement('span');
      child1.setAttribute('tree-test', 'a');
      const child2 = document.createElement('p');
      child2.setAttribute('tree-test', 'b');
      root.appendChild(child1);
      root.appendChild(child2);

      processTree(root);
      expect(initFn).toHaveBeenCalledTimes(2);
    });

    test('skips template and script elements', () => {
      const initFn = jest.fn();
      registerDirective('skip-tpl', { init: initFn });

      const root = document.createElement('div');
      const tpl = document.createElement('template');
      tpl.setAttribute('skip-tpl', '');
      const script = document.createElement('script');
      script.setAttribute('skip-tpl', '');
      root.appendChild(tpl);
      root.appendChild(script);

      processTree(root);
      expect(initFn).not.toHaveBeenCalled();
    });

    test('handles null root gracefully', () => {
      expect(() => processTree(null)).not.toThrow();
    });

    test('processes root element itself', () => {
      const initFn = jest.fn();
      registerDirective('root-test', { init: initFn });

      const root = document.createElement('div');
      root.setAttribute('root-test', 'val');
      processTree(root);

      expect(initFn).toHaveBeenCalledWith(root, 'root-test', 'val');
    });
  });
});
