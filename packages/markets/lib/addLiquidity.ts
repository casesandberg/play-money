import Decimal from 'decimal.js'
import { createMarketLiquidityTransaction } from '@play-money/transactions/lib/createMarketLiquidityTransaction'

export async function addLiquidity({
  userId,
  amount,
  marketId,
}: {
  userId: string
  amount: Decimal
  marketId: string
}) {
  await createMarketLiquidityTransaction({
    userId,
    amount,
    marketId,
  })
}
