import { Market } from '@play-money/database'
import { ExtendedMarket } from '../types'

export function canResolveMarket({ market, userId }: { market: Market; userId?: string }) {
  return market.createdBy === userId
}

export function isMarketTradable(market: Market): boolean {
  const now = new Date()
  return !market.resolvedAt && (!market.closeDate || new Date(market.closeDate) > now)
}

export function isMarketResolved(market: ExtendedMarket): boolean {
  return Boolean(market.marketResolution)
}

// Based on django's slugify:
// https://github.com/django/django/blob/a21a63cc288ba51bcf8c227a49de6f5bb9a72cc3/django/utils/text.py#L362
export function slugifyTitle(title: string, maxLen = 50) {
  let slug = title
    .normalize('NFKD') // Normalize to decomposed form (eg. é -> e)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .trim()
    .replace(/[\s]/g, '-') // Replace whitespace with a dash
    .replace(/-+/, '-') // Replace multiple dashes with a single dash

  if (slug.length > maxLen) {
    slug = slug.substring(0, maxLen).replace(/-+[^-]*?$/, '') // Remove the last word, since it might be cut off
  }

  return slug
}
