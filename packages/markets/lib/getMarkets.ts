import db, { Market } from '@play-money/database'
import { ExtendedMarket } from '../types'

interface MarketFilterOptions {
  createdBy?: string
  tag?: string
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
      tags: filters.tag ? { has: filters.tag } : undefined,
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

  return Promise.all(
    markets.map(async (market) => {
      const [commentCount, uniqueTraders] = await Promise.all([
        db.comment.count({
          where: {
            entityType: 'MARKET',
            entityId: market.id,
          },
        }),
        db.transaction.groupBy({
          by: ['initiatorId'],
          where: {
            marketId: market.id,
            type: 'TRADE_BUY',
          },
          _count: true,
        }),
      ])

      return {
        ...market,
        commentCount,
        uniqueTraderCount: uniqueTraders.length,
      }
    })
  )
}
