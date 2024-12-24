import { getPaginatedItems, PaginationRequest } from '@play-money/api-helpers'
import db, { Market } from '@play-money/database'
import { ExtendedMarket } from '../types'

interface MarketFilterOptions {
  status?: 'active' | 'halted' | 'closed' | 'resolved' | 'canceled' | 'all'
  createdBy?: string
  tags?: string[]
}

function getStatusFilters(status: MarketFilterOptions['status']) {
  switch (status) {
    case 'active':
      return {
        closeDate: { gt: new Date() },
        resolvedAt: null,
        canceledAt: null,
      }
    case 'closed':
      return {
        closeDate: { lt: new Date() },
        resolvedAt: null,
        canceledAt: null,
      }
    case 'resolved':
      return {
        resolvedAt: { not: null },
      }
    case 'canceled':
      return {
        canceledAt: { not: null },
      }
    default:
      return {}
  }
}

export async function getMarkets(filters: MarketFilterOptions = {}, pagination?: PaginationRequest) {
  return getPaginatedItems<Market | ExtendedMarket>({
    model: db.market,
    pagination: pagination ?? {},
    where: {
      ...getStatusFilters(filters.status),
      createdBy: filters.createdBy,
      tags: filters.tags ? { hasSome: filters.tags } : undefined,
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
  })
}
