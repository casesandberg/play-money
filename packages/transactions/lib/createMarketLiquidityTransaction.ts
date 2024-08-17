import Decimal from 'decimal.js'
import _ from 'lodash'
import { addLiquidity } from '@play-money/amms/lib/maniswap-v1.1'
import { getBalances } from '@play-money/finance/lib/getBalances'
import { getMarketAmmAccount } from '@play-money/finance/lib/getMarketAmmAccount'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { createTransaction } from './createTransaction'
import { convertPrimaryToMarketShares } from './exchanger'

interface MarketLiquidityTransactionInput {
  accountId: string
  amount: Decimal // in dollars
  marketId: string
}

export async function createMarketLiquidityTransaction({
  accountId,
  marketId,
  amount,
}: MarketLiquidityTransactionInput) {
  const ammAccount = await getMarketAmmAccount({ marketId })
  const market = await getMarket({ id: marketId, extended: true })

  const ammBalances = await getBalances({ accountId: ammAccount.id, marketId })
  const ammAssetBalances = ammBalances.filter(({ assetType }) => assetType === 'MARKET_OPTION')

  const exchangerTransactions = await convertPrimaryToMarketShares({
    fromAccountId: accountId,
    amount,
    marketId,
  })

  // TODO
  const liquidityAdditions = await addLiquidity({
    amount,
    options: market.options.map((option) => {
      const optionBalance = ammAssetBalances.find(({ assetId }) => assetId === option.id)!

      return {
        ...option,
        shares: optionBalance.amount,
      }
    }),
  })

  const ammTransactions = [
    {
      accountId: accountId,
      currencyCode: 'YES',
      amount: amount.neg(),
    },
    {
      accountId: ammAccount.id,
      currencyCode: 'YES',
      amount: amount,
    },
    {
      accountId: accountId,
      currencyCode: 'NO',
      amount: amount.neg(),
    },
    {
      accountId: ammAccount.id,
      currencyCode: 'NO',
      amount: amount,
    },
  ] as const

  const transaction = await createTransaction({
    creatorId: accountId,
    type: 'MARKET_LIQUIDITY',
    description: `Add ${amount} worth of liquidity to market ${marketId}`,
    marketId,
    transactionItems: [...exchangerTransactions, ...ammTransactions],
  })

  return transaction
}
