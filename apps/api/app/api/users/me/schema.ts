import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'

export default createSchema({
  GET: {
    responses: {
      200: UserProfileModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  PATCH: {
    requestBody: UserSchema.pick({ username: true, bio: true, displayName: true, avatarUrl: true }).partial(),
    responses: {
      200: UserProfileModel,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
