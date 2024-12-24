import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default {
  get: {
    summary: 'Get the current user',
    security: true,
    responses: {
      200: z.object({ data: UserSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
  patch: {
    summary: 'Update the current user',
    security: true,
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
