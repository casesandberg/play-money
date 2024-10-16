import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketOptionSchema, MarketSchema } from '@play-money/database'

export default createSchema({
  post: {
    parameters: z.object({ id: z.string() }),
    requestBody: MarketSchema.pick({
      question: true,
      description: true,
      closeDate: true,
      tags: true,
    }).extend({
      options: z.array(
        MarketOptionSchema.pick({
          name: true,
          color: true,
        })
      ),
    }),
    responses: {
      200: z.object({ market: MarketSchema.optional() }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
