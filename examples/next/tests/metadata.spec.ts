import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Page Title", async ({ page }) => {
  await expect(page).toHaveTitle(/StarkNet ❤️ React/);
});
