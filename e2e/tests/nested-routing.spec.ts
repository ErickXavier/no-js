import { test, expect } from '@playwright/test';

test.describe('Nested Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/nested-routing.html');
  });

  test('1 — Navigate to /#/docs loads docs layout with sidebar and default child (getting-started)', async ({ page }) => {
    await page.getByTestId('nav-docs').click();

    // Sidebar should be visible
    const sidebar = page.getByTestId('docs-sidebar');
    await expect(sidebar).toBeVisible();

    // Default child (getting-started) should be loaded in the docs outlet
    const gettingStarted = page.getByTestId('doc-getting-started');
    await expect(gettingStarted).toBeVisible();
    await expect(gettingStarted).toContainText('Welcome to No.JS');

    // Home page should NOT be visible in the main outlet
    await expect(page.getByTestId('page-home')).toBeHidden();
  });

  test('2 — Click sidebar link to /#/docs/loops swaps child content, sidebar persists', async ({ page }) => {
    // First navigate to docs
    await page.getByTestId('nav-docs').click();
    await expect(page.getByTestId('doc-getting-started')).toBeVisible();

    // Click loops in sidebar
    await page.getByTestId('sidebar-loops').click();

    // Loops content should be visible
    const loops = page.getByTestId('doc-loops');
    await expect(loops).toBeVisible();
    await expect(loops).toContainText('each directive');

    // Sidebar should still be visible
    await expect(page.getByTestId('docs-sidebar')).toBeVisible();

    // Getting-started should no longer be visible
    await expect(page.getByTestId('doc-getting-started')).toBeHidden();
  });

  test('3 — Click sidebar link to /#/docs/state swaps child again, layout stays', async ({ page }) => {
    // Navigate to docs/loops first
    await page.getByTestId('nav-docs').click();
    await expect(page.getByTestId('doc-getting-started')).toBeVisible();

    await page.getByTestId('sidebar-loops').click();
    await expect(page.getByTestId('doc-loops')).toBeVisible();

    // Now click state in sidebar
    await page.getByTestId('sidebar-state').click();

    // State content should be visible
    const state = page.getByTestId('doc-state');
    await expect(state).toBeVisible();
    await expect(state).toContainText('reactive state');

    // Sidebar should persist
    await expect(page.getByTestId('docs-sidebar')).toBeVisible();

    // Loops should be gone
    await expect(page.getByTestId('doc-loops')).toBeHidden();
  });

  test('4 — Deep link directly to /#/docs/loops renders layout and correct child', async ({ page }) => {
    // Navigate directly to docs/loops via URL
    await page.goto('/e2e/examples/nested-routing.html#/docs/loops');

    // Sidebar should be visible
    await expect(page.getByTestId('docs-sidebar')).toBeVisible();

    // Loops content should render in the docs outlet
    const loops = page.getByTestId('doc-loops');
    await expect(loops).toBeVisible();
    await expect(loops).toContainText('each directive');

    // Other doc pages should not be visible
    await expect(page.getByTestId('doc-getting-started')).toBeHidden();
    await expect(page.getByTestId('doc-state')).toBeHidden();
  });

  test('5 — Navigate from /#/docs/loops to /#/ (home) removes docs, shows home', async ({ page }) => {
    // Start at docs/loops
    await page.goto('/e2e/examples/nested-routing.html#/docs/loops');
    await expect(page.getByTestId('doc-loops')).toBeVisible();

    // Click home
    await page.getByTestId('nav-home').click();

    // Home page should be visible
    const home = page.getByTestId('page-home');
    await expect(home).toBeVisible();
    await expect(home).toContainText('Welcome to the home page');

    // Docs content should be cleared from the docs outlet
    await expect(page.getByTestId('doc-loops')).toBeHidden();
  });

  test('6 — Navigate back to /#/docs from home re-renders layout with default child', async ({ page }) => {
    // Start at home
    await expect(page.getByTestId('page-home')).toBeVisible();

    // Go to docs
    await page.getByTestId('nav-docs').click();
    await expect(page.getByTestId('doc-getting-started')).toBeVisible();

    // Go back to home
    await page.getByTestId('nav-home').click();
    await expect(page.getByTestId('page-home')).toBeVisible();

    // Go to docs again
    await page.getByTestId('nav-docs').click();

    // Docs layout should re-render with default child
    await expect(page.getByTestId('docs-sidebar')).toBeVisible();
    const gettingStarted = page.getByTestId('doc-getting-started');
    await expect(gettingStarted).toBeVisible();
    await expect(gettingStarted).toContainText('Welcome to No.JS');
  });

  test('7 — Single-segment route /#/home resolves via flat file-based routing', async ({ page }) => {
    // Navigate to /home explicitly (not just /)
    await page.goto('/e2e/examples/nested-routing.html#/home');

    // The file-based router should resolve nested-routing-templates/home.tpl
    const home = page.getByTestId('page-home');
    await expect(home).toBeVisible();
    await expect(home).toContainText('Welcome to the home page');
  });

  test('8 — Active class on sidebar links updates correctly', async ({ page }) => {
    // Navigate to docs (redirects to getting-started)
    await page.getByTestId('nav-docs').click();
    await expect(page.getByTestId('doc-getting-started')).toBeVisible();

    // Getting-started sidebar link should be active
    await expect(page.getByTestId('sidebar-getting-started')).toHaveClass(/active/);
    await expect(page.getByTestId('sidebar-loops')).not.toHaveClass(/active/);

    // Click loops
    await page.getByTestId('sidebar-loops').click();
    await expect(page.getByTestId('doc-loops')).toBeVisible();

    // Loops should now be active, getting-started should not
    await expect(page.getByTestId('sidebar-loops')).toHaveClass(/active/);
    await expect(page.getByTestId('sidebar-getting-started')).not.toHaveClass(/active/);
  });

  test('9 — Top-level nav active class reflects docs section', async ({ page }) => {
    // Navigate to docs
    await page.getByTestId('nav-docs').click();
    await expect(page.getByTestId('doc-getting-started')).toBeVisible();

    // The "Docs" nav link should be active (route-active prefix match)
    await expect(page.getByTestId('nav-docs')).toHaveClass(/active/);
    await expect(page.getByTestId('nav-home')).not.toHaveClass(/active/);

    // Navigate to a specific doc sub-route — docs link should still be active
    await page.getByTestId('sidebar-loops').click();
    await expect(page.getByTestId('nav-docs')).toHaveClass(/active/);
  });
});
