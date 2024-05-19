import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CreateSchema } from '@play-money/comments/lib/createComment'
import { _CommentModel } from '@play-money/database'

export default createSchema({
  POST: {
    request: {
      body: CreateSchema.omit({ authorId: true }),
    },
    response: {
      200: _CommentModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
