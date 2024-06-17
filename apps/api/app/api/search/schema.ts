import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'

export default createSchema({
  get: {
    parameters: zod.object({ query: zod.string().optional() }),
    responses: {
      200: zod.object({ users: zod.array(UserProfileModel) }),
      500: ServerErrorSchema,
    },
  },
})
