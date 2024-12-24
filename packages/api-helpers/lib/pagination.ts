import { Prisma } from '@prisma/client'
import { z } from 'zod'
import db from '@play-money/database'
import { PaginationRequest, PaginatedResponse } from '../types'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 50

export function validatePaginationParams(params: PaginationRequest) {
  return {
    cursor: params.cursor,
    limit: Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
    sortDirection: params.sortDirection ?? 'desc',
    sortField: params.sortField,
  }
}

export async function getPaginatedItems<T extends { id: string }>(data: {
  model: typeof db.market
  pagination: PaginationRequest
  where?: Prisma.MarketWhereInput
  include?: Prisma.MarketInclude
  orderBy?: Prisma.MarketOrderByWithRelationInput
}): Promise<PaginatedResponse<T>>
export async function getPaginatedItems<T extends { id: string }>(data: {
  model: typeof db.list
  pagination: PaginationRequest
  where?: Prisma.ListWhereInput
  include?: Prisma.ListInclude
  orderBy?: Prisma.ListOrderByWithRelationInput
}): Promise<PaginatedResponse<T>>
export async function getPaginatedItems<T extends { id: string }>(data: {
  model: typeof db.marketOptionPosition
  pagination: PaginationRequest
  where?: Prisma.MarketOptionPositionWhereInput
  include?: Prisma.MarketOptionPositionInclude
  orderBy?: Prisma.MarketOptionPositionOrderByWithRelationInput
}): Promise<PaginatedResponse<T>>
export async function getPaginatedItems<T extends { id: string }>({
  model,
  pagination,
  where = {},
  include = {},
  orderBy = {},
}: {
  model: any
  pagination: PaginationRequest
  where?: any
  include?: any
  orderBy?: any
}): Promise<PaginatedResponse<T>> {
  const { cursor, limit, sortField, sortDirection } = validatePaginationParams(pagination)

  const cursorCondition = cursor
    ? {
        cursor: {
          id: cursor,
        },
        skip: 1, // Skip the cursor
      }
    : {}

  const orderCondition = sortField ? { [sortField]: sortDirection } : { createdAt: sortDirection }

  const [items, total] = await Promise.all([
    model.findMany({
      where,
      include,
      orderBy: { ...orderCondition, ...orderBy },
      ...cursorCondition,
      take: limit + 1,
    }),
    model.count({ where }),
  ])

  const hasNextPage = items.length > limit
  const data = hasNextPage ? items.slice(0, -1) : items

  return {
    data,
    pageInfo: {
      hasNextPage,
      endCursor: data[data.length - 1]?.id,
      total,
    },
  }
}

export const createPaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      endCursor: z.string().optional(),
      total: z.number(),
    }),
  })
