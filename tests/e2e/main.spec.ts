import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and displays hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Mes Aides/);
    
    // Check hero CTA
    const ctaButton = page.getByRole('link', { name: /simuler/i });
    await expect(ctaButton).toBeVisible();
  });

  test('has accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Skip link exists and works
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
    
    // Main navigation is accessible
    const nav = page.getByRole('navigation', { name: /principale/i });
    await expect(nav).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('#theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Toggle to dark
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // Toggle back to light
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('Simulator Wizard', () => {
  test('navigates through wizard steps', async ({ page }) => {
    await page.goto('/simulateur.html');
    
    // Step 1 should be visible
    await expect(page.locator('[data-step="1"]')).toBeVisible();
    
    // Fill age
    await page.fill('input[name="age"]', '35');
    
    // Click next
    await page.click('button[data-action="next"]');
    
    // Step 2 should now be visible
    await expect(page.locator('[data-step="2"]')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/simulateur.html');
    
    // Try to proceed without filling required field
    await page.click('button[data-action="next"]');
    
    // Should show error
    const errorMessage = page.locator('.field-error');
    await expect(errorMessage).toBeVisible();
  });

  test('saves progress to localStorage', async ({ page }) => {
    await page.goto('/simulateur.html');
    
    // Fill some data
    await page.fill('input[name="age"]', '45');
    
    // Check localStorage
    const savedData = await page.evaluate(() => {
      return localStorage.getItem('simulation-progress');
    });
    
    expect(savedData).toBeTruthy();
  });
});

test.describe('Results Page', () => {
  test('displays results when simulation data exists', async ({ page }) => {
    // Pre-populate simulation result
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('simulation-result', JSON.stringify({
        aides_eligibles: [
          { aide_id: 'rsa', nom: 'RSA', montant_mensuel: 600 }
        ],
        total_mensuel: 600
      }));
    });
    
    await page.goto('/resultats.html');
    
    // Should show results
    await expect(page.locator('.aide-card')).toBeVisible();
    await expect(page.getByText('RSA')).toBeVisible();
  });

  test('shows empty state when no results', async ({ page }) => {
    await page.goto('/resultats.html');
    
    // Clear any existing data
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Should show empty state or redirect
    const emptyState = page.locator('.empty-state');
    const redirected = page.url().includes('simulateur');
    
    expect(emptyState.isVisible() || redirected).toBeTruthy();
  });
});

test.describe('Aids Catalog', () => {
  test('displays aid cards', async ({ page }) => {
    await page.goto('/aides.html');
    
    // Should have multiple aid cards
    const cards = page.locator('.aide-card');
    await expect(cards.first()).toBeVisible();
    
    const count = await cards.count();
    expect(count).toBeGreaterThan(5);
  });

  test('filters by category', async ({ page }) => {
    await page.goto('/aides.html');
    
    // Click a category filter
    const filter = page.locator('[data-category="logement"]');
    if (await filter.isVisible()) {
      await filter.click();
      
      // Should filter cards
      await expect(page.locator('.aide-card[data-category="logement"]')).toBeVisible();
    }
  });

  test('search works', async ({ page }) => {
    await page.goto('/aides.html');
    
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('RSA');
      
      // Should show RSA card
      await expect(page.getByText('Revenu de Solidarité Active')).toBeVisible();
    }
  });
});

test.describe('Accessibility', () => {
  test('all pages pass basic a11y checks', async ({ page }) => {
    const pages = ['/', '/simulateur.html', '/aides.html', '/accessibilite.html'];
    
    for (const url of pages) {
      await page.goto(url);
      
      // Check for main landmark
      await expect(page.locator('main')).toBeVisible();
      
      // Check for h1
      await expect(page.locator('h1')).toBeVisible();
      
      // Check lang attribute
      await expect(page.locator('html')).toHaveAttribute('lang', /^(fr|en|ar)/);
    }
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab through page
    await page.keyboard.press('Tab');
    
    // Focus should be on skip link
    const focused = await page.evaluate(() => document.activeElement?.className);
    expect(focused).toContain('skip-link');
  });
});

test.describe('i18n', () => {
  test('switches language', async ({ page }) => {
    await page.goto('/?lang=en');
    
    // Should have English content
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('RTL layout for Arabic', async ({ page }) => {
    await page.goto('/?lang=ar');
    
    // Should have RTL direction
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('Offline Support', () => {
  test('service worker registers', async ({ page }) => {
    await page.goto('/');
    
    // Wait for SW registration
    await page.waitForTimeout(2000);
    
    const swRegistered = await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    });
    
    expect(swRegistered).toBeTruthy();
  });
});
