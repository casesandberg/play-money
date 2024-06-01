import db from '@play-money/database'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'

export async function getUserBalances(userId: string) {
  const transactionItems = await db.transactionItem.findMany({
    where: { userId },
    include: { currency: true },
  })

  const balances: { [currencyCode: string]: number } = {}

  transactionItems.forEach((item) => {
    if (!balances[item.currency.code]) {
      balances[item.currency.code] = 0
    }

    balances[item.currency.code] += item.amount
  })

  return balances
}

export async function checkUserBalance(
  userId: string,
  currencyCode: CurrencyCodeType,
  amount: number
): Promise<boolean> {
  const transactionItems = await db.transactionItem.findMany({
    where: { userId, currencyCode },
  })

  const balance = transactionItems.reduce((sum, item) => sum + item.amount, 0)

  return balance >= amount
}
