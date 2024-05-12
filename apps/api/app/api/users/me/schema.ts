import { _UserModel } from '@play-money/database'
import { UpdateSchema } from '@play-money/users/lib/updateUserById'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  GET: {
    // TODO: @casesandberg Fix typescript to allow for no request data
    request: {
      body: UpdateSchema,
    },
    response: {
      200: _UserModel.pick({ id: true, username: true }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  PATCH: {
    request: {
      body: UpdateSchema,
    },
    response: {
      200: _UserModel.pick({ id: true, username: true }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
