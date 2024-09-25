import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CommentSchema } from '@play-money/database'

export default createSchema({
  POST: {
    requestBody: CommentSchema.pick({
      content: true,
      parentId: true,
      entityType: true,
      entityId: true,
    }).extend({
      entityType: z.enum(['MARKET', 'LIST']),
    }),
    responses: {
      200: CommentSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
