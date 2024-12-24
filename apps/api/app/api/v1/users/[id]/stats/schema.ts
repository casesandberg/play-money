import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default {
  get: {
    parameters: UserSchema.pick({ id: true }),
    responses: {
      200: z.object({
        data: z.object({
          netWorth: z.number(),
          tradingVolume: z.number(),
          totalMarkets: z.number(),
          lastTradeAt: z.date().optional(),
          activeDayCount: z.number(),
          otherIncome: z.number(),
          quests: z.array(
            z.object({
              title: z.string(),
              award: z.number(),
              href: z.string(),
              completed: z.boolean(),
            })
          ),
        }),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
