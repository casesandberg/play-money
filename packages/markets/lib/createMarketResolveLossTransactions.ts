import Decimal from 'decimal.js'
import _ from 'lodash'
import db, { Transaction } from '@play-money/database'
import { createTransaction } from '@play-money/finance/lib/createTransaction'
import { getMarketAmmAccount } from '@play-money/finance/lib/getMarketAmmAccount'
import { getMarketClearingAccount } from '@play-money/finance/lib/getMarketClearingAccount'
import { getMarketOption } from './getMarketOption'

export async function createMarketResolveLossTransactions({
  marketId,
  losingOptionId,
}: {
  marketId: string
  losingOptionId: string
}) {
  const ammAccount = await getMarketAmmAccount({ marketId })
  const exchangerAccount = await getMarketClearingAccount({ marketId })
  const marketOption = await getMarketOption({ id: losingOptionId, marketId })
  const systemAccountIds = [ammAccount.id, exchangerAccount.id]

  // TODO: Solve this with a better balance report
  const losingShares = await db.transactionItem.findMany({
    where: {
      transaction: { marketId },
      currencyCode: marketOption.currencyCode,
      accountId: { notIn: systemAccountIds },
    },
  })

  const groupedLosingShares = _.groupBy(losingShares, 'accountId')
  const summedLosingShares = _.mapValues(groupedLosingShares, (transactions) => {
    return transactions.reduce((sum, item) => sum.plus(item.amount), new Decimal(0))
  })

  const transactions: Array<Transaction> = []

  // Transfer all losing shares back to the AMM
  for (const [accountId, amount] of Object.entries(summedLosingShares)) {
    if (amount.gt(0)) {
      transactions.push(
        await createTransaction({
          creatorId: ammAccount.id,
          type: 'MARKET_RESOLVE_LOSS',
          description: `Returning losing shares for market ${marketId}`,
          marketId,
          transactionItems: [
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
          ],
        })
      )
    }
  }

  return transactions
}
