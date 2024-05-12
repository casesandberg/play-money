import { _UserModel } from '@play-money/database'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  GET: {
    request: {
      params: _UserModel.pick({ id: true }),
    },
    response: {
      200: _UserModel.pick({ id: true, username: true }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
