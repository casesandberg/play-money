import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CommentSchema } from '@play-money/database'

export default createSchema({
  GET: {
    parameters: zod.object({ id: zod.string() }),
    responses: {
      200: zod.object({ comments: zod.array(CommentSchema) }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
