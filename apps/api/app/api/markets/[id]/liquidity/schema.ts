import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketSchema } from '@play-money/database'

export default createSchema({
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
})
