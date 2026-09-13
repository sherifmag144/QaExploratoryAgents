// Module PROD — Products
const { test, expect } = require('@playwright/test');
const { shot, emptyCart } = require('../../helpers/target');

test.describe('PROD — Products', () => {
  test.beforeEach(async ({ page }) => {
    await emptyCart(page);
  });

  test('TC-PROD-001 — [Smoke] Products page shows the six products with name and price', async ({ page }) => {
    test.info().annotations.push({ type: 'caseId', description: 'TC-PROD-001' });

    const cards = page.locator('[data-test="inventory-item"]');
    await expect(cards).toHaveCount(6);

    // Every card carries a name, a description, a price and an Add to cart button.
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveCount(6);
    await expect(page.locator('[data-test="inventory-item-desc"]')).toHaveCount(6);
    await expect(page.locator('[data-test="inventory-item-price"]')).toHaveCount(6);
    await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(6);

    // The first card is the Backpack at $29.99.
    const first = cards.first();
    await expect(first.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
    await expect(first.locator('[data-test="inventory-item-price"]')).toHaveText('$29.99');

    await page.screenshot({ path: shot('TC-PROD-001') });
  });
});
