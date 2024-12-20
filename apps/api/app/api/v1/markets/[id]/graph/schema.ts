import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

export default {
  get: {
    parameters: z.object({ id: z.string() }),
    responses: {
      200: z.object({
        data: z.array(
          z.object({
            startAt: z.date(),
            endAt: z.date(),
            options: z.array(
              z.object({
                id: z.string(),
                probability: z.number(),
              })
            ),
          })
        ),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
