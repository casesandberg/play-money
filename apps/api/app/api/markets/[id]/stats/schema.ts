import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketSchema } from '@play-money/database'

export default createSchema({
  get: {
    parameters: MarketSchema.pick({ id: true }),
    responses: {
      200: z.object({
        totalLiquidity: z.number(),
        lpUserCount: z.number(),
        traderBonusPayouts: z.number(),
        holdings: z.object({
          traderBonusPayouts: z.number().optional(),
        }),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
