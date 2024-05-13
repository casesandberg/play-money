import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'

export default createSchema({
  GET: {
    request: {
      params: UserProfileModel.pick({ username: true }),
    },
    response: {
      200: UserProfileModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
