import { z } from 'zod';

export const CurrencyScalarFieldEnumSchema = z.enum(['id','name','symbol','code','imageUrl','createdAt','updatedAt']);

export default CurrencyScalarFieldEnumSchema;
