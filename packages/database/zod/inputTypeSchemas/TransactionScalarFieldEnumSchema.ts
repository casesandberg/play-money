import { z } from 'zod';

export const TransactionScalarFieldEnumSchema = z.enum(['id','type','description','marketId','creatorId','createdAt','updatedAt']);

export default TransactionScalarFieldEnumSchema;
