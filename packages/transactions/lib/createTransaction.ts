import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import db, { TransactionItem, Transaction } from '@play-money/database'

export type TransactionItemInput = Pick<TransactionItem, 'accountId' | 'currencyCode' | 'amount'>

export type TransactionInput = Pick<Transaction, 'description' | 'marketId' | 'type' | 'creatorId'> & {
  transactionItems: Array<TransactionItemInput>
}

export async function createTransaction({
  description,
  marketId,
  transactionItems,
  type,
  creatorId,
}: TransactionInput) {
  const currencySums: { [currencyCode: string]: Decimal } = {}

  transactionItems.forEach((item) => {
    if (!currencySums[item.currencyCode]) {
      currencySums[item.currencyCode] = new Decimal(0)
    }

    currencySums[item.currencyCode] = currencySums[item.currencyCode].plus(item.amount)
  })

  Object.entries(currencySums).forEach(([currencyCode, sum]) => {
    if (!sum.equals(0)) {
      throw new Error(`TransactionItems do not balance for currencyCode ${currencyCode}`)
    }
  })

  await Promise.all(
    transactionItems.map(async (item) => {
      if (item.amount.lessThan(0)) {
        const hasEnoughBalance = await checkAccountBalance(item.accountId, item.currencyCode, item.amount)

        if (!hasEnoughBalance) {
          // console.log(`User ${item.accountId} does not have enough balance for currencyCode ${item.currencyCode}`)
        }
      }
    })
  )

  // TODO: squash transactionItems to remove unnecessary items

  const transaction = await db.transaction.create({
    data: {
      type,
      creatorId,
      description,
      marketId,
      transactionItems: {
        create: transactionItems.map((item) => ({
          accountId: item.accountId,
          currencyCode: item.currencyCode,
          amount: item.amount,
        })),
      },
    },
  })

  return transaction
}
