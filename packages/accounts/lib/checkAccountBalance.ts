import db from '@play-money/database'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'

export async function checkAccountBalance(
  accountId: string,
  currencyCode: CurrencyCodeType,
  amount: number
): Promise<boolean> {
  const transactionItems = await db.transactionItem.findMany({
    where: { accountId, currencyCode },
  })

  const balance = transactionItems.reduce((sum, item) => sum + item.amount, 0)

  return balance >= amount
}
