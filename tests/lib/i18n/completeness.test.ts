import { describe, it, expect } from 'vitest'
import { translations } from '@/lib/i18n/translations'

// Deep key collection (objects/arrays are recursed, primitives counted as leaves)
function leafKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') {
    return [prefix]
  }
  if (Array.isArray(obj)) {
    // arrays: compare length + each element's shape rather than keys
    return obj.flatMap((item, i) => leafKeys(item, `${prefix}[${i}]`))
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    leafKeys(v, prefix ? `${prefix}.${k}` : k)
  )
}

function collectKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return [prefix]
  return Object.keys(obj as Record<string, unknown>).sort().flatMap((k) =>
    collectKeys((obj as Record<string, unknown>)[k], prefix ? `${prefix}.${k}` : k)
  )
}

describe('i18n: RU/EN completeness parity', () => {
  const ruKeys = collectKeys(translations.ru).filter(Boolean).sort()
  const enKeys = collectKeys(translations.en).filter(Boolean).sort()

  it('RU and EN have exactly the same key structure', () => {
    expect(enKeys).toEqual(ruKeys)
  })

  it('every RU string leaf is non-empty', () => {
    for (const key of ruKeys) {
      const value = key.split('.').reduce<any>((acc, part) => acc?.[part], translations.ru)
      if (typeof value === 'string') {
        expect(value.trim().length, `RU key "${key}" must not be empty`).toBeGreaterThan(0)
      }
    }
  })

  it('every EN string leaf is non-empty', () => {
    for (const key of enKeys) {
      const value = key.split('.').reduce<any>((acc, part) => acc?.[part], translations.en)
      if (typeof value === 'string') {
        expect(value.trim().length, `EN key "${key}" must not be empty`).toBeGreaterThan(0)
      }
    }
  })

  it('process steps array has 4 entries in both locales', () => {
    expect(translations.ru.process.steps).toHaveLength(4)
    expect(translations.en.process.steps).toHaveLength(4)
    const ruStepKeys = leafKeys(translations.ru.process.steps).sort()
    const enStepKeys = leafKeys(translations.en.process.steps).sort()
    expect(enStepKeys).toEqual(ruStepKeys)
  })

  it('footer contact details are present and identical across locales', () => {
    expect(translations.ru.footer.phone).toBe(translations.en.footer.phone)
    expect(translations.ru.footer.email).toBe(translations.en.footer.email)
  })
})
