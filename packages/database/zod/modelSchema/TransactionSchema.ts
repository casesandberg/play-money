import { z } from 'zod';
import { TransactionTypeSchema } from '../inputTypeSchemas/TransactionTypeSchema'

/////////////////////////////////////////
// TRANSACTION SCHEMA
/////////////////////////////////////////

export const TransactionSchema = z.object({
  type: TransactionTypeSchema,
  id: z.string().cuid(),
  initiatorId: z.string().nullable(),
  isReverse: z.boolean().nullable(),
  reverseOfId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  batchId: z.string().nullable(),
  marketId: z.string().nullable(),
})

export type Transaction = z.infer<typeof TransactionSchema>

export default TransactionSchema;
