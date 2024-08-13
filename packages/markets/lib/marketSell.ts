import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { createMarketSellTransaction } from '@play-money/transactions/lib/createMarketSellTransaction'
import { getMarket } from './getMarket'
import { getMarketOption } from './getMarketOption'
import { isMarketTradable } from './helpers'

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

  const marketOption = await getMarketOption({ id: optionId, marketId })

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
    optionId,
  })
}
