import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketOptionPositionSchema, UserSchema } from '@play-money/database'

export default createSchema({
  get: {
    parameters: UserSchema.pick({ id: true }).extend({
      pageSize: z.coerce.number().optional(),
      status: z.enum(['active', 'closed', 'all']).optional(),
    }),
    responses: {
      200: z.object({
        positions: z.array(MarketOptionPositionSchema),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
