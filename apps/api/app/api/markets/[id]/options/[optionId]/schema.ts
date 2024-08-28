import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketOptionSchema } from '@play-money/database'

export default createSchema({
  patch: {
    parameters: z.object({ id: z.string(), optionId: z.string() }),
    requestBody: MarketOptionSchema.pick({ name: true, color: true }).partial(),
    responses: {
      200: MarketOptionSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
