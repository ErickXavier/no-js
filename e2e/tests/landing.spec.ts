import { test, expect } from '@playwright/test';

test.describe('Landing Page v8', () => {
  test.beforeEach(async ({ page }) => {
    // Clear stored locale so the page loads in English
    await page.addInitScript(() => {
      localStorage.removeItem('nojs-locale');
    });
    await page.goto('http://localhost:3000/');
    // Ensure locale is English and wait for translations to load
    await page.evaluate(() => {
      (window as any).NoJS.locale = 'en';
    });
    await page.locator('.v8-hero-headline').waitFor();
  });

  test('1 — Hero section renders with headline and badge', async ({ page }) => {
    const headline = page.locator('.v8-hero-headline');
    await expect(headline).toContainText('Build reactive apps');

    const badge = page.locator('.v8-hero-badge');
    await expect(badge).toContainText('v1.8.0');

    await expect(page.locator('.v8-hero-cta .btn-primary')).toBeVisible();
    await expect(page.locator('.v8-hero-cta .btn-hero-outline')).toBeVisible();
  });

  test('2 — CDN install snippet is displayed', async ({ page }) => {
    const installCode = page.locator('.v8-hero-install-code');
    await expect(installCode).toContainText('<script src="https://cdn.no-js.dev/"></script>');

    const tabLabel = page.locator('.v8-hero-install-tab');
    await expect(tabLabel).toContainText('CDN');
  });

  test('3 — Section order is correct', async ({ page }) => {
    const sections = page.locator(
      '.v8-hero, .v8-code-compare, .v8-features, .v8-bundle, .v8-manifesto, .v8-problem, .v8-principles, .v8-community, .v8-quote'
    );

    const expectedOrder = [
      'v8-hero',
      'v8-code-compare',
      'v8-features',
      'v8-bundle',
      'v8-manifesto',
      'v8-problem',
      'v8-principles',
      'v8-community',
      'v8-quote',
    ];

    await expect(sections).toHaveCount(expectedOrder.length);

    for (let i = 0; i < expectedOrder.length; i++) {
      await expect(sections.nth(i)).toHaveClass(new RegExp(expectedOrder[i]));
    }
  });

  test('4 — Features grid shows 6 cards', async ({ page }) => {
    await expect(page.getByText('WHAT YOU GET')).toBeVisible();

    const cards = page.locator('.v8-feature-card');
    await expect(cards).toHaveCount(6);

    const expectedTitles = [
      'Reactive State',
      'SPA Router',
      'i18n Built-in',
      'Declarative Fetch',
      'Form Validation',
      'Animations',
    ];

    for (const title of expectedTitles) {
      await expect(page.locator('.v8-feature-title', { hasText: title })).toBeVisible();
    }
  });

  test('5 — CTA section is removed', async ({ page }) => {
    await expect(page.getByText('Ready to Build?')).toHaveCount(0);
  });

  test('6 — Community section is visible', async ({ page }) => {
    await expect(page.getByText('OPEN SOURCE')).toBeVisible();
    await expect(page.locator('.v8-community .btn-github')).toBeVisible();
    await expect(page.locator('.v8-community .btn-discord')).toBeVisible();
  });

  test('7 — Problem and Principles sections maintain dark theme', async ({ page }) => {
    const problem = page.locator('.v8-problem');
    await expect(problem).toHaveCSS('background-color', 'rgb(15, 23, 42)');

    const principles = page.locator('.v8-principles');
    await expect(principles).toHaveCSS('background-color', 'rgb(10, 16, 32)');
  });

  test('8 — Responsive: features grid stacks at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000/');

    const grid = page.locator('.v8-features-grid');
    await expect(grid).toHaveCSS('grid-template-columns', /^\d+(\.\d+)?px$/);

    // In single-column mode, each card should span roughly the full grid width
    const gridBox = await grid.boundingBox();
    const firstCard = page.locator('.v8-feature-card').first();
    const cardBox = await firstCard.boundingBox();

    expect(gridBox).toBeTruthy();
    expect(cardBox).toBeTruthy();
    // Card width should be close to grid width (within padding/border tolerance)
    expect(cardBox!.width).toBeGreaterThan(gridBox!.width * 0.85);
  });

  test('9 — i18n: locale switch updates hero text', async ({ page }) => {
    const headline = page.locator('.v8-hero-headline');
    await expect(headline).toContainText('Build reactive apps');

    // Open the language dropdown and click Spanish
    await page.locator('.lang-dropdown-btn').click();
    await page.locator('#lang-menu').getByText('🇪🇸 Español').click();

    await expect(headline).toContainText('Construye apps reactivas');
  });

  test('10 — Route links work', async ({ page }) => {
    const getStarted = page.locator('.v8-hero-cta .btn-primary');
    await getStarted.click();

    await expect(page).toHaveURL(/\/#\/docs/);
  });
});
