import Decimal from 'decimal.js'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { createNotification } from '@play-money/notifications/lib/createNotification'
import { createMarketLiquidityTransaction } from '@play-money/transactions/lib/createMarketLiquidityTransaction'
import { getUniqueLiquidityProviderIds } from '@play-money/transactions/lib/getUniqueLiquidityProviderIds'
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
  const transaction = await createMarketLiquidityTransaction({
    accountId: userAccount.id,
    amount,
    marketId,
  })

  const recipientIds = await getUniqueLiquidityProviderIds(marketId, [userId])

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        type: 'MARKET_LIQUIDITY_ADDED',
        actorId: userId,
        marketId: market.id,
        transactionId: transaction.id,
        groupKey: market.id,
        userId: recipientId,
        actionUrl: `/questions/${market.id}/${market.slug}`,
      })
    )
  )

  return transaction
}
