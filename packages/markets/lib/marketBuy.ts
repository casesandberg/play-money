import Decimal from 'decimal.js'
import db from '@play-money/database'
import { DAILY_TRADE_BONUS_PRIMARY, UNIQUE_TRADER_LIQUIDITY_PRIMARY } from '@play-money/finance/economy'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { getUniqueLiquidityProviderIds } from '@play-money/markets/lib/getUniqueLiquidityProviderIds'
import { createNotification } from '@play-money/notifications/lib/createNotification'
import { createDailyTradeBonusTransaction } from '@play-money/quests/lib/createDailyTradeBonusTransaction'
import { hasPlacedMarketTradeToday } from '@play-money/quests/lib/helpers'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { createMarketBuyTransaction } from './createMarketBuyTransaction'
import { createMarketLiquidityTransaction } from './createMarketLiquidityTransaction'
import { createMarketTraderBonusTransactions } from './createMarketTraderBonusTransactions'
import { getMarket } from './getMarket'
import { isMarketTradable } from './helpers'

export async function marketBuy({
  marketId,
  optionId,
  userId,
  amount,
}: {
  marketId: string
  optionId: string
  userId: string
  amount: Decimal
}) {
  const [market, userAccount] = await Promise.all([getMarket({ id: marketId }), getUserPrimaryAccount({ userId })])

  if (!isMarketTradable(market)) {
    throw new Error('Market is closed')
  }

  const transaction = await createMarketBuyTransaction({
    initiatorId: userId,
    accountId: userAccount.id,
    marketId,
    amount,
    optionId,
  })

  const existingTradeInMarket = await db.transaction.findFirst({
    where: {
      id: { not: transaction.id },
      marketId,
      type: 'TRADE_BUY',
      initiatorId: userId,
    },
  })

  if (userId !== market.createdBy && !existingTradeInMarket) {
    const houseAccount = await getHouseAccount()

    await Promise.all([
      createMarketLiquidityTransaction({
        accountId: houseAccount.id,
        amount: new Decimal(UNIQUE_TRADER_LIQUIDITY_PRIMARY),
        marketId,
      }),
      createMarketTraderBonusTransactions({ marketId, initiatorId: userId }),
    ])
  }

  const recipientIds = await getUniqueLiquidityProviderIds(marketId, [userId])

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        type: 'MARKET_TRADE',
        actorId: userId,
        marketId: market.id,
        marketOptionId: optionId,
        transactionId: transaction.id,
        groupKey: market.id,
        userId: recipientId,
        actionUrl: `/questions/${market.id}/${market.slug}/trades`,
      })
    )
  )

  // TODO: Look into returning multiple messages to let the user know toast of the bonus.
  if (!(await hasPlacedMarketTradeToday({ userId })) && amount.gte(DAILY_TRADE_BONUS_PRIMARY)) {
    await createDailyTradeBonusTransaction({ accountId: userAccount.id, marketId, initiatorId: userId })
  }
}
