import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getHouseAccount } from '@play-money/accounts/lib/getHouseAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import db from '@play-money/database'
import { UNIQUE_TRADER_LIQUIDITY_PRIMARY } from '@play-money/economy'
import { createNotification } from '@play-money/notifications/lib/createNotification'
import { createDailyTradeBonusTransaction } from '@play-money/quests/lib/createDailyTradeBonusTransaction'
import { hasPlacedMarketTradeToday } from '@play-money/quests/lib/helpers'
import { createMarketBuyTransaction } from '@play-money/transactions/lib/createMarketBuyTransaction'
import { createMarketLiquidityTransaction } from '@play-money/transactions/lib/createMarketLiquidityTransaction'
import { createMarketTraderBonusTransactions } from '@play-money/transactions/lib/createMarketTraderBonusTransactions'
import { getUniqueLiquidityProviderIds } from '@play-money/transactions/lib/getUniqueLiquidityProviderIds'
import { getMarket } from './getMarket'
import { isMarketTradable } from './helpers'

export async function marketBuy({
  marketId,
  optionId,
  creatorId,
  amount,
}: {
  marketId: string
  optionId: string
  creatorId: string
  amount: Decimal
}) {
  const market = await getMarket({ id: marketId })
  if (!isMarketTradable(market)) {
    throw new Error('Market is closed')
  }

  const userAccount = await getUserAccount({ id: creatorId })
  const hasEnoughBalance = await checkAccountBalance({ accountId: userAccount.id, currencyCode: 'PRIMARY', amount })

  if (!hasEnoughBalance) {
    throw new Error('User does not have enough balance to purchase')
  }

  const transaction = await createMarketBuyTransaction({
    userId: creatorId,
    marketId,
    amount: new Decimal(amount),
    optionId,
  })

  const existingTradeInMarket = await db.transaction.findFirst({
    where: {
      id: { not: transaction.id },
      marketId,
      type: 'MARKET_BUY',
      creatorId,
    },
  })

  if (creatorId !== market.createdBy && !existingTradeInMarket) {
    const houseAccount = await getHouseAccount()

    await createMarketLiquidityTransaction({
      accountId: houseAccount.id,
      amount: new Decimal(UNIQUE_TRADER_LIQUIDITY_PRIMARY),
      marketId,
    })

    await createMarketTraderBonusTransactions({ marketId })
  }

  const recipientIds = await getUniqueLiquidityProviderIds(marketId, [creatorId])

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        type: 'MARKET_TRADE',
        actorId: creatorId,
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
  if (!(await hasPlacedMarketTradeToday({ userId: creatorId }))) {
    await createDailyTradeBonusTransaction({ accountId: userAccount.id, marketId })
  }
}
