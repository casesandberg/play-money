import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

export default {
  get: {
    responses: {
      200: z.object({ balance: z.number() }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
