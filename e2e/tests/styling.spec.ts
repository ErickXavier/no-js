import { test, expect } from '@playwright/test';

test.describe('Styling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/styling.html');
  });

  test('1 — Class toggle: adds and removes "active" class', async ({ page }) => {
    const target = page.getByTestId('class-target');

    await expect(target).not.toHaveClass(/active/);

    await page.getByTestId('class-toggle').click();
    await expect(target).toHaveClass(/active/);

    await page.getByTestId('class-toggle').click();
    await expect(target).not.toHaveClass(/active/);
  });

  test('2 — Class map: toggles bold and italic independently', async ({ page }) => {
    const target = page.getByTestId('classmap-target');

    await expect(target).not.toHaveClass(/bold/);
    await expect(target).not.toHaveClass(/italic/);

    // Check bold
    await page.getByTestId('bold-check').check();
    await expect(target).toHaveClass(/bold/);
    await expect(target).not.toHaveClass(/italic/);

    // Check italic
    await page.getByTestId('italic-check').check();
    await expect(target).toHaveClass(/bold/);
    await expect(target).toHaveClass(/italic/);

    // Uncheck bold
    await page.getByTestId('bold-check').uncheck();
    await expect(target).not.toHaveClass(/bold/);
    await expect(target).toHaveClass(/italic/);
  });

  test('3 — Class list: applies base + variant, switches on select', async ({ page }) => {
    const target = page.getByTestId('classlist-target');

    // Initially has base and primary
    await expect(target).toHaveClass(/base/);
    await expect(target).toHaveClass(/primary/);
    await expect(target).not.toHaveClass(/danger/);

    // Change to danger
    await page.getByTestId('variant-select').selectOption('danger');
    await expect(target).toHaveClass(/base/);
    await expect(target).toHaveClass(/danger/);
    await expect(target).not.toHaveClass(/primary/);
  });

  test('4 — Style binding: color input updates element color', async ({ page }) => {
    const target = page.getByTestId('style-target');

    // Initial color is #ff0000
    await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');

    // Change color via input
    await page.getByTestId('color-input').fill('#0000ff');
    await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)');
  });

  test('5 — Style map: range changes fontSize, backgroundColor persists', async ({ page }) => {
    const target = page.getByTestId('stylemap-target');

    // Initial fontSize is 16px
    await expect(target).toHaveCSS('font-size', '16px');
    await expect(target).toHaveCSS('background-color', 'rgb(238, 238, 238)');

    // Change size via range input
    await page.getByTestId('size-input').fill('24');
    await expect(target).toHaveCSS('font-size', '24px');
    await expect(target).toHaveCSS('background-color', 'rgb(238, 238, 238)');
  });
});
