import { NextRequest } from 'next/server'

export function parsePositiveInt(value: string | null, fallback = 1): number {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function getSearchParams(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  return searchParams
}
