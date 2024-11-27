import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { MarketOptionPositionSchema } from '@play-money/database'

export default {
  get: {
    parameters: z
      .object({
        status: z.enum(['active', 'closed', 'all']).optional(),
        ownerId: z.string().optional(),
        marketId: z.string().optional(),
        pageSize: z.coerce.number().optional(),
        page: z.coerce.number().optional(),
        sortField: z.string().optional(),
        sortDirection: z.enum(['asc', 'desc']).optional(),
      })
      .optional(),
    responses: {
      200: z.object({
        marketPositions: z.array(MarketOptionPositionSchema),
        page: z.number(),
        pageSize: z.number(),
        totalPages: z.number(),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
