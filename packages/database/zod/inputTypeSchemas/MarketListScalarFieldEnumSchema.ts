import { z } from 'zod';

export const MarketListScalarFieldEnumSchema = z.enum(['id','listId','marketId','createdAt']);

export default MarketListScalarFieldEnumSchema;
