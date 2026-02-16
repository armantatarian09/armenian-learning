import { test, expect } from "@playwright/test";

test("can reach first lesson", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000");
  await page.getByRole("link", { name: "Continue" }).click();
  await expect(page).toHaveURL(/lesson\/unit-1-lesson-1/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Choose the translation");
});
