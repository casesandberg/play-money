import Decimal from 'decimal.js'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { createMarketLiquidityTransaction } from '@play-money/transactions/lib/createMarketLiquidityTransaction'
import { getMarket } from './getMarket'

export async function addLiquidity({
  userId,
  amount,
  marketId,
}: {
  userId: string
  amount: Decimal
  marketId: string
}) {
  const market = await getMarket({ id: marketId })

  if (market.resolvedAt) {
    throw new Error('Market already resolved')
  }

  const userAccount = await getUserAccount({ id: userId })
  await createMarketLiquidityTransaction({
    accountId: userAccount.id,
    amount,
    marketId,
  })
}
