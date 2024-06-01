import { z } from 'zod';
import { CurrencyCodeSchema } from '../inputTypeSchemas/CurrencyCodeSchema'

/////////////////////////////////////////
// TRANSACTION ITEM SCHEMA
/////////////////////////////////////////

export const TransactionItemSchema = z.object({
  currencyCode: CurrencyCodeSchema,
  id: z.string().cuid(),
  userId: z.string(),
  transactionId: z.string(),
  amount: z.number(),
  createdAt: z.coerce.date(),
})

export type TransactionItem = z.infer<typeof TransactionItemSchema>

export default TransactionItemSchema;
