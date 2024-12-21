import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

export default {
  post: {
    parameters: z.object({ id: z.string() }),
    requestBody: z.object({ reason: z.string() }),
    responses: {
      200: z.object({}),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
