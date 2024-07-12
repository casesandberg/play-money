import Decimal from 'decimal.js'
import { getMarketLiquidity } from './getMarketLiquidity'

export async function getMarketStats({ marketId }: { marketId: string }) {
  const [liquidity] = await Promise.all([getMarketLiquidity(marketId)])

  return {
    totalLiquidity: liquidity.total,
    lpUserCount: Object.keys(liquidity.providers).length,
    traderBonusPayouts: new Decimal(0),
  }
}
