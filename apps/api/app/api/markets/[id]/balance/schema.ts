import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  GET: {
    parameters: z.object({ id: z.string() }),
    responses: {
      200: z.object({
        YES: z.number(),
        NO: z.number(),
        probability: z.object({
          YES: z.number(),
          NO: z.number(),
        }),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
