import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default {
  get: {
    summary: 'Get a user',
    parameters: UserSchema.pick({ id: true }),
    responses: {
      200: z.object({ data: UserSchema }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
