import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'
import { UpdateSchema } from '@play-money/users/lib/updateUserById'

export default createSchema({
  GET: {
    responses: {
      200: UserProfileModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  PATCH: {
    requestBody: UpdateSchema,
    responses: {
      200: UserProfileModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
