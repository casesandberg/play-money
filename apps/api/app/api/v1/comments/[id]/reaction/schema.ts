import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { CommentReactionSchema } from '@play-money/database'

export default {
  post: {
    summary: 'React to a comment, will remove reaction if already exists',
    security: true,
    parameters: z.object({ id: z.string() }),
    requestBody: CommentReactionSchema.pick({
      emoji: true,
    }),
    responses: {
      200: z.object({ data: CommentReactionSchema }),
      204: z.object({}),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
