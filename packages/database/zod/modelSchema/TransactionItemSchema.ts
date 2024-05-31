import { z } from 'zod';

/////////////////////////////////////////
// TRANSACTION ITEM SCHEMA
/////////////////////////////////////////

export const TransactionItemSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  currencyId: z.string(),
  transactionId: z.string(),
  amount: z.number(),
  createdAt: z.coerce.date(),
})

export type TransactionItem = z.infer<typeof TransactionItemSchema>

export default TransactionItemSchema;
