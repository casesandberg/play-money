import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { CommentSchema } from '@play-money/database'

export default {
  get: {
    parameters: CommentSchema.pick({ id: true }),
    responses: {
      200: z.object({ data: CommentSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  patch: {
    parameters: CommentSchema.pick({ id: true }),
    requestBody: CommentSchema.pick({ content: true }),
    responses: {
      200: z.object({ data: CommentSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  delete: {
    parameters: CommentSchema.pick({ id: true }),
    responses: {
      204: z.void(),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
