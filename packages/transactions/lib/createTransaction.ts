import db, { TransactionItem, Transaction } from '@play-money/database'
import { checkUserBalance } from './getUserBalances'

type TransactionItemInput = Pick<TransactionItem, 'userId' | 'currencyId' | 'amount'>

type TransactionInput = Pick<Transaction, 'description' | 'marketId'> & {
  transactionItems: Array<TransactionItemInput>
}

export async function createTransaction({ description, marketId, transactionItems }: TransactionInput) {
  const currencySums: { [currencyId: number]: number } = {}

  transactionItems.forEach((item) => {
    if (!currencySums[item.currencyId]) {
      currencySums[item.currencyId] = 0
    }

    currencySums[item.currencyId] += item.amount
  })

  Object.entries(currencySums).forEach(([currencyId, sum]) => {
    if (sum !== 0) {
      throw new Error(`TransactionItems do not balance for currencyId ${currencyId}`)
    }
  })

  await Promise.all(
    transactionItems.map(async (item) => {
      if (item.amount < 0) {
        const hasEnoughBalance = await checkUserBalance(item.userId, item.currencyId, item.amount)

        if (!hasEnoughBalance) {
          throw new Error(`User ${item.userId} does not have enough balance for currencyId ${item.currencyId}`)
        }
      }
    })
  )

  const transaction = await db.transaction.create({
    data: {
      description,
      marketId,
      transactionItems: {
        create: transactionItems.map((item) => ({
          userId: item.userId,
          currencyId: item.currencyId,
          amount: item.amount,
        })),
      },
    },
  })

  return transaction
}
