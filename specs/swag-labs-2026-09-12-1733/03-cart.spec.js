// Module CART — Cart
const { test, expect } = require('@playwright/test');
const { shot, emptyCart } = require('../../helpers/target');

test.describe('CART — Cart', () => {
  test.beforeEach(async ({ page }) => {
    await emptyCart(page);
  });

  test('TC-CART-001 — [Smoke] Adding a product updates the cart count and the button becomes Remove', async ({ page }) => {
    test.info().annotations.push({ type: 'caseId', description: 'TC-CART-001' });

    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toHaveText('Remove');

    await page.screenshot({ path: shot('TC-CART-001') });
  });

  test('TC-CART-002 — [Smoke] Cart page lists the products that were added', async ({ page }) => {
    test.info().annotations.push({ type: 'caseId', description: 'TC-CART-002' });

    // Precondition: Backpack and Bike Light are in the cart.
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    await page.locator('[data-test="shopping-cart-link"]').click();

    await expect(page).toHaveURL(/\/cart\.html$/);
    const rows = page.locator('.cart_item');
    await expect(rows).toHaveCount(2);

    await expect(rows.nth(0).locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
    await expect(rows.nth(0).locator('[data-test="inventory-item-price"]')).toHaveText('$29.99');
    await expect(rows.nth(1).locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Bike Light');
    await expect(rows.nth(1).locator('[data-test="inventory-item-price"]')).toHaveText('$9.99');

    // Quantity is 1 on both rows.
    await expect(page.locator('[data-test="item-quantity"]')).toHaveText(['1', '1']);

    await page.screenshot({ path: shot('TC-CART-002') });
  });
});
