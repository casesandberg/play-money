import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketSchema, TransactionEntrySchema, TransactionSchema, UserSchema } from '@play-money/database'

export default createSchema({
  get: {
    responses: {
      200: z.object({
        transactions: z.array(
          TransactionSchema.extend({
            entries: z.array(TransactionEntrySchema),
            market: MarketSchema.or(z.null()),
            initiator: UserSchema.or(z.null()),
          })
        ),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
