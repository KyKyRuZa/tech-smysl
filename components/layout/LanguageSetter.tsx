'use client'

import { useEffect } from 'react'
import { isValidLocale } from '@/lib/i18n/get-locale'

type Props = {
  locale: string
}

export default function LanguageSetter({ locale }: Props) {
  useEffect(() => {
    if (isValidLocale(locale)) {
      document.documentElement.lang = locale
    }
  }, [locale])

  return null
}
