import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default createSchema({
  GET: {
    responses: {
      200: UserSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  PATCH: {
    requestBody: UserSchema.pick({
      username: true,
      bio: true,
      displayName: true,
      avatarUrl: true,
      timezone: true,
    }).partial(),
    responses: {
      200: UserSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
