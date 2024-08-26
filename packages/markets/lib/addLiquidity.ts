import Decimal from 'decimal.js'
import { DAILY_LIQUIDITY_BONUS_PRIMARY } from '@play-money/finance/economy'
import { getUniqueLiquidityProviderIds } from '@play-money/markets/lib/getUniqueLiquidityProviderIds'
import { createNotification } from '@play-money/notifications/lib/createNotification'
import { createDailyLiquidityBonusTransaction } from '@play-money/quests/lib/createDailyLiquidityBonusTransaction'
import { hasBoostedLiquidityToday } from '@play-money/quests/lib/helpers'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { createMarketLiquidityTransaction } from './createMarketLiquidityTransaction'
import { getMarket } from './getMarket'
import { isMarketResolved } from './helpers'

export async function addLiquidity({
  userId,
  amount,
  marketId,
}: {
  userId: string
  amount: Decimal
  marketId: string
}) {
  const [market, userAccount] = await Promise.all([
    getMarket({ id: marketId, extended: true }),
    getUserPrimaryAccount({ userId }),
  ])

  if (isMarketResolved(market)) {
    throw new Error('Market already resolved')
  }

  const transaction = await createMarketLiquidityTransaction({
    accountId: userAccount.id,
    initiatorId: userId,
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

  if (!(await hasBoostedLiquidityToday({ userId: userId })) && amount.gte(DAILY_LIQUIDITY_BONUS_PRIMARY)) {
    await createDailyLiquidityBonusTransaction({ accountId: userAccount.id, marketId: market.id, initiatorId: userId })
  }

  return transaction
}
