import { z } from 'zod';

export const MarketOptionScalarFieldEnumSchema = z.enum(['id','name','marketId','color','liquidityProbability','createdAt','updatedAt']);

export default MarketOptionScalarFieldEnumSchema;
