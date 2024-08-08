import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should have a title", async ({ page }) => {
  await expect(page).toHaveTitle(/StarkNet ❤️ React/);
});
