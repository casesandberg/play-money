import { z } from 'zod';

export const AccountTypeSchema = z.enum(['USER','MARKET_AMM','MARKET_CLEARING','HOUSE']);

export type AccountTypeType = `${z.infer<typeof AccountTypeSchema>}`

export default AccountTypeSchema;
