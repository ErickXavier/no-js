import { test, expect } from '@playwright/test';

test.describe('Conditionals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/conditionals.html');
  });

  test('1 — If toggle: show and hide welcome message', async ({ page }) => {
    const welcome = page.getByTestId('welcome-msg');
    await expect(welcome).toBeHidden();

    await page.getByTestId('login-toggle').click();
    await expect(welcome).toBeVisible();
    await expect(welcome).toHaveText('Welcome!');

    await page.getByTestId('login-toggle').click();
    await expect(welcome).toBeHidden();
  });

  test('2 — If/else-if/else: role-based panels', async ({ page }) => {
    const admin = page.getByTestId('panel-admin');
    const editor = page.getByTestId('panel-editor');
    const guest = page.getByTestId('panel-guest');
    const select = page.getByTestId('role-select');

    // Default: guest
    await expect(guest).toBeVisible();
    await expect(admin).toBeHidden();
    await expect(editor).toBeHidden();

    // Switch to admin
    await select.selectOption('admin');
    await expect(admin).toBeVisible();
    await expect(editor).toBeHidden();
    await expect(guest).toBeHidden();

    // Switch to editor
    await select.selectOption('editor');
    await expect(editor).toBeVisible();
    await expect(admin).toBeHidden();
    await expect(guest).toBeHidden();

    // Back to guest
    await select.selectOption('guest');
    await expect(guest).toBeVisible();
    await expect(admin).toBeHidden();
    await expect(editor).toBeHidden();
  });

  test('3 — Show directive: toggles display but stays in DOM', async ({ page }) => {
    const target = page.getByTestId('show-target');

    await expect(target).toBeVisible();

    await page.getByTestId('show-toggle').click();
    await expect(target).toBeHidden();
    // Element should still be in the DOM
    await expect(target).toBeAttached();

    await page.getByTestId('show-toggle').click();
    await expect(target).toBeVisible();
  });

  test('4 — Hide directive: toggles display:none', async ({ page }) => {
    const target = page.getByTestId('hide-target');

    await expect(target).toBeVisible();

    await page.getByTestId('hide-toggle').click();
    await expect(target).toBeHidden();
    // Element should still be in the DOM
    await expect(target).toBeAttached();

    await page.getByTestId('hide-toggle').click();
    await expect(target).toBeVisible();
  });

  test('5 — Switch/case: renders matching case', async ({ page }) => {
    const pending = page.getByTestId('case-pending');
    const active = page.getByTestId('case-active');
    const defaultCase = page.getByTestId('case-default');
    const select = page.getByTestId('status-select');

    // Default: pending
    await expect(pending).toBeVisible();
    await expect(active).toBeHidden();
    await expect(defaultCase).toBeHidden();

    // Switch to active
    await select.selectOption('active');
    await expect(active).toBeVisible();
    await expect(pending).toBeHidden();
    await expect(defaultCase).toBeHidden();

    // Switch to other (default case)
    await select.selectOption('other');
    await expect(defaultCase).toBeVisible();
    await expect(pending).toBeHidden();
    await expect(active).toBeHidden();

    // Back to pending
    await select.selectOption('pending');
    await expect(pending).toBeVisible();
  });

  test('6 — Template branches: renders correct template', async ({ page }) => {
    const output = page.getByTestId('branch-output');

    // Default: free
    await expect(output).toContainText('Free content');

    // Toggle to premium
    await page.getByTestId('premium-toggle').click();
    await expect(output).toContainText('Premium content');

    // Toggle back to free
    await page.getByTestId('premium-toggle').click();
    await expect(output).toContainText('Free content');
  });
});
