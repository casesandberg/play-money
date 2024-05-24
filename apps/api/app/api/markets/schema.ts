import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketSchema } from '@play-money/database'

export default createSchema({
  POST: {
    request: {
      body: MarketSchema.pick({
        question: true,
        description: true,
        closeDate: true,
      }),
    },
    response: {
      200: MarketSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
