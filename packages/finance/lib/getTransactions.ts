import db from '@play-money/database'
import { TransactionTypeType } from '@play-money/database/zod/inputTypeSchemas/TransactionTypeSchema'
import { TransactionWithEntries } from '../types'

interface TransactionFilterOptions {
  marketId?: string
  userId?: string
  transactionType?: Array<TransactionTypeType>
  isReverse?: boolean | null
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
): Promise<{ transactions: Array<TransactionWithEntries>; total: number }> {
  const [transactions, total] = await Promise.all([
    db.transaction.findMany({
      where: {
        marketId: filters.marketId,
        initiatorId: filters.userId,
        type: filters.transactionType ? { in: filters.transactionType } : undefined,
        isReverse: filters.isReverse,
      },
      include: {
        entries: true,
        market: true,
        initiator: true,
        options: true,
      },
      orderBy: {
        [sort.field]: sort.direction,
      },
      skip: pagination.skip,
      take: pagination.take,
    }),

    db.transaction.count({
      where: {
        marketId: filters.marketId,
        initiatorId: filters.userId,
        type: filters.transactionType ? { in: filters.transactionType } : undefined,
        isReverse: filters.isReverse,
      },
    }),
  ])

  return { transactions, total }
}
