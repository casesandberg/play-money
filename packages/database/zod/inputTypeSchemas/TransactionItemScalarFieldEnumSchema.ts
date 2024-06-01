import { z } from 'zod';

export const TransactionItemScalarFieldEnumSchema = z.enum(['id','userId','currencyCode','transactionId','amount','createdAt']);

export default TransactionItemScalarFieldEnumSchema;
