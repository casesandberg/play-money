import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { MarketSchema, UserSchema, ListSchema } from '@play-money/database'

export default {
  get: {
    summary: 'Search for users, markets, and lists',
    parameters: z.object({ query: z.string().optional() }),
    responses: {
      200: z.object({
        data: z.object({
          users: z.array(UserSchema),
          markets: z.array(MarketSchema),
          lists: z.array(ListSchema),
        }),
      }),
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
