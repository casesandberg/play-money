import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CommentSchema } from '@play-money/database'

export default createSchema({
  GET: {
    request: {
      params: CommentSchema.pick({ id: true }),
      body: CommentSchema.pick({ content: true }),
    },
    response: {
      200: CommentSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  PATCH: {
    request: {
      params: CommentSchema.pick({ id: true }),
      body: CommentSchema.pick({ content: true }),
    },
    response: {
      200: CommentSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  DELETE: {
    request: {
      params: CommentSchema.pick({ id: true }),
      body: CommentSchema.pick({ content: true }),
    },
    // TODO: @casesandberg Fix mixed response types
    response: {
      200: CommentSchema, // zod.object({ message: zod.string() }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
