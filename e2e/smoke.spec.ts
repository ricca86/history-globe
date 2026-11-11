import { expect, test } from "@playwright/test";

test("slider loads events and the panel opens an event", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#era")).toHaveText("1900 CE");
  await expect(page.locator("#panel li button").first()).toBeVisible();

  await page.fill("#jump-input", "1453");
  await page.press("#jump-input", "Enter");
  await expect(page.locator("#era")).toContainText("1450 CE");
  await expect(page.locator("#panel li button").first()).toBeVisible();

  await page.locator("#panel li button").first().click();
  await expect(page.locator("#panel .credit, #summary")).toBeVisible();
  await expect(page.locator("#panel .back")).toBeVisible();

  await page.fill("#jump-input", "480 BCE");
  await page.press("#jump-input", "Enter");
  await expect(page.locator("#era")).toContainText("BCE");
  expect(errors).toEqual([]);
});
