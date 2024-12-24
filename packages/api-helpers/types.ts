import { z } from 'zod'

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sortField: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
})

export type PaginationRequest = z.infer<typeof paginationSchema> & { sortDirection?: 'asc' | 'desc' }
export type PageInfo = {
  hasNextPage: boolean
  endCursor?: string
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pageInfo: PageInfo
}
