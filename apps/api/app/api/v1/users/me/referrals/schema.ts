import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default {
  get: {
    summary: 'Get all referrals for the current user',
    security: true,
    responses: {
      200: z.object({ data: z.array(UserSchema) }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
