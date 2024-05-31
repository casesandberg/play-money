import { z } from 'zod';

/////////////////////////////////////////
// TRANSACTION SCHEMA
/////////////////////////////////////////

export const TransactionSchema = z.object({
  id: z.string().cuid(),
  description: z.string().nullable(),
  marketId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Transaction = z.infer<typeof TransactionSchema>

export default TransactionSchema;
