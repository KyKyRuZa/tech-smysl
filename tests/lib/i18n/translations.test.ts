import { describe, it, expect } from 'vitest'
import { getTranslations, translations } from '@/lib/i18n/translations'

describe('i18n: translations runtime', () => {
  it('returns Russian copy for ru', () => {
    const t = getTranslations('ru')
    expect(t.hero.title).toBe('Техсмысл: +30 IT-решений ежегодно')
    expect(t.contact.send).toBe('Отправить')
    expect(t.footer.brandName).toBe('Tech Smysl')
  })

  it('returns English copy for en', () => {
    const t = getTranslations('en')
    expect(t.hero.title).toBe('Tech Smysl: +30 IT solutions yearly')
    expect(t.contact.send).toBe('Send')
    expect(t.directions.title).toBe('Projects')
  })

  it('falls back to Russian for unknown locale', () => {
    // @ts-expect-error intentionally testing runtime fallback
    const t = getTranslations('fr')
    expect(t.hero.title).toBe(translations.ru.hero.title)
    expect(t.contact.send).toBe(translations.ru.contact.send)
  })

  it('falls back to Russian when locale is undefined', () => {
    // @ts-expect-error intentionally testing runtime fallback
    const t = getTranslations(undefined)
    expect(t.hero.eyebrow).toBe(translations.ru.hero.eyebrow)
  })

  it('exposes both locale objects with identical top-level shape', () => {
    expect(Object.keys(translations.ru).sort()).toEqual(Object.keys(translations.en).sort())
  })
})
