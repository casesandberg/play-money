import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { _CommentModel } from '@play-money/database'

export default createSchema({
  GET: {
    request: {
      params: zod.object({ id: zod.string() }),
    },
    response: {
      200: zod.object({ comments: zod.array(_CommentModel) }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
