import { z } from 'zod'
import { ApiEndpoints, ServerErrorSchema } from '@play-money/api-helpers'
import { TransactionEntrySchema, TransactionSchema, UserSchema } from '@play-money/database'

export default {
  get: {
    summary: 'Get transactions for a user',
    parameters: UserSchema.pick({ id: true }),
    responses: {
      200: z.object({
        data: z.array(TransactionSchema.extend({ entries: z.array(TransactionEntrySchema) })),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
} as const satisfies ApiEndpoints
