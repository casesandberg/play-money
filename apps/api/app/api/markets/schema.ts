import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketOptionSchema, MarketSchema } from '@play-money/database'

export default createSchema({
  get: {
    parameters: z
      .object({
        createdBy: z.string().optional(),
        limit: z.coerce.number().optional(),
      })
      .optional(),
    responses: {
      200: z.object({
        markets: z.array(MarketSchema),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  post: {
    requestBody: MarketSchema.pick({
      question: true,
      description: true,
      closeDate: true,
    }).extend({
      options: z.array(
        MarketOptionSchema.pick({
          name: true,
          currencyCode: true,
          color: true,
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
