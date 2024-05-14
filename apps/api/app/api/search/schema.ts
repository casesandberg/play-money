import zod from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'

export default createSchema({
  GET: {
    request: {
      params: zod.object({ query: zod.string().optional() }),
    },
    response: {
      200: zod.object({ users: zod.array(UserProfileModel) }),
      500: ServerErrorSchema,
    },
  },
})
