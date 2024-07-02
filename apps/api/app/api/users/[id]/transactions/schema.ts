import { z } from 'zod'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { TransactionItemSchema, TransactionSchema } from '@play-money/database'
import { UserProfileModel } from '@play-money/users/lib/sanitizeUser'

export default createSchema({
  GET: {
    parameters: UserProfileModel.pick({ id: true }),
    responses: {
      200: z.object({
        transactions: z.array(TransactionSchema.extend({ transactionItems: z.array(TransactionItemSchema) })),
      }),
      404: ServerErrorSchema,
      500: ServerErrorSchema,
    },
  },
})
