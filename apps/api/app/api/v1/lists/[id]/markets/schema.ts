import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { MarketOptionSchema, MarketSchema } from '@play-money/database'

export default {
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
      200: z.object({ data: MarketSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
