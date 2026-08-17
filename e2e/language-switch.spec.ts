import { test, expect } from '@playwright/test'

test.describe('Language switch', () => {
  test('switches from Russian to English', async ({ page }) => {
    await page.goto('/ru')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Техсмысл')

    await page.getByRole('button', { name: 'Eng' }).click()
    await expect(page).toHaveURL(/\/en/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Tech Smysl')
  })

  test('switches from English to Russian', async ({ page }) => {
    await page.goto('/en')
    await page.getByRole('button', { name: 'Рус' }).click()
    await expect(page).toHaveURL(/\/ru/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Техсмысл')
  })
})
