import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default {
  get: {
    responses: {
      200: z.object({ data: UserSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  patch: {
    requestBody: UserSchema.pick({
      username: true,
      bio: true,
      displayName: true,
      avatarUrl: true,
      timezone: true,
      referredBy: true,
    }).partial(),
    responses: {
      200: z.object({ data: UserSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
