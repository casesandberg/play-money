import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'

export default createSchema({
  GET: {
    responses: {
      200: z.object({
        data: z.array(
          z.object({
            dau: z.number(),
            signups: z.number(),
            referrals: z.number(),
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
