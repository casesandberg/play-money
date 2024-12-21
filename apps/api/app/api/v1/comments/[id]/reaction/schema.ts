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
      200: [CommentReactionSchema, zod.object({ message: zod.string() })],
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
