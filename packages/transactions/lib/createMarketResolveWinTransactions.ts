import Decimal from 'decimal.js'
import _ from 'lodash'
import db, { Transaction } from '@play-money/database'
import { getMarketAmmAccount } from '@play-money/finance/lib/getMarketAmmAccount'
import { getMarketClearingAccount } from '@play-money/finance/lib/getMarketClearingAccount'
import { getMarketOption } from '@play-money/markets/lib/getMarketOption'
import { createTransaction } from './createTransaction'
import { convertMarketSharesToPrimary } from './exchanger'

export async function createMarketResolveWinTransactions({
  marketId,
  winningOptionId,
}: {
  marketId: string
  winningOptionId: string
}) {
  const ammAccount = await getMarketAmmAccount({ marketId })
  const exchangerAccount = await getMarketClearingAccount({ marketId })
  const marketOption = await getMarketOption({ id: winningOptionId, marketId })
  const systemAccountIds = [ammAccount.id, exchangerAccount.id]

  const winningShares = await db.transactionItem.findMany({
    where: {
      transaction: { marketId },
      currencyCode: marketOption.currencyCode,
      accountId: { notIn: systemAccountIds },
    },
  })

  const groupedWinningShares = _.groupBy(winningShares, 'accountId')
  const summedWinningShares = _.mapValues(groupedWinningShares, (transactions) => {
    return transactions.reduce((sum, item) => sum.plus(item.amount), new Decimal(0))
  })

  const transactions: Array<Transaction> = []

  // Transfer winning shares back to the AMM and convert to primary currency
  for (const [accountId, amount] of Object.entries(summedWinningShares)) {
    if (amount.gt(0)) {
      const inflightTransactionItems = [
        {
          accountId: accountId,
          currencyCode: marketOption.currencyCode,
          amount: amount.negated(),
        },
        {
          accountId: ammAccount.id,
          currencyCode: marketOption.currencyCode,
          amount,
        },
      ]

      transactions.push(
        await createTransaction({
          creatorId: ammAccount.id,
          type: 'MARKET_RESOLVE_WIN',
          description: `Returning winning shares for market ${marketId} and converting to primary currency`,
          marketId,
          transactionItems: [
            ...inflightTransactionItems,
            ...(await convertMarketSharesToPrimary({
              fromAccountId: ammAccount.id,
              amount,
              marketId,
              inflightTransactionItems,
            })),
            {
              accountId: ammAccount.id,
              currencyCode: 'PRIMARY',
              amount: amount.negated(),
            },
            {
              accountId: accountId,
              currencyCode: 'PRIMARY',
              amount: amount,
            },
          ],
        })
      )
    }
  }

  return transactions
}
