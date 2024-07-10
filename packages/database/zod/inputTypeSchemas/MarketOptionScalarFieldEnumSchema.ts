import { z } from 'zod';

export const MarketOptionScalarFieldEnumSchema = z.enum(['id','name','marketId','currencyCode','color','createdAt','updatedAt']);

export default MarketOptionScalarFieldEnumSchema;
