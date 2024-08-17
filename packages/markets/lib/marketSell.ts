import Decimal from 'decimal.js'
import { getAssetBalance } from '@play-money/finance/lib/getBalances'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { createMarketSellTransaction } from './createMarketSellTransaction'
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

  const userAccount = await getUserPrimaryAccount({ userId: creatorId })
  const userOptionBalance = await getAssetBalance({
    accountId: userAccount.id,
    assetType: 'MARKET_OPTION',
    assetId: marketOption.id,
  })

  if (!userOptionBalance.amount.gte(amount)) {
    throw new Error('User does not have enough balance to sell')
  }

  await createMarketSellTransaction({
    userId: creatorId,
    marketId,
    amount,
    optionId,
  })
}
