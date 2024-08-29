import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  GET: {
    parameters: z.object({ id: z.string() }),
    responses: {
      200: z.object({
        data: z.array(
          z.object({
            startAt: z.date(),
            endAt: z.date(),
            options: z.array(
              z.object({
                id: z.string(),
                probability: z.number(),
              })
            ),
          })
        ),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
