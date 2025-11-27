import { test, expect } from "@playwright/test";

test.describe("Admin login", () => {
  test("shows helper text with seeded credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByText("founder@claroche.shop")).toBeVisible();
    await expect(page.getByText("Claroche#2025!")).toBeVisible();
  });
});
