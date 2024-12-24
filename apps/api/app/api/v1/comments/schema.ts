import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { CommentSchema } from '@play-money/database'

export default {
  post: {
    summary: 'Create a comment on an entity',
    security: true,
    requestBody: CommentSchema.pick({
      content: true,
      parentId: true,
      entityType: true,
      entityId: true,
    }),
    responses: {
      200: z.object({ data: CommentSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
