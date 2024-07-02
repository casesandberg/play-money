import db, { Market, Transaction, TransactionItem } from '@play-money/database'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'

export type TransactionWithItems = Transaction & {
  transactionItems: Array<TransactionItem>
  market: Market
}

interface TransactionFilterOptions {
  marketId?: string
  userId?: string
  transactionType?: string[]
  currencyCode?: CurrencyCodeType
}

interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

interface PaginationOptions {
  skip: number
  take: number
}

export async function getTransactions(
  filters: TransactionFilterOptions = {},
  sort: SortOptions = { field: 'createdAt', direction: 'desc' },
  pagination: PaginationOptions = { skip: 0, take: 10 }
) {
  const transactions = await db.transaction.findMany({
    where: {
      marketId: filters.marketId,
      creator: {
        userId: filters.userId,
      },
      type: filters.transactionType ? { in: filters.transactionType } : undefined,
      transactionItems: {
        some: {
          currencyCode: filters.currencyCode,
        },
      },
    },
    include: {
      transactionItems: true,
      market: true,
    },
    orderBy: {
      [sort.field]: sort.direction,
    },
    skip: pagination.skip,
    take: pagination.take,
  })

  return transactions
}
