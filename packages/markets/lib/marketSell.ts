import Decimal from 'decimal.js'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { createMarketSellTransaction } from './createMarketSellTransaction'
import { getMarket } from './getMarket'
import { isMarketTradable } from './helpers'

export async function marketSell({
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
  const [market, userAccount] = await Promise.all([
    getMarket({ id: marketId }),
    getUserPrimaryAccount({ userId: userId }),
  ])
  if (!isMarketTradable(market)) {
    throw new Error('Market is closed')
  }

  await createMarketSellTransaction({
    initiatorId: userId,
    accountId: userAccount.id,
    marketId,
    amount,
    optionId,
  })
}
