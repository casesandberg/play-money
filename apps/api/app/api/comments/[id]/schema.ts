import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CommentSchema } from '@play-money/database'

export default createSchema({
  get: {
    parameters: CommentSchema.pick({ id: true }),
    responses: {
      200: CommentSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  patch: {
    parameters: CommentSchema.pick({ id: true }),
    requestBody: CommentSchema.pick({ content: true }),
    responses: {
      200: CommentSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  delete: {
    parameters: CommentSchema.pick({ id: true }),
    responses: {
      200: z.object({ message: z.string() }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
