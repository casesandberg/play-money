import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { ListSchema } from '@play-money/database'

export default createSchema({
  get: {
    parameters: z
      .object({
        pageSize: z.coerce.number().optional(),
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
})
