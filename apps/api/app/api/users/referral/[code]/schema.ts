import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { UserSchema } from '@play-money/database'

export default createSchema({
  GET: {
    parameters: z.object({ code: z.string() }),
    responses: {
      200: UserSchema,
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
