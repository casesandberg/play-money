import db, { TransactionItem, Transaction } from '@play-money/database'
import { checkUserBalance } from './getUserBalances'

export type TransactionItemInput = Pick<TransactionItem, 'userId' | 'currencyCode' | 'amount'>

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
  const currencySums: { [currencyCode: string]: number } = {}

  transactionItems.forEach((item) => {
    if (!currencySums[item.currencyCode]) {
      currencySums[item.currencyCode] = 0
    }

    currencySums[item.currencyCode] += item.amount
  })

  Object.entries(currencySums).forEach(([currencyCode, sum]) => {
    if (sum !== 0) {
      throw new Error(`TransactionItems do not balance for currencyCode ${currencyCode}`)
    }
  })

  await Promise.all(
    transactionItems.map(async (item) => {
      if (item.amount < 0) {
        const hasEnoughBalance = await checkUserBalance(item.userId, item.currencyCode, item.amount)

        if (!hasEnoughBalance) {
          throw new Error(`User ${item.userId} does not have enough balance for currencyCode ${item.currencyCode}`)
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
          userId: item.userId,
          currencyCode: item.currencyCode,
          amount: item.amount,
        })),
      },
    },
  })

  return transaction
}
