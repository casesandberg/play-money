import { _UserModel } from '@play-money/database'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import zod from 'zod'

export default createSchema({
  GET: {
    request: {
      params: _UserModel.pick({ username: true }),
    },
    response: {
      200: zod.object({ available: zod.boolean(), message: zod.string().optional() }),
      500: ServerErrorSchema,
    },
  },
})
