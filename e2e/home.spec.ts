import { test, expect } from '@playwright/test'

test.describe('Public site: RU/EN', () => {
  test('Russian home page renders localized hero', async ({ page }) => {
    await page.goto('/ru')
    await expect(page).toHaveURL(/\/ru/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Техсмысл')
  })

  test('English home page renders localized hero', async ({ page }) => {
    await page.goto('/en')
    await expect(page).toHaveURL(/\/en/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Tech Smysl')
  })

  test('root redirects to a locale-prefixed path', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/(ru|en)(\/|$)/)
  })
})
