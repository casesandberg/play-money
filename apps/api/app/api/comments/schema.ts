import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CommentSchema } from '@play-money/database'

export default createSchema({
  post: {
    requestBody: CommentSchema.pick({
      content: true,
      parentId: true,
      entityType: true,
      entityId: true,
    }),
    responses: {
      200: CommentSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
