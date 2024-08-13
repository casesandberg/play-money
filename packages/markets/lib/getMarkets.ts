import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import db, { Market } from '@play-money/database'
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

  // TODO: Move this onto the market model
  const exchangerAccount = await getExchangerAccount()
  return Promise.all(
    markets.map(async (market) => {
      const [commentCount, liquidityCount, uniqueTraders] = await Promise.all([
        db.comment.count({
          where: {
            entityType: 'MARKET',
            entityId: market.id,
          },
        }),
        db.transactionItem.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            accountId: exchangerAccount.id,
            currencyCode: 'PRIMARY',
            transaction: {
              marketId: market.id,
            },
          },
        }),
        prisma.transaction.groupBy({
          by: ['creatorId'],
          where: {
            marketId: market.id,
            type: 'MARKET_BUY',
          },
          _count: true,
        }),
      ])

      return {
        ...market,
        commentCount,
        liquidityCount: liquidityCount._sum.amount?.toNumber(),
        uniqueTraderCount: uniqueTraders.length,
      }
    })
  )
}
