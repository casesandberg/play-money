import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  get: {
    responses: {
      200: z.object({ balance: z.number() }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
