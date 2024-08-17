import Decimal from 'decimal.js'
import _ from 'lodash'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { Transaction } from '@play-money/database'
import { getBalances } from '@play-money/finance/lib/getBalances'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { getMarketLiquidity } from '@play-money/markets/lib/getMarketLiquidity'
import { createTransaction } from './createTransaction'
import { convertMarketSharesToPrimary } from './exchanger'

export async function createMarketExcessLiquidityTransactions({ marketId }: { marketId: string }) {
  const ammAccount = await getAmmAccount({ marketId })
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
