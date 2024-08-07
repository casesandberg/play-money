import Decimal from 'decimal.js'
import _ from 'lodash'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { Transaction } from '@play-money/database'
import { getMarketLiquidity } from '@play-money/markets/lib/getMarketLiquidity'
import { createTransaction } from './createTransaction'
import { convertMarketSharesToPrimary } from './exchanger'

export async function createMarketExcessLiquidityTransactions({ marketId }: { marketId: string }) {
  const ammAccount = await getAmmAccount({ marketId })

  const balances = [
    { amount: await getAccountBalance({ marketId, accountId: ammAccount.id, currencyCode: 'YES' }) },
    { amount: await getAccountBalance({ marketId, accountId: ammAccount.id, currencyCode: 'NO' }) },
  ]

  const amountToDistribute = Decimal.min(...balances.map((b) => b.amount))
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
