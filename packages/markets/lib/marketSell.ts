import Decimal from 'decimal.js'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { getAssetBalance } from '@play-money/finance/lib/getBalances'
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
