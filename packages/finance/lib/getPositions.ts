import db from '@play-money/database'
import { ExtendedMarketOptionPosition } from '../types'

interface PositionsFilterOptions {
  accountId?: string
  status?: 'active' | 'closed' | 'all'
}

interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

interface PaginationOptions {
  skip: number
  take: number
}

export async function getPositions(
  filters: PositionsFilterOptions = {},
  sort: SortOptions = { field: 'createdAt', direction: 'desc' },
  pagination: PaginationOptions = { skip: 0, take: 10 }
): Promise<{ positions: Array<ExtendedMarketOptionPosition>; total: number }> {
  const statusFilters =
    filters.status === 'active'
      ? {
          quantity: { gt: 0.0001 },
        }
      : filters.status === 'closed'
        ? {
            quantity: { lte: 0.0001 },
          }
        : filters.status === 'all'
          ? {}
          : {}

  const [positions, total] = await Promise.all([
    db.marketOptionPosition.findMany({
      where: {
        accountId: filters.accountId,
        ...statusFilters,
      },
      include: {
        market: true,
        option: true,
      },
      orderBy: {
        [sort.field]: sort.direction,
      },
      skip: pagination.skip,
      take: pagination.take,
    }),
    db.marketOptionPosition.count({
      where: {
        accountId: filters.accountId,
        ...statusFilters,
      },
    }),
  ])

  return { positions, total }
}
