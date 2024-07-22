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
        positions: z
          .record(
            z.string(),
            z.object({
              cost: z.number(),
              value: z.number(),
              shares: z.number(),
              payout: z.number(),
            })
          )
          .optional(),
        earnings: z.object({
          traderBonusPayouts: z.number().optional(),
          held: z.number().optional(),
          sold: z.number().optional(),
        }),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
