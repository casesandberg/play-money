import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

export default {
  post: {
    requestBody: z.object({ resourceType: z.string(), resourceId: z.string(), timestamp: z.string() }),
    responses: {
      200: z.object({ data: z.object({ success: z.boolean() }) }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
