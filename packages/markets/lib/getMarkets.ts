import db, { Market } from '@play-money/database'
import { ExtendedMarket } from '../types'

interface MarketFilterOptions {
  status?: 'active' | 'halted' | 'closed' | 'resolved' | 'canceled' | 'all'
  createdBy?: string
  tag?: string
  tags?: string[]
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
): Promise<{ markets: Array<Market | ExtendedMarket>; total: number }> {
  const statusFilters =
    filters.status === 'active'
      ? {
          closeDate: {
            gt: new Date(),
          },
          resolvedAt: null,
          canceledAt: null,
        }
      : filters.status === 'closed'
        ? {
            closeDate: {
              lt: new Date(),
            },
            resolvedAt: null,
            canceledAt: null,
          }
        : filters.status === 'resolved'
          ? {
              resolvedAt: {
                not: null,
              },
            }
          : filters.status === 'canceled'
            ? {
                canceledAt: {
                  not: null,
                },
              }
            : filters.status === 'all'
              ? {}
              : {}

  const [markets, total] = await Promise.all([
    db.market.findMany({
      where: {
        ...statusFilters,
        createdBy: filters.createdBy,
        tags: filters.tag ? { has: filters.tag } : filters.tags ? { hasSome: filters.tags } : undefined,
        parentListId: null,
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
        parentList: true,
      },
      orderBy: {
        [sort.field]: sort.direction,
      },
      skip: pagination.skip,
      take: pagination.take,
    }),
    db.market.count({
      where: {
        ...statusFilters,
        createdBy: filters.createdBy,
        tags: filters.tag ? { has: filters.tag } : undefined,
        parentListId: null,
      },
    }),
  ])

  return { markets, total }
}
