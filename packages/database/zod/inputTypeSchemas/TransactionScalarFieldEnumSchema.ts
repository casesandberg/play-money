import { z } from 'zod';

export const TransactionScalarFieldEnumSchema = z.enum(['id','description','marketId','createdAt','updatedAt']);

export default TransactionScalarFieldEnumSchema;
