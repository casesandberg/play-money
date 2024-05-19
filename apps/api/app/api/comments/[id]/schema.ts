import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { _CommentModel } from '@play-money/database'

export default createSchema({
  GET: {
    request: {
      params: _CommentModel.pick({ id: true }),
      body: _CommentModel.pick({ content: true }),
    },
    response: {
      200: _CommentModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  PATCH: {
    request: {
      params: _CommentModel.pick({ id: true }),
      body: _CommentModel.pick({ content: true }),
    },
    response: {
      200: _CommentModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  DELETE: {
    request: {
      params: _CommentModel.pick({ id: true }),
      body: _CommentModel.pick({ content: true }),
    },
    // TODO: @casesandberg Fix mixed response types
    response: {
      200: _CommentModel, // zod.object({ message: zod.string() }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
