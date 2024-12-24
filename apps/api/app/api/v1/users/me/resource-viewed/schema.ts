import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'

export default {
  post: {
    summary: 'Mark a resource as viewed for the current user',
    security: true,
    requestBody: z.object({ resourceType: z.string(), resourceId: z.string(), timestamp: z.string() }),
    responses: {
      200: z.object({ data: z.object({ success: z.boolean() }) }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
