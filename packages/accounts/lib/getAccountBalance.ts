import Decimal from 'decimal.js'
import db from '@play-money/database'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'

export async function getAccountBalance(
  accountId: string,
  currencyCode: CurrencyCodeType,
  marketId?: string
): Promise<Decimal> {
  const transactionItems = await db.transactionItem.findMany({
    where: {
      accountId,
      currencyCode,
      transaction: marketId ? { marketId } : undefined,
    },
    include: {
      transaction: {
        select: { marketId: true },
      },
    },
  })

  return transactionItems.reduce((sum, item) => sum.plus(item.amount), new Decimal(0))
}
