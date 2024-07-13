import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default createSchema({
  GET: {
    parameters: UserSchema.pick({ username: true }),
    responses: {
      200: UserSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
