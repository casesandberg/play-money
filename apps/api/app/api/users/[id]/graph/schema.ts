import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  get: {
    parameters: z.object({ id: z.string() }),
    responses: {
      200: z.object({
        data: z.array(
          z.object({
            balance: z.number(),
            startAt: z.date(),
            endAt: z.date(),
          })
        ),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
