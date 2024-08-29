import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '@prisma/client'
import { AssetTypeSchema } from '../inputTypeSchemas/AssetTypeSchema'

/////////////////////////////////////////
// BALANCE SCHEMA
/////////////////////////////////////////

export const BalanceSchema = z.object({
  assetType: AssetTypeSchema,
  id: z.string().cuid(),
  accountId: z.string(),
  assetId: z.string(),
  total: z.instanceof(Prisma.Decimal, { message: "Field 'total' must be a Decimal. Location: ['Models', 'Balance']"}),
  subtotals: JsonValueSchema.nullable(),
  marketId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Balance = z.infer<typeof BalanceSchema>

export default BalanceSchema;
