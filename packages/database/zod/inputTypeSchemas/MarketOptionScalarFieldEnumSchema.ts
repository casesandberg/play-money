import { z } from 'zod';

export const MarketOptionScalarFieldEnumSchema = z.enum(['id','name','marketId','currencyCode','createdAt','updatedAt']);

export default MarketOptionScalarFieldEnumSchema;
