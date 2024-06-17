import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { CurrencyCodeSchema } from '../inputTypeSchemas/CurrencyCodeSchema'

/////////////////////////////////////////
// TRANSACTION ITEM SCHEMA
/////////////////////////////////////////

export const TransactionItemSchema = z.object({
  currencyCode: CurrencyCodeSchema,
  id: z.string().cuid(),
  accountId: z.string(),
  transactionId: z.string(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'TransactionItem']"}),
  createdAt: z.coerce.date(),
})

export type TransactionItem = z.infer<typeof TransactionItemSchema>

export default TransactionItemSchema;
