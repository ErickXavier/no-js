import { test, expect } from '@playwright/test';

test.describe('Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/dnd.html');
    await page.waitForSelector('[data-test="list-a"] [data-test="item"]');
  });

  // ─── Initial State ────────────────────────────────────────────

  test('1 — renders initial items correctly', async ({ page }) => {
    await expect(page.getByTestId('count-a')).toHaveText('3');
    await expect(page.getByTestId('count-b')).toHaveText('0');

    const items = page.getByTestId('list-a').getByTestId('item');
    await expect(items).toHaveCount(3);
    await expect(items.first()).toContainText('Alpha');
    await expect(items.nth(1)).toContainText('Beta');
    await expect(items.nth(2)).toContainText('Gamma');
  });

  test('2 — list items are draggable', async ({ page }) => {
    // draggable is set on the first visible child (item), not the display:contents wrapper
    const item = page.getByTestId('list-a').getByTestId('item').first();
    await expect(item).toHaveAttribute('draggable', 'true');
  });

  test('3 — ARIA: listbox + option roles', async ({ page }) => {
    await expect(page.getByTestId('list-a')).toHaveAttribute('role', 'listbox');
    // role=option on wrapper, aria-grabbed on the visible item
    const wrapper = page.getByTestId('list-a').getByTestId('item').first().locator('..');
    await expect(wrapper).toHaveAttribute('role', 'option');
    const item = page.getByTestId('list-a').getByTestId('item').first();
    await expect(item).toHaveAttribute('aria-grabbed', 'false');
  });

  // ─── Cross-list Transfer ──────────────────────────────────────

  test('4 — drag item from A to B transfers it', async ({ page }) => {
    const src = page.getByTestId('list-a').getByTestId('item').first();
    await src.dragTo(page.getByTestId('list-b'));

    await expect(page.getByTestId('count-a')).toHaveText('2');
    await expect(page.getByTestId('count-b')).toHaveText('1');
    await expect(page.getByTestId('list-b').getByTestId('item').first()).toContainText('Alpha');
  });

  test('5 — transferred item is removed from source', async ({ page }) => {
    await page.getByTestId('list-a').getByTestId('item').first().dragTo(page.getByTestId('list-b'));

    const remaining = page.getByTestId('list-a').getByTestId('item');
    await expect(remaining).toHaveCount(2);
    await expect(remaining.first()).toContainText('Beta');
    await expect(remaining.nth(1)).toContainText('Gamma');
  });

  test('6 — multiple transfers accumulate in target', async ({ page }) => {
    await page.getByTestId('list-a').getByTestId('item').first().dragTo(page.getByTestId('list-b'));
    await page.getByTestId('list-a').getByTestId('item').first().dragTo(page.getByTestId('list-b'));

    await expect(page.getByTestId('count-a')).toHaveText('1');
    await expect(page.getByTestId('count-b')).toHaveText('2');
    await expect(page.getByTestId('list-b').getByTestId('item')).toHaveCount(2);
  });

  // ─── Type Isolation ───────────────────────────────────────────

  test('7 — type mismatch: task → file zone rejected', async ({ page }) => {
    const task = page.getByTestId('tasks-src').getByTestId('item').first();
    await task.dragTo(page.getByTestId('file-drop'));

    await expect(page.getByTestId('tasks-src').getByTestId('item')).toHaveCount(1);
    await expect(page.getByTestId('file-drop').getByTestId('item')).toHaveCount(0);
  });

  test('8 — type match: task → task zone accepted', async ({ page }) => {
    const task = page.getByTestId('tasks-src').getByTestId('item').first();
    await task.dragTo(page.getByTestId('task-drop'));

    await expect(page.getByTestId('tasks-src').getByTestId('item')).toHaveCount(0);
    await expect(page.getByTestId('task-drop').getByTestId('item')).toHaveCount(1);
    await expect(page.getByTestId('task-drop').getByTestId('item').first()).toContainText('Task-1');
  });

  // ─── Wildcard Accept ──────────────────────────────────────────

  test('9 — wildcard drop-accept="*" receives any type', async ({ page }) => {
    await page.getByTestId('wild-src').getByTestId('item').first().dragTo(page.getByTestId('wild-target'));

    await expect(page.getByTestId('wild-target').getByTestId('item')).toHaveCount(1);
    await expect(page.getByTestId('wild-target').getByTestId('item').first()).toContainText('Any-1');
  });

  // ─── Disabled States ──────────────────────────────────────────

  test('10 — disabled drag prevents transfer', async ({ page }) => {
    // dragOff=true by default
    const src = page.getByTestId('disabled-src').getByTestId('item').first();
    await src.dragTo(page.getByTestId('disabled-target'));

    await expect(page.getByTestId('disabled-src').getByTestId('item')).toHaveCount(1);
    await expect(page.getByTestId('disabled-target').getByTestId('item')).toHaveCount(0);
  });

  test('11 — toggle enables drag and drop', async ({ page }) => {
    await page.getByTestId('toggle-drag').click();
    await page.getByTestId('toggle-drop').click();

    await page.getByTestId('disabled-src').getByTestId('item').first().dragTo(page.getByTestId('disabled-target'));

    await expect(page.getByTestId('disabled-src').getByTestId('item')).toHaveCount(0);
    await expect(page.getByTestId('disabled-target').getByTestId('item')).toHaveCount(1);
  });

  // ─── Drop Max ─────────────────────────────────────────────────

  test('12 — drop-max: accepts items up to capacity', async ({ page }) => {
    // max-target starts with 1 item, max=2
    await page.getByTestId('max-src').getByTestId('item').first().dragTo(page.getByTestId('max-target'));
    await expect(page.getByTestId('max-target').getByTestId('item')).toHaveCount(2);
  });

  test('13 — drop-max: rejects items at capacity', async ({ page }) => {
    await page.getByTestId('max-src').getByTestId('item').first().dragTo(page.getByTestId('max-target'));
    await expect(page.getByTestId('max-target').getByTestId('item')).toHaveCount(2);

    // Second should be rejected
    await page.getByTestId('max-src').getByTestId('item').first().dragTo(page.getByTestId('max-target'));
    await expect(page.getByTestId('max-target').getByTestId('item')).toHaveCount(2);
  });

  // ─── Lifecycle Events ─────────────────────────────────────────

  test('14 — receive event fires on cross-list drop', async ({ page }) => {
    await expect(page.getByTestId('receive-log')).toHaveText('');

    await page.getByTestId('evt-a').getByTestId('item').first().dragTo(page.getByTestId('evt-b'));

    await expect(page.getByTestId('receive-log')).toContainText('received:Evt-1');
  });

  test('15 — remove event fires on source', async ({ page }) => {
    await expect(page.getByTestId('remove-log')).toHaveText('');

    await page.getByTestId('evt-a').getByTestId('item').first().dragTo(page.getByTestId('evt-b'));

    await expect(page.getByTestId('remove-log')).toContainText('removed:0');
  });

  // ─── Drop on Empty List ───────────────────────────────────────

  test('16 — drop on empty list succeeds', async ({ page }) => {
    await expect(page.getByTestId('em-target').getByTestId('item')).toHaveCount(0);

    await page.getByTestId('em-src').getByTestId('item').first().dragTo(page.getByTestId('em-target'));

    await expect(page.getByTestId('em-target').getByTestId('item')).toHaveCount(1);
    await expect(page.getByTestId('em-target').getByTestId('item').first()).toContainText('EmItem');
    await expect(page.getByTestId('em-src').getByTestId('item')).toHaveCount(0);
  });

  // ─── Horizontal List ──────────────────────────────────────────

  test('17 — horizontal list renders items', async ({ page }) => {
    const items = page.getByTestId('h-list').getByTestId('item');
    await expect(items).toHaveCount(3);
    await expect(items.first()).toContainText('Tab-1');
    await expect(items.nth(2)).toContainText('Tab-3');
  });

  // ─── Low-level Drag + Drop Expression ─────────────────────────

  test('18 — basic drag+drop evaluates expression', async ({ page }) => {
    await expect(page.getByTestId('bin-count')).toHaveText('0');

    await page.getByTestId('basic-item').first().dragTo(page.getByTestId('basic-drop'));

    await expect(page.getByTestId('bin-count')).toHaveText('1');
  });

  // ─── Multi-select (drag-multiple) ───────────────────────────────

  test('19 — click adds selection class', async ({ page }) => {
    const item = page.getByTestId('sel-item').first();
    await item.click();
    await expect(item).toHaveClass(/nojs-selected/);
  });

  test('20 — Cmd+click adds to selection', async ({ page }) => {
    const items = page.getByTestId('sel-item');
    await items.first().click();
    await items.nth(1).click({ modifiers: ['Meta'] });

    await expect(items.first()).toHaveClass(/nojs-selected/);
    await expect(items.nth(1)).toHaveClass(/nojs-selected/);
  });

  test('21 — click without modifier replaces selection', async ({ page }) => {
    const items = page.getByTestId('sel-item');
    await items.first().click();
    await items.nth(1).click(); // no modifier → replaces

    await expect(items.first()).not.toHaveClass(/nojs-selected/);
    await expect(items.nth(1)).toHaveClass(/nojs-selected/);
  });

  test('22 — Escape clears all selections', async ({ page }) => {
    const item = page.getByTestId('sel-item').first();
    await item.click();
    await expect(item).toHaveClass(/nojs-selected/);

    await page.keyboard.press('Escape');
    await expect(item).not.toHaveClass(/nojs-selected/);
  });
});
