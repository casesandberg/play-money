import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketOptionSchema, MarketSchema } from '@play-money/database'

export default createSchema({
  POST: {
    requestBody: MarketSchema.pick({
      question: true,
      description: true,
      closeDate: true,
    }).extend({
      options: z.array(
        MarketOptionSchema.pick({
          name: true,
          currencyCode: true,
        })
      ),
    }),
    responses: {
      200: MarketSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
