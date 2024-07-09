import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { CurrencyCodeSchema, MarketSchema, TransactionItemSchema, TransactionSchema } from '@play-money/database'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'

export default createSchema({
  GET: {
    parameters: z
      .object({
        marketId: z.string().optional(),
        userId: z.string().optional(),
        transactionType: z.array(z.string()).optional(),
        currencyCode: CurrencyCodeSchema.optional(),
      })
      .optional(),
    responses: {
      200: z.object({
        transactions: z.array(
          TransactionSchema.extend({
            transactionItems: z.array(TransactionItemSchema),
            market: MarketSchema.or(z.null()),
            creator: z.object({
              user: UserProfileModel.or(z.null()),
            }),
          })
        ),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
