import { User, Market } from '@play-money/database'
import { isAdmin } from '@play-money/users/rules'

export function canModifyMarket({ market, user }: { market: Market; user: User }) {
  if (isMarketResolved({ market })) {
    return false
  }
  if (isMarketCanceled({ market })) {
    return false
  }
  return market.createdBy === user.id || isAdmin({ user })
}

export function isMarketTradable({ market }: { market: Market }): boolean {
  if (isMarketResolved({ market })) {
    return false
  }
  const now = new Date()
  return !market.closeDate || new Date(market.closeDate) > now
}

export function isMarketResolved({ market }: { market: Market }): boolean {
  return Boolean(market.resolvedAt)
}

export function isMarketCanceled({ market }: { market: Market }): boolean {
  return Boolean(market.canceledAt)
}
