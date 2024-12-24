import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

export default {
  post: {
    summary: 'Generate tags for a market',
    security: true,
    requestBody: z.object({ question: z.string() }),
    responses: {
      200: z.object({
        data: z.array(z.string()),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
