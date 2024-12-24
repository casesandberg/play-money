import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

export default {
  get: {
    summary: 'Get the graph for a user',
    parameters: z.object({ id: z.string() }),
    responses: {
      200: z.object({
        data: z.array(
          z.object({
            balance: z.number(),
            startAt: z.date(),
            endAt: z.date(),
          })
        ),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
