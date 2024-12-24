import { z } from 'zod'
import {
  ApiEndpoints,
  createPaginatedResponseSchema,
  paginationSchema,
  ServerErrorSchema,
} from '@play-money/api-helpers'
import {
  MarketSchema,
  TransactionEntrySchema,
  TransactionSchema,
  TransactionTypeSchema,
  UserSchema,
} from '@play-money/database'

const ExtendedTransactionSchema = TransactionSchema.extend({
  entries: z.array(TransactionEntrySchema),
  market: MarketSchema.or(z.null()),
  initiator: UserSchema.or(z.null()),
})

export default {
  get: {
    summary: 'Get transactions',
    parameters: z
      .object({
        marketId: z.string().optional(),
        userId: z.string().optional(),
        transactionType: z.array(TransactionTypeSchema).optional(),
      })
      .merge(paginationSchema)
      .optional(),
    responses: {
      200: createPaginatedResponseSchema(ExtendedTransactionSchema),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
