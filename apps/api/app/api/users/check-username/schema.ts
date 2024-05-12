import { _UserModel } from '@play-money/database'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import z from 'zod'

export default createSchema({
  GET: {
    request: {
      params: _UserModel.pick({ username: true }),
    },
    response: {
      200: z.object({ available: z.boolean(), message: z.string().optional() }),
      500: ServerErrorSchema,
    },
  },
})
