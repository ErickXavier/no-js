import { test, expect } from '@playwright/test';

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
    (window as any).NoJS.i18n({ defaultLocale: 'es' });
  });

  await expect(page.getByTestId('farewell-text')).toHaveText('Adiós');
});
