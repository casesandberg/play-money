import { z } from 'zod';
import { AccountTypeSchema } from '../inputTypeSchemas/AccountTypeSchema'

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  type: AccountTypeSchema,
  id: z.string().cuid(),
  internalType: z.string().nullable(),
  userId: z.string().nullable(),
  marketId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Account = z.infer<typeof AccountSchema>

export default AccountSchema;
