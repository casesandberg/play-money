import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { TransactionItemSchema, TransactionSchema, UserSchema } from '@play-money/database'

export default createSchema({
  GET: {
    parameters: UserSchema.pick({ id: true }),
    responses: {
      200: z.object({
        transactions: z.array(TransactionSchema.extend({ transactionItems: z.array(TransactionItemSchema) })),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
