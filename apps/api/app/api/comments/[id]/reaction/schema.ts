import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CreateSchema } from '@play-money/comments/lib/reactToComment'
import { CommentReactionSchema } from '@play-money/database'

export default createSchema({
  post: {
    parameters: zod.object({ id: zod.string() }),
    requestBody: CreateSchema.omit({ commentId: true, userId: true }),
    responses: {
      200: [CommentReactionSchema, zod.object({ message: zod.string() })],
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
