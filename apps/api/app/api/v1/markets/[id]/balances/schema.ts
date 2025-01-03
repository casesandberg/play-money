import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

export default {
  get: {
    summary: 'Get the balances for a market',
    parameters: z.object({ id: z.string() }),
    responses: {
      200: z.object({
        data: z.object({
          // TODO: Hookup with NetBalance
          balances: z.array(z.object({})),
          user: z.object({}).optional(),
        }),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
