import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default createSchema({
  GET: {
    parameters: UserSchema.pick({ username: true }),
    responses: {
      200: zod.object({ available: zod.boolean(), message: zod.string().optional() }),
      500: ServerErrorSchema,
    },
  },
})
