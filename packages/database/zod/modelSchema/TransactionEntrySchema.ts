import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { AssetTypeSchema } from '../inputTypeSchemas/AssetTypeSchema'

/////////////////////////////////////////
// TRANSACTION ENTRY SCHEMA
/////////////////////////////////////////

export const TransactionEntrySchema = z.object({
  assetType: AssetTypeSchema,
  id: z.string().cuid(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'TransactionEntry']"}),
  assetId: z.string(),
  fromAccountId: z.string(),
  toAccountId: z.string(),
  transactionId: z.string(),
  createdAt: z.coerce.date(),
})

export type TransactionEntry = z.infer<typeof TransactionEntrySchema>

export default TransactionEntrySchema;
