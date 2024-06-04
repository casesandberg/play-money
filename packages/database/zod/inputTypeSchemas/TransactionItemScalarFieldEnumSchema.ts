import { z } from 'zod';

export const TransactionItemScalarFieldEnumSchema = z.enum(['id','accountId','currencyCode','transactionId','amount','createdAt']);

export default TransactionItemScalarFieldEnumSchema;
