import type { ZodTypeAny } from 'zod'
import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CreateSchema } from '@play-money/comments/lib/reactToComment'
import { _CommentReactionModel } from '@play-money/database'

export default createSchema({
  POST: {
    request: {
      params: zod.object({ id: zod.string() }),
      body: CreateSchema.omit({ commentId: true, userId: true }),
    },
    response: {
      // TODO: @casesandberg Fix response type to allow for union types
      200: _CommentReactionModel.or(zod.object({ message: zod.string() })) as unknown as zod.ZodObject<
        Record<string, ZodTypeAny>
      >,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
