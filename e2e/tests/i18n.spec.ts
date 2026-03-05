import { test, expect } from '@playwright/test';

// ─── Inline locale tests ────────────────────────────────────────────
test.describe('i18n — inline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/i18n.html');
  });

  test('displays basic translation', async ({ page }) => {
    await expect(page.getByTestId('welcome-text')).toHaveText('Welcome to our app');
  });

  test('displays parameterized translation', async ({ page }) => {
    await expect(page.getByTestId('greeting-text')).toHaveText('Hello, Alice!');
  });

  test('handles pluralization', async ({ page }) => {
    await expect(page.getByTestId('plural-text')).toHaveText('one item');

    await page.getByTestId('set-five').click();
    await expect(page.getByTestId('plural-text')).toHaveText('5 items');
  });

  test('switches locale', async ({ page }) => {
    await expect(page.getByTestId('farewell-text')).toHaveText('Goodbye');

    await page.evaluate(() => {
      (window as any).NoJS.locale = 'es';
    });

    await expect(page.getByTestId('farewell-text')).toHaveText('Adiós');
  });
});

// ─── External file tests ────────────────────────────────────────────
test.describe('i18n — external files', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/i18n-external.html');
  });

  test('loads translation from external JSON', async ({ page }) => {
    await expect(page.getByTestId('ext-welcome')).toHaveText('Welcome from file');
  });

  test('interpolates params from external file', async ({ page }) => {
    await expect(page.getByTestId('ext-greeting')).toHaveText('Hi, Bob!');
  });

  test('pluralization from external file', async ({ page }) => {
    await expect(page.getByTestId('ext-plural')).toHaveText('one thing');
    await page.getByTestId('ext-set-many').click();
    await expect(page.getByTestId('ext-plural')).toHaveText('7 things');
  });

  test('locale switch fetches new external file', async ({ page }) => {
    await expect(page.getByTestId('ext-switch-text')).toHaveText('Welcome from file');
    await page.getByTestId('ext-lang-es').click();
    await expect(page.getByTestId('ext-switch-text')).toHaveText('Bienvenido desde archivo');
  });

  test('i18n-ns directive loads namespace on-demand', async ({ page }) => {
    await expect(page.getByTestId('ns-title')).toHaveText('Dashboard');
  });

  test('locale switch back to original works', async ({ page }) => {
    await page.getByTestId('ext-lang-es').click();
    await expect(page.getByTestId('ext-welcome')).toHaveText('Bienvenido desde archivo');
    await page.getByTestId('ext-lang-en').click();
    await expect(page.getByTestId('ext-welcome')).toHaveText('Welcome from file');
  });
});
