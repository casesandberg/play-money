import zod from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { CommentSchema } from '@play-money/database'

export default {
  get: {
    parameters: zod.object({ id: zod.string() }),
    responses: {
      200: zod.object({ data: zod.array(CommentSchema) }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
