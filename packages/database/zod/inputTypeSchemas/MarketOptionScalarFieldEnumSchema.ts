import { z } from 'zod';

export const MarketOptionScalarFieldEnumSchema = z.enum(['id','name','marketId','color','liquidityProbability','probability','createdAt','updatedAt']);

export default MarketOptionScalarFieldEnumSchema;
