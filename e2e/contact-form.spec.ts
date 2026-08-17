import { test, expect } from '@playwright/test'

test.describe('Contact form', () => {
  test('submits the Russian form and shows success', async ({ page }) => {
    await page.goto('/ru#discuss')

    await page.getByLabel('Имя *').fill('Иван Петров')
    await page.getByLabel('Email *').fill('ivan@example.com')
    await page.getByLabel('Телефон').fill('+79990000000')
    await page.getByLabel('Услуга').selectOption('web')
    await page.getByLabel('Сообщение *').fill('Нужен корпоративный сайт')

    await page.getByRole('button', { name: 'Отправить заявку' }).click()

    await expect(page.getByText('Заявка отправлена!')).toBeVisible()
  })

  test('submits the English form and shows success', async ({ page }) => {
    await page.goto('/en#discuss')

    await page.getByLabel('Name *').fill('John Doe')
    await page.getByLabel('Email *').fill('john@example.com')
    await page.getByLabel('Message *').fill('Need a corporate website')

    await page.getByRole('button', { name: 'Send application' }).click()

    await expect(page.getByText('Application sent!')).toBeVisible()
  })

  test('shows validation errors when required fields are empty', async ({ page }) => {
    await page.goto('/ru#discuss')
    await page.getByRole('button', { name: 'Отправить заявку' }).click()
    // API returns field errors; at least one required-field message should appear
    await expect(page.locator('text=обязательно')).toBeVisible()
  })
})
