import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { MarketSchema, TransactionItemSchema, TransactionSchema, UserSchema } from '@play-money/database'

export default createSchema({
  GET: {
    parameters: z
      .object({
        marketId: z.string().optional(),
        userId: z.string().optional(),
        transactionType: z.array(z.string()).optional(),
      })
      .optional(),
    responses: {
      200: z.object({
        transactions: z.array(
          TransactionSchema.extend({
            transactionItems: z.array(TransactionItemSchema),
            market: MarketSchema.or(z.null()),
            creator: z.object({
              user: UserSchema.or(z.null()),
            }),
          })
        ),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
