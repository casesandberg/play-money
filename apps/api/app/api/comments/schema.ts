import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CreateSchema } from '@play-money/comments/lib/createComment'
import { CommentSchema } from '@play-money/database'

export default createSchema({
  POST: {
    requestBody: CreateSchema.omit({ authorId: true }),
    responses: {
      200: CommentSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
