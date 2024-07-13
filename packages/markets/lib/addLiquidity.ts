import Decimal from 'decimal.js'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
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
  const userAccount = await getUserAccount({ id: userId })
  await createMarketLiquidityTransaction({
    accountId: userAccount.id,
    amount,
    marketId,
  })
}
