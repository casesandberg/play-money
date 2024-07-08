import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import db from '@play-money/database'
import { createMarketSellTransaction } from '@play-money/transactions/lib/createMarketSellTransaction'
import { getMarket } from './getMarket'
import { isMarketTradable, isPurchasableCurrency } from './helpers'

export async function marketSell({
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
  const hasEnoughBalance = await checkAccountBalance({
    accountId: userAccount.id,
    currencyCode: marketOption.currencyCode,
    amount,
  })

  if (!hasEnoughBalance) {
    throw new Error('User does not have enough balance to sell')
  }

  await createMarketSellTransaction({
    userId: creatorId,
    marketId,
    amount,
    sellCurrencyCode: marketOption.currencyCode,
  })
}
