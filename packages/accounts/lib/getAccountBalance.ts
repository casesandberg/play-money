import Decimal from 'decimal.js'
import db from '@play-money/database'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'

export async function getAccountBalance({
  accountId,
  currencyCode,
  marketId,
  excludeTransactionTypes,
}: {
  accountId: string
  currencyCode: CurrencyCodeType
  marketId?: string
  excludeTransactionTypes?: string[]
}): Promise<Decimal> {
  const transactionItems = await db.transactionItem.findMany({
    where: {
      accountId,
      currencyCode,
      transaction: {
        marketId,
        type: {
          notIn: excludeTransactionTypes,
        },
      },
    },
    include: {
      transaction: {
        select: { marketId: true, type: true },
      },
    },
  })

  return transactionItems.reduce((sum, item) => sum.plus(item.amount), new Decimal(0))
}
