import { z } from 'zod';

/////////////////////////////////////////
// TRANSACTION BATCH SCHEMA
/////////////////////////////////////////

export const TransactionBatchSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TransactionBatch = z.infer<typeof TransactionBatchSchema>

export default TransactionBatchSchema;
