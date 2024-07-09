import db, { Market, Transaction, TransactionItem } from '@play-money/database'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { UserProfile, sanitizeUser } from '@play-money/users/lib/sanitizeUser'

export type TransactionWithItems = Transaction & {
  transactionItems: Array<TransactionItem>
  market: Market | null
  creator: {
    user: UserProfile | null
  }
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
): Promise<Array<TransactionWithItems>> {
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
      creator: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      [sort.field]: sort.direction,
    },
    skip: pagination.skip,
    take: pagination.take,
  })

  return transactions.map((transaction) => {
    return {
      ...transaction,
      creator: {
        ...transaction.creator,
        user: transaction.creator.user ? sanitizeUser(transaction.creator.user) : null,
      },
    }
  })
}
