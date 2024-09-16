import db from '@play-money/database'
import { ExtendedMarketOptionPosition } from '../types'

interface PositionsFilterOptions {
  accountId?: string
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
  const [positions, total] = await Promise.all([
    db.marketOptionPosition.findMany({
      where: {
        accountId: filters.accountId,
        value: { gt: 0 },
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
        value: { gt: 0 },
      },
    }),
  ])

  return { positions, total }
}
