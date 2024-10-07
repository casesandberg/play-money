import Decimal from 'decimal.js'
import db, { MarketOptionPosition } from '@play-money/database'

interface MarketPositionFilterOptions {
  status?: 'active' | 'closed' | 'all'
  ownerId?: string
}

interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

interface PaginationOptions {
  skip: number
  take: number
}

export async function getMarketPositions(
  filters: MarketPositionFilterOptions = {},
  sort: SortOptions = { field: 'createdAt', direction: 'desc' },
  pagination: PaginationOptions = { skip: 0, take: 10 }
): Promise<{ marketPositions: Array<MarketOptionPosition>; total: number }> {
  const statusFilters =
    filters.status === 'active'
      ? {
          quantity: {
            gt: new Decimal(0.0001),
          },
        }
      : filters.status === 'closed'
        ? {
            quantity: {
              lt: new Decimal(0.0001),
            },
          }
        : filters.status === 'all'
          ? {}
          : {}

  const [marketPositions, total] = await Promise.all([
    db.marketOptionPosition.findMany({
      where: {
        ...statusFilters,
        account: {
          userPrimary: {
            id: filters.ownerId,
          },
        },
      },
      include: {
        account: {
          include: {
            user: true,
          },
        },
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
        ...statusFilters,
        account: {
          userPrimary: {
            id: filters.ownerId,
          },
        },
      },
    }),
  ])

  return { marketPositions, total }
}
