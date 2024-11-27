import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import {
  MarketSchema,
  TransactionEntrySchema,
  TransactionSchema,
  TransactionTypeSchema,
  UserSchema,
} from '@play-money/database'

export default {
  get: {
    parameters: z
      .object({
        marketId: z.string().optional(),
        userId: z.string().optional(),
        transactionType: z.array(TransactionTypeSchema).optional(),
        pageSize: z.coerce.number().optional(),
        page: z.coerce.number().optional(),
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
} as const satisfies ApiEndpoints
