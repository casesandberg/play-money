import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default createSchema({
  get: {
    responses: {
      200: z.object({ referrals: z.array(UserSchema) }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
