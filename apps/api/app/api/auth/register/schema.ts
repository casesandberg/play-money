import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default createSchema({
  POST: {
    request: {
      body: UserSchema.pick({ email: true }),
    },
    response: {
      201: UserSchema.pick({ id: true }),
      409: {
        content: ServerErrorSchema,
        description: 'User already exists with that email address',
      },
      422: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
