import { z } from 'zod';

export const MarketResolutionScalarFieldEnumSchema = z.enum(['id','marketId','resolvedById','resolutionId','supportingLink','createdAt','updatedAt']);

export default MarketResolutionScalarFieldEnumSchema;
