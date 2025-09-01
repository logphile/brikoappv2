import { test, expect } from "@playwright/test"

const BASE = process.env.BASE_URL || "http://localhost:4178"

test("home loads", async ({ page }) => {
  await page.goto(BASE + "/")
  await expect(page).toHaveTitle(/briko/i)
})

test("mosaic shell", async ({ page }) => {
  await page.goto(BASE + "/mosaic")
  await expect(page.getByText(/Mosaic/i)).toBeVisible()
})

test("voxel shell", async ({ page }) => {
  await page.goto(BASE + "/voxel")
  await expect(page.getByText(/Voxel \(preview\)/i)).toBeVisible()
})
