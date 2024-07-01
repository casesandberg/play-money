import Decimal from 'decimal.js'
import db from '@play-money/database'
import { createMarketBuyTransaction } from '@play-money/transactions/lib/createMarketBuyTransaction'
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

  await createMarketBuyTransaction({
    userId: creatorId,
    marketId,
    amount: new Decimal(amount),
    purchaseCurrencyCode: marketOption.currencyCode,
  })
}
