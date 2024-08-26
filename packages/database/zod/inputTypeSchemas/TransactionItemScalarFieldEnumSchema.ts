import { z } from 'zod';

export const TransactionItemScalarFieldEnumSchema = z.enum(['id','accountId','transactionId','amount','createdAt']);

export default TransactionItemScalarFieldEnumSchema;
