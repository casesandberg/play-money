import db, { Market } from '@play-money/database'
import { sanitizeUser } from '@play-money/users/lib/sanitizeUser'
import { ExtendedMarket } from '../components/MarketOverviewPage'

interface MarketFilterOptions {
  createdBy?: string
}

interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

interface PaginationOptions {
  skip: number
  take: number
}

export async function getMarkets(
  filters: MarketFilterOptions = {},
  sort: SortOptions = { field: 'createdAt', direction: 'desc' },
  pagination: PaginationOptions = { skip: 0, take: 10 }
): Promise<Array<Market | ExtendedMarket>> {
  const markets = await db.market.findMany({
    where: {
      createdBy: filters.createdBy,
    },
    include: {
      user: true,
      options: true,
      marketResolution: {
        include: {
          resolution: true,
          resolvedBy: true,
        },
      },
    },
    orderBy: {
      [sort.field]: sort.direction,
    },
    skip: pagination.skip,
    take: pagination.take,
  })

  return markets.map((market) => {
    return {
      ...market,
      user: sanitizeUser(market.user),
      options: market.options.map((option) => ({
        ...option,
        color: option.currencyCode === 'YES' ? '#3b82f6' : '#ec4899',
      })),
      marketResolution: market.marketResolution
        ? {
            ...market.marketResolution,
            resolvedBy: sanitizeUser(market.marketResolution.resolvedBy),
            resolution: {
              ...market.marketResolution.resolution,
              color: market.marketResolution.resolution.currencyCode === 'YES' ? '#3b82f6' : '#ec4899',
            },
          }
        : undefined,
    }
  })
}
