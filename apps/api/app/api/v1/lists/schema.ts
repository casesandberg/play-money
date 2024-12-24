import { z } from 'zod'
import {
  ApiEndpoints,
  createPaginatedResponseSchema,
  paginationSchema,
  ServerErrorSchema,
} from '@play-money/api-helpers'
import { ListSchema } from '@play-money/database'

export default {
  get: {
    summary: 'Get lists',
    parameters: z
      .object({
        ownerId: z.string().optional(),
      })
      .merge(paginationSchema)
      .optional(),
    responses: {
      200: createPaginatedResponseSchema(ListSchema),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
