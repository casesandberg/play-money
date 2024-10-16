import { z } from 'zod';

export const TransactionScalarFieldEnumSchema = z.enum(['id','type','initiatorId','isReverse','reverseOfId','createdAt','updatedAt','batchId','marketId']);

export default TransactionScalarFieldEnumSchema;
