import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CommentReactionSchema } from '@play-money/database'

export default createSchema({
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
})
