import Decimal from 'decimal.js'
import _ from 'lodash'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import db, { Transaction } from '@play-money/database'
import { createTransaction } from './createTransaction'
import { convertMarketSharesToPrimary } from './exchanger'

export async function createMarketResolveWinTransactions({
  marketId,
  winningCurrencyCode,
}: {
  marketId: string
  winningCurrencyCode: 'YES' | 'NO'
}) {
  const ammAccount = await getAmmAccount({ marketId })
  const exchangerAccount = await getExchangerAccount()
  const systemAccountIds = [ammAccount.id, exchangerAccount.id]

  const winningShares = await db.transactionItem.findMany({
    where: {
      transaction: { marketId },
      currencyCode: winningCurrencyCode,
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
          currencyCode: winningCurrencyCode,
          amount: amount.negated(),
        },
        {
          accountId: ammAccount.id,
          currencyCode: winningCurrencyCode,
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
