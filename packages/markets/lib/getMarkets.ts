import db, { Market } from '@play-money/database'
import { getBalance } from '@play-money/finance/lib/getBalances'
import { marketOptionBalancesToProbabilities } from '@play-money/finance/lib/helpers'
import { ExtendedMarket } from '../types'
import { getMarketClearingAccount } from './getMarketClearingAccount'

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

  return Promise.all(
    markets.map(async (market) => {
      const clearingAccount = await getMarketClearingAccount({ marketId: market.id })
      const [commentCount, liquidityCount, uniqueTraders, balances] = await Promise.all([
        db.comment.count({
          where: {
            entityType: 'MARKET',
            entityId: market.id,
          },
        }),
        db.transactionEntry.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            toAccountId: clearingAccount.id,
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            transaction: {
              marketId: market.id,
            },
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
        await Promise.all(
          market.options.map((option) => {
            return getBalance({
              accountId: market.ammAccountId,
              assetType: 'MARKET_OPTION',
              assetId: option.id,
              marketId: market.id,
            })
          })
        ),
      ])

      const probabilities = marketOptionBalancesToProbabilities(balances)

      return {
        ...market,
        options: market.options.map((option) => {
          return {
            ...option,
            probability: probabilities[option.id],
          }
        }),
        commentCount,
        liquidityCount: liquidityCount._sum.amount?.toNumber(),
        uniqueTraderCount: uniqueTraders.length,
      }
    })
  )
}
