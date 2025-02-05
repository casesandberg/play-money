import { z } from 'zod'
import {
  ApiEndpoints,
  createPaginatedResponseSchema,
  paginationSchema,
  ServerErrorSchema,
} from '@play-money/api-helpers'
import { MarketOptionPositionSchema } from '@play-money/database'

export default {
  get: {
    summary: 'Get positions for a user',
    parameters: z
      .object({
        id: z.string(),
        status: z.enum(['active', 'closed', 'all']).optional(),
      })
      .merge(paginationSchema),
    responses: {
      200: createPaginatedResponseSchema(MarketOptionPositionSchema),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
