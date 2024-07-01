import Decimal from 'decimal.js'
import _ from 'lodash'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import db from '@play-money/database'
import { createTransaction } from './createTransaction'

export async function createMarketResolveLossTransactions({
  marketId,
  losingCurrencyCode,
}: {
  marketId: string
  losingCurrencyCode: 'YES' | 'NO'
}) {
  const ammAccount = await getAmmAccount({ marketId })
  const exchangerAccount = await getExchangerAccount()
  const systemAccountIds = [ammAccount.id, exchangerAccount.id]

  const losingShares = await db.transactionItem.findMany({
    where: {
      transaction: { marketId },
      currencyCode: losingCurrencyCode,
      accountId: { notIn: systemAccountIds },
    },
  })

  const groupedLosingShares = _.groupBy(losingShares, 'accountId')
  const summedLosingShares = _.mapValues(groupedLosingShares, (transactions) => {
    return transactions.reduce((sum, item) => sum.plus(item.amount), new Decimal(0))
  })

  // Transfer all losing shares back to the AMM
  for (const [accountId, amount] of Object.entries(summedLosingShares)) {
    await createTransaction({
      creatorId: ammAccount.id,
      type: 'MARKET_RESOLVE_LOSS',
      description: `Returning losing shares for market ${marketId}`,
      marketId,
      transactionItems: [
        {
          accountId: accountId,
          currencyCode: losingCurrencyCode,
          amount: amount.negated(),
        },
        {
          accountId: ammAccount.id,
          currencyCode: losingCurrencyCode,
          amount,
        },
      ],
    })
  }
}
