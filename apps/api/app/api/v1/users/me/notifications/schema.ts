import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { NotificationGroupSchema } from '@play-money/database'

export default {
  get: {
    responses: {
      200: z.object({ notifications: z.array(NotificationGroupSchema), unreadCount: z.number() }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  post: {
    responses: {
      200: z.object({ success: z.boolean() }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
