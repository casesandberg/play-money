import Decimal from 'decimal.js'
import db from '@play-money/database'
import { DAILY_LIQUIDITY_BONUS_PRIMARY } from '@play-money/finance/economy'
import { getBalance } from '@play-money/finance/lib/getBalances'
import { getUniqueLiquidityProviderIds } from '@play-money/markets/lib/getUniqueLiquidityProviderIds'
import { createNotification } from '@play-money/notifications/lib/createNotification'
import { createDailyLiquidityBonusTransaction } from '@play-money/quests/lib/createDailyLiquidityBonusTransaction'
import { hasBoostedLiquidityToday } from '@play-money/quests/lib/helpers'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { isMarketCanceled, isMarketResolved } from '../rules'
import { createMarketLiquidityTransaction } from './createMarketLiquidityTransaction'
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
  const [market, userAccount] = await Promise.all([
    getMarket({ id: marketId, extended: true }),
    getUserPrimaryAccount({ userId }),
  ])

  const balance = await getBalance({ accountId: userAccount.id, assetType: 'CURRENCY', assetId: 'PRIMARY' })

  if (!balance.total.gte(amount)) {
    throw new Error('User does not have enough balance')
  }

  if (isMarketResolved({ market })) {
    throw new Error('Market already resolved')
  }

  if (isMarketCanceled({ market })) {
    throw new Error('Market is canceled')
  }

  const transaction = await createMarketLiquidityTransaction({
    accountId: userAccount.id,
    initiatorId: userId,
    amount,
    marketId,
  })

  const existingLiquidityInMarket = await db.transaction.findFirst({
    where: {
      id: { not: transaction.id },
      marketId,
      type: {
        in: ['LIQUIDITY_DEPOSIT', 'LIQUIDITY_INITIALIZE'],
      },
      isReverse: null,
      initiatorId: userId,
    },
  })

  if (!existingLiquidityInMarket) {
    await db.market.update({
      where: { id: marketId },
      data: {
        uniquePromotersCount: { increment: amount.toNumber() },
        updatedAt: new Date(),
      },
    })
  }

  // TODO: Feedback was it was unncessary to notify all liquidity providers, instead just nofify owner if other user
  // const recipientIds = await getUniqueLiquidityProviderIds(marketId, [userId])

  // await Promise.all(
  //   recipientIds.map((recipientId) =>
  //     createNotification({
  //       type: 'MARKET_LIQUIDITY_ADDED',
  //       actorId: userId,
  //       marketId: market.id,
  //       transactionId: transaction.id,
  //       groupKey: market.id,
  //       userId: recipientId,
  //       actionUrl: `/questions/${market.id}/${market.slug}`,
  //     })
  //   )
  // )

  if (userId !== market.createdBy) {
    await createNotification({
      type: 'MARKET_LIQUIDITY_ADDED',
      actorId: userId,
      marketId: market.id,
      transactionId: transaction.id,
      groupKey: market.id,
      userId: market.createdBy,
      actionUrl: `/questions/${market.id}/${market.slug}`,
    })
  }

  if (!(await hasBoostedLiquidityToday({ userId: userId }))) {
    await createDailyLiquidityBonusTransaction({ accountId: userAccount.id, marketId: market.id, initiatorId: userId })
  }

  return transaction
}
