import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

export default {
  get: {
    parameters: z.object({ id: z.string() }),
    responses: {
      200: z.object({
        data: z.object({
          // TODO: Hookup with NetBalance
          balance: z.object({}),
        }),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
