import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default {
  get: {
    parameters: z.object({ code: z.string() }),
    responses: {
      200: UserSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
