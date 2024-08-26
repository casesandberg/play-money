import { z } from 'zod';

export const BalanceScalarFieldEnumSchema = z.enum(['id','accountId','assetType','assetId','total','subtotals','marketId','createdAt','updatedAt']);

export default BalanceScalarFieldEnumSchema;
