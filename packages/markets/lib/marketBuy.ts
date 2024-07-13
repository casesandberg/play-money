import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getHouseAccount } from '@play-money/accounts/lib/getHouseAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import db from '@play-money/database'
import { UNIQUE_TRADER_LIQUIDITY_PRIMARY } from '@play-money/economy'
import { createMarketBuyTransaction } from '@play-money/transactions/lib/createMarketBuyTransaction'
import { createMarketLiquidityTransaction } from '@play-money/transactions/lib/createMarketLiquidityTransaction'
import { createMarketTraderBonusTransactions } from '@play-money/transactions/lib/createMarketTraderBonusTransactions'
import { getMarket } from './getMarket'
import { isMarketTradable, isPurchasableCurrency } from './helpers'

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

  const marketOption = await db.marketOption.findFirst({
    where: { id: optionId, marketId },
  })

  if (!marketOption) {
    throw new Error('Invalid optionId')
  }

  if (!isPurchasableCurrency(marketOption.currencyCode)) {
    throw new Error('Invalid option currency code')
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
    purchaseCurrencyCode: marketOption.currencyCode,
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
}
