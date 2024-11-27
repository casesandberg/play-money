import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { ListSchema } from '@play-money/database'

export default {
  get: {
    parameters: z
      .object({
        pageSize: z.coerce.number().optional(),
        ownerId: z.string().optional(),
      })
      .optional(),
    responses: {
      200: z.object({
        lists: z.array(ListSchema),
        page: z.number(),
        pageSize: z.number(),
        totalPages: z.number(),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
