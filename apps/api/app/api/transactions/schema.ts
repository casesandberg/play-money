import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import {
  MarketSchema,
  TransactionEntrySchema,
  TransactionSchema,
  TransactionTypeSchema,
  UserSchema,
} from '@play-money/database'

export default createSchema({
  GET: {
    parameters: z
      .object({
        marketId: z.string().optional(),
        userId: z.string().optional(),
        transactionType: z.array(TransactionTypeSchema).optional(),
      })
      .optional(),
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
