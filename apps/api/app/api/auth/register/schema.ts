import { _UserModel } from '@play-money/database'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  POST: {
    request: {
      body: _UserModel.pick({ email: true, password: true }),
    },
    response: {
      201: _UserModel.pick({ id: true, email: true }),
      409: {
        content: ServerErrorSchema,
        description: 'User already exists with that email address',
      },
      422: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
