import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default {
  get: {
    parameters: UserSchema.pick({ username: true }),
    responses: {
      200: UserSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
