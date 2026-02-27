import { _animateIn, _animateOut } from '../src/animations.js';

describe('Animations', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('_animateIn', () => {
    test('adds animation class and removes after animationend', () => {
      const el = document.createElement('div');
      const child = document.createElement('span');
      el.appendChild(child);
      document.body.appendChild(el);

      _animateIn(el, 'fadeIn', null);
      expect(child.classList.contains('fadeIn')).toBe(true);

      child.dispatchEvent(new Event('animationend'));
      expect(child.classList.contains('fadeIn')).toBe(false);
    });

    test('adds transition classes for named transition', () => {
      const el = document.createElement('div');
      const child = document.createElement('span');
      el.appendChild(child);
      document.body.appendChild(el);

      _animateIn(el, null, 'slide');
      expect(child.classList.contains('slide-enter')).toBe(true);
      expect(child.classList.contains('slide-enter-active')).toBe(true);
    });

    test('does nothing when no animation or transition specified', () => {
      const el = document.createElement('div');
      const child = document.createElement('span');
      el.appendChild(child);
      document.body.appendChild(el);

      _animateIn(el, null, null);
      expect(child.classList.length).toBe(0);
    });

    test('targets el itself when no firstElementChild', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);

      _animateIn(el, 'fadeIn', null);
      expect(el.classList.contains('fadeIn')).toBe(true);
    });
  });

  describe('_animateOut', () => {
    test('adds animation class and calls callback after animationend', () => {
      const el = document.createElement('div');
      const child = document.createElement('span');
      el.appendChild(child);
      document.body.appendChild(el);

      const callback = jest.fn();
      _animateOut(el, 'fadeOut', null, callback);
      expect(child.classList.contains('fadeOut')).toBe(true);

      child.dispatchEvent(new Event('animationend'));
      expect(child.classList.contains('fadeOut')).toBe(false);
      expect(callback).toHaveBeenCalled();
    });

    test('adds transition leave classes', () => {
      const el = document.createElement('div');
      const child = document.createElement('span');
      el.appendChild(child);
      document.body.appendChild(el);

      const callback = jest.fn();
      _animateOut(el, null, 'slide', callback);
      expect(child.classList.contains('slide-leave')).toBe(true);
      expect(child.classList.contains('slide-leave-active')).toBe(true);
    });

    test('calls callback immediately when no animation specified', () => {
      const el = document.createElement('div');
      const child = document.createElement('span');
      el.appendChild(child);
      document.body.appendChild(el);

      const callback = jest.fn();
      _animateOut(el, null, null, callback);
      expect(callback).toHaveBeenCalled();
    });

    test('calls callback immediately when element has no children', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);

      const callback = jest.fn();
      _animateOut(el, 'fadeOut', null, callback);
      expect(callback).toHaveBeenCalled();
    });
  });
});

describe('_animateIn with transition', () => {
  test('adds transition-enter and transition-enter-active classes', () => {
    const el = document.createElement('div');
    const child = document.createElement('p');
    el.appendChild(child);

    _animateIn(el, null, 'fade');

    expect(child.classList.contains('fade-enter')).toBe(true);
    expect(child.classList.contains('fade-enter-active')).toBe(true);
  });

  test('transition rAF removes enter, adds enter-to', async () => {
    const el = document.createElement('div');
    const child = document.createElement('p');
    el.appendChild(child);

    _animateIn(el, null, 'slide');

    await new Promise((r) => requestAnimationFrame(r));

    expect(child.classList.contains('slide-enter')).toBe(false);
    expect(child.classList.contains('slide-enter-to')).toBe(true);
    expect(child.classList.contains('slide-enter-active')).toBe(true);
  });

  test('transition cleans up classes on transitionend', async () => {
    const el = document.createElement('div');
    const child = document.createElement('p');
    el.appendChild(child);

    _animateIn(el, null, 'zoom');

    await new Promise((r) => requestAnimationFrame(r));

    child.dispatchEvent(new Event('transitionend'));

    expect(child.classList.contains('zoom-enter-active')).toBe(false);
    expect(child.classList.contains('zoom-enter-to')).toBe(false);
  });
});

describe('_animateOut with transition', () => {
  test('adds transition-leave classes', () => {
    const el = document.createElement('div');
    const child = document.createElement('p');
    el.appendChild(child);

    const callback = jest.fn();
    _animateOut(el, null, 'fade', callback);

    expect(child.classList.contains('fade-leave')).toBe(true);
    expect(child.classList.contains('fade-leave-active')).toBe(true);
  });

  test('transition-leave rAF removes leave, adds leave-to', async () => {
    const el = document.createElement('div');
    const child = document.createElement('p');
    el.appendChild(child);

    const callback = jest.fn();
    _animateOut(el, null, 'slide', callback);

    await new Promise((r) => requestAnimationFrame(r));

    expect(child.classList.contains('slide-leave')).toBe(false);
    expect(child.classList.contains('slide-leave-to')).toBe(true);
  });

  test('transition-leave cleanup and callback on transitionend', async () => {
    const el = document.createElement('div');
    const child = document.createElement('p');
    el.appendChild(child);

    const callback = jest.fn();
    _animateOut(el, null, 'zoom', callback);

    await new Promise((r) => requestAnimationFrame(r));

    child.dispatchEvent(new Event('transitionend'));

    expect(child.classList.contains('zoom-leave-active')).toBe(false);
    expect(child.classList.contains('zoom-leave-to')).toBe(false);
    expect(callback).toHaveBeenCalled();
  });

  test('animateOut with animName fallback timeout', () => {
    jest.useFakeTimers();
    const el = document.createElement('div');
    const child = document.createElement('p');
    el.appendChild(child);

    const callback = jest.fn();
    _animateOut(el, 'spin-out', null, callback);

    expect(child.classList.contains('spin-out')).toBe(true);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('animateIn transition fallback timeout cleans up classes', async () => {
    const el = document.createElement('div');
    const child = document.createElement('p');
    el.appendChild(child);

    _animateIn(el, null, 'slow');

    await new Promise((r) => requestAnimationFrame(r));

    expect(child.classList.contains('slow-enter-active')).toBe(true);
    expect(child.classList.contains('slow-enter-to')).toBe(true);

    child.dispatchEvent(new Event('transitionend'));

    expect(child.classList.contains('slow-enter-active')).toBe(false);
    expect(child.classList.contains('slow-enter-to')).toBe(false);
  });
});

describe('_animateIn – el fallback with transitionName (L16 || el branch)', () => {
  test('targets el itself when no firstElementChild and transitionName is used', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    _animateIn(el, null, 'fade');

    expect(el.classList.contains('fade-enter')).toBe(true);
    expect(el.classList.contains('fade-enter-active')).toBe(true);

    await new Promise((r) => requestAnimationFrame(r));

    expect(el.classList.contains('fade-enter')).toBe(false);
    expect(el.classList.contains('fade-enter-to')).toBe(true);
    expect(el.classList.contains('fade-enter-active')).toBe(true);

    el.dispatchEvent(new Event('transitionend'));

    expect(el.classList.contains('fade-enter-active')).toBe(false);
    expect(el.classList.contains('fade-enter-to')).toBe(false);
  });
});

describe('_animateOut – childNodes.length > 0 but no firstElementChild (L43 false branch)', () => {
  test('does not short-circuit when element has text childNodes but no element children', () => {
    const el = document.createElement('div');
    el.appendChild(document.createTextNode('hello'));
    document.body.appendChild(el);

    const callback = jest.fn();
    _animateOut(el, null, null, callback);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('processes animName on el itself when text-only childNodes exist', () => {
    const el = document.createElement('div');
    el.appendChild(document.createTextNode('some text'));
    document.body.appendChild(el);

    const callback = jest.fn();
    _animateOut(el, 'fadeOut', null, callback);

    expect(el.classList.contains('fadeOut')).toBe(true);
    expect(callback).not.toHaveBeenCalled();

    el.dispatchEvent(new Event('animationend'));
    expect(el.classList.contains('fadeOut')).toBe(false);
    expect(callback).toHaveBeenCalled();
  });
});

describe('_animateOut – el fallback with transitionName (L57 || el branch)', () => {
  test('targets el itself for transition-leave when no firstElementChild', async () => {
    const el = document.createElement('div');
    el.appendChild(document.createTextNode('text node'));
    document.body.appendChild(el);

    const callback = jest.fn();
    _animateOut(el, null, 'slide', callback);

    expect(el.classList.contains('slide-leave')).toBe(true);
    expect(el.classList.contains('slide-leave-active')).toBe(true);

    await new Promise((r) => requestAnimationFrame(r));

    expect(el.classList.contains('slide-leave')).toBe(false);
    expect(el.classList.contains('slide-leave-to')).toBe(true);
    expect(el.classList.contains('slide-leave-active')).toBe(true);

    el.dispatchEvent(new Event('transitionend'));

    expect(el.classList.contains('slide-leave-active')).toBe(false);
    expect(el.classList.contains('slide-leave-to')).toBe(false);
    expect(callback).toHaveBeenCalled();
  });
});

describe('Built-in CSS @keyframes injection', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('_animateIn injects a <style data-nojs-animations> tag into document head', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    _animateIn(el, 'fadeIn', null);

    const styleTag = document.head.querySelector('style[data-nojs-animations]');
    expect(styleTag).not.toBeNull();
    expect(styleTag.textContent).toContain('@keyframes fadeIn');
    expect(styleTag.textContent).toContain('@keyframes fadeOut');
    expect(styleTag.textContent).toContain('@keyframes slideInLeft');
    expect(styleTag.textContent).toContain('@keyframes zoomIn');
    expect(styleTag.textContent).toContain('@keyframes bounceIn');
  });
});

describe('animate-duration', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('_animateIn sets style.animationDuration on target when durationMs provided', () => {
    const el = document.createElement('div');
    const child = document.createElement('span');
    el.appendChild(child);
    document.body.appendChild(el);

    _animateIn(el, 'fadeIn', null, 500);

    expect(child.style.animationDuration).toBe('500ms');
  });

  test('_animateOut sets style.animationDuration on target when durationMs provided', () => {
    const el = document.createElement('div');
    const child = document.createElement('span');
    el.appendChild(child);
    document.body.appendChild(el);

    const callback = jest.fn();
    _animateOut(el, 'fadeOut', null, callback, 300);

    expect(child.style.animationDuration).toBe('300ms');
  });

  test('_animateIn does NOT set animationDuration when durationMs is not provided', () => {
    const el = document.createElement('div');
    const child = document.createElement('span');
    el.appendChild(child);
    document.body.appendChild(el);

    _animateIn(el, 'fadeIn', null);

    expect(child.style.animationDuration).toBe('');
  });
});
