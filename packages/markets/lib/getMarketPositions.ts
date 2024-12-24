import Decimal from 'decimal.js'
import { getPaginatedItems, PaginationRequest } from '@play-money/api-helpers'
import db, { MarketOptionPosition } from '@play-money/database'

interface MarketPositionFilterOptions {
  status?: 'active' | 'closed' | 'all'
  ownerId?: string
  marketId?: string
}

export async function getMarketPositions(filters: MarketPositionFilterOptions = {}, pagination?: PaginationRequest) {
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

  return getPaginatedItems<MarketOptionPosition>({
    model: db.marketOptionPosition,
    pagination: pagination ?? {},
    where: {
      ...statusFilters,
      marketId: filters.marketId,
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
  })
}
