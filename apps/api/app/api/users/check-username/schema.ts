import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'

export default createSchema({
  get: {
    parameters: UserProfileModel.pick({ username: true }),
    responses: {
      200: zod.object({ available: zod.boolean(), message: zod.string().optional() }),
      500: ServerErrorSchema,
    },
  },
})
