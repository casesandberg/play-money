import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { MarketSchema } from '@play-money/database'

export default {
  post: {
    parameters: MarketSchema.pick({ id: true }),
    requestBody: z.object({ amount: z.number() }),
    responses: {
      200: z.object({
        message: z.string(),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
