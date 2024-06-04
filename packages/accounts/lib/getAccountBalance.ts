import db from '@play-money/database'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'

export async function getAccountBalance(accountId: string, currencyCode: CurrencyCodeType): Promise<number> {
  const transactionItems = await db.transactionItem.findMany({
    where: { accountId, currencyCode },
  })

  return transactionItems.reduce((sum, item) => sum + item.amount, 0)
}
