import db, { List } from '@play-money/database'
import { ExtendedList } from '../types'

interface ListFilterOptions {}

interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

interface PaginationOptions {
  skip: number
  take: number
}

export async function getLists(
  filters: ListFilterOptions = {},
  sort: SortOptions = { field: 'createdAt', direction: 'desc' },
  pagination: PaginationOptions = { skip: 0, take: 10 }
): Promise<{ lists: Array<List | ExtendedList>; total: number }> {
  const [lists, total] = await Promise.all([
    db.list.findMany({
      include: {
        owner: true,
        markets: {
          include: {
            market: {
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
            },
          },
        },
      },
      orderBy: {
        [sort.field]: sort.direction,
      },
      skip: pagination.skip,
      take: pagination.take,
    }),
    db.list.count(),
  ])

  return { lists, total }
}
