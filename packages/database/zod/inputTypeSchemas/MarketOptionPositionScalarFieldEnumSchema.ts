import { z } from 'zod';

export const MarketOptionPositionScalarFieldEnumSchema = z.enum(['id','accountId','marketId','optionId','cost','quantity','value','createdAt','updatedAt']);

export default MarketOptionPositionScalarFieldEnumSchema;
