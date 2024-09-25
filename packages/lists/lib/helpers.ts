import { INITIAL_MARKET_LIQUIDITY_PRIMARY, LOWEST_MARKET_LIQUIDITY_PRIMARY } from '@play-money/finance/economy'

export function calculateTotalCost(numItems: number): number {
  let totalCost = 0

  for (let i = 1; i <= numItems; i++) {
    const costPerItem = Math.max(INITIAL_MARKET_LIQUIDITY_PRIMARY - (i - 1) * 100, LOWEST_MARKET_LIQUIDITY_PRIMARY)
    totalCost += costPerItem
  }

  return totalCost
}
