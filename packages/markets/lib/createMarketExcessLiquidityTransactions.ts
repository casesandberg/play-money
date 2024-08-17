import Decimal from 'decimal.js'
import _ from 'lodash'
import { Transaction } from '@play-money/database'
import { createTransaction } from '@play-money/finance/lib/createTransaction'
import { convertMarketSharesToPrimary } from '@play-money/finance/lib/exchanger'
import { getBalances } from '@play-money/finance/lib/getBalances'
import { getMarket } from './getMarket'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketLiquidity } from './getMarketLiquidity'

export async function createMarketExcessLiquidityTransactions({ marketId }: { marketId: string }) {
  const ammAccount = await getMarketAmmAccount({ marketId })
  const market = await getMarket({ id: marketId, extended: true })

  const balances = await getBalances({ accountId: ammAccount.id, marketId: market.id })
  const amounts = balances.filter(({ assetType }) => assetType === 'MARKET_OPTION').map((b) => b.amount)

  if (!amounts.length) {
    return
  }
  const amountToDistribute = Decimal.min(...amounts)
  const liquidity = await getMarketLiquidity(marketId)
  const transactions: Array<Transaction> = []

  for (const [accountId, providedAmount] of Object.entries(liquidity.providers)) {
    if (providedAmount.isZero()) continue

    const proportion = providedAmount.div(liquidity.total)
    const payout = amountToDistribute.mul(proportion).toDecimalPlaces(4)

    if (payout.isZero()) continue

    transactions.push(
      await createTransaction({
        creatorId: ammAccount.id,
        type: 'MARKET_EXCESS_LIQUIDITY',
        description: `Distributing excess liquidity for market ${marketId} to ${accountId}`,
        marketId,
        transactionItems: [
          ...(await convertMarketSharesToPrimary({
            fromAccountId: ammAccount.id,
            amount: payout,
            marketId,
          })),
          {
            accountId: ammAccount.id,
            currencyCode: 'PRIMARY',
            amount: payout.negated(),
          },
          {
            accountId: accountId,
            currencyCode: 'PRIMARY',
            amount: payout,
          },
        ],
      })
    )
  }

  // TODO: Handle dust

  return transactions
}
