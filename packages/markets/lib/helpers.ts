import { Market } from '@play-money/database'
import { ExtendedMarket } from '../components/MarketOverviewPage'

export function canResolveMarket({ market, userId }: { market: Market; userId?: string }) {
  return market.createdBy === userId
}

export function isMarketTradable(market: Market): boolean {
  const now = new Date()
  return !market.resolvedAt && (!market.closeDate || market.closeDate > now)
}

export function isMarketResolved(market: ExtendedMarket): boolean {
  return Boolean(market.marketResolution)
}
