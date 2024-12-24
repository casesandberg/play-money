import zod from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { CommentReactionSchema } from '@play-money/database'

export default {
  post: {
    parameters: zod.object({ id: zod.string() }),
    requestBody: CommentReactionSchema.pick({
      emoji: true,
    }),
    responses: {
      200: zod.object({ data: CommentReactionSchema }),
      204: zod.void(),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
