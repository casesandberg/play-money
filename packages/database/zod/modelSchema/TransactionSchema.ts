import { z } from 'zod';

/////////////////////////////////////////
// TRANSACTION SCHEMA
/////////////////////////////////////////

export const TransactionSchema = z.object({
  id: z.string().cuid(),
  type: z.string(),
  description: z.string().nullable(),
  marketId: z.string().nullable(),
  creatorId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Transaction = z.infer<typeof TransactionSchema>

export default TransactionSchema;
