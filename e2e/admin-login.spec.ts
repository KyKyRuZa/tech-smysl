import { test, expect } from '@playwright/test'

test.describe('Admin auth gate', () => {
  test('redirects unauthenticated users from /admin to /login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page renders the credential form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Пароль')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible()
  })

  test('rejects invalid credentials with an error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('nobody@example.com')
    await page.getByLabel('Пароль').fill('wrong-password')
    await page.getByRole('button', { name: 'Войти' }).click()

    // /api/auth/login returns 401 for bad creds -> login page stays, error shown
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })
})
