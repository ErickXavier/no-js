import { test, expect } from '@playwright/test';

test.describe('Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/filters.html');
  });

  test('1 — uppercase: converts text to upper case', async ({ page }) => {
    await expect(page.getByTestId('upper-output')).toHaveText('HELLO WORLD');
  });

  test('2 — currency: formats price with dollar sign', async ({ page }) => {
    const text = await page.getByTestId('currency-output').textContent();
    expect(text).toContain('$');
    expect(text).toContain('19.99');
  });

  test('3 — count: returns array length', async ({ page }) => {
    await expect(page.getByTestId('count-output')).toHaveText('5');
  });

  test('4 — chain (sortBy | first | json): result contains Alice', async ({ page }) => {
    const text = await page.getByTestId('chain-output').textContent();
    expect(text).toContain('Alice');
  });

  test('5 — truncate: text ends with ellipsis', async ({ page }) => {
    const text = await page.getByTestId('truncate-output').textContent();
    expect(text).not.toBeNull();
    expect(text!.endsWith('...')).toBe(true);
    expect(text!.length).toBe(33); // 30 chars + "..."
  });

  test('6 — capitalize: capitalizes each word', async ({ page }) => {
    await expect(page.getByTestId('capitalize-output')).toHaveText('John Doe Smith');
  });

  test('7 — custom filter (initials): extracts initials', async ({ page }) => {
    await expect(page.getByTestId('custom-output')).toHaveText('JD');
  });

  test('8 — join: joins array with separator', async ({ page }) => {
    await expect(page.getByTestId('join-output')).toHaveText('javascript, html, css');
  });

  test('9 — default: shows fallback for null value', async ({ page }) => {
    await expect(page.getByTestId('default-output')).toHaveText('N/A');
  });
});
