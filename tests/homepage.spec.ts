import { test, expect } from '@playwright/test';

test.describe('Phase 3A Homepage Verification — Digital Craft V2', () => {
  test('has correct metadata and accessible heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check Title
    await expect(page).toHaveTitle(/James De Mesa/i);

    // Skip to main content link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Check h1 in Hero
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Engineering tailored web platforms');

    // Check h2 sections
    const h2s = page.locator('h2');
    await expect(h2s.first()).toBeVisible();
  });

  test('renders 3 commercial pillars and interactive filters', async ({ page }) => {
    await page.goto('/');

    // Verify 3 pillars in Hero
    const wpPillar = page.getByRole('button', { name: /Custom WordPress & FSE/i });
    const fullstackPillar = page.getByRole('button', { name: /Full-Stack Web Systems/i });
    const ecommercePillar = page.getByRole('button', { name: /E-Commerce & High-Converting Landing/i });

    await expect(wpPillar).toBeVisible();
    await expect(fullstackPillar).toBeVisible();
    await expect(ecommercePillar).toBeVisible();

    // Click WordPress pillar to toggle
    await wpPillar.click();
    await expect(wpPillar).toHaveAttribute('aria-pressed', 'true');
  });

  test('interactive split reveal behaves correctly on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop-only split slider test');

    await page.goto('/');

    // Locate Split Reveal section
    const showcase = page.locator('#showcase');
    await expect(showcase).toBeVisible();

    // Slider divider should exist
    const slider = page.getByRole('slider', { name: /Split view divider/i });
    await expect(slider).toBeVisible();

    // Verify toggle button
    const toggleButton = page.getByRole('button', { name: /Reveal Architecture|Reveal Finished Product/i });
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();

    // Check verified repository link
    const repoLink = page.getByRole('link', { name: /SaucesCode \/ thread-and-form/i });
    await expect(repoLink).toBeVisible();
    await expect(repoLink).toHaveAttribute('href', 'https://github.com/SaucesCode/thread-and-form');
  });

  test('mobile tabs work cleanly without drag conflicts on mobile viewport', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only tabs test');

    await page.goto('/');

    // Finished Product tab should be selected by default
    const finishedTab = page.getByRole('button', { name: /Finished Product/i });
    const buildTab = page.getByRole('button', { name: /Behind the Build/i });

    await expect(finishedTab).toBeVisible();
    await expect(buildTab).toBeVisible();

    // Switch to Behind the Build tab
    await buildTab.click();
    await expect(page.locator('.block.md\\:hidden').getByText('theme.json', { exact: false }).first()).toBeVisible();

    // Switch back to Finished Product tab
    await finishedTab.click();
    await expect(page.locator('.block.md\\:hidden').getByText('THREAD & FORM', { exact: false }).first()).toBeVisible();
  });

  test('renders services section with deliverables and technology tags', async ({ page }) => {
    await page.goto('/');

    const services = page.locator('#services');
    await expect(services).toBeVisible();

    await expect(page.getByText('Custom WordPress & FSE Block Themes')).toBeVisible();
    await expect(page.getByText('Full-Stack Web Applications & Systems')).toBeVisible();
    await expect(page.getByText('High-Converting Landing & E-Commerce')).toBeVisible();
  });

  test('footer contains verified profile and zero fake metrics declaration', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('#contact');
    await expect(footer).toBeVisible();

    // Check verified GitHub profile link in footer
    const ghLink = page.locator('#contact a[href="https://github.com/SaucesCode"]').first();
    await expect(ghLink).toBeVisible();

    // Check ethical notice
    await expect(page.getByText('No artificial metrics, unverified testimonials, or fabricated scores')).toBeVisible();
  });
});
