import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'

export default createSchema({
  GET: {
    parameters: UserProfileModel.pick({ username: true }),
    responses: {
      200: UserProfileModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
