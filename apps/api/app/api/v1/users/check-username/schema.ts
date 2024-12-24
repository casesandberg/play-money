import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default {
  get: {
    parameters: UserSchema.pick({ username: true }),
    responses: {
      200: z.object({ data: z.object({ available: z.boolean(), message: z.string().optional() }) }),
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
