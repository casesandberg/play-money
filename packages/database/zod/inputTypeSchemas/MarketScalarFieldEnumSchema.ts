import { z } from 'zod';

export const MarketScalarFieldEnumSchema = z.enum(['id','question','description','slug','closeDate','resolvedAt','createdBy','createdAt','updatedAt']);

export default MarketScalarFieldEnumSchema;
